// Every verse is taught through its Hindi translation. The learner reads the Hindi — in Roman script on the
// Beginner tier, in Devanagari on Medium and Hard (see `scriptModeForTier`) — and always answers in English.
// No Sanskrit is shown anywhere in the learning path.

/**
 * Hindi in both scripts. `dev` and `roman` are word-for-word parallel: the same number of
 * whitespace-separated tokens, so a word can be paired with its romanization by position.
 */
export interface HindiText {
  dev: string;
  roman: string;
}

/**
 * A clue on a translate exercise (Duolingo-style): the Hindi words `from`..`to` (token indexes) are
 * highlighted in the sentence, and the answer-bank tile `tile` that translates them is highlighted too.
 */
export interface TranslateClue {
  from: number;
  to: number;
  tile: string;
}

/** A Hindi word or phrase and the English it means — one pair in a matching exercise. */
export interface PhrasePair {
  hindi: HindiText;
  english: string;
}

export interface MCQOption {
  text: string;
  isCorrect: boolean;
  explanation: string;
}

/**
 * A Hindi vocabulary word. `word` is the romanized Hindi spelling — it is also the word's identity
 * (spaced-repetition key, glossary key), so one spelling always carries one meaning.
 */
export interface WordMeaning {
  word: string;
  /** How the word is spelled on screen when that differs from the key, e.g. key `tyagkar` shown as "tyag kar" */
  roman?: string;
  devanagari: string;
  meaning: string;
  partOfSpeech: string;
}

export interface Commentary {
  author: string;
  tradition: string;
  text: string;
}

/** `word` is the romanized key; `devanagari` is what gets spoken. */
export interface ListeningOption {
  word: string;
  devanagari: string;
}

// targetWords: romanized Hindi words an exercise tests — lets mistakes be attributed to specific words
// for spaced review. warmup: a word-by-word matching step that opens each part; the Beginner tier skips it.
type QuestionMeta = { targetWords?: string[]; warmup?: boolean };

export type Question = QuestionMeta & (
  | {
      id: string;
      type: 'listening';
      prompt: string;
      /** Devanagari text that is spoken aloud */
      audioText: string;
      options: ListeningOption[];
      answer: string;
      explanation: string;
    }
  | {
      id: string;
      type: 'phrase_matching';
      prompt: string;
      pairs: PhrasePair[];
    }
  | {
      id: string;
      type: 'translate';
      prompt: string;
      /** The Hindi Krishna says (shown in his speech bubble and spoken aloud) */
      hindi: HindiText;
      /** The English the learner assembles from tiles — graded by its words, in any order */
      answer: string;
      /** The answer's phrase chunks plus a few distractor chunks; shuffled on screen */
      tiles: string[];
      /** Highlighted Hindi words and the bank tile that translates each */
      clues?: TranslateClue[];
      explanation?: string;
    }
  | {
      id: string;
      type: 'fill_in_the_blank';
      prompt: string;
      /** The Hindi phrase that is the clue */
      hindi: HindiText;
      /** English sentence with a `____` gap */
      sentence: string;
      options: string[];
      answer: string;
      explanation: string;
    }
  | {
      id: string;
      type: 'multiple_choice';
      prompt: string;
      options: MCQOption[];
    }
  | {
      id: string;
      type: 'reflection';
      prompt: string;
      verseContext?: string;
      guidance?: string;
    }
);

export interface VersePart {
  partIndex: number;
  title: string;
  hindiTranslationDevanagari: string;
  hindiTranslationRoman: string;
  /** English meaning of this part */
  translation: string;
  wordBreakdown: WordMeaning[];
  questions: Question[];
  commentary?: Commentary;
  reflectionPrompt?: string;
}

export interface Lesson {
  id: string;
  title: string;
  verseRef: string;
  /** One plain-English sentence of what the verse says, shown up-front on the verse-intro screen. */
  essence?: string;
  /** The source shloka. Reference only — never rendered in the learning path. */
  verseSanskrit?: string;
  /** The verse's Hindi translation, one line per line of the verse. It is the parts' Hindi read in order. */
  hindiTranslationDevanagari: string;
  hindiTranslationRoman: string;
  translation: string;
  purport: string;
  commentary?: Commentary;
  reflectionPrompt?: string;
  parts?: VersePart[];
  finalSynthesisQuestions?: Question[];
  wordBreakdown: WordMeaning[];
  questions: Question[];
  /** One narrative sentence for this lesson's frame in the unit's story reward; falls back to `translation`. */
  storyCaption?: string;
}

export interface Section {
  id: string;
  title: string;
  lessons: Lesson[];
}

export interface Chapter {
  id: string;
  number: number;
  title: string;
  summary: string;
  sections: Section[];
}

export interface GitaData {
  chapters: Chapter[];
}

/** Finds the section (and its chapter) that owns a given lesson id. */
export function sectionForLesson(gita: GitaData, lessonId: string): { chapter: Chapter; section: Section } | undefined {
  for (const chapter of gita.chapters) {
    for (const section of chapter.sections) {
      if (section.lessons.some((l) => l.id === lessonId)) return { chapter, section };
    }
  }
  return undefined;
}

export const gitaData: GitaData = {
  chapters: [
    {
      id: 'ch2',
      number: 2,
      title: 'Sankhya Yoga',
      summary: 'Yoga of Knowledge',
      sections: [
        {
          id: 'ch2_sec1',
          title: 'Duty and Right Action',
          lessons: [
            {
              id: 'ch2_sec1_l1',
              title: 'Right to Action',
              verseRef: 'BG 2.47',
              essence: 'Do your duty with full effort, but let go of the results.',
              verseSanskrit: 'कर्मण्येवाधिकारस्ते मा फलेषु कदाचन ।\nमा कर्मफलहेतुर्भूर्मा ते सङ्गोऽस्त्वकर्मणि ॥',
              hindiTranslationDevanagari: 'तुम्हारा अधिकार केवल कर्म करने पर है, उसके फलों पर कभी नहीं।\nइसलिए तुम कर्म के फलों की चाहत मत रखो, और न ही तुम्हारी आसक्ति कर्म न करने में हो।',
              hindiTranslationRoman: 'Tumhara adhikar keval karma karne par hai, uske phalon par kabhi nahi.\nIsliye tum karma ke phalon ki chahat mat rakho, aur na hi tumhari aasakti karma na karne mein ho.',
              translation: 'You have a right to perform your prescribed duties, but you are not entitled to the fruits of your actions. Never consider yourself to be the cause of the results of your activities, and never be attached to not doing your duty.',
              purport: 'This famous verse outlines the foundation of Karma Yoga. Krishna advises Arjuna to focus entirely on his duty (action) without anxiety about the outcomes (fruits) of those actions, and warns against resolving not to do work (inaction) just because he cannot control the results.',
              commentary: {
                author: 'Swami Sivananda',
                tradition: 'Divine Life Society',
                text: 'Work done with expectation of reward brings anxiety and bondage. Perform your duty with an unattached mind, treating success and failure with equanimity. By giving up claim to the fruits of action, you purify the mind and gain liberation.'
              },
              reflectionPrompt: 'Where in your life today are you clinging to results rather than bringing full presence and dedication to the action itself?',
              storyCaption: 'Arjuna raised his bow, and Krishna raised a hand. "Your right is to action alone," he said, "never to its fruit."',
              wordBreakdown: [
                { word: 'tumhara', devanagari: 'तुम्हारा', meaning: 'your', partOfSpeech: 'pronoun' },
                { word: 'adhikar', devanagari: 'अधिकार', meaning: 'right / authority', partOfSpeech: 'noun' },
                { word: 'keval', devanagari: 'केवल', meaning: 'only', partOfSpeech: 'adverb' },
                { word: 'karma', devanagari: 'कर्म', meaning: 'action / duty', partOfSpeech: 'noun' },
                { word: 'uske', devanagari: 'उसके', meaning: 'its / of that', partOfSpeech: 'pronoun' },
                { word: 'phalon', devanagari: 'फलों', meaning: 'fruits / results', partOfSpeech: 'noun (plural)' },
                { word: 'kabhi', devanagari: 'कभी', meaning: 'ever / at any time', partOfSpeech: 'adverb' },
                { word: 'nahi', devanagari: 'नहीं', meaning: 'not', partOfSpeech: 'adverb' },
                { word: 'isliye', devanagari: 'इसलिए', meaning: 'therefore', partOfSpeech: 'adverb' },
                { word: 'tum', devanagari: 'तुम', meaning: 'you', partOfSpeech: 'pronoun' },
                { word: 'chahat', devanagari: 'चाहत', meaning: 'desire / wish', partOfSpeech: 'noun' },
                { word: 'mat', devanagari: 'मत', meaning: 'do not', partOfSpeech: 'particle' },
                { word: 'tumhari', devanagari: 'तुम्हारी', meaning: 'your', partOfSpeech: 'pronoun' },
                { word: 'aasakti', devanagari: 'आसक्ति', meaning: 'attachment', partOfSpeech: 'noun' },
                { word: 'na', devanagari: 'न', meaning: 'not', partOfSpeech: 'particle' },
                { word: 'karne', devanagari: 'करने', meaning: 'doing / to do', partOfSpeech: 'verb' }
              ],
              questions: [],
              parts: [
                {
                  partIndex: 1,
                  title: 'Part 1: Your Right to Action',
                  hindiTranslationDevanagari: 'तुम्हारा अधिकार केवल कर्म करने पर है,',
                  hindiTranslationRoman: 'Tumhara adhikar keval karma karne par hai,',
                  translation: 'You have a right to perform your prescribed duties.',
                  wordBreakdown: [
                    { word: 'tumhara', devanagari: 'तुम्हारा', meaning: 'your', partOfSpeech: 'pronoun' },
                    { word: 'adhikar', devanagari: 'अधिकार', meaning: 'right / authority', partOfSpeech: 'noun' },
                    { word: 'keval', devanagari: 'केवल', meaning: 'only', partOfSpeech: 'adverb' },
                    { word: 'karma', devanagari: 'कर्म', meaning: 'action / duty', partOfSpeech: 'noun' }
                  ],
                  questions: [
                    {
                      id: 'bg247_p1_w',
                      type: 'phrase_matching',
                      warmup: true,
                      targetWords: ['tumhara', 'adhikar', 'keval', 'karma'],
                      prompt: 'Match each Hindi word to its meaning.',
                      pairs: [
                        { hindi: { dev: 'तुम्हारा', roman: 'tumhara' }, english: 'your' },
                        { hindi: { dev: 'अधिकार', roman: 'adhikar' }, english: 'right / authority' },
                        { hindi: { dev: 'केवल', roman: 'keval' }, english: 'only' },
                        { hindi: { dev: 'कर्म', roman: 'karma' }, english: 'action / duty' }
                      ]
                    },
                    {
                      id: 'bg247_p1_m',
                      type: 'phrase_matching',
                      targetWords: ['tumhara', 'adhikar', 'keval', 'karma'],
                      prompt: 'Now match the Hindi phrases to their meanings.',
                      pairs: [
                        { hindi: { dev: 'तुम्हारा अधिकार', roman: 'tumhara adhikar' }, english: 'your right' },
                        { hindi: { dev: 'केवल कर्म करने पर', roman: 'keval karma karne par' }, english: 'only to do your duty' }
                      ]
                    },
                    {
                      id: 'bg247_p1_c',
                      type: 'fill_in_the_blank',
                      targetWords: ['tumhara', 'adhikar', 'keval', 'karma'],
                      prompt: 'Complete the English sentence.',
                      hindi: { dev: 'तुम्हारा अधिकार केवल कर्म करने पर है,', roman: 'Tumhara adhikar keval karma karne par hai,' },
                      sentence: 'Your right is only to do your ____,',
                      options: ['duty', 'no', 'reward', 'always'],
                      answer: 'duty',
                      explanation: 'The full phrase: "Your right is only to do your duty."'
                    },
                    {
                      id: 'bg247_p1_t',
                      type: 'translate',
                      targetWords: ['tumhara', 'adhikar', 'keval', 'karma'],
                      prompt: 'Translate this sentence',
                      hindi: { dev: 'तुम्हारा अधिकार केवल कर्म करने पर है,', roman: 'Tumhara adhikar keval karma karne par hai,' },
                      answer: 'Your right is only to do your duty,',
                      tiles: ['Your right', 'is only', 'to do your duty,', 'no reward', 'always'],
                      clues: [
                        { from: 2, to: 3, tile: 'is only' }
                      ],
                      explanation: 'You have a right to perform your prescribed duties.'
                    }
                  ]
                },
                {
                  partIndex: 2,
                  title: 'Part 2: Detachment from Results',
                  hindiTranslationDevanagari: 'उसके फलों पर कभी नहीं।',
                  hindiTranslationRoman: 'uske phalon par kabhi nahi.',
                  translation: 'Never in the fruits at any time.',
                  wordBreakdown: [
                    { word: 'uske', devanagari: 'उसके', meaning: 'its / of that', partOfSpeech: 'pronoun' },
                    { word: 'phalon', devanagari: 'फलों', meaning: 'fruits / results', partOfSpeech: 'noun (plural)' },
                    { word: 'kabhi', devanagari: 'कभी', meaning: 'ever / at any time', partOfSpeech: 'adverb' },
                    { word: 'nahi', devanagari: 'नहीं', meaning: 'not', partOfSpeech: 'adverb' }
                  ],
                  questions: [
                    {
                      id: 'bg247_p2_w',
                      type: 'phrase_matching',
                      warmup: true,
                      targetWords: ['uske', 'phalon', 'kabhi', 'nahi'],
                      prompt: 'Match each Hindi word to its meaning.',
                      pairs: [
                        { hindi: { dev: 'उसके', roman: 'uske' }, english: 'its / of that' },
                        { hindi: { dev: 'फलों', roman: 'phalon' }, english: 'fruits / results' },
                        { hindi: { dev: 'कभी', roman: 'kabhi' }, english: 'ever / at any time' },
                        { hindi: { dev: 'नहीं', roman: 'nahi' }, english: 'not' }
                      ]
                    },
                    {
                      id: 'bg247_p2_m',
                      type: 'phrase_matching',
                      targetWords: ['uske', 'phalon', 'kabhi', 'nahi'],
                      prompt: 'Now match the Hindi phrases to their meanings.',
                      pairs: [
                        { hindi: { dev: 'उसके फलों पर', roman: 'uske phalon par' }, english: 'on its fruits' },
                        { hindi: { dev: 'कभी नहीं', roman: 'kabhi nahi' }, english: 'never' }
                      ]
                    },
                    {
                      id: 'bg247_p2_c',
                      type: 'fill_in_the_blank',
                      targetWords: ['uske', 'phalon', 'kabhi', 'nahi'],
                      prompt: 'Complete the English sentence.',
                      hindi: { dev: 'उसके फलों पर कभी नहीं।', roman: 'uske phalon par kabhi nahi.' },
                      sentence: 'Never on its ____.',
                      options: ['fruits', 'actions', 'no', 'reward'],
                      answer: 'fruits',
                      explanation: 'The full phrase: "Never on its fruits.."'
                    },
                    {
                      id: 'bg247_p2_t',
                      type: 'translate',
                      targetWords: ['uske', 'phalon', 'kabhi', 'nahi'],
                      prompt: 'Translate this sentence',
                      hindi: { dev: 'उसके फलों पर कभी नहीं।', roman: 'uske phalon par kabhi nahi.' },
                      answer: 'never on its fruits.',
                      tiles: ['never on', 'its fruits.', 'actions'],
                      explanation: 'Never in the fruits at any time.'
                    }
                  ]
                },
                {
                  partIndex: 3,
                  title: 'Part 3: Freedom from Motive',
                  hindiTranslationDevanagari: 'इसलिए तुम कर्म के फलों की चाहत मत रखो,',
                  hindiTranslationRoman: 'Isliye tum karma ke phalon ki chahat mat rakho,',
                  translation: 'Never be motivated by the fruits of action.',
                  wordBreakdown: [
                    { word: 'isliye', devanagari: 'इसलिए', meaning: 'therefore', partOfSpeech: 'adverb' },
                    { word: 'tum', devanagari: 'तुम', meaning: 'you', partOfSpeech: 'pronoun' },
                    { word: 'chahat', devanagari: 'चाहत', meaning: 'desire / wish', partOfSpeech: 'noun' },
                    { word: 'mat', devanagari: 'मत', meaning: 'do not', partOfSpeech: 'particle' }
                  ],
                  questions: [
                    {
                      id: 'bg247_p3_w',
                      type: 'phrase_matching',
                      warmup: true,
                      targetWords: ['isliye', 'tum', 'chahat', 'mat'],
                      prompt: 'Match each Hindi word to its meaning.',
                      pairs: [
                        { hindi: { dev: 'इसलिए', roman: 'isliye' }, english: 'therefore' },
                        { hindi: { dev: 'तुम', roman: 'tum' }, english: 'you' },
                        { hindi: { dev: 'चाहत', roman: 'chahat' }, english: 'desire / wish' },
                        { hindi: { dev: 'मत', roman: 'mat' }, english: 'do not' }
                      ]
                    },
                    {
                      id: 'bg247_p3_m',
                      type: 'phrase_matching',
                      targetWords: ['isliye', 'tum', 'chahat', 'mat'],
                      prompt: 'Now match the Hindi phrases to their meanings.',
                      pairs: [
                        { hindi: { dev: 'इसलिए तुम', roman: 'isliye tum' }, english: 'therefore you' },
                        { hindi: { dev: 'कर्म के फलों की', roman: 'karma ke phalon ki' }, english: 'of the fruits of action' },
                        { hindi: { dev: 'चाहत मत रखो', roman: 'chahat mat rakho' }, english: 'do not desire' }
                      ]
                    },
                    {
                      id: 'bg247_p3_c',
                      type: 'fill_in_the_blank',
                      targetWords: ['isliye', 'tum', 'chahat', 'mat'],
                      prompt: 'Complete the English sentence.',
                      hindi: { dev: 'इसलिए तुम कर्म के फलों की चाहत मत रखो,', roman: 'Isliye tum karma ke phalon ki chahat mat rakho,' },
                      sentence: 'Therefore, do not desire the fruits of your ____,',
                      options: ['actions', 'wish', 'no', 'reward'],
                      answer: 'actions',
                      explanation: 'The full phrase: "Therefore, do not desire the fruits of your actions."'
                    },
                    {
                      id: 'bg247_p3_t',
                      type: 'translate',
                      targetWords: ['isliye', 'tum', 'chahat', 'mat'],
                      prompt: 'Translate this sentence',
                      hindi: { dev: 'इसलिए तुम कर्म के फलों की चाहत मत रखो,', roman: 'Isliye tum karma ke phalon ki chahat mat rakho,' },
                      answer: 'Therefore, do not desire the fruits of your actions,',
                      tiles: ['Therefore,', 'do not desire', 'the fruits', 'of your actions,', 'wish for'],
                      explanation: 'Never be motivated by the fruits of action.'
                    },
                    {
                      id: 'bg247_p3_q',
                      type: 'multiple_choice',
                      prompt: 'What does Krishna ask about the motive behind your work?',
                      options: [
                        {
                          text: 'Do not let the desire for results be the motive for your work.',
                          isCorrect: true,
                          explanation: 'Correct! Work for the sake of duty, not greed for results.'
                        },
                        { text: 'Always demand high rewards before working.', isCorrect: false, explanation: 'Incorrect. Krishna asks the opposite.' }
                      ]
                    }
                  ]
                },
                {
                  partIndex: 4,
                  title: 'Part 4: Not Attached to Inaction',
                  hindiTranslationDevanagari: 'और न ही तुम्हारी आसक्ति कर्म न करने में हो।',
                  hindiTranslationRoman: 'aur na hi tumhari aasakti karma na karne mein ho.',
                  translation: 'Nor let your attachment be to inaction.',
                  wordBreakdown: [
                    { word: 'tumhari', devanagari: 'तुम्हारी', meaning: 'your', partOfSpeech: 'pronoun' },
                    { word: 'aasakti', devanagari: 'आसक्ति', meaning: 'attachment', partOfSpeech: 'noun' },
                    { word: 'na', devanagari: 'न', meaning: 'not', partOfSpeech: 'particle' },
                    { word: 'karne', devanagari: 'करने', meaning: 'doing / to do', partOfSpeech: 'verb' }
                  ],
                  questions: [
                    {
                      id: 'bg247_p4_w',
                      type: 'phrase_matching',
                      warmup: true,
                      targetWords: ['tumhari', 'aasakti', 'na', 'karne'],
                      prompt: 'Match each Hindi word to its meaning.',
                      pairs: [
                        { hindi: { dev: 'तुम्हारी', roman: 'tumhari' }, english: 'your' },
                        { hindi: { dev: 'आसक्ति', roman: 'aasakti' }, english: 'attachment' },
                        { hindi: { dev: 'न', roman: 'na' }, english: 'not' },
                        { hindi: { dev: 'करने', roman: 'karne' }, english: 'doing / to do' }
                      ]
                    },
                    {
                      id: 'bg247_p4_m',
                      type: 'phrase_matching',
                      targetWords: ['tumhari', 'aasakti', 'na', 'karne'],
                      prompt: 'Now match the Hindi phrases to their meanings.',
                      pairs: [
                        { hindi: { dev: 'और न ही', roman: 'aur na hi' }, english: 'and nor' },
                        { hindi: { dev: 'तुम्हारी आसक्ति', roman: 'tumhari aasakti' }, english: 'your attachment' },
                        { hindi: { dev: 'कर्म न करने में', roman: 'karma na karne mein' }, english: 'in not doing your duty' }
                      ]
                    },
                    {
                      id: 'bg247_p4_c',
                      type: 'fill_in_the_blank',
                      targetWords: ['tumhari', 'aasakti', 'na', 'karne'],
                      prompt: 'Complete the English sentence.',
                      hindi: { dev: 'और न ही तुम्हारी आसक्ति कर्म न करने में हो।', roman: 'aur na hi tumhari aasakti karma na karne mein ho.' },
                      sentence: 'Nor should your attachment be toward not doing ____.',
                      options: ['work', 'run', 'away', 'no'],
                      answer: 'work',
                      explanation: 'The full phrase: "Nor should your attachment be toward not doing work.."'
                    },
                    {
                      id: 'bg247_p4_t',
                      type: 'translate',
                      targetWords: ['tumhari', 'aasakti', 'na', 'karne'],
                      prompt: 'Translate this sentence',
                      hindi: { dev: 'और न ही तुम्हारी आसक्ति कर्म न करने में हो।', roman: 'aur na hi tumhari aasakti karma na karne mein ho.' },
                      answer: 'nor should your attachment be toward not doing work.',
                      tiles: ['nor should', 'your attachment', 'be', 'toward not', 'doing work.', 'run away'],
                      clues: [
                        { from: 3, to: 5, tile: 'your attachment' }
                      ],
                      explanation: 'Nor let your attachment be to inaction.'
                    }
                  ]
                }
              ],
              finalSynthesisQuestions: [
                {
                  id: 'bg247_syn_m',
                  type: 'phrase_matching',
                  targetWords: [
                    'tumhara',
                    'adhikar',
                    'keval',
                    'karma',
                    'uske',
                    'phalon',
                    'kabhi',
                    'nahi',
                    'isliye',
                    'tum',
                    'chahat',
                    'mat',
                    'tumhari',
                    'aasakti',
                    'na',
                    'karne'
                  ],
                  prompt: 'Match every phrase of the verse to its meaning.',
                  pairs: [
                    {
                      hindi: { dev: 'तुम्हारा अधिकार केवल कर्म करने पर है,', roman: 'Tumhara adhikar keval karma karne par hai,' },
                      english: 'Your right is only to do your duty'
                    },
                    { hindi: { dev: 'उसके फलों पर कभी नहीं।', roman: 'uske phalon par kabhi nahi.' }, english: 'never on its fruits/results.' },
                    {
                      hindi: { dev: 'इसलिए तुम कर्म के फलों की चाहत मत रखो,', roman: 'Isliye tum karma ke phalon ki chahat mat rakho,' },
                      english: 'Therefore, do not desire the fruits of your actions,'
                    },
                    {
                      hindi: { dev: 'और न ही तुम्हारी आसक्ति कर्म न करने में हो।', roman: 'aur na hi tumhari aasakti karma na karne mein ho.' },
                      english: 'nor be attached to not doing your duty.'
                    }
                  ]
                },
                {
                  id: 'bg247_syn_t1',
                  type: 'translate',
                  targetWords: ['tumhara', 'adhikar', 'keval', 'karma', 'uske', 'phalon', 'kabhi', 'nahi'],
                  prompt: 'Translate this sentence',
                  hindi: {
                    dev: 'तुम्हारा अधिकार केवल कर्म करने पर है, उसके फलों पर कभी नहीं।',
                    roman: 'Tumhara adhikar keval karma karne par hai, uske phalon par kabhi nahi.'
                  },
                  answer: 'Your right is only to do your duty, never on its fruits.',
                  tiles: [
                    'Your right',
                    'is only',
                    'to do your duty,',
                    'never on',
                    'its fruits.',
                    'no reward',
                    'always',
                    'actions'
                  ],
                  explanation: 'You have a right to perform your prescribed duties. Never in the fruits at any time.',
                  clues: [
                    { from: 2, to: 3, tile: 'is only' }
                  ]
                },
                {
                  id: 'bg247_syn_t2',
                  type: 'translate',
                  targetWords: ['isliye', 'tum', 'chahat', 'mat', 'tumhari', 'aasakti', 'na', 'karne'],
                  prompt: 'Translate this sentence',
                  hindi: {
                    dev: 'इसलिए तुम कर्म के फलों की चाहत मत रखो, और न ही तुम्हारी आसक्ति कर्म न करने में हो।',
                    roman: 'Isliye tum karma ke phalon ki chahat mat rakho, aur na hi tumhari aasakti karma na karne mein ho.'
                  },
                  answer: 'Therefore, do not desire the fruits of your actions, nor should your attachment be toward not doing work.',
                  tiles: [
                    'Therefore,',
                    'do not desire',
                    'the fruits',
                    'of your actions,',
                    'nor should',
                    'your attachment',
                    'be',
                    'toward not',
                    'doing work.',
                    'run away'
                  ],
                  explanation: 'Never be motivated by the fruits of action. Nor let your attachment be to inaction.',
                  clues: [
                    { from: 12, to: 14, tile: 'your attachment' }
                  ]
                },
                {
                  id: 'bg247_syn_q3',
                  type: 'multiple_choice',
                  prompt: 'How does mastering BG 2.47 reduce performance anxiety in modern daily life?',
                  options: [
                    {
                      text: 'By focusing 100% on effort and preparation while releasing worry over outcome.',
                      isCorrect: true,
                      explanation: 'Correct! Directing mind power to the task itself eliminates fear of failure.'
                    },
                    { text: 'By quitting difficult projects immediately.', isCorrect: false, explanation: 'Incorrect. Krishna warns against attachment to inaction.' }
                  ]
                },
                {
                  id: 'syn_q4',
                  type: 'reflection',
                  prompt: 'Personal Reflection on Karma Yoga:',
                  verseContext: 'BG 2.47: "You have a right to perform your prescribed duties, but never to the fruits of your actions."',
                  guidance: 'Reflect on a personal project or goal you are currently pursuing. How would your peace of mind and effort change if you detached from the final outcome and focused entirely on the craftsmanship of your action today?'
                }
              ]
            },
            {
              id: 'ch2_sec1_l2',
              title: 'Equanimity in Action',
              verseRef: 'BG 2.48',
              essence: 'Stay steady in success and failure. That evenness of mind is Yoga.',
              verseSanskrit: 'योगस्थः कुरु कर्माणि सङ्गं त्यक्त्वा धनञ्जय ।\nसिद्ध्यसिद्ध्योः समो भूत्वा समत्वं योग उच्यते ॥',
              hindiTranslationDevanagari: 'योग में स्थित होकर कर्म करो, आसक्ति को त्यागकर, हे धनञ्जय,\nसफलता और असफलता में समान रहकर, समभाव ही योग कहलाता है।',
              hindiTranslationRoman: 'Yog mein sthit hokar karma karo, aasakti ko tyagkar, he dhananjay,\nsafalta aur asafalta mein samaan rahkar, samabhav hi yog kehlata hai.',
              translation: 'Perform your duty equipoised, O Arjuna, abandoning all attachment to success or failure. Such equanimity is called Yoga.',
              purport: 'Krishna advises Arjuna to maintain a balanced mind regardless of victory or defeat.',
              commentary: {
                author: 'Adi Shankaracharya',
                tradition: 'Advaita Vedanta',
                text: 'Equanimity (samatvam) is remaining unshaken in praise or blame, gain or loss. When the mind is steady and undisturbed by external results, every action becomes a spiritual discipline (Yoga).'
              },
              reflectionPrompt: 'Recall a recent situation where an unexpected outcome disturbed your peace. How could practicing "samatvam" (evenness of mind) help you respond differently next time?',
              storyCaption: 'Do your duty, and let go of the outcome, Krishna taught. To remain even in victory and in defeat — that is Yoga.',
              wordBreakdown: [
                { word: 'yog', devanagari: 'योग', meaning: 'Yoga', partOfSpeech: 'noun' },
                { word: 'sthit', devanagari: 'स्थित', meaning: 'established', partOfSpeech: 'adjective' },
                { word: 'karma', devanagari: 'कर्म', meaning: 'action / duty', partOfSpeech: 'noun' },
                { word: 'karo', devanagari: 'करो', meaning: 'do / perform', partOfSpeech: 'verb' },
                { word: 'aasakti', devanagari: 'आसक्ति', meaning: 'attachment', partOfSpeech: 'noun' },
                { word: 'tyagkar', devanagari: 'त्यागकर', meaning: 'giving up / having abandoned', partOfSpeech: 'verb' },
                { word: 'dhananjay', devanagari: 'धनञ्जय', meaning: 'Arjuna ("winner of wealth")', partOfSpeech: 'noun (name)' },
                { word: 'safalta', devanagari: 'सफलता', meaning: 'success', partOfSpeech: 'noun' },
                { word: 'asafalta', devanagari: 'असफलता', meaning: 'failure', partOfSpeech: 'noun' },
                { word: 'samaan', devanagari: 'समान', meaning: 'equal / even', partOfSpeech: 'adjective' },
                { word: 'samabhav', devanagari: 'समभाव', meaning: 'evenness of mind', partOfSpeech: 'noun' },
                { word: 'kehlata', devanagari: 'कहलाता', meaning: 'is called', partOfSpeech: 'verb' }
              ],
              questions: [],
              parts: [
                {
                  partIndex: 1,
                  title: 'Part 1: Established in Yoga',
                  hindiTranslationDevanagari: 'योग में स्थित होकर कर्म करो,',
                  hindiTranslationRoman: 'Yog mein sthit hokar karma karo,',
                  translation: 'Established in Yoga, perform your duties.',
                  wordBreakdown: [
                    { word: 'yog', devanagari: 'योग', meaning: 'Yoga', partOfSpeech: 'noun' },
                    { word: 'sthit', devanagari: 'स्थित', meaning: 'established', partOfSpeech: 'adjective' },
                    { word: 'karma', devanagari: 'कर्म', meaning: 'action / duty', partOfSpeech: 'noun' },
                    { word: 'karo', devanagari: 'करो', meaning: 'do / perform', partOfSpeech: 'verb' }
                  ],
                  questions: [
                    {
                      id: 'bg248_p1_w',
                      type: 'phrase_matching',
                      warmup: true,
                      targetWords: ['yog', 'sthit', 'karma', 'karo'],
                      prompt: 'Match each Hindi word to its meaning.',
                      pairs: [
                        { hindi: { dev: 'योग', roman: 'yog' }, english: 'Yoga' },
                        { hindi: { dev: 'स्थित', roman: 'sthit' }, english: 'established' },
                        { hindi: { dev: 'कर्म', roman: 'karma' }, english: 'action / duty' },
                        { hindi: { dev: 'करो', roman: 'karo' }, english: 'do / perform' }
                      ]
                    },
                    {
                      id: 'bg248_p1_m',
                      type: 'phrase_matching',
                      targetWords: ['yog', 'sthit', 'karma', 'karo'],
                      prompt: 'Now match the Hindi phrases to their meanings.',
                      pairs: [
                        { hindi: { dev: 'योग में स्थित होकर', roman: 'yog mein sthit hokar' }, english: 'established in yoga' },
                        { hindi: { dev: 'कर्म करो', roman: 'karma karo' }, english: 'perform your duty' }
                      ]
                    },
                    {
                      id: 'bg248_p1_c',
                      type: 'fill_in_the_blank',
                      targetWords: ['yog', 'sthit', 'karma', 'karo'],
                      prompt: 'Complete the English sentence.',
                      hindi: { dev: 'योग में स्थित होकर कर्म करो,', roman: 'Yog mein sthit hokar karma karo,' },
                      sentence: 'Established in yoga, perform your ____,',
                      options: ['duties', 'abandon', 'failure', 'success'],
                      answer: 'duties',
                      explanation: 'The full phrase: "Established in yoga, perform your duties."'
                    },
                    {
                      id: 'bg248_p1_t',
                      type: 'translate',
                      targetWords: ['yog', 'sthit', 'karma', 'karo'],
                      prompt: 'Translate this sentence',
                      hindi: { dev: 'योग में स्थित होकर कर्म करो,', roman: 'Yog mein sthit hokar karma karo,' },
                      answer: 'Established in yoga, perform your duties,',
                      tiles: ['Established in yoga,', 'perform', 'your duties,', 'abandon', 'failure'],
                      clues: [
                        { from: 2, to: 4, tile: 'Established in yoga,' }
                      ],
                      explanation: 'Established in Yoga, perform your duties.'
                    }
                  ]
                },
                {
                  partIndex: 2,
                  title: 'Part 2: Letting Go of Attachment',
                  hindiTranslationDevanagari: 'आसक्ति को त्यागकर, हे धनञ्जय,',
                  hindiTranslationRoman: 'aasakti ko tyagkar, he dhananjay,',
                  translation: 'Abandoning all attachment, O Arjuna.',
                  wordBreakdown: [
                    { word: 'aasakti', devanagari: 'आसक्ति', meaning: 'attachment', partOfSpeech: 'noun' },
                    { word: 'tyagkar', devanagari: 'त्यागकर', meaning: 'giving up / having abandoned', partOfSpeech: 'verb' },
                    { word: 'dhananjay', devanagari: 'धनञ्जय', meaning: 'Arjuna ("winner of wealth")', partOfSpeech: 'noun (name)' }
                  ],
                  questions: [
                    {
                      id: 'bg248_p2_w',
                      type: 'phrase_matching',
                      warmup: true,
                      targetWords: ['aasakti', 'tyagkar', 'dhananjay'],
                      prompt: 'Match each Hindi word to its meaning.',
                      pairs: [
                        { hindi: { dev: 'आसक्ति', roman: 'aasakti' }, english: 'attachment' },
                        { hindi: { dev: 'त्यागकर', roman: 'tyagkar' }, english: 'giving up / having abandoned' },
                        { hindi: { dev: 'धनञ्जय', roman: 'dhananjay' }, english: 'Arjuna ("winner of wealth")' }
                      ]
                    },
                    {
                      id: 'bg248_p2_m',
                      type: 'phrase_matching',
                      targetWords: ['aasakti', 'tyagkar', 'dhananjay'],
                      prompt: 'Now match the Hindi phrases to their meanings.',
                      pairs: [
                        { hindi: { dev: 'आसक्ति को त्यागकर', roman: 'aasakti ko tyagkar' }, english: 'abandoning attachment' },
                        { hindi: { dev: 'हे धनञ्जय', roman: 'he dhananjay' }, english: 'O Arjuna' }
                      ]
                    },
                    {
                      id: 'bg248_p2_c',
                      type: 'fill_in_the_blank',
                      targetWords: ['aasakti', 'tyagkar', 'dhananjay'],
                      prompt: 'Complete the English sentence.',
                      hindi: { dev: 'आसक्ति को त्यागकर, हे धनञ्जय,', roman: 'aasakti ko tyagkar, he dhananjay,' },
                      sentence: 'Abandoning attachment, O ____,',
                      options: ['arjuna', 'success', 'wealth', 'abandon'],
                      answer: 'arjuna',
                      explanation: 'The full phrase: "Abandoning attachment, O Arjuna."'
                    },
                    {
                      id: 'bg248_p2_t',
                      type: 'translate',
                      targetWords: ['aasakti', 'tyagkar', 'dhananjay'],
                      prompt: 'Translate this sentence',
                      hindi: { dev: 'आसक्ति को त्यागकर, हे धनञ्जय,', roman: 'aasakti ko tyagkar, he dhananjay,' },
                      answer: 'abandoning attachment, O Arjuna,',
                      tiles: ['abandoning', 'attachment,', 'O Arjuna,', 'success', 'wealth'],
                      clues: [
                        { from: 4, to: 5, tile: 'O Arjuna,' }
                      ],
                      explanation: 'Abandoning all attachment, O Arjuna.'
                    }
                  ]
                },
                {
                  partIndex: 3,
                  title: 'Part 3: Equal in Success and Failure',
                  hindiTranslationDevanagari: 'सफलता और असफलता में समान रहकर,',
                  hindiTranslationRoman: 'safalta aur asafalta mein samaan rahkar,',
                  translation: 'Being equal in success and failure.',
                  wordBreakdown: [
                    { word: 'safalta', devanagari: 'सफलता', meaning: 'success', partOfSpeech: 'noun' },
                    { word: 'asafalta', devanagari: 'असफलता', meaning: 'failure', partOfSpeech: 'noun' },
                    { word: 'samaan', devanagari: 'समान', meaning: 'equal / even', partOfSpeech: 'adjective' }
                  ],
                  questions: [
                    {
                      id: 'bg248_p3_w',
                      type: 'phrase_matching',
                      warmup: true,
                      targetWords: ['safalta', 'asafalta', 'samaan'],
                      prompt: 'Match each Hindi word to its meaning.',
                      pairs: [
                        { hindi: { dev: 'सफलता', roman: 'safalta' }, english: 'success' },
                        { hindi: { dev: 'असफलता', roman: 'asafalta' }, english: 'failure' },
                        { hindi: { dev: 'समान', roman: 'samaan' }, english: 'equal / even' }
                      ]
                    },
                    {
                      id: 'bg248_p3_m',
                      type: 'phrase_matching',
                      targetWords: ['safalta', 'asafalta', 'samaan'],
                      prompt: 'Now match the Hindi phrases to their meanings.',
                      pairs: [
                        { hindi: { dev: 'सफलता और असफलता में', roman: 'safalta aur asafalta mein' }, english: 'in success and failure' },
                        { hindi: { dev: 'समान रहकर', roman: 'samaan rahkar' }, english: 'remaining equal' }
                      ]
                    },
                    {
                      id: 'bg248_p3_c',
                      type: 'fill_in_the_blank',
                      targetWords: ['safalta', 'asafalta', 'samaan'],
                      prompt: 'Complete the English sentence.',
                      hindi: { dev: 'सफलता और असफलता में समान रहकर,', roman: 'safalta aur asafalta mein samaan rahkar,' },
                      sentence: 'Being equal in success and ____,',
                      options: ['failure', 'unequal', 'duties', 'abandon'],
                      answer: 'failure',
                      explanation: 'The full phrase: "Being equal in success and failure."'
                    },
                    {
                      id: 'bg248_p3_t',
                      type: 'translate',
                      targetWords: ['safalta', 'asafalta', 'samaan'],
                      prompt: 'Translate this sentence',
                      hindi: { dev: 'सफलता और असफलता में समान रहकर,', roman: 'safalta aur asafalta mein samaan rahkar,' },
                      answer: 'Being equal in success and failure,',
                      tiles: ['Being equal', 'in success', 'and failure,', 'unequal', 'duties'],
                      clues: [
                        { from: 4, to: 5, tile: 'Being equal' }
                      ],
                      explanation: 'Being equal in success and failure.'
                    }
                  ]
                },
                {
                  partIndex: 4,
                  title: 'Part 4: Definition of Yoga',
                  hindiTranslationDevanagari: 'समभाव ही योग कहलाता है।',
                  hindiTranslationRoman: 'samabhav hi yog kehlata hai.',
                  translation: 'Such evenness of mind is called Yoga.',
                  wordBreakdown: [
                    { word: 'samabhav', devanagari: 'समभाव', meaning: 'evenness of mind', partOfSpeech: 'noun' },
                    { word: 'yog', devanagari: 'योग', meaning: 'Yoga', partOfSpeech: 'noun' },
                    { word: 'kehlata', devanagari: 'कहलाता', meaning: 'is called', partOfSpeech: 'verb' }
                  ],
                  questions: [
                    {
                      id: 'bg248_p4_w',
                      type: 'phrase_matching',
                      warmup: true,
                      targetWords: ['samabhav', 'yog', 'kehlata'],
                      prompt: 'Match each Hindi word to its meaning.',
                      pairs: [
                        { hindi: { dev: 'समभाव', roman: 'samabhav' }, english: 'evenness of mind' },
                        { hindi: { dev: 'योग', roman: 'yog' }, english: 'Yoga' },
                        { hindi: { dev: 'कहलाता', roman: 'kehlata' }, english: 'is called' }
                      ]
                    },
                    {
                      id: 'bg248_p4_m',
                      type: 'phrase_matching',
                      targetWords: ['samabhav', 'yog', 'kehlata'],
                      prompt: 'Now match the Hindi phrases to their meanings.',
                      pairs: [
                        { hindi: { dev: 'समभाव', roman: 'samabhav' }, english: 'evenness of mind' },
                        { hindi: { dev: 'योग कहलाता है', roman: 'yog kehlata hai' }, english: 'is called yoga' }
                      ]
                    },
                    {
                      id: 'bg248_p4_c',
                      type: 'fill_in_the_blank',
                      targetWords: ['samabhav', 'yog', 'kehlata'],
                      prompt: 'Complete the English sentence.',
                      hindi: { dev: 'समभाव ही योग कहलाता है।', roman: 'samabhav hi yog kehlata hai.' },
                      sentence: 'Evenness of mind alone is called ____.',
                      options: ['yoga', 'skill', 'peace', 'abandon'],
                      answer: 'yoga',
                      explanation: 'The full phrase: "Evenness of mind alone is called yoga.."'
                    },
                    {
                      id: 'bg248_p4_t',
                      type: 'translate',
                      targetWords: ['samabhav', 'yog', 'kehlata'],
                      prompt: 'Translate this sentence',
                      hindi: { dev: 'समभाव ही योग कहलाता है।', roman: 'samabhav hi yog kehlata hai.' },
                      answer: 'evenness of mind alone is called yoga.',
                      tiles: ['evenness of mind', 'alone', 'is called', 'yoga.', 'skill', 'peace'],
                      clues: [
                        { from: 0, to: 1, tile: 'evenness of mind' }
                      ],
                      explanation: 'Such evenness of mind is called Yoga.'
                    },
                    {
                      id: 'bg248_p4_q',
                      type: 'multiple_choice',
                      prompt: 'What does Krishna define as "Yoga" in BG 2.48?',
                      options: [
                        { text: 'Equanimity of mind in both success and failure.', isCorrect: true, explanation: 'Correct! Evenness of mind is true Yoga.' },
                        { text: 'Only physical postures.', isCorrect: false, explanation: 'Incorrect.' }
                      ]
                    }
                  ]
                }
              ],
              finalSynthesisQuestions: [
                {
                  id: 'bg248_syn_m',
                  type: 'phrase_matching',
                  targetWords: [
                    'yog',
                    'sthit',
                    'karma',
                    'karo',
                    'aasakti',
                    'tyagkar',
                    'dhananjay',
                    'safalta',
                    'asafalta',
                    'samaan',
                    'samabhav',
                    'kehlata'
                  ],
                  prompt: 'Match every phrase of the verse to its meaning.',
                  pairs: [
                    { hindi: { dev: 'योग में स्थित होकर कर्म करो,', roman: 'Yog mein sthit hokar karma karo,' }, english: 'Established in yoga, perform your duties,' },
                    { hindi: { dev: 'आसक्ति को त्यागकर, हे धनञ्जय,', roman: 'aasakti ko tyagkar, he dhananjay,' }, english: 'abandoning attachment, O Arjuna,' },
                    {
                      hindi: { dev: 'सफलता और असफलता में समान रहकर,', roman: 'safalta aur asafalta mein samaan rahkar,' },
                      english: 'Being equal in success and failure,'
                    },
                    { hindi: { dev: 'समभाव ही योग कहलाता है।', roman: 'samabhav hi yog kehlata hai.' }, english: 'evenness of mind alone is called yoga.' }
                  ]
                },
                {
                  id: 'bg248_syn_t1',
                  type: 'translate',
                  targetWords: ['yog', 'sthit', 'karma', 'karo', 'aasakti', 'tyagkar', 'dhananjay'],
                  prompt: 'Translate this sentence',
                  hindi: { dev: 'योग में स्थित होकर कर्म करो, आसक्ति को त्यागकर, हे धनञ्जय,', roman: 'Yog mein sthit hokar karma karo, aasakti ko tyagkar, he dhananjay,' },
                  answer: 'Established in yoga, perform your duties, abandoning attachment, O Arjuna,',
                  tiles: [
                    'Established in yoga,',
                    'perform',
                    'your duties,',
                    'abandoning',
                    'attachment,',
                    'O Arjuna,',
                    'abandon',
                    'failure',
                    'success'
                  ],
                  explanation: 'Established in Yoga, perform your duties. Abandoning all attachment, O Arjuna.',
                  clues: [
                    { from: 2, to: 4, tile: 'Established in yoga,' },
                    { from: 10, to: 11, tile: 'O Arjuna,' }
                  ]
                },
                {
                  id: 'bg248_syn_t2',
                  type: 'translate',
                  targetWords: ['safalta', 'asafalta', 'samaan', 'samabhav', 'yog', 'kehlata'],
                  prompt: 'Translate this sentence',
                  hindi: { dev: 'सफलता और असफलता में समान रहकर, समभाव ही योग कहलाता है।', roman: 'safalta aur asafalta mein samaan rahkar, samabhav hi yog kehlata hai.' },
                  answer: 'Being equal in success and failure, evenness of mind alone is called yoga.',
                  tiles: [
                    'Being equal',
                    'in success',
                    'and failure,',
                    'evenness of mind',
                    'alone',
                    'is called',
                    'yoga.',
                    'unequal',
                    'duties',
                    'skill'
                  ],
                  explanation: 'Being equal in success and failure. Such evenness of mind is called Yoga.',
                  clues: [
                    { from: 4, to: 5, tile: 'Being equal' },
                    { from: 6, to: 7, tile: 'evenness of mind' }
                  ]
                }
              ]
            },
            {
              id: 'ch2_sec1_l3',
              title: 'Skill in Action',
              verseRef: 'BG 2.50',
              essence: 'Wise action frees you from good and bad karma. Yoga is skill in action.',
              verseSanskrit: 'बुद्धियुक्तो जहातीह उभे सुकृतदुष्कृते ।\nतस्माद्योगाय युज्यस्व योगः कर्मसु कौशलम् ॥',
              hindiTranslationDevanagari: 'बुद्धि से युक्त व्यक्ति इसी जीवन में पुण्य और पाप दोनों को छोड़ देता है।\nइसलिए तुम योग में लग जाओ। योग ही कर्मों में कुशलता है।',
              hindiTranslationRoman: 'Buddhi se yukt vyakti isi jeevan mein punya aur paap donon ko chhod deta hai.\nIsliye tum yog mein lag jao. Yog hi karmon mein kushalta hai.',
              translation: 'A person engaged in devotional service rids himself of both good and bad actions even in this life. Therefore, strive for Yoga, which is the art of all work.',
              purport: 'Yoga is skill in action ("yogah karmasu kaushalam").',
              storyCaption: 'Wisdom acts without being bound by its results. This skill in action, Krishna said, is the highest art of all.',
              wordBreakdown: [
                { word: 'buddhi', devanagari: 'बुद्धि', meaning: 'wisdom / intellect', partOfSpeech: 'noun' },
                { word: 'punya', devanagari: 'पुण्य', meaning: 'good deeds / merit', partOfSpeech: 'noun' },
                { word: 'paap', devanagari: 'पाप', meaning: 'bad deeds / sin', partOfSpeech: 'noun' },
                { word: 'chhod', devanagari: 'छोड़', meaning: 'give up / leave', partOfSpeech: 'verb' },
                { word: 'isliye', devanagari: 'इसलिए', meaning: 'therefore', partOfSpeech: 'adverb' },
                { word: 'yog', devanagari: 'योग', meaning: 'Yoga', partOfSpeech: 'noun' },
                { word: 'lag', devanagari: 'लग', meaning: 'get engaged / strive', partOfSpeech: 'verb' },
                { word: 'karmon', devanagari: 'कर्मों', meaning: 'actions / works', partOfSpeech: 'noun (plural)' },
                { word: 'kushalta', devanagari: 'कुशलता', meaning: 'skill', partOfSpeech: 'noun' }
              ],
              questions: [],
              parts: [
                {
                  partIndex: 1,
                  title: 'Part 1: Wisdom Overcomes Reaction',
                  hindiTranslationDevanagari: 'बुद्धि से युक्त व्यक्ति इसी जीवन में पुण्य और पाप दोनों को छोड़ देता है।',
                  hindiTranslationRoman: 'Buddhi se yukt vyakti isi jeevan mein punya aur paap donon ko chhod deta hai.',
                  translation: 'One endowed with wisdom casts off both good and bad karma in this life.',
                  wordBreakdown: [
                    { word: 'buddhi', devanagari: 'बुद्धि', meaning: 'wisdom / intellect', partOfSpeech: 'noun' },
                    { word: 'punya', devanagari: 'पुण्य', meaning: 'good deeds / merit', partOfSpeech: 'noun' },
                    { word: 'paap', devanagari: 'पाप', meaning: 'bad deeds / sin', partOfSpeech: 'noun' },
                    { word: 'chhod', devanagari: 'छोड़', meaning: 'give up / leave', partOfSpeech: 'verb' }
                  ],
                  questions: [
                    {
                      id: 'bg250_p1_w',
                      type: 'phrase_matching',
                      warmup: true,
                      targetWords: ['buddhi', 'punya', 'paap', 'chhod'],
                      prompt: 'Match each Hindi word to its meaning.',
                      pairs: [
                        { hindi: { dev: 'बुद्धि', roman: 'buddhi' }, english: 'wisdom / intellect' },
                        { hindi: { dev: 'पुण्य', roman: 'punya' }, english: 'good deeds / merit' },
                        { hindi: { dev: 'पाप', roman: 'paap' }, english: 'bad deeds / sin' },
                        { hindi: { dev: 'छोड़', roman: 'chhod' }, english: 'give up / leave' }
                      ]
                    },
                    {
                      id: 'bg250_p1_m',
                      type: 'phrase_matching',
                      targetWords: ['buddhi', 'punya', 'paap', 'chhod'],
                      prompt: 'Now match the Hindi phrases to their meanings.',
                      pairs: [
                        { hindi: { dev: 'बुद्धि से युक्त व्यक्ति', roman: 'buddhi se yukt vyakti' }, english: 'a person endowed with wisdom' },
                        { hindi: { dev: 'इसी जीवन में', roman: 'isi jeevan mein' }, english: 'in this very life' },
                        {
                          hindi: { dev: 'पुण्य और पाप दोनों को छोड़ देता है', roman: 'punya aur paap donon ko chhod deta hai' },
                          english: 'gives up both good and bad deeds'
                        }
                      ]
                    },
                    {
                      id: 'bg250_p1_c',
                      type: 'fill_in_the_blank',
                      targetWords: ['buddhi', 'punya', 'paap', 'chhod'],
                      prompt: 'Complete the English sentence.',
                      hindi: {
                        dev: 'बुद्धि से युक्त व्यक्ति इसी जीवन में पुण्य और पाप दोनों को छोड़ देता है।',
                        roman: 'Buddhi se yukt vyakti isi jeevan mein punya aur paap donon ko chhod deta hai.'
                      },
                      sentence: 'A wise person gives up both good and bad deeds in this ____.',
                      options: ['life', 'skill', 'therefore', 'rest'],
                      answer: 'life',
                      explanation: 'The full phrase: "A wise person gives up both good and bad deeds in this life.."'
                    },
                    {
                      id: 'bg250_p1_t',
                      type: 'translate',
                      targetWords: ['buddhi', 'punya', 'paap', 'chhod'],
                      prompt: 'Translate this sentence',
                      hindi: {
                        dev: 'बुद्धि से युक्त व्यक्ति इसी जीवन में पुण्य और पाप दोनों को छोड़ देता है।',
                        roman: 'Buddhi se yukt vyakti isi jeevan mein punya aur paap donon ko chhod deta hai.'
                      },
                      answer: 'A wise person gives up both good and bad deeds in this life.',
                      tiles: [
                        'A wise person',
                        'gives up',
                        'both good and bad deeds',
                        'in this life.',
                        'skill',
                        'therefore'
                      ],
                      clues: [
                        { from: 7, to: 10, tile: 'both good and bad deeds' }
                      ],
                      explanation: 'One endowed with wisdom casts off both good and bad karma in this life.'
                    }
                  ]
                },
                {
                  partIndex: 2,
                  title: 'Part 2: Strive for Yoga',
                  hindiTranslationDevanagari: 'इसलिए तुम योग में लग जाओ।',
                  hindiTranslationRoman: 'Isliye tum yog mein lag jao.',
                  translation: 'Therefore, strive for Yoga.',
                  wordBreakdown: [
                    { word: 'isliye', devanagari: 'इसलिए', meaning: 'therefore', partOfSpeech: 'adverb' },
                    { word: 'yog', devanagari: 'योग', meaning: 'Yoga', partOfSpeech: 'noun' },
                    { word: 'lag', devanagari: 'लग', meaning: 'get engaged / strive', partOfSpeech: 'verb' }
                  ],
                  questions: [
                    {
                      id: 'bg250_p2_w',
                      type: 'phrase_matching',
                      warmup: true,
                      targetWords: ['isliye', 'yog', 'lag'],
                      prompt: 'Match each Hindi word to its meaning.',
                      pairs: [
                        { hindi: { dev: 'इसलिए', roman: 'isliye' }, english: 'therefore' },
                        { hindi: { dev: 'योग', roman: 'yog' }, english: 'Yoga' },
                        { hindi: { dev: 'लग', roman: 'lag' }, english: 'get engaged / strive' }
                      ]
                    },
                    {
                      id: 'bg250_p2_m',
                      type: 'phrase_matching',
                      targetWords: ['isliye', 'yog', 'lag'],
                      prompt: 'Now match the Hindi phrases to their meanings.',
                      pairs: [
                        { hindi: { dev: 'इसलिए', roman: 'isliye' }, english: 'therefore' },
                        { hindi: { dev: 'योग में लग जाओ', roman: 'yog mein lag jao' }, english: 'strive for yoga' }
                      ]
                    },
                    {
                      id: 'bg250_p2_c',
                      type: 'fill_in_the_blank',
                      targetWords: ['isliye', 'yog', 'lag'],
                      prompt: 'Complete the English sentence.',
                      hindi: { dev: 'इसलिए तुम योग में लग जाओ।', roman: 'Isliye tum yog mein lag jao.' },
                      sentence: 'Therefore, strive for ____.',
                      options: ['yoga', 'rest', 'wisdom', 'skill'],
                      answer: 'yoga',
                      explanation: 'The full phrase: "Therefore, strive for yoga.."'
                    },
                    {
                      id: 'bg250_p2_t',
                      type: 'translate',
                      targetWords: ['isliye', 'yog', 'lag'],
                      prompt: 'Translate this sentence',
                      hindi: { dev: 'इसलिए तुम योग में लग जाओ।', roman: 'Isliye tum yog mein lag jao.' },
                      answer: 'Therefore, strive for yoga.',
                      tiles: ['Therefore,', 'strive', 'for yoga.', 'rest', 'wisdom'],
                      clues: [
                        { from: 4, to: 6, tile: 'strive' }
                      ],
                      explanation: 'Therefore, strive for Yoga.'
                    }
                  ]
                },
                {
                  partIndex: 3,
                  title: 'Part 3: Yoga is Skill in Action',
                  hindiTranslationDevanagari: 'योग ही कर्मों में कुशलता है।',
                  hindiTranslationRoman: 'Yog hi karmon mein kushalta hai.',
                  translation: 'Yoga is skill in action.',
                  wordBreakdown: [
                    { word: 'yog', devanagari: 'योग', meaning: 'Yoga', partOfSpeech: 'noun' },
                    { word: 'karmon', devanagari: 'कर्मों', meaning: 'actions / works', partOfSpeech: 'noun (plural)' },
                    { word: 'kushalta', devanagari: 'कुशलता', meaning: 'skill', partOfSpeech: 'noun' }
                  ],
                  questions: [
                    {
                      id: 'bg250_p3_w',
                      type: 'phrase_matching',
                      warmup: true,
                      targetWords: ['yog', 'karmon', 'kushalta'],
                      prompt: 'Match each Hindi word to its meaning.',
                      pairs: [
                        { hindi: { dev: 'योग', roman: 'yog' }, english: 'Yoga' },
                        { hindi: { dev: 'कर्मों', roman: 'karmon' }, english: 'actions / works' },
                        { hindi: { dev: 'कुशलता', roman: 'kushalta' }, english: 'skill' }
                      ]
                    },
                    {
                      id: 'bg250_p3_m',
                      type: 'phrase_matching',
                      targetWords: ['yog', 'karmon', 'kushalta'],
                      prompt: 'Now match the Hindi phrases to their meanings.',
                      pairs: [
                        { hindi: { dev: 'योग ही', roman: 'yog hi' }, english: 'yoga itself' },
                        { hindi: { dev: 'कर्मों में', roman: 'karmon mein' }, english: 'in actions' },
                        { hindi: { dev: 'कुशलता है', roman: 'kushalta hai' }, english: 'is skill' }
                      ]
                    },
                    {
                      id: 'bg250_p3_c',
                      type: 'fill_in_the_blank',
                      targetWords: ['yog', 'karmon', 'kushalta'],
                      prompt: 'Complete the English sentence.',
                      hindi: { dev: 'योग ही कर्मों में कुशलता है।', roman: 'Yog hi karmon mein kushalta hai.' },
                      sentence: 'Yoga itself is skill in ____.',
                      options: ['action', 'both', 'therefore', 'rest'],
                      answer: 'action',
                      explanation: 'The full phrase: "Yoga itself is skill in action.."'
                    },
                    {
                      id: 'bg250_p3_t',
                      type: 'translate',
                      targetWords: ['yog', 'karmon', 'kushalta'],
                      prompt: 'Translate this sentence',
                      hindi: { dev: 'योग ही कर्मों में कुशलता है।', roman: 'Yog hi karmon mein kushalta hai.' },
                      answer: 'Yoga itself is skill in action.',
                      tiles: ['Yoga itself', 'is', 'skill', 'in action.', 'both'],
                      clues: [
                        { from: 4, to: 5, tile: 'skill' }
                      ],
                      explanation: 'Yoga is skill in action.'
                    },
                    {
                      id: 'bg250_p3_q',
                      type: 'multiple_choice',
                      prompt: 'What famous declaration is made in BG 2.50?',
                      options: [
                        { text: 'Yoga is skill in action.', isCorrect: true, explanation: 'Correct!' },
                        { text: 'Work is to be avoided.', isCorrect: false, explanation: 'Incorrect.' }
                      ]
                    }
                  ]
                }
              ],
              finalSynthesisQuestions: [
                {
                  id: 'bg250_syn_m',
                  type: 'phrase_matching',
                  targetWords: ['buddhi', 'punya', 'paap', 'chhod', 'isliye', 'yog', 'lag', 'karmon', 'kushalta'],
                  prompt: 'Match every phrase of the verse to its meaning.',
                  pairs: [
                    {
                      hindi: {
                        dev: 'बुद्धि से युक्त व्यक्ति इसी जीवन में पुण्य और पाप दोनों को छोड़ देता है।',
                        roman: 'Buddhi se yukt vyakti isi jeevan mein punya aur paap donon ko chhod deta hai.'
                      },
                      english: 'A wise person gives up both good and bad deeds in this life.'
                    },
                    { hindi: { dev: 'इसलिए तुम योग में लग जाओ।', roman: 'Isliye tum yog mein lag jao.' }, english: 'Therefore, strive for yoga.' },
                    { hindi: { dev: 'योग ही कर्मों में कुशलता है।', roman: 'Yog hi karmon mein kushalta hai.' }, english: 'Yoga itself is skill in action.' }
                  ]
                },
                {
                  id: 'bg250_syn_t1',
                  type: 'translate',
                  targetWords: ['buddhi', 'punya', 'paap', 'chhod'],
                  prompt: 'Translate this sentence',
                  hindi: {
                    dev: 'बुद्धि से युक्त व्यक्ति इसी जीवन में पुण्य और पाप दोनों को छोड़ देता है।',
                    roman: 'Buddhi se yukt vyakti isi jeevan mein punya aur paap donon ko chhod deta hai.'
                  },
                  answer: 'A wise person gives up both good and bad deeds in this life.',
                  tiles: [
                    'A wise person',
                    'gives up',
                    'both good and bad deeds',
                    'in this life.',
                    'skill',
                    'therefore'
                  ],
                  explanation: 'One endowed with wisdom casts off both good and bad karma in this life.',
                  clues: [
                    { from: 7, to: 10, tile: 'both good and bad deeds' }
                  ]
                },
                {
                  id: 'bg250_syn_t2',
                  type: 'translate',
                  targetWords: ['isliye', 'yog', 'lag', 'karmon', 'kushalta'],
                  prompt: 'Translate this sentence',
                  hindi: { dev: 'इसलिए तुम योग में लग जाओ। योग ही कर्मों में कुशलता है।', roman: 'Isliye tum yog mein lag jao. Yog hi karmon mein kushalta hai.' },
                  answer: 'Therefore, strive for yoga. Yoga itself is skill in action.',
                  tiles: [
                    'Therefore,',
                    'strive',
                    'for yoga.',
                    'Yoga itself',
                    'is',
                    'skill',
                    'in action.',
                    'rest',
                    'wisdom',
                    'both'
                  ],
                  explanation: 'Therefore, strive for Yoga. Yoga is skill in action.',
                  clues: [
                    { from: 4, to: 6, tile: 'strive' },
                    { from: 10, to: 11, tile: 'skill' }
                  ]
                }
              ]
            },
            {
              id: 'ch2_sec1_l4',
              title: 'Attaining Peace',
              verseRef: 'BG 2.71',
              essence: 'Give up craving and ego, and real peace comes.',
              verseSanskrit: 'विहाय कामान्यः सर्वान्पुमांश्चरति निःस्पृहः ।\nनिर्ममो निरहङ्कारः स शान्तिमधिगच्छति ॥',
              hindiTranslationDevanagari: 'जो व्यक्ति सभी कामनाओं को छोड़कर इच्छारहित होकर विचरता है,\nजो ममता और अहंकार से मुक्त है, वही शांति को प्राप्त होता है।',
              hindiTranslationRoman: 'Jo vyakti sabhi kamnaon ko chhodkar ichchharahit hokar vicharta hai,\njo mamta aur ahankar se mukt hai, wahi shanti ko prapt hota hai.',
              translation: 'A person who has given up all desires for sense gratification, who lives free from desires, who has given up all sense of proprietorship and is devoid of false ego — he alone attains real peace.',
              purport: 'True peace comes when we drop possessiveness ("nirmamah") and false ego ("nirahankarah").',
              storyCaption: 'Free of craving, free of ego, Arjuna set down his fear — and found the peace that never fades.',
              wordBreakdown: [
                { word: 'vyakti', devanagari: 'व्यक्ति', meaning: 'person', partOfSpeech: 'noun' },
                { word: 'kamnaon', devanagari: 'कामनाओं', meaning: 'desires', partOfSpeech: 'noun (plural)' },
                { word: 'chhodkar', devanagari: 'छोड़कर', meaning: 'giving up / having left', partOfSpeech: 'verb' },
                { word: 'ichchharahit', devanagari: 'इच्छारहित', meaning: 'free from craving', partOfSpeech: 'adjective' },
                { word: 'mamta', devanagari: 'ममता', meaning: 'possessiveness', partOfSpeech: 'noun' },
                { word: 'ahankar', devanagari: 'अहंकार', meaning: 'ego', partOfSpeech: 'noun' },
                { word: 'mukt', devanagari: 'मुक्त', meaning: 'free', partOfSpeech: 'adjective' },
                { word: 'wahi', devanagari: 'वही', meaning: 'he alone / that very one', partOfSpeech: 'pronoun' },
                { word: 'shanti', devanagari: 'शांति', meaning: 'peace', partOfSpeech: 'noun' },
                { word: 'prapt', devanagari: 'प्राप्त', meaning: 'attained / obtained', partOfSpeech: 'adjective' }
              ],
              questions: [],
              parts: [
                {
                  partIndex: 1,
                  title: 'Part 1: Giving Up Desires',
                  hindiTranslationDevanagari: 'जो व्यक्ति सभी कामनाओं को छोड़कर इच्छारहित होकर विचरता है,',
                  hindiTranslationRoman: 'Jo vyakti sabhi kamnaon ko chhodkar ichchharahit hokar vicharta hai,',
                  translation: 'That person who relinquishes all desires and moves about free from longing.',
                  wordBreakdown: [
                    { word: 'vyakti', devanagari: 'व्यक्ति', meaning: 'person', partOfSpeech: 'noun' },
                    { word: 'kamnaon', devanagari: 'कामनाओं', meaning: 'desires', partOfSpeech: 'noun (plural)' },
                    { word: 'chhodkar', devanagari: 'छोड़कर', meaning: 'giving up / having left', partOfSpeech: 'verb' },
                    { word: 'ichchharahit', devanagari: 'इच्छारहित', meaning: 'free from craving', partOfSpeech: 'adjective' }
                  ],
                  questions: [
                    {
                      id: 'bg271_p1_w',
                      type: 'phrase_matching',
                      warmup: true,
                      targetWords: ['vyakti', 'kamnaon', 'chhodkar', 'ichchharahit'],
                      prompt: 'Match each Hindi word to its meaning.',
                      pairs: [
                        { hindi: { dev: 'व्यक्ति', roman: 'vyakti' }, english: 'person' },
                        { hindi: { dev: 'कामनाओं', roman: 'kamnaon' }, english: 'desires' },
                        { hindi: { dev: 'छोड़कर', roman: 'chhodkar' }, english: 'giving up / having left' },
                        { hindi: { dev: 'इच्छारहित', roman: 'ichchharahit' }, english: 'free from craving' }
                      ]
                    },
                    {
                      id: 'bg271_p1_m',
                      type: 'phrase_matching',
                      targetWords: ['vyakti', 'kamnaon', 'chhodkar', 'ichchharahit'],
                      prompt: 'Now match the Hindi phrases to their meanings.',
                      pairs: [
                        { hindi: { dev: 'जो व्यक्ति', roman: 'jo vyakti' }, english: 'the person who' },
                        { hindi: { dev: 'सभी कामनाओं को छोड़कर', roman: 'sabhi kamnaon ko chhodkar' }, english: 'giving up all desires' },
                        { hindi: { dev: 'इच्छारहित होकर विचरता है', roman: 'ichchharahit hokar vicharta hai' }, english: 'moves about free from craving' }
                      ]
                    },
                    {
                      id: 'bg271_p1_c',
                      type: 'fill_in_the_blank',
                      targetWords: ['vyakti', 'kamnaon', 'chhodkar', 'ichchharahit'],
                      prompt: 'Complete the English sentence.',
                      hindi: { dev: 'जो व्यक्ति सभी कामनाओं को छोड़कर इच्छारहित होकर विचरता है,', roman: 'Jo vyakti sabhi kamnaon ko chhodkar ichchharahit hokar vicharta hai,' },
                      sentence: 'The person who gives up all desires and lives free from ____,',
                      options: ['craving', 'ego', 'wealth', 'power'],
                      answer: 'craving',
                      explanation: 'The full phrase: "The person who gives up all desires and lives free from craving."'
                    },
                    {
                      id: 'bg271_p1_t',
                      type: 'translate',
                      targetWords: ['vyakti', 'kamnaon', 'chhodkar', 'ichchharahit'],
                      prompt: 'Translate this sentence',
                      hindi: { dev: 'जो व्यक्ति सभी कामनाओं को छोड़कर इच्छारहित होकर विचरता है,', roman: 'Jo vyakti sabhi kamnaon ko chhodkar ichchharahit hokar vicharta hai,' },
                      answer: 'The person who gives up all desires and lives free from craving,',
                      tiles: [
                        'The person who',
                        'gives up',
                        'all desires',
                        'and lives',
                        'free from craving,',
                        'ego',
                        'wealth',
                        'power'
                      ],
                      clues: [
                        { from: 6, to: 7, tile: 'free from craving,' }
                      ],
                      explanation: 'That person who relinquishes all desires and moves about free from longing.'
                    }
                  ]
                },
                {
                  partIndex: 2,
                  title: 'Part 2: Without Ego & Possessiveness',
                  hindiTranslationDevanagari: 'जो ममता और अहंकार से मुक्त है,',
                  hindiTranslationRoman: 'jo mamta aur ahankar se mukt hai,',
                  translation: 'Free from possessiveness and false ego.',
                  wordBreakdown: [
                    { word: 'mamta', devanagari: 'ममता', meaning: 'possessiveness', partOfSpeech: 'noun' },
                    { word: 'ahankar', devanagari: 'अहंकार', meaning: 'ego', partOfSpeech: 'noun' },
                    { word: 'mukt', devanagari: 'मुक्त', meaning: 'free', partOfSpeech: 'adjective' }
                  ],
                  questions: [
                    {
                      id: 'bg271_p2_w',
                      type: 'phrase_matching',
                      warmup: true,
                      targetWords: ['mamta', 'ahankar', 'mukt'],
                      prompt: 'Match each Hindi word to its meaning.',
                      pairs: [
                        { hindi: { dev: 'ममता', roman: 'mamta' }, english: 'possessiveness' },
                        { hindi: { dev: 'अहंकार', roman: 'ahankar' }, english: 'ego' },
                        { hindi: { dev: 'मुक्त', roman: 'mukt' }, english: 'free' }
                      ]
                    },
                    {
                      id: 'bg271_p2_m',
                      type: 'phrase_matching',
                      targetWords: ['mamta', 'ahankar', 'mukt'],
                      prompt: 'Now match the Hindi phrases to their meanings.',
                      pairs: [
                        { hindi: { dev: 'ममता और अहंकार', roman: 'mamta aur ahankar' }, english: 'possessiveness and ego' },
                        { hindi: { dev: 'से मुक्त है', roman: 'se mukt hai' }, english: 'is free from' }
                      ]
                    },
                    {
                      id: 'bg271_p2_c',
                      type: 'fill_in_the_blank',
                      targetWords: ['mamta', 'ahankar', 'mukt'],
                      prompt: 'Complete the English sentence.',
                      hindi: { dev: 'जो ममता और अहंकार से मुक्त है,', roman: 'jo mamta aur ahankar se mukt hai,' },
                      sentence: 'One who is free from possessiveness and ____,',
                      options: ['ego', 'desires', 'wealth', 'power'],
                      answer: 'ego',
                      explanation: 'The full phrase: "One who is free from possessiveness and ego."'
                    },
                    {
                      id: 'bg271_p2_t',
                      type: 'translate',
                      targetWords: ['mamta', 'ahankar', 'mukt'],
                      prompt: 'Translate this sentence',
                      hindi: { dev: 'जो ममता और अहंकार से मुक्त है,', roman: 'jo mamta aur ahankar se mukt hai,' },
                      answer: 'One who is free from possessiveness and ego,',
                      tiles: ['One who is free', 'from possessiveness', 'and ego,', 'desires'],
                      clues: [
                        { from: 5, to: 6, tile: 'One who is free' }
                      ],
                      explanation: 'Free from possessiveness and false ego.'
                    }
                  ]
                },
                {
                  partIndex: 3,
                  title: 'Part 3: Attains Real Peace',
                  hindiTranslationDevanagari: 'वही शांति को प्राप्त होता है।',
                  hindiTranslationRoman: 'wahi shanti ko prapt hota hai.',
                  translation: 'He alone attains real peace.',
                  wordBreakdown: [
                    { word: 'wahi', devanagari: 'वही', meaning: 'he alone / that very one', partOfSpeech: 'pronoun' },
                    { word: 'shanti', devanagari: 'शांति', meaning: 'peace', partOfSpeech: 'noun' },
                    { word: 'prapt', devanagari: 'प्राप्त', meaning: 'attained / obtained', partOfSpeech: 'adjective' }
                  ],
                  questions: [
                    {
                      id: 'bg271_p3_w',
                      type: 'phrase_matching',
                      warmup: true,
                      targetWords: ['wahi', 'shanti', 'prapt'],
                      prompt: 'Match each Hindi word to its meaning.',
                      pairs: [
                        { hindi: { dev: 'वही', roman: 'wahi' }, english: 'he alone / that very one' },
                        { hindi: { dev: 'शांति', roman: 'shanti' }, english: 'peace' },
                        { hindi: { dev: 'प्राप्त', roman: 'prapt' }, english: 'attained / obtained' }
                      ]
                    },
                    {
                      id: 'bg271_p3_m',
                      type: 'phrase_matching',
                      targetWords: ['wahi', 'shanti', 'prapt'],
                      prompt: 'Now match the Hindi phrases to their meanings.',
                      pairs: [
                        { hindi: { dev: 'वही', roman: 'wahi' }, english: 'he alone' },
                        { hindi: { dev: 'शांति को प्राप्त होता है', roman: 'shanti ko prapt hota hai' }, english: 'attains peace' }
                      ]
                    },
                    {
                      id: 'bg271_p3_c',
                      type: 'fill_in_the_blank',
                      targetWords: ['wahi', 'shanti', 'prapt'],
                      prompt: 'Complete the English sentence.',
                      hindi: { dev: 'वही शांति को प्राप्त होता है।', roman: 'wahi shanti ko prapt hota hai.' },
                      sentence: 'He alone attains ____.',
                      options: ['peace', 'craving', 'wealth', 'ego'],
                      answer: 'peace',
                      explanation: 'The full phrase: "He alone attains peace.."'
                    },
                    {
                      id: 'bg271_p3_t',
                      type: 'translate',
                      targetWords: ['wahi', 'shanti', 'prapt'],
                      prompt: 'Translate this sentence',
                      hindi: { dev: 'वही शांति को प्राप्त होता है।', roman: 'wahi shanti ko prapt hota hai.' },
                      answer: 'he alone attains peace.',
                      tiles: ['he alone', 'attains', 'peace.', 'craving', 'wealth'],
                      clues: [
                        { from: 0, to: 1, tile: 'he alone' }
                      ],
                      explanation: 'He alone attains real peace.'
                    },
                    {
                      id: 'bg271_p3_q',
                      type: 'multiple_choice',
                      prompt: 'Who attains real peace according to BG 2.71?',
                      options: [
                        { text: 'One who lives free from false ego and possessiveness.', isCorrect: true, explanation: 'Correct!' },
                        { text: 'One who accumulates physical wealth.', isCorrect: false, explanation: 'Incorrect.' }
                      ]
                    }
                  ]
                }
              ],
              finalSynthesisQuestions: [
                {
                  id: 'bg271_syn_m',
                  type: 'phrase_matching',
                  targetWords: [
                    'vyakti',
                    'kamnaon',
                    'chhodkar',
                    'ichchharahit',
                    'mamta',
                    'ahankar',
                    'mukt',
                    'wahi',
                    'shanti',
                    'prapt'
                  ],
                  prompt: 'Match every phrase of the verse to its meaning.',
                  pairs: [
                    {
                      hindi: { dev: 'जो व्यक्ति सभी कामनाओं को छोड़कर इच्छारहित होकर विचरता है,', roman: 'Jo vyakti sabhi kamnaon ko chhodkar ichchharahit hokar vicharta hai,' },
                      english: 'The person who gives up all desires and lives free from craving,'
                    },
                    {
                      hindi: { dev: 'जो ममता और अहंकार से मुक्त है,', roman: 'jo mamta aur ahankar se mukt hai,' },
                      english: 'One who is free from possessiveness and ego,'
                    },
                    { hindi: { dev: 'वही शांति को प्राप्त होता है।', roman: 'wahi shanti ko prapt hota hai.' }, english: 'he alone attains peace.' }
                  ]
                },
                {
                  id: 'bg271_syn_t1',
                  type: 'translate',
                  targetWords: ['vyakti', 'kamnaon', 'chhodkar', 'ichchharahit'],
                  prompt: 'Translate this sentence',
                  hindi: { dev: 'जो व्यक्ति सभी कामनाओं को छोड़कर इच्छारहित होकर विचरता है,', roman: 'Jo vyakti sabhi kamnaon ko chhodkar ichchharahit hokar vicharta hai,' },
                  answer: 'The person who gives up all desires and lives free from craving,',
                  tiles: [
                    'The person who',
                    'gives up',
                    'all desires',
                    'and lives',
                    'free from craving,',
                    'ego',
                    'wealth',
                    'power'
                  ],
                  explanation: 'That person who relinquishes all desires and moves about free from longing.',
                  clues: [
                    { from: 6, to: 7, tile: 'free from craving,' }
                  ]
                },
                {
                  id: 'bg271_syn_t2',
                  type: 'translate',
                  targetWords: ['mamta', 'ahankar', 'mukt', 'wahi', 'shanti', 'prapt'],
                  prompt: 'Translate this sentence',
                  hindi: { dev: 'जो ममता और अहंकार से मुक्त है, वही शांति को प्राप्त होता है।', roman: 'jo mamta aur ahankar se mukt hai, wahi shanti ko prapt hota hai.' },
                  answer: 'One who is free from possessiveness and ego, he alone attains peace.',
                  tiles: [
                    'One who is free',
                    'from possessiveness',
                    'and ego,',
                    'he alone',
                    'attains',
                    'peace.',
                    'desires',
                    'craving',
                    'wealth'
                  ],
                  explanation: 'Free from possessiveness and false ego. He alone attains real peace.',
                  clues: [
                    { from: 5, to: 6, tile: 'One who is free' },
                    { from: 7, to: 8, tile: 'he alone' }
                  ]
                }
              ]
            }
          ]
        },
        {
          id: 'ch2_sec2',
          title: 'The Eternal Self',
          lessons: [
            {
              id: 'ch2_sec2_l1',
              title: 'The Eternal Traveler',
              verseRef: 'BG 2.13',
              essence: 'The soul passes from childhood to old age to a new body. The wise are not shaken by it.',
              verseSanskrit: 'देहिनोऽस्मिन् यथा देहे कौमारं यौवनं जरा ।\nतथा देहान्तरप्राप्तिर्धीरस्तत्र न मुह्यति ॥',
              hindiTranslationDevanagari: 'जैसे इस शरीर में देहधारी आत्मा को बचपन, जवानी और बुढ़ापा मिलते हैं,\nवैसे ही दूसरा शरीर भी मिलता है; धैर्यवान व्यक्ति इससे मोहित नहीं होता।',
              hindiTranslationRoman: 'Jaise is sharir mein dehdhari aatma ko bachpan, jawani aur budhapa milte hain,\nwaise hi doosra sharir bhi milta hai; dhairyavan vyakti isse mohit nahi hota.',
              translation: 'As the embodied soul continuously passes, in this body, from childhood to youth to old age, the soul similarly passes into another body at death. The wise are not deluded by this change.',
              purport: 'This verse opens the chapter\'s central teaching: the self within the body is not the body itself. A person already accepts, without distress, that the body of childhood is not the body of old age — Krishna asks Arjuna to extend that same acceptance to the passage from one body to the next.',
              commentary: {
                author: 'Paramahansa Yogananda',
                tradition: 'Self-Realization Fellowship',
                text: 'You have already died many times in this one life — the infant\'s body is gone, the child\'s body is gone — yet you remained. Death of the body is only the last of these many changes, not the end of the one who witnesses them.'
              },
              reflectionPrompt: 'Think of an earlier version of yourself — as a child, or years younger. That body and that time are gone, yet something in you carried through. What was it?',
              storyCaption: 'Krishna looked at the warrior who had once been a boy on these same fields. "The body you had then is gone," he said, "yet you remain. Death is only one more such change."',
              wordBreakdown: [
                { word: 'jaise', devanagari: 'जैसे', meaning: 'just as', partOfSpeech: 'adverb' },
                { word: 'sharir', devanagari: 'शरीर', meaning: 'body', partOfSpeech: 'noun' },
                { word: 'dehdhari', devanagari: 'देहधारी', meaning: 'embodied one', partOfSpeech: 'adjective' },
                { word: 'aatma', devanagari: 'आत्मा', meaning: 'soul', partOfSpeech: 'noun' },
                { word: 'bachpan', devanagari: 'बचपन', meaning: 'childhood', partOfSpeech: 'noun' },
                { word: 'jawani', devanagari: 'जवानी', meaning: 'youth', partOfSpeech: 'noun' },
                { word: 'budhapa', devanagari: 'बुढ़ापा', meaning: 'old age', partOfSpeech: 'noun' },
                { word: 'waise', devanagari: 'वैसे', meaning: 'similarly / in the same way', partOfSpeech: 'adverb' },
                { word: 'doosra', devanagari: 'दूसरा', meaning: 'another / other', partOfSpeech: 'adjective' },
                { word: 'milta', devanagari: 'मिलता', meaning: 'is obtained / received', partOfSpeech: 'verb' },
                { word: 'dhairyavan', devanagari: 'धैर्यवान', meaning: 'wise / steadfast', partOfSpeech: 'adjective' },
                { word: 'vyakti', devanagari: 'व्यक्ति', meaning: 'person', partOfSpeech: 'noun' },
                { word: 'mohit', devanagari: 'मोहित', meaning: 'deluded / bewildered', partOfSpeech: 'adjective' },
                { word: 'nahi', devanagari: 'नहीं', meaning: 'not', partOfSpeech: 'adverb' }
              ],
              questions: [],
              parts: [
                {
                  partIndex: 1,
                  title: 'Part 1: The Embodied Soul',
                  hindiTranslationDevanagari: 'जैसे इस शरीर में देहधारी आत्मा को',
                  hindiTranslationRoman: 'Jaise is sharir mein dehdhari aatma ko',
                  translation: 'As, for the embodied soul, in this body...',
                  wordBreakdown: [
                    { word: 'jaise', devanagari: 'जैसे', meaning: 'just as', partOfSpeech: 'adverb' },
                    { word: 'sharir', devanagari: 'शरीर', meaning: 'body', partOfSpeech: 'noun' },
                    { word: 'dehdhari', devanagari: 'देहधारी', meaning: 'embodied one', partOfSpeech: 'adjective' },
                    { word: 'aatma', devanagari: 'आत्मा', meaning: 'soul', partOfSpeech: 'noun' }
                  ],
                  questions: [
                    {
                      id: 'bg213_p1_w',
                      type: 'phrase_matching',
                      warmup: true,
                      targetWords: ['jaise', 'sharir', 'dehdhari', 'aatma'],
                      prompt: 'Match each Hindi word to its meaning.',
                      pairs: [
                        { hindi: { dev: 'जैसे', roman: 'jaise' }, english: 'just as' },
                        { hindi: { dev: 'शरीर', roman: 'sharir' }, english: 'body' },
                        { hindi: { dev: 'देहधारी', roman: 'dehdhari' }, english: 'embodied one' },
                        { hindi: { dev: 'आत्मा', roman: 'aatma' }, english: 'soul' }
                      ]
                    },
                    {
                      id: 'bg213_p1_m',
                      type: 'phrase_matching',
                      targetWords: ['jaise', 'sharir', 'dehdhari', 'aatma'],
                      prompt: 'Now match the Hindi phrases to their meanings.',
                      pairs: [
                        { hindi: { dev: 'इस शरीर में', roman: 'is sharir mein' }, english: 'in this body' },
                        { hindi: { dev: 'देहधारी आत्मा को', roman: 'dehdhari aatma ko' }, english: 'for the embodied soul' }
                      ]
                    },
                    {
                      id: 'bg213_p1_c',
                      type: 'fill_in_the_blank',
                      targetWords: ['jaise', 'sharir', 'dehdhari', 'aatma'],
                      prompt: 'Complete the English sentence.',
                      hindi: { dev: 'जैसे इस शरीर में देहधारी आत्मा को', roman: 'Jaise is sharir mein dehdhari aatma ko' },
                      sentence: 'Just as the embodied soul in this ____',
                      options: ['body', 'another', 'life', 'wise'],
                      answer: 'body',
                      explanation: 'The full phrase: "Just as the embodied soul in this body."'
                    },
                    {
                      id: 'bg213_p1_t',
                      type: 'translate',
                      targetWords: ['jaise', 'sharir', 'dehdhari', 'aatma'],
                      prompt: 'Translate this sentence',
                      hindi: { dev: 'जैसे इस शरीर में देहधारी आत्मा को', roman: 'Jaise is sharir mein dehdhari aatma ko' },
                      answer: 'Just as the embodied soul in this body',
                      tiles: ['Just as', 'the embodied soul', 'in this body', 'another life', 'wise'],
                      clues: [
                        { from: 4, to: 6, tile: 'the embodied soul' }
                      ],
                      explanation: 'As, for the embodied soul, in this body...'
                    }
                  ]
                },
                {
                  partIndex: 2,
                  title: 'Part 2: The Stages of Life',
                  hindiTranslationDevanagari: 'बचपन, जवानी और बुढ़ापा मिलते हैं,',
                  hindiTranslationRoman: 'bachpan, jawani aur budhapa milte hain,',
                  translation: 'childhood, youth, and old age.',
                  wordBreakdown: [
                    { word: 'bachpan', devanagari: 'बचपन', meaning: 'childhood', partOfSpeech: 'noun' },
                    { word: 'jawani', devanagari: 'जवानी', meaning: 'youth', partOfSpeech: 'noun' },
                    { word: 'budhapa', devanagari: 'बुढ़ापा', meaning: 'old age', partOfSpeech: 'noun' }
                  ],
                  questions: [
                    {
                      id: 'bg213_p2_w',
                      type: 'phrase_matching',
                      warmup: true,
                      targetWords: ['bachpan', 'jawani', 'budhapa'],
                      prompt: 'Match each Hindi word to its meaning.',
                      pairs: [
                        { hindi: { dev: 'बचपन', roman: 'bachpan' }, english: 'childhood' },
                        { hindi: { dev: 'जवानी', roman: 'jawani' }, english: 'youth' },
                        { hindi: { dev: 'बुढ़ापा', roman: 'budhapa' }, english: 'old age' }
                      ]
                    },
                    {
                      id: 'bg213_p2_m',
                      type: 'phrase_matching',
                      targetWords: ['bachpan', 'jawani', 'budhapa'],
                      prompt: 'Now match the Hindi phrases to their meanings.',
                      pairs: [
                        { hindi: { dev: 'बचपन', roman: 'bachpan' }, english: 'childhood' },
                        { hindi: { dev: 'जवानी और बुढ़ापा', roman: 'jawani aur budhapa' }, english: 'youth and old age' }
                      ]
                    },
                    {
                      id: 'bg213_p2_c',
                      type: 'fill_in_the_blank',
                      targetWords: ['bachpan', 'jawani', 'budhapa'],
                      prompt: 'Complete the English sentence.',
                      hindi: { dev: 'बचपन, जवानी और बुढ़ापा मिलते हैं,', roman: 'bachpan, jawani aur budhapa milte hain,' },
                      sentence: 'Gets childhood, youth and old ____,',
                      options: ['age', 'death', 'sleep', 'another'],
                      answer: 'age',
                      explanation: 'The full phrase: "Gets childhood, youth and old age."'
                    },
                    {
                      id: 'bg213_p2_t',
                      type: 'translate',
                      targetWords: ['bachpan', 'jawani', 'budhapa'],
                      prompt: 'Translate this sentence',
                      hindi: { dev: 'बचपन, जवानी और बुढ़ापा मिलते हैं,', roman: 'bachpan, jawani aur budhapa milte hain,' },
                      answer: 'gets childhood, youth and old age,',
                      tiles: ['gets', 'childhood,', 'youth', 'and old age,', 'death', 'sleep'],
                      clues: [
                        { from: 0, to: 1, tile: 'childhood,' }
                      ],
                      explanation: 'childhood, youth, and old age.'
                    }
                  ]
                },
                {
                  partIndex: 3,
                  title: 'Part 3: Passing to Another Body',
                  hindiTranslationDevanagari: 'वैसे ही दूसरा शरीर भी मिलता है;',
                  hindiTranslationRoman: 'waise hi doosra sharir bhi milta hai;',
                  translation: 'similarly, the wise are not bewildered by the attainment of another body.',
                  wordBreakdown: [
                    { word: 'waise', devanagari: 'वैसे', meaning: 'similarly / in the same way', partOfSpeech: 'adverb' },
                    { word: 'doosra', devanagari: 'दूसरा', meaning: 'another / other', partOfSpeech: 'adjective' },
                    { word: 'sharir', devanagari: 'शरीर', meaning: 'body', partOfSpeech: 'noun' },
                    { word: 'milta', devanagari: 'मिलता', meaning: 'is obtained / received', partOfSpeech: 'verb' }
                  ],
                  questions: [
                    {
                      id: 'bg213_p3_w',
                      type: 'phrase_matching',
                      warmup: true,
                      targetWords: ['waise', 'doosra', 'sharir', 'milta'],
                      prompt: 'Match each Hindi word to its meaning.',
                      pairs: [
                        { hindi: { dev: 'वैसे', roman: 'waise' }, english: 'similarly / in the same way' },
                        { hindi: { dev: 'दूसरा', roman: 'doosra' }, english: 'another / other' },
                        { hindi: { dev: 'शरीर', roman: 'sharir' }, english: 'body' },
                        { hindi: { dev: 'मिलता', roman: 'milta' }, english: 'is obtained / received' }
                      ]
                    },
                    {
                      id: 'bg213_p3_m',
                      type: 'phrase_matching',
                      targetWords: ['waise', 'doosra', 'sharir', 'milta'],
                      prompt: 'Now match the Hindi phrases to their meanings.',
                      pairs: [
                        { hindi: { dev: 'वैसे ही', roman: 'waise hi' }, english: 'in the same way' },
                        { hindi: { dev: 'दूसरा शरीर', roman: 'doosra sharir' }, english: 'another body' },
                        { hindi: { dev: 'भी मिलता है', roman: 'bhi milta hai' }, english: 'is also obtained' }
                      ]
                    },
                    {
                      id: 'bg213_p3_c',
                      type: 'fill_in_the_blank',
                      targetWords: ['waise', 'doosra', 'sharir', 'milta'],
                      prompt: 'Complete the English sentence.',
                      hindi: { dev: 'वैसे ही दूसरा शरीर भी मिलता है;', roman: 'waise hi doosra sharir bhi milta hai;' },
                      sentence: 'In the same way another body is also ____;',
                      options: ['obtained', 'wise', 'deluded', 'life'],
                      answer: 'obtained',
                      explanation: 'The full phrase: "In the same way another body is also obtained."'
                    },
                    {
                      id: 'bg213_p3_t',
                      type: 'translate',
                      targetWords: ['waise', 'doosra', 'sharir', 'milta'],
                      prompt: 'Translate this sentence',
                      hindi: { dev: 'वैसे ही दूसरा शरीर भी मिलता है;', roman: 'waise hi doosra sharir bhi milta hai;' },
                      answer: 'In the same way another body is also obtained;',
                      tiles: ['In the same way', 'another body', 'is also obtained;', 'wise', 'deluded'],
                      clues: [
                        { from: 2, to: 4, tile: 'another body' }
                      ],
                      explanation: 'similarly, the wise are not bewildered by the attainment of another body.'
                    }
                  ]
                },
                {
                  partIndex: 4,
                  title: 'Part 4: Not Bewildered',
                  hindiTranslationDevanagari: 'धैर्यवान व्यक्ति इससे मोहित नहीं होता।',
                  hindiTranslationRoman: 'dhairyavan vyakti isse mohit nahi hota.',
                  translation: 'is not deluded.',
                  wordBreakdown: [
                    { word: 'dhairyavan', devanagari: 'धैर्यवान', meaning: 'wise / steadfast', partOfSpeech: 'adjective' },
                    { word: 'vyakti', devanagari: 'व्यक्ति', meaning: 'person', partOfSpeech: 'noun' },
                    { word: 'mohit', devanagari: 'मोहित', meaning: 'deluded / bewildered', partOfSpeech: 'adjective' },
                    { word: 'nahi', devanagari: 'नहीं', meaning: 'not', partOfSpeech: 'adverb' }
                  ],
                  questions: [
                    {
                      id: 'bg213_p4_w',
                      type: 'phrase_matching',
                      warmup: true,
                      targetWords: ['dhairyavan', 'vyakti', 'mohit', 'nahi'],
                      prompt: 'Match each Hindi word to its meaning.',
                      pairs: [
                        { hindi: { dev: 'धैर्यवान', roman: 'dhairyavan' }, english: 'wise / steadfast' },
                        { hindi: { dev: 'व्यक्ति', roman: 'vyakti' }, english: 'person' },
                        { hindi: { dev: 'मोहित', roman: 'mohit' }, english: 'deluded / bewildered' },
                        { hindi: { dev: 'नहीं', roman: 'nahi' }, english: 'not' }
                      ]
                    },
                    {
                      id: 'bg213_p4_m',
                      type: 'phrase_matching',
                      targetWords: ['dhairyavan', 'vyakti', 'mohit', 'nahi'],
                      prompt: 'Now match the Hindi phrases to their meanings.',
                      pairs: [
                        { hindi: { dev: 'धैर्यवान व्यक्ति', roman: 'dhairyavan vyakti' }, english: 'the wise person' },
                        { hindi: { dev: 'मोहित नहीं होता', roman: 'mohit nahi hota' }, english: 'is not deluded' }
                      ]
                    },
                    {
                      id: 'bg213_p4_c',
                      type: 'fill_in_the_blank',
                      targetWords: ['dhairyavan', 'vyakti', 'mohit', 'nahi'],
                      prompt: 'Complete the English sentence.',
                      hindi: { dev: 'धैर्यवान व्यक्ति इससे मोहित नहीं होता।', roman: 'dhairyavan vyakti isse mohit nahi hota.' },
                      sentence: 'The wise person is not deluded by ____.',
                      options: ['this', 'born', 'youth', 'another'],
                      answer: 'this',
                      explanation: 'The full phrase: "The wise person is not deluded by this.."'
                    },
                    {
                      id: 'bg213_p4_t',
                      type: 'translate',
                      targetWords: ['dhairyavan', 'vyakti', 'mohit', 'nahi'],
                      prompt: 'Translate this sentence',
                      hindi: { dev: 'धैर्यवान व्यक्ति इससे मोहित नहीं होता।', roman: 'dhairyavan vyakti isse mohit nahi hota.' },
                      answer: 'the wise person is not deluded by this.',
                      tiles: ['the wise person', 'is not', 'deluded', 'by this.', 'born', 'youth'],
                      clues: [
                        { from: 0, to: 1, tile: 'the wise person' }
                      ],
                      explanation: 'is not deluded.'
                    },
                    {
                      id: 'bg213_p4_q',
                      type: 'multiple_choice',
                      prompt: 'According to BG 2.13, how does the wise person respond to the soul passing into a new body?',
                      options: [
                        {
                          text: 'They are not bewildered by it, just as they were not bewildered by aging from childhood to youth.',
                          isCorrect: true,
                          explanation: 'Correct! Change of body is compared to the changes already accepted within one life.'
                        },
                        { text: 'They become anxious and afraid.', isCorrect: false, explanation: 'Incorrect. Krishna says the wise are not deluded by this.' }
                      ]
                    }
                  ]
                }
              ],
              finalSynthesisQuestions: [
                {
                  id: 'bg213_syn_m',
                  type: 'phrase_matching',
                  targetWords: [
                    'jaise',
                    'sharir',
                    'dehdhari',
                    'aatma',
                    'bachpan',
                    'jawani',
                    'budhapa',
                    'waise',
                    'doosra',
                    'milta',
                    'dhairyavan',
                    'vyakti',
                    'mohit',
                    'nahi'
                  ],
                  prompt: 'Match every phrase of the verse to its meaning.',
                  pairs: [
                    {
                      hindi: { dev: 'जैसे इस शरीर में देहधारी आत्मा को', roman: 'Jaise is sharir mein dehdhari aatma ko' },
                      english: 'Just as the embodied soul in this body'
                    },
                    {
                      hindi: { dev: 'बचपन, जवानी और बुढ़ापा मिलते हैं,', roman: 'bachpan, jawani aur budhapa milte hain,' },
                      english: 'gets childhood, youth and old age,'
                    },
                    {
                      hindi: { dev: 'वैसे ही दूसरा शरीर भी मिलता है;', roman: 'waise hi doosra sharir bhi milta hai;' },
                      english: 'In the same way another body is also obtained;'
                    },
                    {
                      hindi: { dev: 'धैर्यवान व्यक्ति इससे मोहित नहीं होता।', roman: 'dhairyavan vyakti isse mohit nahi hota.' },
                      english: 'the wise person is not deluded by this.'
                    }
                  ]
                },
                {
                  id: 'bg213_syn_t1',
                  type: 'translate',
                  targetWords: ['jaise', 'sharir', 'dehdhari', 'aatma', 'bachpan', 'jawani', 'budhapa'],
                  prompt: 'Translate this sentence',
                  hindi: {
                    dev: 'जैसे इस शरीर में देहधारी आत्मा को बचपन, जवानी और बुढ़ापा मिलते हैं,',
                    roman: 'Jaise is sharir mein dehdhari aatma ko bachpan, jawani aur budhapa milte hain,'
                  },
                  answer: 'Just as the embodied soul in this body gets childhood, youth and old age,',
                  tiles: [
                    'Just as',
                    'the embodied soul',
                    'in this body',
                    'gets',
                    'childhood,',
                    'youth',
                    'and old age,',
                    'another life',
                    'wise',
                    'death'
                  ],
                  explanation: 'As, for the embodied soul, in this body... childhood, youth, and old age.',
                  clues: [
                    { from: 4, to: 6, tile: 'the embodied soul' },
                    { from: 7, to: 8, tile: 'childhood,' }
                  ]
                },
                {
                  id: 'bg213_syn_t2',
                  type: 'translate',
                  targetWords: ['waise', 'doosra', 'sharir', 'milta', 'dhairyavan', 'vyakti', 'mohit', 'nahi'],
                  prompt: 'Translate this sentence',
                  hindi: {
                    dev: 'वैसे ही दूसरा शरीर भी मिलता है; धैर्यवान व्यक्ति इससे मोहित नहीं होता।',
                    roman: 'waise hi doosra sharir bhi milta hai; dhairyavan vyakti isse mohit nahi hota.'
                  },
                  answer: 'In the same way another body is also obtained; the wise person is not deluded by this.',
                  tiles: [
                    'In the same way',
                    'another body',
                    'is also obtained;',
                    'the wise person',
                    'is not',
                    'deluded',
                    'by this.',
                    'born',
                    'youth'
                  ],
                  explanation: 'similarly, the wise are not bewildered by the attainment of another body. is not deluded.',
                  clues: [
                    { from: 2, to: 4, tile: 'another body' },
                    { from: 7, to: 8, tile: 'the wise person' }
                  ]
                },
                {
                  id: 'bg213_syn_q3',
                  type: 'reflection',
                  prompt: 'Personal Reflection on the Eternal Self:',
                  verseContext: 'BG 2.13: "As the embodied soul passes through childhood, youth, and old age, it likewise passes into another body; the wise are not bewildered by this."',
                  guidance: 'You have already lived through bodies and identities that no longer exist — the infant, the child, perhaps a much younger adult. What in you stayed constant through all of those changes?'
                }
              ]
            },
            {
              id: 'ch2_sec2_l2',
              title: 'Never Born, Never Dies',
              verseRef: 'BG 2.20',
              essence: 'The soul is never born and never dies.',
              verseSanskrit: 'न जायते म्रियते वा कदाचिन्नायं भूत्वा भविता वा न भूयः ।\nअजो नित्यः शाश्वतोऽयं पुराणो न हन्यते हन्यमाने शरीरे ॥',
              hindiTranslationDevanagari: 'यह आत्मा न कभी जन्म लेती है, न कभी मरती है। यह कभी उत्पन्न नहीं हुई, और न आगे फिर कभी उत्पन्न होगी।\nयह अजन्मा, नित्य, शाश्वत और पुरातन है। शरीर के मारे जाने पर भी यह नहीं मारी जाती।',
              hindiTranslationRoman: 'Yah aatma na kabhi janm leti hai, na kabhi marti hai. Yah kabhi utpann nahi hui, aur na aage phir kabhi utpann hogi.\nYah ajanma, nitya, shashvat aur puratan hai. Sharir ke mare jaane par bhi yah nahi maari jaati.',
              translation: 'For the soul there is neither birth nor death at any time. It has not come into being, does not come into being, and will not come into being. It is unborn, eternal, ever-existing, undying and primeval. It is not slain when the body is slain.',
              purport: 'This is the Gita\'s most direct statement on the nature of the self: it is entirely outside the cycle of birth and death that the body passes through. What is slain, when a body dies, is only the body — never the one who inhabited it.',
              commentary: {
                author: 'Swami Vivekananda',
                tradition: 'Ramakrishna Order',
                text: 'That which is born must die, and that which dies must be born again — this is true of the body, never of the Self. The Self was never born, so it can never die; it only appears to enter and leave, as a man enters and leaves a room.'
              },
              reflectionPrompt: 'This verse says the true self is untouched by birth and death. What would change in how you face a loss or an ending, if you believed this fully?',
              storyCaption: 'Arjuna feared for lives about to end. "It is never born, and it never dies," Krishna said. "What you see slain on this field is only the body — never the one within it."',
              wordBreakdown: [
                { word: 'aatma', devanagari: 'आत्मा', meaning: 'soul', partOfSpeech: 'noun' },
                { word: 'janm', devanagari: 'जन्म', meaning: 'birth', partOfSpeech: 'noun' },
                { word: 'marti', devanagari: 'मरती', meaning: 'dies', partOfSpeech: 'verb' },
                { word: 'kabhi', devanagari: 'कभी', meaning: 'ever / at any time', partOfSpeech: 'adverb' },
                { word: 'utpann', devanagari: 'उत्पन्न', meaning: 'born / come into being', partOfSpeech: 'adjective' },
                { word: 'nahi', devanagari: 'नहीं', meaning: 'not', partOfSpeech: 'adverb' },
                { word: 'aage', devanagari: 'आगे', meaning: 'ahead / in the future', partOfSpeech: 'adverb' },
                { word: 'phir', devanagari: 'फिर', meaning: 'again', partOfSpeech: 'adverb' },
                { word: 'ajanma', devanagari: 'अजन्मा', meaning: 'unborn', partOfSpeech: 'adjective' },
                { word: 'nitya', devanagari: 'नित्य', meaning: 'eternal', partOfSpeech: 'adjective' },
                { word: 'shashvat', devanagari: 'शाश्वत', meaning: 'everlasting', partOfSpeech: 'adjective' },
                { word: 'puratan', devanagari: 'पुरातन', meaning: 'ancient / primeval', partOfSpeech: 'adjective' },
                { word: 'sharir', devanagari: 'शरीर', meaning: 'body', partOfSpeech: 'noun' },
                { word: 'maari', devanagari: 'मारी', meaning: 'slain / killed', partOfSpeech: 'adjective' }
              ],
              questions: [],
              parts: [
                {
                  partIndex: 1,
                  title: 'Part 1: Never Born, Never Dies',
                  hindiTranslationDevanagari: 'यह आत्मा न कभी जन्म लेती है, न कभी मरती है।',
                  hindiTranslationRoman: 'Yah aatma na kabhi janm leti hai, na kabhi marti hai.',
                  translation: 'It is never born, nor does it ever die.',
                  wordBreakdown: [
                    { word: 'aatma', devanagari: 'आत्मा', meaning: 'soul', partOfSpeech: 'noun' },
                    { word: 'janm', devanagari: 'जन्म', meaning: 'birth', partOfSpeech: 'noun' },
                    { word: 'marti', devanagari: 'मरती', meaning: 'dies', partOfSpeech: 'verb' },
                    { word: 'kabhi', devanagari: 'कभी', meaning: 'ever / at any time', partOfSpeech: 'adverb' }
                  ],
                  questions: [
                    {
                      id: 'bg220_p1_w',
                      type: 'phrase_matching',
                      warmup: true,
                      targetWords: ['aatma', 'janm', 'marti', 'kabhi'],
                      prompt: 'Match each Hindi word to its meaning.',
                      pairs: [
                        { hindi: { dev: 'आत्मा', roman: 'aatma' }, english: 'soul' },
                        { hindi: { dev: 'जन्म', roman: 'janm' }, english: 'birth' },
                        { hindi: { dev: 'मरती', roman: 'marti' }, english: 'dies' },
                        { hindi: { dev: 'कभी', roman: 'kabhi' }, english: 'ever / at any time' }
                      ]
                    },
                    {
                      id: 'bg220_p1_m',
                      type: 'phrase_matching',
                      targetWords: ['aatma', 'janm', 'marti', 'kabhi'],
                      prompt: 'Now match the Hindi phrases to their meanings.',
                      pairs: [
                        { hindi: { dev: 'यह आत्मा', roman: 'yah aatma' }, english: 'this soul' },
                        { hindi: { dev: 'न कभी जन्म लेती है', roman: 'na kabhi janm leti hai' }, english: 'is never born' },
                        { hindi: { dev: 'न कभी मरती है', roman: 'na kabhi marti hai' }, english: 'never dies' }
                      ]
                    },
                    {
                      id: 'bg220_p1_c',
                      type: 'fill_in_the_blank',
                      targetWords: ['aatma', 'janm', 'marti', 'kabhi'],
                      prompt: 'Complete the English sentence.',
                      hindi: { dev: 'यह आत्मा न कभी जन्म लेती है, न कभी मरती है।', roman: 'Yah aatma na kabhi janm leti hai, na kabhi marti hai.' },
                      sentence: 'This soul is never born, and never ____.',
                      options: ['dies', 'slain', 'again', 'will'],
                      answer: 'dies',
                      explanation: 'The full phrase: "This soul is never born, and never dies.."'
                    },
                    {
                      id: 'bg220_p1_t',
                      type: 'translate',
                      targetWords: ['aatma', 'janm', 'marti', 'kabhi'],
                      prompt: 'Translate this sentence',
                      hindi: { dev: 'यह आत्मा न कभी जन्म लेती है, न कभी मरती है।', roman: 'Yah aatma na kabhi janm leti hai, na kabhi marti hai.' },
                      answer: 'This soul is never born, and never dies.',
                      tiles: ['This soul', 'is never born,', 'and never dies.', 'slain', 'again'],
                      clues: [
                        { from: 9, to: 10, tile: 'and never dies.' }
                      ],
                      explanation: 'It is never born, nor does it ever die.'
                    }
                  ]
                },
                {
                  partIndex: 2,
                  title: 'Part 2: Never Ceases to Be',
                  hindiTranslationDevanagari: 'यह कभी उत्पन्न नहीं हुई,',
                  hindiTranslationRoman: 'Yah kabhi utpann nahi hui,',
                  translation: 'At no time did it come into being...',
                  wordBreakdown: [
                    { word: 'kabhi', devanagari: 'कभी', meaning: 'ever / at any time', partOfSpeech: 'adverb' },
                    { word: 'utpann', devanagari: 'उत्पन्न', meaning: 'born / come into being', partOfSpeech: 'adjective' },
                    { word: 'nahi', devanagari: 'नहीं', meaning: 'not', partOfSpeech: 'adverb' }
                  ],
                  questions: [
                    {
                      id: 'bg220_p2_w',
                      type: 'phrase_matching',
                      warmup: true,
                      targetWords: ['kabhi', 'utpann', 'nahi'],
                      prompt: 'Match each Hindi word to its meaning.',
                      pairs: [
                        { hindi: { dev: 'कभी', roman: 'kabhi' }, english: 'ever / at any time' },
                        { hindi: { dev: 'उत्पन्न', roman: 'utpann' }, english: 'born / come into being' },
                        { hindi: { dev: 'नहीं', roman: 'nahi' }, english: 'not' }
                      ]
                    },
                    {
                      id: 'bg220_p2_m',
                      type: 'phrase_matching',
                      targetWords: ['kabhi', 'utpann', 'nahi'],
                      prompt: 'Now match the Hindi phrases to their meanings.',
                      pairs: [
                        { hindi: { dev: 'यह', roman: 'yah' }, english: 'this soul' },
                        { hindi: { dev: 'कभी उत्पन्न नहीं हुई', roman: 'kabhi utpann nahi hui' }, english: 'never came into being' }
                      ]
                    },
                    {
                      id: 'bg220_p2_c',
                      type: 'fill_in_the_blank',
                      targetWords: ['kabhi', 'utpann', 'nahi'],
                      prompt: 'Complete the English sentence.',
                      hindi: { dev: 'यह कभी उत्पन्न नहीं हुई,', roman: 'Yah kabhi utpann nahi hui,' },
                      sentence: 'It never came into ____,',
                      options: ['being', 'will', 'again', 'slain'],
                      answer: 'being',
                      explanation: 'The full phrase: "It never came into being."'
                    },
                    {
                      id: 'bg220_p2_t',
                      type: 'translate',
                      targetWords: ['kabhi', 'utpann', 'nahi'],
                      prompt: 'Translate this sentence',
                      hindi: { dev: 'यह कभी उत्पन्न नहीं हुई,', roman: 'Yah kabhi utpann nahi hui,' },
                      answer: 'It never came into being,',
                      tiles: ['It', 'never came', 'into being,', 'will', 'again'],
                      clues: [
                        { from: 1, to: 2, tile: 'never came' }
                      ],
                      explanation: 'At no time did it come into being...'
                    }
                  ]
                },
                {
                  partIndex: 3,
                  title: 'Part 3: Nor Will It Cease',
                  hindiTranslationDevanagari: 'और न आगे फिर कभी उत्पन्न होगी।',
                  hindiTranslationRoman: 'aur na aage phir kabhi utpann hogi.',
                  translation: '...nor will it ever come to be again.',
                  wordBreakdown: [
                    { word: 'aage', devanagari: 'आगे', meaning: 'ahead / in the future', partOfSpeech: 'adverb' },
                    { word: 'phir', devanagari: 'फिर', meaning: 'again', partOfSpeech: 'adverb' },
                    { word: 'utpann', devanagari: 'उत्पन्न', meaning: 'born / come into being', partOfSpeech: 'adjective' }
                  ],
                  questions: [
                    {
                      id: 'bg220_p3_w',
                      type: 'phrase_matching',
                      warmup: true,
                      targetWords: ['aage', 'phir', 'utpann'],
                      prompt: 'Match each Hindi word to its meaning.',
                      pairs: [
                        { hindi: { dev: 'आगे', roman: 'aage' }, english: 'ahead / in the future' },
                        { hindi: { dev: 'फिर', roman: 'phir' }, english: 'again' },
                        { hindi: { dev: 'उत्पन्न', roman: 'utpann' }, english: 'born / come into being' }
                      ]
                    },
                    {
                      id: 'bg220_p3_m',
                      type: 'phrase_matching',
                      targetWords: ['aage', 'phir', 'utpann'],
                      prompt: 'Now match the Hindi phrases to their meanings.',
                      pairs: [
                        { hindi: { dev: 'और न', roman: 'aur na' }, english: 'and not' },
                        { hindi: { dev: 'आगे फिर कभी', roman: 'aage phir kabhi' }, english: 'ever again in the future' },
                        { hindi: { dev: 'उत्पन्न होगी', roman: 'utpann hogi' }, english: 'will come into being' }
                      ]
                    },
                    {
                      id: 'bg220_p3_c',
                      type: 'fill_in_the_blank',
                      targetWords: ['aage', 'phir', 'utpann'],
                      prompt: 'Complete the English sentence.',
                      hindi: { dev: 'और न आगे फिर कभी उत्पन्न होगी।', roman: 'aur na aage phir kabhi utpann hogi.' },
                      sentence: 'And will not come into being ever ____.',
                      options: ['again', 'body', 'slain', 'new'],
                      answer: 'again',
                      explanation: 'The full phrase: "And will not come into being ever again.."'
                    },
                    {
                      id: 'bg220_p3_t',
                      type: 'translate',
                      targetWords: ['aage', 'phir', 'utpann'],
                      prompt: 'Translate this sentence',
                      hindi: { dev: 'और न आगे फिर कभी उत्पन्न होगी।', roman: 'aur na aage phir kabhi utpann hogi.' },
                      answer: 'and will not come into being ever again.',
                      tiles: ['and will not', 'come into being', 'ever again.', 'was', 'body'],
                      clues: [
                        { from: 3, to: 5, tile: 'ever again.' }
                      ],
                      explanation: '...nor will it ever come to be again.'
                    }
                  ]
                },
                {
                  partIndex: 4,
                  title: 'Part 4: Unborn, Eternal, Primeval',
                  hindiTranslationDevanagari: 'यह अजन्मा, नित्य, शाश्वत और पुरातन है।',
                  hindiTranslationRoman: 'Yah ajanma, nitya, shashvat aur puratan hai.',
                  translation: 'It is unborn, eternal, ever-existing, and primeval.',
                  wordBreakdown: [
                    { word: 'ajanma', devanagari: 'अजन्मा', meaning: 'unborn', partOfSpeech: 'adjective' },
                    { word: 'nitya', devanagari: 'नित्य', meaning: 'eternal', partOfSpeech: 'adjective' },
                    { word: 'shashvat', devanagari: 'शाश्वत', meaning: 'everlasting', partOfSpeech: 'adjective' },
                    { word: 'puratan', devanagari: 'पुरातन', meaning: 'ancient / primeval', partOfSpeech: 'adjective' }
                  ],
                  questions: [
                    {
                      id: 'bg220_p4_w',
                      type: 'phrase_matching',
                      warmup: true,
                      targetWords: ['ajanma', 'nitya', 'shashvat', 'puratan'],
                      prompt: 'Match each Hindi word to its meaning.',
                      pairs: [
                        { hindi: { dev: 'अजन्मा', roman: 'ajanma' }, english: 'unborn' },
                        { hindi: { dev: 'नित्य', roman: 'nitya' }, english: 'eternal' },
                        { hindi: { dev: 'शाश्वत', roman: 'shashvat' }, english: 'everlasting' },
                        { hindi: { dev: 'पुरातन', roman: 'puratan' }, english: 'ancient / primeval' }
                      ]
                    },
                    {
                      id: 'bg220_p4_m',
                      type: 'phrase_matching',
                      targetWords: ['ajanma', 'nitya', 'shashvat', 'puratan'],
                      prompt: 'Now match the Hindi phrases to their meanings.',
                      pairs: [
                        { hindi: { dev: 'अजन्मा नित्य', roman: 'ajanma nitya' }, english: 'unborn and eternal' },
                        { hindi: { dev: 'शाश्वत और पुरातन', roman: 'shashvat aur puratan' }, english: 'everlasting and ancient' }
                      ]
                    },
                    {
                      id: 'bg220_p4_c',
                      type: 'fill_in_the_blank',
                      targetWords: ['ajanma', 'nitya', 'shashvat', 'puratan'],
                      prompt: 'Complete the English sentence.',
                      hindi: { dev: 'यह अजन्मा, नित्य, शाश्वत और पुरातन है।', roman: 'Yah ajanma, nitya, shashvat aur puratan hai.' },
                      sentence: 'It is unborn, eternal, everlasting and ____.',
                      options: ['ancient', 'slain', 'new', 'again'],
                      answer: 'ancient',
                      explanation: 'The full phrase: "It is unborn, eternal, everlasting and ancient.."'
                    },
                    {
                      id: 'bg220_p4_t',
                      type: 'translate',
                      targetWords: ['ajanma', 'nitya', 'shashvat', 'puratan'],
                      prompt: 'Translate this sentence',
                      hindi: { dev: 'यह अजन्मा, नित्य, शाश्वत और पुरातन है।', roman: 'Yah ajanma, nitya, shashvat aur puratan hai.' },
                      answer: 'It is unborn, eternal, everlasting and ancient.',
                      tiles: ['It is', 'unborn,', 'eternal,', 'everlasting', 'and ancient.', 'slain', 'new'],
                      clues: [
                        { from: 2, to: 3, tile: 'eternal,' }
                      ],
                      explanation: 'It is unborn, eternal, ever-existing, and primeval.'
                    }
                  ]
                },
                {
                  partIndex: 5,
                  title: 'Part 5: Not Slain With the Body',
                  hindiTranslationDevanagari: 'शरीर के मारे जाने पर भी यह नहीं मारी जाती।',
                  hindiTranslationRoman: 'Sharir ke mare jaane par bhi yah nahi maari jaati.',
                  translation: 'it is not slain when the body is slain.',
                  wordBreakdown: [
                    { word: 'sharir', devanagari: 'शरीर', meaning: 'body', partOfSpeech: 'noun' },
                    { word: 'maari', devanagari: 'मारी', meaning: 'slain / killed', partOfSpeech: 'adjective' },
                    { word: 'nahi', devanagari: 'नहीं', meaning: 'not', partOfSpeech: 'adverb' }
                  ],
                  questions: [
                    {
                      id: 'bg220_p5_w',
                      type: 'phrase_matching',
                      warmup: true,
                      targetWords: ['sharir', 'maari', 'nahi'],
                      prompt: 'Match each Hindi word to its meaning.',
                      pairs: [
                        { hindi: { dev: 'शरीर', roman: 'sharir' }, english: 'body' },
                        { hindi: { dev: 'मारी', roman: 'maari' }, english: 'slain / killed' },
                        { hindi: { dev: 'नहीं', roman: 'nahi' }, english: 'not' }
                      ]
                    },
                    {
                      id: 'bg220_p5_m',
                      type: 'phrase_matching',
                      targetWords: ['sharir', 'maari', 'nahi'],
                      prompt: 'Now match the Hindi phrases to their meanings.',
                      pairs: [
                        { hindi: { dev: 'शरीर के मारे जाने पर', roman: 'sharir ke mare jaane par' }, english: 'when the body is slain' },
                        { hindi: { dev: 'यह नहीं मारी जाती', roman: 'yah nahi maari jaati' }, english: 'it is not slain' }
                      ]
                    },
                    {
                      id: 'bg220_p5_c',
                      type: 'fill_in_the_blank',
                      targetWords: ['sharir', 'maari', 'nahi'],
                      prompt: 'Complete the English sentence.',
                      hindi: { dev: 'शरीर के मारे जाने पर भी यह नहीं मारी जाती।', roman: 'Sharir ke mare jaane par bhi yah nahi maari jaati.' },
                      sentence: 'Even when the body is ____, it is not slain.',
                      options: ['slain', 'born', 'again', 'will'],
                      answer: 'slain',
                      explanation: 'The full phrase: "Even when the body is slain, it is not slain.."'
                    },
                    {
                      id: 'bg220_p5_t',
                      type: 'translate',
                      targetWords: ['sharir', 'maari', 'nahi'],
                      prompt: 'Translate this sentence',
                      hindi: { dev: 'शरीर के मारे जाने पर भी यह नहीं मारी जाती।', roman: 'Sharir ke mare jaane par bhi yah nahi maari jaati.' },
                      answer: 'Even when the body is slain, it is not slain.',
                      tiles: ['Even when', 'the body is slain,', 'it is not slain.', 'born', 'again'],
                      clues: [
                        { from: 6, to: 10, tile: 'it is not slain.' }
                      ],
                      explanation: 'it is not slain when the body is slain.'
                    },
                    {
                      id: 'bg220_p5_q',
                      type: 'multiple_choice',
                      prompt: 'What does BG 2.20 say happens to the soul when the body dies?',
                      options: [
                        {
                          text: 'Nothing — the soul is not slain when the body is slain.',
                          isCorrect: true,
                          explanation: 'Correct! The soul is entirely untouched by the body\'s death.'
                        },
                        { text: 'The soul dies along with the body.', isCorrect: false, explanation: 'Incorrect. This verse says exactly the opposite.' }
                      ]
                    }
                  ]
                }
              ],
              finalSynthesisQuestions: [
                {
                  id: 'bg220_syn_m',
                  type: 'phrase_matching',
                  targetWords: [
                    'aatma',
                    'janm',
                    'marti',
                    'kabhi',
                    'utpann',
                    'nahi',
                    'aage',
                    'phir',
                    'ajanma',
                    'nitya',
                    'shashvat',
                    'puratan',
                    'sharir',
                    'maari'
                  ],
                  prompt: 'Match every phrase of the verse to its meaning.',
                  pairs: [
                    {
                      hindi: { dev: 'यह आत्मा न कभी जन्म लेती है, न कभी मरती है।', roman: 'Yah aatma na kabhi janm leti hai, na kabhi marti hai.' },
                      english: 'This soul is never born, and never dies.'
                    },
                    { hindi: { dev: 'यह कभी उत्पन्न नहीं हुई,', roman: 'Yah kabhi utpann nahi hui,' }, english: 'It never came into being,' },
                    {
                      hindi: { dev: 'और न आगे फिर कभी उत्पन्न होगी।', roman: 'aur na aage phir kabhi utpann hogi.' },
                      english: 'and will not come into being ever again.'
                    },
                    {
                      hindi: { dev: 'यह अजन्मा, नित्य, शाश्वत और पुरातन है।', roman: 'Yah ajanma, nitya, shashvat aur puratan hai.' },
                      english: 'It is unborn, eternal, everlasting and ancient.'
                    },
                    {
                      hindi: { dev: 'शरीर के मारे जाने पर भी यह नहीं मारी जाती।', roman: 'Sharir ke mare jaane par bhi yah nahi maari jaati.' },
                      english: 'Even when the body is slain, it is not slain.'
                    }
                  ]
                },
                {
                  id: 'bg220_syn_t1',
                  type: 'translate',
                  targetWords: ['aatma', 'janm', 'marti', 'kabhi', 'utpann', 'nahi'],
                  prompt: 'Translate this sentence',
                  hindi: {
                    dev: 'यह आत्मा न कभी जन्म लेती है, न कभी मरती है। यह कभी उत्पन्न नहीं हुई,',
                    roman: 'Yah aatma na kabhi janm leti hai, na kabhi marti hai. Yah kabhi utpann nahi hui,'
                  },
                  answer: 'This soul is never born, and never dies. It never came into being,',
                  tiles: [
                    'This soul',
                    'is never born,',
                    'and never dies.',
                    'It',
                    'never came',
                    'into being,',
                    'slain',
                    'again',
                    'will'
                  ],
                  explanation: 'It is never born, nor does it ever die. At no time did it come into being...',
                  clues: [
                    { from: 9, to: 10, tile: 'and never dies.' },
                    { from: 12, to: 13, tile: 'never came' }
                  ]
                },
                {
                  id: 'bg220_syn_t2',
                  type: 'translate',
                  targetWords: ['aage', 'phir', 'utpann'],
                  prompt: 'Translate this sentence',
                  hindi: { dev: 'और न आगे फिर कभी उत्पन्न होगी।', roman: 'aur na aage phir kabhi utpann hogi.' },
                  answer: 'and will not come into being ever again.',
                  tiles: ['and will not', 'come into being', 'ever again.', 'was', 'body'],
                  explanation: '...nor will it ever come to be again.',
                  clues: [
                    { from: 3, to: 5, tile: 'ever again.' }
                  ]
                },
                {
                  id: 'bg220_syn_t3',
                  type: 'translate',
                  targetWords: ['ajanma', 'nitya', 'shashvat', 'puratan'],
                  prompt: 'Translate this sentence',
                  hindi: { dev: 'यह अजन्मा, नित्य, शाश्वत और पुरातन है।', roman: 'Yah ajanma, nitya, shashvat aur puratan hai.' },
                  answer: 'It is unborn, eternal, everlasting and ancient.',
                  tiles: ['It is', 'unborn,', 'eternal,', 'everlasting', 'and ancient.', 'slain', 'new'],
                  explanation: 'It is unborn, eternal, ever-existing, and primeval.',
                  clues: [
                    { from: 2, to: 3, tile: 'eternal,' }
                  ]
                },
                {
                  id: 'bg220_syn_t4',
                  type: 'translate',
                  targetWords: ['sharir', 'maari', 'nahi'],
                  prompt: 'Translate this sentence',
                  hindi: { dev: 'शरीर के मारे जाने पर भी यह नहीं मारी जाती।', roman: 'Sharir ke mare jaane par bhi yah nahi maari jaati.' },
                  answer: 'Even when the body is slain, it is not slain.',
                  tiles: ['Even when', 'the body is slain,', 'it is not slain.', 'born', 'again'],
                  explanation: 'it is not slain when the body is slain.',
                  clues: [
                    { from: 6, to: 10, tile: 'it is not slain.' }
                  ]
                },
                {
                  id: 'bg220_syn_q3',
                  type: 'multiple_choice',
                  prompt: 'What is the central teaching of BG 2.20?',
                  options: [
                    {
                      text: 'The soul is entirely outside the cycle of birth and death that only the body goes through.',
                      isCorrect: true,
                      explanation: 'Correct! This is the Gita\'s clearest statement of the soul\'s eternal nature.'
                    },
                    {
                      text: 'The soul is reborn many times, but eventually stops existing.',
                      isCorrect: false,
                      explanation: 'Incorrect. The verse says the soul is unborn and undying — it never began and will never cease.'
                    }
                  ]
                }
              ]
            },
            {
              id: 'ch2_sec2_l3',
              title: 'Like Changing Garments',
              verseRef: 'BG 2.22',
              essence: 'Like changing worn-out clothes, the soul changes worn-out bodies.',
              verseSanskrit: 'वासांसि जीर्णानि यथा विहाय नवानि गृह्णाति नरोऽपराणि ।\nतथा शरीराणि विहाय जीर्णान्यन्यानि संयाति नवानि देही ॥',
              hindiTranslationDevanagari: 'जैसे मनुष्य पुराने वस्त्रों को त्यागकर दूसरे नए वस्त्र धारण करता है;\nवैसे ही जीवात्मा पुराने शरीरों को त्यागकर दूसरे नए शरीरों को प्राप्त होती है।',
              hindiTranslationRoman: 'Jaise manushya purane vastron ko tyagkar doosre naye vastra dharan karta hai;\nwaise hi jeevatma purane shariron ko tyagkar doosre naye shariron ko prapt hoti hai.',
              translation: 'As a person casts off worn-out garments and puts on new ones, the embodied soul likewise casts off worn-out bodies and enters into others that are new.',
              purport: 'One of the Gita\'s best-loved images. A worn-out garment is discarded without grief, because we know we are not the garment. The verse asks us to see the body the same way — as something the self wears, not something the self is.',
              commentary: {
                author: 'Sri Aurobindo',
                tradition: 'Integral Yoga',
                text: 'Nothing is lost when a garment is changed for a new one; the wearer continues. So it is with the embodied self — its bodies change, one after another, but that which puts them on and takes them off remains the same throughout.'
              },
              reflectionPrompt: 'The verse compares the body to a garment the soul wears and eventually changes. Does thinking of your body this way change how you feel about aging, illness, or death?',
              storyCaption: 'Krishna gestured to Arjuna\'s own worn and mended garments. "You do not weep for the cloth you replace," he said. "The soul, too, only changes what it wears."',
              wordBreakdown: [
                { word: 'manushya', devanagari: 'मनुष्य', meaning: 'person / human being', partOfSpeech: 'noun' },
                { word: 'purane', devanagari: 'पुराने', meaning: 'old / worn-out', partOfSpeech: 'adjective' },
                { word: 'vastron', devanagari: 'वस्त्रों', meaning: 'garments', partOfSpeech: 'noun (plural)' },
                { word: 'tyagkar', devanagari: 'त्यागकर', meaning: 'giving up / having abandoned', partOfSpeech: 'verb' },
                { word: 'doosre', devanagari: 'दूसरे', meaning: 'another / other', partOfSpeech: 'adjective' },
                { word: 'naye', devanagari: 'नए', meaning: 'new', partOfSpeech: 'adjective' },
                { word: 'vastra', devanagari: 'वस्त्र', meaning: 'garments', partOfSpeech: 'noun' },
                { word: 'dharan', devanagari: 'धारण', meaning: 'wearing / putting on', partOfSpeech: 'noun' },
                { word: 'waise', devanagari: 'वैसे', meaning: 'similarly / in the same way', partOfSpeech: 'adverb' },
                { word: 'jeevatma', devanagari: 'जीवात्मा', meaning: 'embodied soul', partOfSpeech: 'noun' },
                { word: 'shariron', devanagari: 'शरीरों', meaning: 'bodies', partOfSpeech: 'noun (plural)' },
                { word: 'prapt', devanagari: 'प्राप्त', meaning: 'attained / obtained', partOfSpeech: 'adjective' }
              ],
              questions: [],
              parts: [
                {
                  partIndex: 1,
                  title: 'Part 1: Worn-Out Garments',
                  hindiTranslationDevanagari: 'जैसे मनुष्य पुराने वस्त्रों को त्यागकर',
                  hindiTranslationRoman: 'Jaise manushya purane vastron ko tyagkar',
                  translation: 'As, giving up garments that are worn out...',
                  wordBreakdown: [
                    { word: 'manushya', devanagari: 'मनुष्य', meaning: 'person / human being', partOfSpeech: 'noun' },
                    { word: 'purane', devanagari: 'पुराने', meaning: 'old / worn-out', partOfSpeech: 'adjective' },
                    { word: 'vastron', devanagari: 'वस्त्रों', meaning: 'garments', partOfSpeech: 'noun (plural)' },
                    { word: 'tyagkar', devanagari: 'त्यागकर', meaning: 'giving up / having abandoned', partOfSpeech: 'verb' }
                  ],
                  questions: [
                    {
                      id: 'bg222_p1_w',
                      type: 'phrase_matching',
                      warmup: true,
                      targetWords: ['manushya', 'purane', 'vastron', 'tyagkar'],
                      prompt: 'Match each Hindi word to its meaning.',
                      pairs: [
                        { hindi: { dev: 'मनुष्य', roman: 'manushya' }, english: 'person / human being' },
                        { hindi: { dev: 'पुराने', roman: 'purane' }, english: 'old / worn-out' },
                        { hindi: { dev: 'वस्त्रों', roman: 'vastron' }, english: 'garments' },
                        { hindi: { dev: 'त्यागकर', roman: 'tyagkar' }, english: 'giving up / having abandoned' }
                      ]
                    },
                    {
                      id: 'bg222_p1_m',
                      type: 'phrase_matching',
                      targetWords: ['manushya', 'purane', 'vastron', 'tyagkar'],
                      prompt: 'Now match the Hindi phrases to their meanings.',
                      pairs: [
                        { hindi: { dev: 'जैसे मनुष्य', roman: 'jaise manushya' }, english: 'just as a person' },
                        { hindi: { dev: 'पुराने वस्त्रों को', roman: 'purane vastron ko' }, english: 'the old garments' },
                        { hindi: { dev: 'त्यागकर', roman: 'tyagkar' }, english: 'giving up' }
                      ]
                    },
                    {
                      id: 'bg222_p1_c',
                      type: 'fill_in_the_blank',
                      targetWords: ['manushya', 'purane', 'vastron', 'tyagkar'],
                      prompt: 'Complete the English sentence.',
                      hindi: { dev: 'जैसे मनुष्य पुराने वस्त्रों को त्यागकर', roman: 'Jaise manushya purane vastron ko tyagkar' },
                      sentence: 'Just as a person gives up old ____,',
                      options: ['garments', 'new', 'bodies', 'takes'],
                      answer: 'garments',
                      explanation: 'The full phrase: "Just as a person gives up old garments."'
                    },
                    {
                      id: 'bg222_p1_t',
                      type: 'translate',
                      targetWords: ['manushya', 'purane', 'vastron', 'tyagkar'],
                      prompt: 'Translate this sentence',
                      hindi: { dev: 'जैसे मनुष्य पुराने वस्त्रों को त्यागकर', roman: 'Jaise manushya purane vastron ko tyagkar' },
                      answer: 'Just as a person gives up old garments,',
                      tiles: ['Just as', 'a person', 'gives up', 'old garments,', 'new bodies', 'takes'],
                      clues: [
                        { from: 2, to: 4, tile: 'old garments,' }
                      ],
                      explanation: 'As, giving up garments that are worn out...'
                    }
                  ]
                },
                {
                  partIndex: 2,
                  title: 'Part 2: Taking Up New Ones',
                  hindiTranslationDevanagari: 'दूसरे नए वस्त्र धारण करता है;',
                  hindiTranslationRoman: 'doosre naye vastra dharan karta hai;',
                  translation: 'a person takes up other, new ones.',
                  wordBreakdown: [
                    { word: 'doosre', devanagari: 'दूसरे', meaning: 'another / other', partOfSpeech: 'adjective' },
                    { word: 'naye', devanagari: 'नए', meaning: 'new', partOfSpeech: 'adjective' },
                    { word: 'vastra', devanagari: 'वस्त्र', meaning: 'garments', partOfSpeech: 'noun' },
                    { word: 'dharan', devanagari: 'धारण', meaning: 'wearing / putting on', partOfSpeech: 'noun' }
                  ],
                  questions: [
                    {
                      id: 'bg222_p2_w',
                      type: 'phrase_matching',
                      warmup: true,
                      targetWords: ['doosre', 'naye', 'vastra', 'dharan'],
                      prompt: 'Match each Hindi word to its meaning.',
                      pairs: [
                        { hindi: { dev: 'दूसरे', roman: 'doosre' }, english: 'another / other' },
                        { hindi: { dev: 'नए', roman: 'naye' }, english: 'new' },
                        { hindi: { dev: 'वस्त्र', roman: 'vastra' }, english: 'garments' },
                        { hindi: { dev: 'धारण', roman: 'dharan' }, english: 'wearing / putting on' }
                      ]
                    },
                    {
                      id: 'bg222_p2_m',
                      type: 'phrase_matching',
                      targetWords: ['doosre', 'naye', 'vastra', 'dharan'],
                      prompt: 'Now match the Hindi phrases to their meanings.',
                      pairs: [
                        { hindi: { dev: 'दूसरे नए वस्त्र', roman: 'doosre naye vastra' }, english: 'other new garments' },
                        { hindi: { dev: 'धारण करता है', roman: 'dharan karta hai' }, english: 'puts on' }
                      ]
                    },
                    {
                      id: 'bg222_p2_c',
                      type: 'fill_in_the_blank',
                      targetWords: ['doosre', 'naye', 'vastra', 'dharan'],
                      prompt: 'Complete the English sentence.',
                      hindi: { dev: 'दूसरे नए वस्त्र धारण करता है;', roman: 'doosre naye vastra dharan karta hai;' },
                      sentence: 'Puts on other new ____;',
                      options: ['garments', 'bodies', 'soul', 'takes'],
                      answer: 'garments',
                      explanation: 'The full phrase: "Puts on other new garments."'
                    },
                    {
                      id: 'bg222_p2_t',
                      type: 'translate',
                      targetWords: ['doosre', 'naye', 'vastra', 'dharan'],
                      prompt: 'Translate this sentence',
                      hindi: { dev: 'दूसरे नए वस्त्र धारण करता है;', roman: 'doosre naye vastra dharan karta hai;' },
                      answer: 'puts on other new garments;',
                      tiles: ['puts on', 'other', 'new garments;', 'bodies', 'soul'],
                      clues: [
                        { from: 3, to: 6, tile: 'puts on' }
                      ],
                      explanation: 'a person takes up other, new ones.'
                    }
                  ]
                },
                {
                  partIndex: 3,
                  title: 'Part 3: Giving Up Worn-Out Bodies',
                  hindiTranslationDevanagari: 'वैसे ही जीवात्मा पुराने शरीरों को त्यागकर',
                  hindiTranslationRoman: 'waise hi jeevatma purane shariron ko tyagkar',
                  translation: 'so too, giving up worn-out bodies, for other ones...',
                  wordBreakdown: [
                    { word: 'waise', devanagari: 'वैसे', meaning: 'similarly / in the same way', partOfSpeech: 'adverb' },
                    { word: 'jeevatma', devanagari: 'जीवात्मा', meaning: 'embodied soul', partOfSpeech: 'noun' },
                    { word: 'purane', devanagari: 'पुराने', meaning: 'old / worn-out', partOfSpeech: 'adjective' },
                    { word: 'shariron', devanagari: 'शरीरों', meaning: 'bodies', partOfSpeech: 'noun (plural)' }
                  ],
                  questions: [
                    {
                      id: 'bg222_p3_w',
                      type: 'phrase_matching',
                      warmup: true,
                      targetWords: ['waise', 'jeevatma', 'purane', 'shariron'],
                      prompt: 'Match each Hindi word to its meaning.',
                      pairs: [
                        { hindi: { dev: 'वैसे', roman: 'waise' }, english: 'similarly / in the same way' },
                        { hindi: { dev: 'जीवात्मा', roman: 'jeevatma' }, english: 'embodied soul' },
                        { hindi: { dev: 'पुराने', roman: 'purane' }, english: 'old / worn-out' },
                        { hindi: { dev: 'शरीरों', roman: 'shariron' }, english: 'bodies' }
                      ]
                    },
                    {
                      id: 'bg222_p3_m',
                      type: 'phrase_matching',
                      targetWords: ['waise', 'jeevatma', 'purane', 'shariron'],
                      prompt: 'Now match the Hindi phrases to their meanings.',
                      pairs: [
                        { hindi: { dev: 'वैसे ही जीवात्मा', roman: 'waise hi jeevatma' }, english: 'in the same way the soul' },
                        { hindi: { dev: 'पुराने शरीरों को', roman: 'purane shariron ko' }, english: 'the old bodies' },
                        { hindi: { dev: 'त्यागकर', roman: 'tyagkar' }, english: 'giving up' }
                      ]
                    },
                    {
                      id: 'bg222_p3_c',
                      type: 'fill_in_the_blank',
                      targetWords: ['waise', 'jeevatma', 'purane', 'shariron'],
                      prompt: 'Complete the English sentence.',
                      hindi: { dev: 'वैसे ही जीवात्मा पुराने शरीरों को त्यागकर', roman: 'waise hi jeevatma purane shariron ko tyagkar' },
                      sentence: 'In the same way the soul gives up old ____,',
                      options: ['bodies', 'garments', 'person', 'new'],
                      answer: 'bodies',
                      explanation: 'The full phrase: "In the same way the soul gives up old bodies."'
                    },
                    {
                      id: 'bg222_p3_t',
                      type: 'translate',
                      targetWords: ['waise', 'jeevatma', 'purane', 'shariron'],
                      prompt: 'Translate this sentence',
                      hindi: { dev: 'वैसे ही जीवात्मा पुराने शरीरों को त्यागकर', roman: 'waise hi jeevatma purane shariron ko tyagkar' },
                      answer: 'In the same way the soul gives up old bodies,',
                      tiles: ['In the same way', 'the soul', 'gives up', 'old bodies,', 'garments', 'person'],
                      clues: [
                        { from: 2, to: 3, tile: 'the soul' }
                      ],
                      explanation: 'so too, giving up worn-out bodies, for other ones...'
                    }
                  ]
                },
                {
                  partIndex: 4,
                  title: 'Part 4: The Soul Moves On',
                  hindiTranslationDevanagari: 'दूसरे नए शरीरों को प्राप्त होती है।',
                  hindiTranslationRoman: 'doosre naye shariron ko prapt hoti hai.',
                  translation: 'the embodied soul enters into new ones.',
                  wordBreakdown: [
                    { word: 'doosre', devanagari: 'दूसरे', meaning: 'another / other', partOfSpeech: 'adjective' },
                    { word: 'naye', devanagari: 'नए', meaning: 'new', partOfSpeech: 'adjective' },
                    { word: 'shariron', devanagari: 'शरीरों', meaning: 'bodies', partOfSpeech: 'noun (plural)' },
                    { word: 'prapt', devanagari: 'प्राप्त', meaning: 'attained / obtained', partOfSpeech: 'adjective' }
                  ],
                  questions: [
                    {
                      id: 'bg222_p4_w',
                      type: 'phrase_matching',
                      warmup: true,
                      targetWords: ['doosre', 'naye', 'shariron', 'prapt'],
                      prompt: 'Match each Hindi word to its meaning.',
                      pairs: [
                        { hindi: { dev: 'दूसरे', roman: 'doosre' }, english: 'another / other' },
                        { hindi: { dev: 'नए', roman: 'naye' }, english: 'new' },
                        { hindi: { dev: 'शरीरों', roman: 'shariron' }, english: 'bodies' },
                        { hindi: { dev: 'प्राप्त', roman: 'prapt' }, english: 'attained / obtained' }
                      ]
                    },
                    {
                      id: 'bg222_p4_m',
                      type: 'phrase_matching',
                      targetWords: ['doosre', 'naye', 'shariron', 'prapt'],
                      prompt: 'Now match the Hindi phrases to their meanings.',
                      pairs: [
                        { hindi: { dev: 'दूसरे नए शरीरों को', roman: 'doosre naye shariron ko' }, english: 'other new bodies' },
                        { hindi: { dev: 'प्राप्त होती है', roman: 'prapt hoti hai' }, english: 'attains' }
                      ]
                    },
                    {
                      id: 'bg222_p4_c',
                      type: 'fill_in_the_blank',
                      targetWords: ['doosre', 'naye', 'shariron', 'prapt'],
                      prompt: 'Complete the English sentence.',
                      hindi: { dev: 'दूसरे नए शरीरों को प्राप्त होती है।', roman: 'doosre naye shariron ko prapt hoti hai.' },
                      sentence: 'And attains other new ____.',
                      options: ['bodies', 'garments', 'person', 'takes'],
                      answer: 'bodies',
                      explanation: 'The full phrase: "And attains other new bodies.."'
                    },
                    {
                      id: 'bg222_p4_t',
                      type: 'translate',
                      targetWords: ['doosre', 'naye', 'shariron', 'prapt'],
                      prompt: 'Translate this sentence',
                      hindi: { dev: 'दूसरे नए शरीरों को प्राप्त होती है।', roman: 'doosre naye shariron ko prapt hoti hai.' },
                      answer: 'and attains other new bodies.',
                      tiles: ['and attains', 'other new bodies.', 'garments', 'person'],
                      clues: [
                        { from: 4, to: 7, tile: 'and attains' }
                      ],
                      explanation: 'the embodied soul enters into new ones.'
                    },
                    {
                      id: 'bg222_p4_q',
                      type: 'multiple_choice',
                      prompt: 'What does the garment simile in BG 2.22 teach?',
                      options: [
                        {
                          text: 'Just as we replace old clothes with new ones, the soul takes on a new body when the old one wears out.',
                          isCorrect: true,
                          explanation: 'Correct! The body is what the soul wears, not what the soul is.'
                        },
                        {
                          text: 'The soul is destroyed along with the body, like a garment thrown away for good.',
                          isCorrect: false,
                          explanation: 'Incorrect. The garment is discarded, but the wearer — the soul — continues.'
                        }
                      ]
                    }
                  ]
                }
              ],
              finalSynthesisQuestions: [
                {
                  id: 'bg222_syn_m',
                  type: 'phrase_matching',
                  targetWords: [
                    'manushya',
                    'purane',
                    'vastron',
                    'tyagkar',
                    'doosre',
                    'naye',
                    'vastra',
                    'dharan',
                    'waise',
                    'jeevatma',
                    'shariron',
                    'prapt'
                  ],
                  prompt: 'Match every phrase of the verse to its meaning.',
                  pairs: [
                    {
                      hindi: { dev: 'जैसे मनुष्य पुराने वस्त्रों को त्यागकर', roman: 'Jaise manushya purane vastron ko tyagkar' },
                      english: 'Just as a person gives up old garments,'
                    },
                    { hindi: { dev: 'दूसरे नए वस्त्र धारण करता है;', roman: 'doosre naye vastra dharan karta hai;' }, english: 'puts on other new garments;' },
                    {
                      hindi: { dev: 'वैसे ही जीवात्मा पुराने शरीरों को त्यागकर', roman: 'waise hi jeevatma purane shariron ko tyagkar' },
                      english: 'In the same way the soul gives up old bodies,'
                    },
                    { hindi: { dev: 'दूसरे नए शरीरों को प्राप्त होती है।', roman: 'doosre naye shariron ko prapt hoti hai.' }, english: 'and attains other new bodies.' }
                  ]
                },
                {
                  id: 'bg222_syn_t1',
                  type: 'translate',
                  targetWords: ['manushya', 'purane', 'vastron', 'tyagkar', 'doosre', 'naye', 'vastra', 'dharan'],
                  prompt: 'Translate this sentence',
                  hindi: {
                    dev: 'जैसे मनुष्य पुराने वस्त्रों को त्यागकर दूसरे नए वस्त्र धारण करता है;',
                    roman: 'Jaise manushya purane vastron ko tyagkar doosre naye vastra dharan karta hai;'
                  },
                  answer: 'Just as a person gives up old garments, puts on other new garments;',
                  tiles: [
                    'Just as',
                    'a person',
                    'gives up',
                    'old garments,',
                    'puts on',
                    'other',
                    'new garments;',
                    'takes',
                    'bodies',
                    'soul'
                  ],
                  explanation: 'As, giving up garments that are worn out... a person takes up other, new ones.',
                  clues: [
                    { from: 2, to: 4, tile: 'old garments,' },
                    { from: 9, to: 12, tile: 'puts on' }
                  ]
                },
                {
                  id: 'bg222_syn_t2',
                  type: 'translate',
                  targetWords: ['waise', 'jeevatma', 'purane', 'shariron', 'doosre', 'naye', 'prapt'],
                  prompt: 'Translate this sentence',
                  hindi: {
                    dev: 'वैसे ही जीवात्मा पुराने शरीरों को त्यागकर दूसरे नए शरीरों को प्राप्त होती है।',
                    roman: 'waise hi jeevatma purane shariron ko tyagkar doosre naye shariron ko prapt hoti hai.'
                  },
                  answer: 'In the same way the soul gives up old bodies, and attains other new bodies.',
                  tiles: [
                    'In the same way',
                    'the soul',
                    'gives up',
                    'old bodies,',
                    'and attains',
                    'other new bodies.',
                    'garments',
                    'person'
                  ],
                  explanation: 'so too, giving up worn-out bodies, for other ones... the embodied soul enters into new ones.',
                  clues: [
                    { from: 2, to: 3, tile: 'the soul' },
                    { from: 11, to: 14, tile: 'and attains' }
                  ]
                }
              ]
            },
            {
              id: 'ch2_sec2_l4',
              title: 'Untouched by Any Element',
              verseRef: 'BG 2.23',
              essence: 'Weapons, fire, water and wind cannot harm the soul.',
              verseSanskrit: 'नैनं छिन्दन्ति शस्त्राणि नैनं दहति पावकः ।\nन चैनं क्लेदयन्त्यापो न शोषयति मारुतः ॥',
              hindiTranslationDevanagari: 'इसे शस्त्र काट नहीं सकते, आग इसे जला नहीं सकती,\nजल इसे गीला नहीं कर सकता, और वायु इसे सुखा नहीं सकती।',
              hindiTranslationRoman: 'Ise shastra kaat nahi sakte, aag ise jala nahi sakti,\njal ise geela nahi kar sakta, aur vayu ise sukha nahi sakti.',
              translation: 'Weapons cannot cut the soul, nor can fire burn it. Water cannot wet it, nor can wind dry it.',
              purport: 'Having said the soul is unborn and undying, Krishna makes the point as concrete as possible: nothing in the physical world — blade, flame, water, or wind — can reach it at all. Arjuna\'s fear is of what weapons can do; this verse says weapons simply cannot touch what he truly is.',
              commentary: {
                author: 'Swami Chinmayananda',
                tradition: 'Chinmaya Mission',
                text: 'The four great elements Arjuna would use to end a life — the blade, the fire, the flood, the storm — are named here only to be dismissed. None of them are equal to the task, because the target they seek was never made of anything they can act upon.'
              },
              reflectionPrompt: 'This verse insists that the true self cannot be harmed by any physical force. What fears in your own life are really fears about the body or circumstances, rather than about you?',
              storyCaption: 'Arjuna\'s hands trembled on his bow, afraid of the harm his weapons could do. "No blade can cut it," Krishna said, "no fire burn it, no water wet it, no wind dry it."',
              wordBreakdown: [
                { word: 'shastra', devanagari: 'शस्त्र', meaning: 'weapons', partOfSpeech: 'noun' },
                { word: 'kaat', devanagari: 'काट', meaning: 'cut', partOfSpeech: 'verb' },
                { word: 'ise', devanagari: 'इसे', meaning: 'it / this soul', partOfSpeech: 'pronoun' },
                { word: 'nahi', devanagari: 'नहीं', meaning: 'not', partOfSpeech: 'adverb' },
                { word: 'aag', devanagari: 'आग', meaning: 'fire', partOfSpeech: 'noun' },
                { word: 'jala', devanagari: 'जला', meaning: 'burn', partOfSpeech: 'verb' },
                { word: 'jal', devanagari: 'जल', meaning: 'water', partOfSpeech: 'noun' },
                { word: 'geela', devanagari: 'गीला', meaning: 'wet', partOfSpeech: 'adjective' },
                { word: 'vayu', devanagari: 'वायु', meaning: 'wind', partOfSpeech: 'noun' },
                { word: 'sukha', devanagari: 'सुखा', meaning: 'dry', partOfSpeech: 'verb' },
                { word: 'aur', devanagari: 'और', meaning: 'and', partOfSpeech: 'conjunction' }
              ],
              questions: [],
              parts: [
                {
                  partIndex: 1,
                  title: 'Part 1: Weapons Cannot Cut It',
                  hindiTranslationDevanagari: 'इसे शस्त्र काट नहीं सकते,',
                  hindiTranslationRoman: 'Ise shastra kaat nahi sakte,',
                  translation: 'Weapons cannot cut it.',
                  wordBreakdown: [
                    { word: 'shastra', devanagari: 'शस्त्र', meaning: 'weapons', partOfSpeech: 'noun' },
                    { word: 'kaat', devanagari: 'काट', meaning: 'cut', partOfSpeech: 'verb' },
                    { word: 'ise', devanagari: 'इसे', meaning: 'it / this soul', partOfSpeech: 'pronoun' },
                    { word: 'nahi', devanagari: 'नहीं', meaning: 'not', partOfSpeech: 'adverb' }
                  ],
                  questions: [
                    {
                      id: 'bg223_p1_w',
                      type: 'phrase_matching',
                      warmup: true,
                      targetWords: ['shastra', 'kaat', 'ise', 'nahi'],
                      prompt: 'Match each Hindi word to its meaning.',
                      pairs: [
                        { hindi: { dev: 'शस्त्र', roman: 'shastra' }, english: 'weapons' },
                        { hindi: { dev: 'काट', roman: 'kaat' }, english: 'cut' },
                        { hindi: { dev: 'इसे', roman: 'ise' }, english: 'it / this soul' },
                        { hindi: { dev: 'नहीं', roman: 'nahi' }, english: 'not' }
                      ]
                    },
                    {
                      id: 'bg223_p1_m',
                      type: 'phrase_matching',
                      targetWords: ['shastra', 'kaat', 'ise', 'nahi'],
                      prompt: 'Now match the Hindi phrases to their meanings.',
                      pairs: [
                        { hindi: { dev: 'इसे', roman: 'ise' }, english: 'it' },
                        { hindi: { dev: 'शस्त्र', roman: 'shastra' }, english: 'weapons' },
                        { hindi: { dev: 'काट नहीं सकते', roman: 'kaat nahi sakte' }, english: 'cannot cut' }
                      ]
                    },
                    {
                      id: 'bg223_p1_c',
                      type: 'fill_in_the_blank',
                      targetWords: ['shastra', 'kaat', 'ise', 'nahi'],
                      prompt: 'Complete the English sentence.',
                      hindi: { dev: 'इसे शस्त्र काट नहीं सकते,', roman: 'Ise shastra kaat nahi sakte,' },
                      sentence: 'Weapons cannot ____ it,',
                      options: ['cut', 'burn', 'wet', 'wind'],
                      answer: 'cut',
                      explanation: 'The full phrase: "Weapons cannot cut it."'
                    },
                    {
                      id: 'bg223_p1_t',
                      type: 'translate',
                      targetWords: ['shastra', 'kaat', 'ise', 'nahi'],
                      prompt: 'Translate this sentence',
                      hindi: { dev: 'इसे शस्त्र काट नहीं सकते,', roman: 'Ise shastra kaat nahi sakte,' },
                      answer: 'Weapons cannot cut it,',
                      tiles: ['Weapons', 'cannot cut it,', 'burn', 'wet'],
                      clues: [
                        { from: 1, to: 2, tile: 'Weapons' }
                      ],
                      explanation: 'Weapons cannot cut it.'
                    }
                  ]
                },
                {
                  partIndex: 2,
                  title: 'Part 2: Fire Cannot Burn It',
                  hindiTranslationDevanagari: 'आग इसे जला नहीं सकती,',
                  hindiTranslationRoman: 'aag ise jala nahi sakti,',
                  translation: 'Fire cannot burn it.',
                  wordBreakdown: [
                    { word: 'aag', devanagari: 'आग', meaning: 'fire', partOfSpeech: 'noun' },
                    { word: 'jala', devanagari: 'जला', meaning: 'burn', partOfSpeech: 'verb' },
                    { word: 'ise', devanagari: 'इसे', meaning: 'it / this soul', partOfSpeech: 'pronoun' }
                  ],
                  questions: [
                    {
                      id: 'bg223_p2_w',
                      type: 'phrase_matching',
                      warmup: true,
                      targetWords: ['aag', 'jala', 'ise'],
                      prompt: 'Match each Hindi word to its meaning.',
                      pairs: [
                        { hindi: { dev: 'आग', roman: 'aag' }, english: 'fire' },
                        { hindi: { dev: 'जला', roman: 'jala' }, english: 'burn' },
                        { hindi: { dev: 'इसे', roman: 'ise' }, english: 'it / this soul' }
                      ]
                    },
                    {
                      id: 'bg223_p2_m',
                      type: 'phrase_matching',
                      targetWords: ['aag', 'jala', 'ise'],
                      prompt: 'Now match the Hindi phrases to their meanings.',
                      pairs: [
                        { hindi: { dev: 'आग', roman: 'aag' }, english: 'fire' },
                        { hindi: { dev: 'इसे', roman: 'ise' }, english: 'it' },
                        { hindi: { dev: 'जला नहीं सकती', roman: 'jala nahi sakti' }, english: 'cannot burn' }
                      ]
                    },
                    {
                      id: 'bg223_p2_c',
                      type: 'fill_in_the_blank',
                      targetWords: ['aag', 'jala', 'ise'],
                      prompt: 'Complete the English sentence.',
                      hindi: { dev: 'आग इसे जला नहीं सकती,', roman: 'aag ise jala nahi sakti,' },
                      sentence: 'Fire cannot ____ it,',
                      options: ['burn', 'wind', 'dry', 'wet'],
                      answer: 'burn',
                      explanation: 'The full phrase: "Fire cannot burn it."'
                    },
                    {
                      id: 'bg223_p2_t',
                      type: 'translate',
                      targetWords: ['aag', 'jala', 'ise'],
                      prompt: 'Translate this sentence',
                      hindi: { dev: 'आग इसे जला नहीं सकती,', roman: 'aag ise jala nahi sakti,' },
                      answer: 'fire cannot burn it,',
                      tiles: ['fire', 'cannot burn it,', 'wind', 'dry'],
                      clues: [
                        { from: 0, to: 1, tile: 'fire' }
                      ],
                      explanation: 'Fire cannot burn it.'
                    }
                  ]
                },
                {
                  partIndex: 3,
                  title: 'Part 3: Water Cannot Wet It',
                  hindiTranslationDevanagari: 'जल इसे गीला नहीं कर सकता,',
                  hindiTranslationRoman: 'jal ise geela nahi kar sakta,',
                  translation: 'nor can water wet it.',
                  wordBreakdown: [
                    { word: 'jal', devanagari: 'जल', meaning: 'water', partOfSpeech: 'noun' },
                    { word: 'geela', devanagari: 'गीला', meaning: 'wet', partOfSpeech: 'adjective' },
                    { word: 'ise', devanagari: 'इसे', meaning: 'it / this soul', partOfSpeech: 'pronoun' }
                  ],
                  questions: [
                    {
                      id: 'bg223_p3_w',
                      type: 'phrase_matching',
                      warmup: true,
                      targetWords: ['jal', 'geela', 'ise'],
                      prompt: 'Match each Hindi word to its meaning.',
                      pairs: [
                        { hindi: { dev: 'जल', roman: 'jal' }, english: 'water' },
                        { hindi: { dev: 'गीला', roman: 'geela' }, english: 'wet' },
                        { hindi: { dev: 'इसे', roman: 'ise' }, english: 'it / this soul' }
                      ]
                    },
                    {
                      id: 'bg223_p3_m',
                      type: 'phrase_matching',
                      targetWords: ['jal', 'geela', 'ise'],
                      prompt: 'Now match the Hindi phrases to their meanings.',
                      pairs: [
                        { hindi: { dev: 'जल', roman: 'jal' }, english: 'water' },
                        { hindi: { dev: 'इसे', roman: 'ise' }, english: 'it' },
                        { hindi: { dev: 'गीला नहीं कर सकता', roman: 'geela nahi kar sakta' }, english: 'cannot wet' }
                      ]
                    },
                    {
                      id: 'bg223_p3_c',
                      type: 'fill_in_the_blank',
                      targetWords: ['jal', 'geela', 'ise'],
                      prompt: 'Complete the English sentence.',
                      hindi: { dev: 'जल इसे गीला नहीं कर सकता,', roman: 'jal ise geela nahi kar sakta,' },
                      sentence: 'Water cannot ____ it,',
                      options: ['wet', 'dry', 'weapons', 'burn'],
                      answer: 'wet',
                      explanation: 'The full phrase: "Water cannot wet it."'
                    },
                    {
                      id: 'bg223_p3_t',
                      type: 'translate',
                      targetWords: ['jal', 'geela', 'ise'],
                      prompt: 'Translate this sentence',
                      hindi: { dev: 'जल इसे गीला नहीं कर सकता,', roman: 'jal ise geela nahi kar sakta,' },
                      answer: 'Water cannot wet it,',
                      tiles: ['Water', 'cannot wet it,', 'dry', 'weapons'],
                      clues: [
                        { from: 0, to: 1, tile: 'Water' }
                      ],
                      explanation: 'nor can water wet it.'
                    }
                  ]
                },
                {
                  partIndex: 4,
                  title: 'Part 4: Wind Cannot Dry It',
                  hindiTranslationDevanagari: 'और वायु इसे सुखा नहीं सकती।',
                  hindiTranslationRoman: 'aur vayu ise sukha nahi sakti.',
                  translation: 'nor can wind dry it.',
                  wordBreakdown: [
                    { word: 'vayu', devanagari: 'वायु', meaning: 'wind', partOfSpeech: 'noun' },
                    { word: 'sukha', devanagari: 'सुखा', meaning: 'dry', partOfSpeech: 'verb' },
                    { word: 'aur', devanagari: 'और', meaning: 'and', partOfSpeech: 'conjunction' }
                  ],
                  questions: [
                    {
                      id: 'bg223_p4_w',
                      type: 'phrase_matching',
                      warmup: true,
                      targetWords: ['vayu', 'sukha', 'aur'],
                      prompt: 'Match each Hindi word to its meaning.',
                      pairs: [
                        { hindi: { dev: 'वायु', roman: 'vayu' }, english: 'wind' },
                        { hindi: { dev: 'सुखा', roman: 'sukha' }, english: 'dry' },
                        { hindi: { dev: 'और', roman: 'aur' }, english: 'and' }
                      ]
                    },
                    {
                      id: 'bg223_p4_m',
                      type: 'phrase_matching',
                      targetWords: ['vayu', 'sukha', 'aur'],
                      prompt: 'Now match the Hindi phrases to their meanings.',
                      pairs: [
                        { hindi: { dev: 'वायु', roman: 'vayu' }, english: 'wind' },
                        { hindi: { dev: 'इसे', roman: 'ise' }, english: 'it' },
                        { hindi: { dev: 'सुखा नहीं सकती', roman: 'sukha nahi sakti' }, english: 'cannot dry' }
                      ]
                    },
                    {
                      id: 'bg223_p4_c',
                      type: 'fill_in_the_blank',
                      targetWords: ['vayu', 'sukha', 'aur'],
                      prompt: 'Complete the English sentence.',
                      hindi: { dev: 'और वायु इसे सुखा नहीं सकती।', roman: 'aur vayu ise sukha nahi sakti.' },
                      sentence: 'And wind cannot ____ it.',
                      options: ['dry', 'fire', 'burn', 'wet'],
                      answer: 'dry',
                      explanation: 'The full phrase: "And wind cannot dry it.."'
                    },
                    {
                      id: 'bg223_p4_t',
                      type: 'translate',
                      targetWords: ['vayu', 'sukha', 'aur'],
                      prompt: 'Translate this sentence',
                      hindi: { dev: 'और वायु इसे सुखा नहीं सकती।', roman: 'aur vayu ise sukha nahi sakti.' },
                      answer: 'and wind cannot dry it.',
                      tiles: ['and wind', 'cannot dry it.', 'fire', 'burn'],
                      clues: [
                        { from: 1, to: 2, tile: 'and wind' }
                      ],
                      explanation: 'nor can wind dry it.'
                    },
                    {
                      id: 'bg223_p4_q',
                      type: 'multiple_choice',
                      prompt: 'According to BG 2.23, what can harm the soul?',
                      options: [
                        {
                          text: 'Nothing physical — weapons, fire, water, and wind are all named, and all are unable to touch it.',
                          isCorrect: true,
                          explanation: 'Correct! The soul is beyond the reach of every physical force.'
                        },
                        {
                          text: 'Only fire, which can burn away anything.',
                          isCorrect: false,
                          explanation: 'Incorrect. The verse explicitly says fire cannot burn it either.'
                        }
                      ]
                    }
                  ]
                }
              ],
              finalSynthesisQuestions: [
                {
                  id: 'bg223_syn_m',
                  type: 'phrase_matching',
                  targetWords: ['shastra', 'kaat', 'ise', 'nahi', 'aag', 'jala', 'jal', 'geela', 'vayu', 'sukha', 'aur'],
                  prompt: 'Match every phrase of the verse to its meaning.',
                  pairs: [
                    { hindi: { dev: 'इसे शस्त्र काट नहीं सकते,', roman: 'Ise shastra kaat nahi sakte,' }, english: 'Weapons cannot cut it,' },
                    { hindi: { dev: 'आग इसे जला नहीं सकती,', roman: 'aag ise jala nahi sakti,' }, english: 'fire cannot burn it,' },
                    { hindi: { dev: 'जल इसे गीला नहीं कर सकता,', roman: 'jal ise geela nahi kar sakta,' }, english: 'Water cannot wet it,' },
                    { hindi: { dev: 'और वायु इसे सुखा नहीं सकती।', roman: 'aur vayu ise sukha nahi sakti.' }, english: 'and wind cannot dry it.' }
                  ]
                },
                {
                  id: 'bg223_syn_t1',
                  type: 'translate',
                  targetWords: ['shastra', 'kaat', 'ise', 'nahi', 'aag', 'jala'],
                  prompt: 'Translate this sentence',
                  hindi: { dev: 'इसे शस्त्र काट नहीं सकते, आग इसे जला नहीं सकती,', roman: 'Ise shastra kaat nahi sakte, aag ise jala nahi sakti,' },
                  answer: 'Weapons cannot cut it, fire cannot burn it,',
                  tiles: ['Weapons', 'cannot cut it,', 'fire', 'cannot burn it,', 'wet', 'wind', 'dry'],
                  explanation: 'Weapons cannot cut it. Fire cannot burn it.',
                  clues: [
                    { from: 1, to: 2, tile: 'Weapons' },
                    { from: 5, to: 6, tile: 'fire' }
                  ]
                },
                {
                  id: 'bg223_syn_t2',
                  type: 'translate',
                  targetWords: ['jal', 'geela', 'ise', 'vayu', 'sukha', 'aur'],
                  prompt: 'Translate this sentence',
                  hindi: { dev: 'जल इसे गीला नहीं कर सकता, और वायु इसे सुखा नहीं सकती।', roman: 'jal ise geela nahi kar sakta, aur vayu ise sukha nahi sakti.' },
                  answer: 'Water cannot wet it, and wind cannot dry it.',
                  tiles: ['Water', 'cannot wet it,', 'and wind', 'cannot dry it.', 'weapons', 'fire', 'burn'],
                  explanation: 'nor can water wet it. nor can wind dry it.',
                  clues: [
                    { from: 0, to: 1, tile: 'Water' },
                    { from: 7, to: 8, tile: 'and wind' }
                  ]
                },
                {
                  id: 'bg223_syn_q3',
                  type: 'reflection',
                  prompt: 'Personal Reflection on the Indestructible Self:',
                  verseContext: 'BG 2.23: "Weapons cannot cut it, fire cannot burn it, water cannot wet it, nor can wind dry it."',
                  guidance: 'Across these four lessons, the Gita has called the self unborn, undying, ever-changing in body but never in essence, and untouchable by any physical force. Which of these ideas do you find hardest to believe — and which feels most true to your own experience?'
                }
              ]
            }
          ]
        }
      ]
    }
  ]
};
