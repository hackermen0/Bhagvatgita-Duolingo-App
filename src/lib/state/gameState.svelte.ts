import { browser } from '$app/environment';
import { planById, type DevanagariAbility, type OnboardingProfile, type PracticePreference, type DifficultyTier } from '../data/onboarding';

export type { DifficultyTier };
export type TierScriptMode = 'roman_hindi' | 'iast' | 'devanagari';

export function scriptModeForTier(tier: DifficultyTier): TierScriptMode {
  switch (tier) {
    case 'beginner': return 'roman_hindi';
    case 'medium': return 'iast';
    case 'hard': return 'devanagari';
  }
}

/** script: Devanāgarī only · both: Devanāgarī with romanized captions · roman: romanized first */
export type ScriptDisplay = 'script' | 'both' | 'roman';
export type ThemeMode = 'light' | 'dark';

export function scriptDisplayFor(ability: DevanagariAbility): ScriptDisplay {
  return ability === 'none' ? 'roman' : ability === 'comfortable' ? 'script' : 'both';
}

export interface WordMemory {
  strength: number;
  lastPracticed: number;
}

export interface DailyStats {
  date: string;
  xp: number;
  lessons: number;
  /** First-time lesson completions — what the plan's new-content rule limits */
  newLessons: number;
  practices: number;
  reflections: number;
}

export interface SessionResult {
  xpEarned: number;
  streakExtended: boolean;
  goalJustMet: boolean;
}

// Review interval (days) per memory strength: frequent review right after learning,
// spacing out as the learner keeps demonstrating they know the word.
export const INTERVAL_DAYS = [0, 1, 2, 4, 7, 14, 30];
export const MAX_STRENGTH = INTERVAL_DAYS.length - 1;
const DAY_MS = 86_400_000;

export const DAILY_GOAL_OPTIONS = [
  { xp: 10, label: 'Casual' },
  { xp: 20, label: 'Regular' },
  { xp: 30, label: 'Serious' },
  { xp: 50, label: 'Intense' }
];

/** Each verse is taught over three levels: meet the words, build the phrases, assemble the whole verse. */
export const LESSON_LEVELS = 3;
/** First-time XP per level (totals the old 50 for a whole lesson) */
const LEVEL_XP = [15, 15, 20];
const REPLAY_XP = 15;

/** XP a first-time run of this level pays, for showing on the path. */
export function levelXP(level: number): number {
  return LEVEL_XP[Math.min(Math.max(level, 1), LESSON_LEVELS) - 1];
}
const PRACTICE_XP = 15;
const JUMP_XP = 30;

export function dateKey(d: Date = new Date()): string {
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${d.getFullYear()}-${m}-${day}`;
}

function daysBetween(fromKey: string, toKey: string): number {
  const [fy, fm, fd] = fromKey.split('-').map(Number);
  const [ty, tm, td] = toKey.split('-').map(Number);
  return Math.round((Date.UTC(ty, tm - 1, td) - Date.UTC(fy, fm - 1, fd)) / DAY_MS);
}

export function isDue(mem: WordMemory | undefined, now = Date.now()): boolean {
  if (!mem) return true;
  return now - mem.lastPracticed >= INTERVAL_DAYS[mem.strength] * DAY_MS;
}

const emptyDaily = (date: string): DailyStats => ({ date, xp: 0, lessons: 0, newLessons: 0, practices: 0, reflections: 0 });

class GameState {
  // Svelte 5 reactive runes
  hearts = $state(5);
  xp = $state(0);
  streak = $state(0);
  completedLessons = $state<string[]>([]);
  /** Levels finished so far on lessons that aren't complete yet (completed lessons implicitly have them all) */
  levelProgress = $state<Record<string, number>>({});
  lastActiveDate = $state<string | null>(null);
  activeDays = $state<string[]>([]);
  difficultyTier = $state<DifficultyTier>('beginner');
  scriptDisplay = $state<ScriptDisplay>('both');
  userReflections = $state<Record<string, string>>({});
  themeMode = $state<ThemeMode>('light');
  wordMemory = $state<Record<string, WordMemory>>({});
  dailyGoal = $state(20);
  daily = $state<DailyStats>(emptyDaily(dateKey()));
  onboardingComplete = $state(false);
  profile = $state<OnboardingProfile | null>(null);
  joinedDate = $state(dateKey());
  claimedQuests = $state<{ date: string; ids: string[] }>({ date: dateKey(), ids: [] });
  /** Section ids whose unit-completion story reward has already played */
  storiesSeen = $state<string[]>([]);

  constructor() {
    this.loadState();
  }

  get tierScriptMode(): TierScriptMode {
    return scriptModeForTier(this.difficultyTier);
  }

  get today(): DailyStats {
    return this.daily.date === dateKey() ? this.daily : emptyDaily(dateKey());
  }

  loadState() {
    if (!browser) return;
    try {
      const saved = localStorage.getItem('gita_game_state');
      if (saved) {
        const parsed = JSON.parse(saved);
        this.hearts = parsed.hearts ?? 5;
        this.xp = parsed.xp ?? 0;
        this.streak = parsed.streak ?? 0;
        this.completedLessons = parsed.completedLessons ?? [];
        this.levelProgress = parsed.levelProgress ?? {};
        this.activeDays = parsed.activeDays ?? [];
        this.difficultyTier = parsed.difficultyTier ?? (parsed.profile?.difficultyTier ?? 'beginner');
        // Older saves stored a two-way scriptMode ('devanagari' | 'english')
        this.scriptDisplay =
          parsed.scriptDisplay ?? (parsed.scriptMode === 'english' ? 'roman' : 'both');
        this.userReflections = parsed.userReflections ?? {};
        this.themeMode = parsed.themeMode ?? 'light';
        this.wordMemory = parsed.wordMemory ?? {};
        this.dailyGoal = parsed.dailyGoal ?? 20;
        this.daily = { ...emptyDaily(dateKey()), ...parsed.daily };
        this.onboardingComplete = parsed.onboardingComplete ?? false;
        this.profile = parsed.profile ?? null;
        // Saves from before join dates were tracked: the earliest active day is the best guess
        this.joinedDate = parsed.joinedDate ?? [...(parsed.activeDays ?? [])].sort()[0] ?? dateKey();
        this.claimedQuests = parsed.claimedQuests ?? { date: dateKey(), ids: [] };
        this.storiesSeen = parsed.storiesSeen ?? [];

        // Older saves stored Date.toDateString(); normalize to YYYY-MM-DD
        const last: string | null = parsed.lastActiveDate ?? null;
        this.lastActiveDate =
          last && !/^\d{4}-\d{2}-\d{2}$/.test(last) ? dateKey(new Date(last)) : last;

        // A streak only survives if yesterday or today was active
        if (this.lastActiveDate && daysBetween(this.lastActiveDate, dateKey()) > 1) {
          this.streak = 0;
        }
      }
    } catch (e) {
      console.error('Failed to load game state:', e);
    }
  }

  saveState() {
    if (!browser) return;
    try {
      const stateObj = {
        hearts: this.hearts,
        xp: this.xp,
        streak: this.streak,
        completedLessons: $state.snapshot(this.completedLessons),
        levelProgress: $state.snapshot(this.levelProgress),
        lastActiveDate: this.lastActiveDate,
        activeDays: $state.snapshot(this.activeDays),
        difficultyTier: this.difficultyTier,
        scriptDisplay: this.scriptDisplay,
        userReflections: $state.snapshot(this.userReflections),
        themeMode: this.themeMode,
        wordMemory: $state.snapshot(this.wordMemory),
        dailyGoal: this.dailyGoal,
        daily: $state.snapshot(this.daily),
        onboardingComplete: this.onboardingComplete,
        profile: this.profile ? $state.snapshot(this.profile) : null,
        joinedDate: this.joinedDate,
        claimedQuests: $state.snapshot(this.claimedQuests),
        storiesSeen: $state.snapshot(this.storiesSeen)
      };
      localStorage.setItem('gita_game_state', JSON.stringify(stateObj));
    } catch (e) {
      console.error('Failed to save game state:', e);
    }
  }

  private rollDaily() {
    const today = dateKey();
    if (this.daily.date !== today) this.daily = emptyDaily(today);
  }

  saveReflection(promptId: string, text: string) {
    this.userReflections[promptId] = text;
    this.rollDaily();
    this.daily.reflections += 1;
    this.saveState();
  }

  setDifficultyTier(tier: DifficultyTier) {
    this.difficultyTier = tier;
    if (tier === 'beginner' || tier === 'medium') {
      this.scriptDisplay = 'roman';
    } else {
      this.scriptDisplay = 'script';
    }
    if (this.profile) {
      this.profile = { ...this.profile, difficultyTier: tier };
    }
    this.saveState();
  }

  setScriptDisplay(mode: ScriptDisplay) {
    this.scriptDisplay = mode;
    this.saveState();
  }

  setPracticePreference(pref: PracticePreference) {
    if (!this.profile) return;
    this.profile = { ...this.profile, practicePreference: pref };
    this.saveState();
  }

  toggleTheme() {
    this.themeMode = this.themeMode === 'light' ? 'dark' : 'light';
    this.saveState();
  }

  setThemeMode(mode: ThemeMode) {
    this.themeMode = mode;
    this.saveState();
  }

  setDailyGoal(xp: number) {
    this.dailyGoal = xp;
    this.saveState();
  }

  /**
   * Answers that map to user-adjustable settings are applied here as starting values;
   * everything else is read live from `profile` (see data/personalization.ts).
   */
  completeOnboarding(profile: OnboardingProfile) {
    this.profile = profile;
    this.onboardingComplete = true;
    if (profile.difficultyTier) {
      this.difficultyTier = profile.difficultyTier;
    }
    this.scriptDisplay = scriptDisplayFor(profile.devanagariAbility);

    const targetXP =
      profile.plan === 'custom' && profile.customMinutes
        ? profile.customMinutes * 2
        : planById(profile.plan).defaultGoalXP;
    this.dailyGoal = DAILY_GOAL_OPTIONS.reduce((best, opt) =>
      Math.abs(opt.xp - targetXP) < Math.abs(best.xp - targetXP) ? opt : best
    ).xp;

    this.saveState();
  }

  /** Lets the learner retake onboarding from Settings without touching lesson progress. */
  resetOnboarding() {
    this.onboardingComplete = false;
    this.profile = null;
    this.saveState();
  }

  decrementHeart() {
    if (this.hearts > 0) {
      this.hearts--;
      this.saveState();
    }
  }

  refillHearts() {
    this.hearts = 5;
    this.saveState();
  }

  /** Returns true when this award is the one that crosses today's goal. */
  addXP(amount: number): boolean {
    this.rollDaily();
    const before = this.daily.xp;
    this.daily.xp += amount;
    this.xp += amount;
    this.saveState();
    return before < this.dailyGoal && this.daily.xp >= this.dailyGoal;
  }

  /**
   * Spaced-repetition update. A correct recall only strengthens a word once its review
   * is due — cramming the same word repeatedly in one day shouldn't push it to a
   * month-long interval. A miss drops strength so the word comes back soon.
   */
  private updateWordMemory(words: string[], missed: string[]) {
    const now = Date.now();
    const missedSet = new Set(missed);
    for (const w of new Set([...words, ...missed])) {
      const cur = this.wordMemory[w];
      if (missedSet.has(w)) {
        this.wordMemory[w] = { strength: Math.max(0, (cur?.strength ?? 0) - 2), lastPracticed: now };
      } else if (!cur) {
        this.wordMemory[w] = { strength: 1, lastPracticed: now };
      } else if (isDue(cur, now)) {
        this.wordMemory[w] = { strength: Math.min(MAX_STRENGTH, cur.strength + 1), lastPracticed: now };
      }
    }
  }

  /** Any completed session counts toward the streak. Returns true if today was newly counted. */
  private recordActivity(): boolean {
    const today = dateKey();
    if (this.lastActiveDate === today) return false;
    this.streak = this.lastActiveDate && daysBetween(this.lastActiveDate, today) === 1 ? this.streak + 1 : 1;
    this.lastActiveDate = today;
    if (!this.activeDays.includes(today)) this.activeDays = [...this.activeDays, today].slice(-60);
    return true;
  }

  /** How many of a lesson's levels are done (all of them once the lesson is complete). */
  levelsDone(lessonId: string): number {
    return this.completedLessons.includes(lessonId) ? LESSON_LEVELS : (this.levelProgress[lessonId] ?? 0);
  }

  /**
   * Records a finished level. The lesson itself only completes with its last level, which is
   * what unlocks the next verse. A level left unfinished saves nothing — it restarts next time.
   */
  completeLevel(lessonId: string, level: number, words: string[], missed: string[]): SessionResult {
    const first = level > this.levelsDone(lessonId);
    const finishesLesson = level >= LESSON_LEVELS;
    if (first) {
      if (finishesLesson) {
        if (!this.completedLessons.includes(lessonId)) this.completedLessons.push(lessonId);
        delete this.levelProgress[lessonId];
      } else {
        this.levelProgress[lessonId] = level;
      }
    }
    this.updateWordMemory(words, missed);
    this.rollDaily();
    if (finishesLesson) {
      this.daily.lessons += 1;
      if (first) this.daily.newLessons += 1;
    }
    const streakExtended = this.recordActivity();
    const xpEarned = first ? levelXP(level) : REPLAY_XP;
    const goalJustMet = this.addXP(xpEarned);
    return { xpEarned, streakExtended, goalJustMet };
  }


  completePractice(words: string[], missed: string[]): SessionResult {
    this.updateWordMemory(words, missed);
    this.rollDaily();
    this.daily.practices += 1;
    const streakExtended = this.recordActivity();
    const goalJustMet = this.addXP(PRACTICE_XP);
    return { xpEarned: PRACTICE_XP, streakExtended, goalJustMet };
  }

  hasSeenStory(sectionId: string): boolean {
    return this.storiesSeen.includes(sectionId);
  }

  markStorySeen(sectionId: string) {
    if (this.storiesSeen.includes(sectionId)) return;
    this.storiesSeen = [...this.storiesSeen, sectionId];
    this.saveState();
  }

  isQuestClaimed(id: string): boolean {
    return this.claimedQuests.date === dateKey() && this.claimedQuests.ids.includes(id);
  }

  claimQuest(id: string, rewardXP: number) {
    if (this.isQuestClaimed(id)) return;
    const today = dateKey();
    const ids = this.claimedQuests.date === today ? this.claimedQuests.ids : [];
    this.claimedQuests = { date: today, ids: [...ids, id] };
    this.addXP(rewardXP);
  }

  /** Passing a "Jump here?" test marks every skipped lesson complete, like a placement test. */
  completeJump(lessonIds: string[], words: string[], missed: string[]): SessionResult {
    for (const id of lessonIds) if (!this.completedLessons.includes(id)) this.completedLessons.push(id);
    this.updateWordMemory(words, missed);
    this.rollDaily();
    this.daily.lessons += 1;
    const streakExtended = this.recordActivity();
    const goalJustMet = this.addXP(JUMP_XP);
    return { xpEarned: JUMP_XP, streakExtended, goalJustMet };
  }

  resetState() {
    this.hearts = 5;
    this.xp = 0;
    this.streak = 0;
    this.completedLessons = [];
    this.levelProgress = {};
    this.lastActiveDate = null;
    this.activeDays = [];
    this.difficultyTier = 'beginner';
    this.scriptDisplay = this.profile ? scriptDisplayFor(this.profile.devanagariAbility) : 'both';
    this.userReflections = {};
    this.wordMemory = {};
    this.daily = emptyDaily(dateKey());
    // Stories are earned by completing a unit's lessons, so a progress reset re-locks them too
    this.storiesSeen = [];
    this.saveState();
  }
}

export const gameState = new GameState();
