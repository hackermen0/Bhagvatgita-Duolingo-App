import { browser } from '$app/environment';
import { planById, type OnboardingProfile, type PracticePreference, type DifficultyTier } from '../data/onboarding';
import { JOURNEY_PAGE_COUNT } from '../data/journey';

export type { DifficultyTier };
/** How Hindi is written on screen: Roman letters (Hinglish) or Devanagari. */
export type TierScriptMode = 'roman_hindi' | 'devanagari';
export type ThemeMode = 'light' | 'dark';

export const DIFFICULTY_TIER_IDS: readonly DifficultyTier[] = ['beginner', 'medium', 'hard'];

/** beginner → Romanized Hindi (Hinglish) · medium / hard → Devanagari Hindi */
export function scriptModeForTier(tier: DifficultyTier): TierScriptMode {
  return tier === 'beginner' ? 'roman_hindi' : 'devanagari';
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

/** XP for finishing a verse's journey the first time, and for every replay after that */
export const VERSE_XP = 50;
export const REPLAY_XP = 15;
const PRACTICE_XP = 15;

/**
 * Where a learner left off in a verse's journey. Saved after every finished page, so leaving mid-verse
 * resumes at that page instead of the start. The seed and word batches fix what the remaining pages show.
 */
export interface JourneyCheckpoint {
  /** Index of the next page to play */
  page: number;
  /** How many pages the journey had when this was saved — a checkpoint from a different layout can't be resumed */
  pages: number;
  seed: number;
  /** Word keys shown on each half's word-matching page */
  batches: string[][];
  /** Word keys the learner got wrong, for the re-exam */
  missedWords: string[];
  /** Word keys the learner has met this run */
  seenWords: string[];
  correct: number;
  wrong: number;
  /** Time spent playing so far, across sittings */
  elapsedMs: number;
}
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
  /** Verses left part-way through their journey, keyed by lesson id */
  journeyCheckpoint = $state<Record<string, JourneyCheckpoint>>({});
  lastActiveDate = $state<string | null>(null);
  activeDays = $state<string[]>([]);
  difficultyTier = $state<DifficultyTier>('beginner');
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
        // Saves from the three-level design had `levelProgress`; a half-finished level can't be resumed, so it's dropped
        this.journeyCheckpoint = Object.fromEntries(
          Object.entries((parsed.journeyCheckpoint ?? {}) as Record<string, JourneyCheckpoint>).filter(
            ([, c]) => c.pages === JOURNEY_PAGE_COUNT
          )
        );
        this.activeDays = parsed.activeDays ?? [];
        const savedTier = parsed.difficultyTier ?? parsed.profile?.difficultyTier;
        this.difficultyTier = DIFFICULTY_TIER_IDS.includes(savedTier) ? savedTier : 'beginner';
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
        journeyCheckpoint: $state.snapshot(this.journeyCheckpoint),
        lastActiveDate: this.lastActiveDate,
        activeDays: $state.snapshot(this.activeDays),
        difficultyTier: this.difficultyTier,
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
    if (this.profile) {
      this.profile = { ...this.profile, difficultyTier: tier };
    }
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
    this.difficultyTier = profile.difficultyTier;

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

  /** Where the learner left off in this verse's journey, or undefined if they aren't part-way through. */
  checkpointFor(lessonId: string): JourneyCheckpoint | undefined {
    return this.journeyCheckpoint[lessonId];
  }

  saveCheckpoint(lessonId: string, checkpoint: JourneyCheckpoint) {
    this.journeyCheckpoint[lessonId] = checkpoint;
    this.saveState();
  }

  clearCheckpoint(lessonId: string) {
    if (!(lessonId in this.journeyCheckpoint)) return;
    delete this.journeyCheckpoint[lessonId];
    this.saveState();
  }

  /**
   * Records a finished journey: the verse completes (unlocking the next one), its checkpoint is cleared,
   * and only the words the learner actually met are credited in spaced-repetition memory.
   */
  completeVerse(lessonId: string, words: string[], missed: string[]): SessionResult {
    const first = !this.completedLessons.includes(lessonId);
    if (first) this.completedLessons.push(lessonId);
    delete this.journeyCheckpoint[lessonId];
    this.updateWordMemory(words, missed);
    this.rollDaily();
    this.daily.lessons += 1;
    if (first) this.daily.newLessons += 1;
    const streakExtended = this.recordActivity();
    const xpEarned = first ? VERSE_XP : REPLAY_XP;
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
    this.journeyCheckpoint = {};
    this.lastActiveDate = null;
    this.activeDays = [];
    // The difficulty tier is a preference, not progress, so a progress reset keeps it
    this.userReflections = {};
    this.wordMemory = {};
    this.daily = emptyDaily(dateKey());
    // Stories are earned by completing a unit's lessons, so a progress reset re-locks them too
    this.storiesSeen = [];
    this.saveState();
  }
}

export const gameState = new GameState();
