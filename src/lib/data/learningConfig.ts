import type { OnboardingProfile } from './onboarding';

export type ListeningLevel = 'none' | 'light' | 'heavy';
/** sequential: finish lessons in order · jump: locked lessons offer a "Jump here?" test · open: whole path unlocked */
export type PathAccess = 'sequential' | 'jump' | 'open';

export interface NewContentRule {
  /** Recommend review before a new verse once this many words are due */
  reviewFirstAtDue: number;
  maxNewPerDay: number;
}

export interface LearningConfig {
  listening: ListeningLevel;
  autoPlayRecitation: boolean;
  /** Commentary and an extra reflection in lessons */
  meaningFocus: boolean;
  /** Word-by-word matching before phrase-level matching */
  wordWarmups: boolean;
  /** "I know these words" skip on word-discovery cards */
  skippableDiscovery: boolean;
  /** Fill-in-the-blank shows the English translation up front (otherwise behind a hint button) */
  translationHints: boolean;
  pathAccess: PathAccess;
  /** Extra recall exercises at the end of each lesson */
  deepRecall: boolean;
  practiceSize: number;
  newContent: NewContentRule | null;
}

const DEFAULT_CONFIG: LearningConfig = {
  listening: 'light',
  autoPlayRecitation: false,
  meaningFocus: false,
  wordWarmups: true,
  skippableDiscovery: false,
  translationHints: true,
  pathAccess: 'sequential',
  deepRecall: false,
  practiceSize: 5,
  newContent: null
};

export function sessionMinutes(profile: OnboardingProfile): number {
  switch (profile.plan) {
    case 'quick': return 6;
    case 'regular': return 11;
    case 'deep': return 17;
    case 'custom': return profile.customMinutes ?? 10;
  }
}

// Section 3 new-content rules. Short sessions hold new verses back whenever anything is due;
// longer ones allow a new verse while the review backlog stays small.
function newContentRule(minutes: number): NewContentRule {
  if (minutes <= 7) return { reviewFirstAtDue: 1, maxNewPerDay: 1 };
  return { reviewFirstAtDue: 5, maxNewPerDay: minutes >= 20 ? 2 : 1 };
}

export function learningConfig(profile: OnboardingProfile | null): LearningConfig {
  if (!profile) return DEFAULT_CONFIG;

  const { goal, practicePreference: pref, sanskritFamiliarity: fam, gitaKnowledge: known } = profile;
  const soundGoal = goal === 'recitation' || goal === 'pronunciation';
  // An explicit "reading" preference still gets a little listening if the goal is about sound
  const listening: ListeningLevel =
    pref === 'listening' ? 'heavy'
    : pref === 'reading' ? (soundGoal ? 'light' : 'none')
    : soundGoal ? 'heavy' : 'light';

  const experienced = fam === 'studied' || fam === 'advanced';
  const knowsVerses = known === 'many' || known === 'chapters';
  const minutes = sessionMinutes(profile);

  return {
    listening,
    autoPlayRecitation: listening === 'heavy',
    meaningFocus: goal === 'meaning' || goal === 'both' || pref === 'reading',
    wordWarmups: !experienced,
    skippableDiscovery: experienced || knowsVerses,
    translationHints: fam !== 'advanced',
    pathAccess: knowsVerses ? 'open' : known === 'few' ? 'jump' : 'sequential',
    deepRecall: minutes >= 15,
    practiceSize: Math.min(8, Math.max(3, Math.floor(minutes / 2))),
    newContent: newContentRule(minutes)
  };
}

export type NewContentAdvice = 'review-due' | 'daily-limit' | null;

export function newContentAdvice(cfg: LearningConfig, dueCount: number, newToday: number): NewContentAdvice {
  if (!cfg.newContent) return null;
  if (dueCount >= cfg.newContent.reviewFirstAtDue) return 'review-due';
  if (newToday >= cfg.newContent.maxNewPerDay) return 'daily-limit';
  return null;
}

/** Duolingo tailors its nudges to the learner's stated motivation */
export function goalGreeting(profile: OnboardingProfile | null, verseRef: string): string {
  switch (profile?.goal) {
    case 'recitation': return `Let's learn to recite ${verseRef}!`;
    case 'meaning': return `Let's uncover ${verseRef}!`;
    case 'pronunciation': return `Let's perfect the sounds of ${verseRef}!`;
    default: return `Ready for ${verseRef}?`;
  }
}

export function goalNudge(profile: OnboardingProfile | null): string {
  switch (profile?.goal) {
    case 'recitation': return 'Try reciting the full verse aloud once before you move on.';
    case 'pronunciation': return 'Replay the recitation on slow and say each word along with it.';
    case 'meaning': return 'Carry one line of this verse with you today and notice where it applies.';
    default: return '';
  }
}
