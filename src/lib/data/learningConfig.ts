import type { DifficultyTier, OnboardingProfile } from './onboarding';

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
  /** Extra vocabulary and word-matching rounds closing each verse (Hard tier) */
  vocabDrills: boolean;
  /** "I know these words" skip on word-discovery cards */
  skippableDiscovery: boolean;
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
  vocabDrills: false,
  skippableDiscovery: false,
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

function configFromProfile(profile: OnboardingProfile): LearningConfig {
  const { goal, practicePreference: pref, gitaKnowledge: known } = profile;
  const soundGoal = goal === 'recitation' || goal === 'pronunciation';
  // An explicit "reading" preference still gets a little listening if the goal is about sound
  const listening: ListeningLevel =
    pref === 'listening' ? 'heavy'
    : pref === 'reading' ? (soundGoal ? 'light' : 'none')
    : soundGoal ? 'heavy' : 'light';

  const knowsVerses = known === 'many' || known === 'chapters';
  const minutes = sessionMinutes(profile);

  return {
    ...DEFAULT_CONFIG,
    listening,
    autoPlayRecitation: listening === 'heavy',
    meaningFocus: goal === 'meaning' || goal === 'both' || pref === 'reading',
    skippableDiscovery: knowsVerses,
    pathAccess: knowsVerses ? 'open' : known === 'few' ? 'jump' : 'sequential',
    deepRecall: minutes >= 15,
    practiceSize: Math.min(8, Math.max(3, Math.floor(minutes / 2))),
    newContent: newContentRule(minutes)
  };
}

/** The learner's profile sets the pacing; the difficulty tier sets how much vocabulary work each verse carries. */
export function learningConfig(profile: OnboardingProfile | null, tier: DifficultyTier): LearningConfig {
  return {
    ...(profile ? configFromProfile(profile) : DEFAULT_CONFIG),
    vocabDrills: tier === 'hard'
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
