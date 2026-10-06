// Section 3 ("What the Learner Chooses") and Section 4 ("Onboarding") of the product design.

export type Goal = 'recitation' | 'meaning' | 'pronunciation' | 'both';
export type GitaKnowledge = 'none' | 'few' | 'many' | 'chapters';
export type TimeBudget = '5-7' | '10-12' | '15-20' | 'variable';
export type PracticePreference = 'listening' | 'reading' | 'balanced';
export type PlanId = 'quick' | 'regular' | 'deep' | 'custom';
export type DifficultyTier = 'beginner' | 'medium' | 'hard';

export interface OnboardingProfile {
  difficultyTier: DifficultyTier;
  goal: Goal;
  gitaKnowledge: GitaKnowledge;
  timeBudget: TimeBudget;
  practicePreference: PracticePreference;
  plan: PlanId;
  /** Only set when plan === 'custom' */
  customMinutes?: number;
}

// ─── Difficulty tiers ───────────────────────────────────────────────────────
// Every tier presents the verse as Hindi and asks the learner to answer in English; the tier only
// changes the script (see `scriptModeForTier` in gameState) and how much vocabulary work comes with it.
export interface DifficultyTierInfo {
  tier: DifficultyTier;
  title: string;
  badge: string;
  /** One line on how the Hindi is written */
  subtitle: string;
  /** Short label for compact pickers */
  short: string;
  sample: string;
  description: string;
}

export const DIFFICULTY_TIERS: DifficultyTierInfo[] = [
  {
    tier: 'beginner',
    title: 'Beginner',
    badge: 'Easy',
    subtitle: 'Hindi in Roman letters (Hinglish)',
    short: 'Roman Hindi',
    sample: 'Aapka adhikar keval karma karne par hai, uske phalon par kabhi nahi...',
    description: 'Read each verse in Hindi written in English letters, then solve it in English. No new script to learn.'
  },
  {
    tier: 'medium',
    title: 'Medium',
    badge: 'Balanced',
    subtitle: 'Hindi in Devanagari script',
    short: 'Devanagari',
    sample: 'आपका अधिकार केवल कर्म करने पर है, उसके फलों पर कभी नहीं...',
    description: 'Read each verse in Hindi script, then solve it in English. Word matching comes before every phrase.'
  },
  {
    tier: 'hard',
    title: 'Hard',
    badge: 'Challenge',
    subtitle: 'Devanagari + vocabulary drills',
    short: 'Devanagari + drills',
    sample: 'आपका अधिकार केवल कर्म करने पर है, उसके फलों पर कभी नहीं...',
    description: 'Devanagari Hindi with extra vocabulary and word-matching rounds at the end of every verse.'
  }
];

// ─── Section 3: Plan definitions ────────────────────────────────────────────
export interface PlanDefinition {
  id: PlanId;
  name: string;
  timeLabel: string;
  purpose: string;
  newContentRule: string;
  /** Seeds gameState.dailyGoal so the daily-goal card matches the chosen session length */
  defaultGoalXP: number;
}

export const PLANS: PlanDefinition[] = [
  {
    id: 'quick',
    name: 'Quick',
    timeLabel: '5–7 min',
    purpose: 'Consistency',
    newContentRule: 'No new content when review is due; a small phrase only when review health is clear.',
    defaultGoalXP: 10
  },
  {
    id: 'regular',
    name: 'Regular',
    timeLabel: '10–12 min',
    purpose: 'Balanced learning',
    newContentRule: 'Up to 1 new verse only when review health is acceptable.',
    defaultGoalXP: 20
  },
  {
    id: 'deep',
    name: 'Deep',
    timeLabel: '15–20 min',
    purpose: 'Strong recall + recitation',
    newContentRule: 'Up to 1 new verse only when review health is acceptable.',
    defaultGoalXP: 30
  },
  {
    id: 'custom',
    name: 'Custom',
    timeLabel: 'Your choice',
    purpose: 'Personalized',
    newContentRule: 'Adaptive within your selected time budget.',
    defaultGoalXP: 20
  }
];

export function planById(id: PlanId): PlanDefinition {
  return PLANS.find((p) => p.id === id) ?? PLANS[1];
}

/** Section 4: "Practical time" answer -> initial plan recommendation. Overridable by the learner. */
export function recommendPlan(timeBudget: TimeBudget): PlanId {
  switch (timeBudget) {
    case '5-7': return 'quick';
    case '10-12': return 'regular';
    case '15-20': return 'deep';
    case 'variable': return 'custom';
  }
}

// Section 10: Custom Mode minute options
export const CUSTOM_MINUTES_OPTIONS = [5, 7, 10, 12, 15, 20, 30];

// ─── Section 4: Onboarding questions ────────────────────────────────────────
export interface OnboardingOption {
  value: string;
  label: string;
}

export interface OnboardingQuestion {
  key: 'goal' | 'gitaKnowledge' | 'timeBudget' | 'practicePreference';
  question: string;
  helper?: string;
  options: OnboardingOption[];
}

export const ONBOARDING_QUESTIONS: OnboardingQuestion[] = [
  {
    key: 'goal',
    question: 'What brings you to the Gita?',
    helper: 'This shapes which kinds of practice you see most often.',
    options: [
      { value: 'recitation', label: 'Reciting verses from memory' },
      { value: 'meaning', label: 'Understanding the meaning' },
      { value: 'pronunciation', label: 'Correct pronunciation' },
      { value: 'both', label: 'A bit of everything' }
    ]
  },
  {
    key: 'gitaKnowledge',
    question: 'How many verses of the Gita do you already know?',
    options: [
      { value: 'none', label: 'None yet' },
      { value: 'few', label: 'A handful (1–5)' },
      { value: 'many', label: 'Many verses' },
      { value: 'chapters', label: 'Whole chapters' }
    ]
  },
  {
    key: 'timeBudget',
    question: 'How much time can you give each day?',
    options: [
      { value: '5-7', label: '5–7 minutes' },
      { value: '10-12', label: '10–12 minutes' },
      { value: '15-20', label: '15–20 minutes' },
      { value: 'variable', label: 'It varies day to day' }
    ]
  },
  {
    key: 'practicePreference',
    question: 'How do you like to practice?',
    options: [
      { value: 'listening', label: 'Listening + recitation' },
      { value: 'reading', label: 'Reading + meaning' },
      { value: 'balanced', label: 'A balance of both' }
    ]
  }
];

export function labelFor(key: OnboardingQuestion['key'], value: string | undefined): string {
  if (!value) return '';
  const q = ONBOARDING_QUESTIONS.find((q) => q.key === key);
  return q?.options.find((o) => o.value === value)?.label ?? '';
}
