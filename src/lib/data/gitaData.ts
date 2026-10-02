export interface PhrasePair {
  sanskrit: string;
  english: string;
}

export interface MCQOption {
  text: string;
  isCorrect: boolean;
  explanation: string;
}

export interface WordMeaning {
  word: string;
  devanagari: string;
  meaning: string;
  partOfSpeech: string;
}

export interface Commentary {
  author: string;
  tradition: string;
  text: string;
}

export interface TeachingSlide {
  type: 'verse_intro' | 'word_card' | 'meaning_reveal';
  title: string;
  content: string;
  highlight?: string;
  wordData?: WordMeaning;
}

export interface ListeningOption {
  word: string;
  devanagari: string;
}

// targetWords: IAST words an exercise tests — lets mistakes be attributed to specific words
// for spaced review. Hand-authored lesson exercises derive this from their content instead.
// warmup: a word-by-word matching step before the phrase-level one; learners who already
// know Sanskrit skip it.
type QuestionMeta = { targetWords?: string[]; warmup?: boolean };

export type Question = QuestionMeta & (
  | {
      id: string;
      type: 'listening';
      prompt: string;
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
      type: 'sentence_rebuilding';
      prompt: string;
      /** The phrase's meaning, shown as a cue when it builds a single phrase */
      hint?: string;
      targetSentence: string;
      tiles: string[];
      explanation: string;
    }
  | {
      id: string;
      type: 'translate';
      prompt: string;
      /** IAST phrase Krishna says (shown and spoken in his speech bubble) */
      sanskrit: string;
      /** The English the learner assembles from tiles — graded by its words, in any order */
      answer: string;
      /** The answer's words plus a few distractors; shuffled on screen */
      tiles: string[];
      explanation?: string;
    }
  | {
      id: string;
      type: 'fill_in_the_blank';
      prompt: string;
      translation: string;
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
  sanskrit: string;
  transliteration: string;
  translation: string;
  wordBreakdown: WordMeaning[];
  questions: Question[];
  commentary?: Commentary;
  reflectionPrompt?: string;
}

export interface VerseWord {
  devanagari: string;
  roman: string;
}

export interface Lesson {
  id: string;
  title: string;
  verseRef: string;
  /** One plain-English sentence of what the verse says, shown up-front on the verse-intro screen. */
  essence?: string;
  verseSanskrit: string;
  verseTransliteration: string;
  translation: string;
  purport: string;
  commentary?: Commentary;
  reflectionPrompt?: string;
  parts?: VersePart[];
  finalSynthesisQuestions?: Question[];
  wordBreakdown: WordMeaning[];
  teachingSlides: TeachingSlide[];
  questions: Question[];
  /** One narrative sentence for this lesson's frame in the unit's story reward; falls back to `translation`. */
  storyCaption?: string;
  /**
   * Hand-verified Devanagari-token → romanization pairing for the whole verse, in reading order.
   * Devanagari fuses sandhi compounds into single space-delimited tokens that `verseTransliteration`
   * (kept more granular, for readability) doesn't line up with word-for-word — matching them by
   * position breaks as soon as one line's token counts diverge. Used by the verse-hook recitation
   * screen; lessons without one fall back to that best-effort positional match.
   */
  verseWordGuide?: VerseWord[];
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

const bg247WordBreakdown: WordMeaning[] = [
  { word: 'karmaṇi', devanagari: 'कर्मणि', meaning: 'in action / prescribed duty', partOfSpeech: 'noun (locative)' },
  { word: 'eva', devanagari: 'एव', meaning: 'only / certainly', partOfSpeech: 'particle' },
  { word: 'adhikāraḥ', devanagari: 'अधिकारः', meaning: 'right / authority', partOfSpeech: 'noun' },
  { word: 'te', devanagari: 'ते', meaning: 'your', partOfSpeech: 'pronoun' },
  { word: 'mā', devanagari: 'मा', meaning: 'never / not', partOfSpeech: 'particle' },
  { word: 'phaleṣu', devanagari: 'फलेषु', meaning: 'in the fruits / results', partOfSpeech: 'noun (locative)' },
  { word: 'kadācana', devanagari: 'कदाचन', meaning: 'at any time', partOfSpeech: 'adverb' },
  { word: 'karma-phala', devanagari: 'कर्मफल', meaning: 'fruits of action', partOfSpeech: 'compound noun' },
  { word: 'hetuḥ', devanagari: 'हेतुः', meaning: 'cause / motive', partOfSpeech: 'noun' },
  { word: 'bhūḥ', devanagari: 'भूः', meaning: 'become', partOfSpeech: 'verb' },
  { word: 'saṅgaḥ', devanagari: 'सङ्गः', meaning: 'attachment', partOfSpeech: 'noun' },
  { word: 'akarmaṇi', devanagari: 'अकर्मणि', meaning: 'in inaction / not doing duty', partOfSpeech: 'noun (locative)' },
];

const bg247TeachingSlides: TeachingSlide[] = [
  {
    type: 'verse_intro',
    title: 'BG 2.47 — The Heart of Karma Yoga',
    content: 'This is one of the most famous verses in the Bhagavad Gita. Krishna teaches Arjuna the essence of selfless action — how to act without being enslaved by the desire for results.',
  },
  {
    type: 'word_card',
    title: 'New Word',
    content: 'Your right is to action alone — "karmani" is the locative case of "karma", meaning the field of duty or prescribed action.',
    wordData: { word: 'karmaṇi', devanagari: 'कर्मणि', meaning: 'in action / prescribed duty', partOfSpeech: 'noun (locative)' },
  },
  {
    type: 'word_card',
    title: 'New Word',
    content: '"eva" is an emphatic particle that means "only" or "certainly". It stresses that your right is ONLY in action, nothing else.',
    wordData: { word: 'eva', devanagari: 'एव', meaning: 'only / certainly', partOfSpeech: 'particle' },
  },
  {
    type: 'word_card',
    title: 'New Word',
    content: '"adhikarah" means right, authority, or entitlement. Combined with "te" (your), it says: your right/authority…',
    wordData: { word: 'adhikāraḥ', devanagari: 'अधिकारः', meaning: 'right / authority', partOfSpeech: 'noun' },
  },
  {
    type: 'word_card',
    title: 'New Word',
    content: '"ma" is a prohibition particle — it means "never" or "do not". Krishna is commanding: do NOT claim rights over the fruits.',
    wordData: { word: 'mā', devanagari: 'मा', meaning: 'never / not', partOfSpeech: 'particle' },
  },
  {
    type: 'word_card',
    title: 'New Word',
    content: '"phaleshu" comes from "phala" (fruit/result). In locative case, it means "in the fruits". You have no right in the results of your work.',
    wordData: { word: 'phaleṣu', devanagari: 'फलेषु', meaning: 'in the fruits / results', partOfSpeech: 'noun (locative)' },
  },
  {
    type: 'word_card',
    title: 'New Word',
    content: '"karma-phala-hetuh" is a compound: the one who acts motivated ONLY by results. Krishna says: never be such a person.',
    wordData: { word: 'karma-phala', devanagari: 'कर्मफल', meaning: 'fruits of action', partOfSpeech: 'compound noun' },
  },
  {
    type: 'word_card',
    title: 'New Word',
    content: '"sangah" means attachment or clinging. "akarmani" means inaction. The final warning: don\'t become attached to NOT doing your duty either.',
    wordData: { word: 'akarmaṇi', devanagari: 'अकर्मणि', meaning: 'in inaction / not doing duty', partOfSpeech: 'noun (locative)' },
  },
  {
    type: 'meaning_reveal',
    title: 'Putting It All Together',
    content: 'karmany-evadhikaras te — Your right is in action only\nma phaleshu kadachana — Never in the fruits at any time\nma karma-phala-hetur bhuh — Never be motivated only by results\nma te sango \'stv akarmani — Nor be attached to inaction',
  },
];

// Mock data for BG 2.48
const bg248TeachingSlides: TeachingSlide[] = [
  {
    type: 'verse_intro',
    title: 'BG 2.48 — Equanimity in Action',
    content: 'Perform your duty equipoised, O Arjuna, abandoning all attachment to success or failure. Such equanimity is called Yoga.',
  },
  {
    type: 'word_card',
    title: 'New Word',
    content: '"yogasthah" means established in Yoga (balanced mind).',
    wordData: { word: 'yogasthaḥ', devanagari: 'योगस्थः', meaning: 'established in Yoga', partOfSpeech: 'adjective' },
  },
  {
    type: 'meaning_reveal',
    title: 'Equanimity is Yoga',
    content: 'yogasthah kuru karmani — Perform duty established in Yoga\nsamatvam yoga uchyate — Evenness of mind is called Yoga',
  }
];

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
              verseTransliteration: 'karmaṇy-evādhikāras te mā phaleṣu kadācana\nmā karma-phala-hetur bhūr mā te saṅgo \'stv akarmaṇi',
              verseWordGuide: [
                { devanagari: 'कर्मण्येवाधिकारस्ते', roman: 'karmaṇy-evādhikāras-te' },
                { devanagari: 'मा', roman: 'mā' },
                { devanagari: 'फलेषु', roman: 'phaleṣu' },
                { devanagari: 'कदाचन', roman: 'kadācana' },
                { devanagari: 'मा', roman: 'mā' },
                { devanagari: 'कर्मफलहेतुर्भूर्', roman: 'karma-phala-hetur-bhūr' },
                { devanagari: 'मा', roman: 'mā' },
                { devanagari: 'ते', roman: 'te' },
                { devanagari: 'सङ्गोऽस्त्वकर्मणि', roman: "saṅgo-'stv-akarmaṇi" }
              ],
              translation: 'You have a right to perform your prescribed duties, but you are not entitled to the fruits of your actions. Never consider yourself to be the cause of the results of your activities, and never be attached to not doing your duty.',
              purport: 'This famous verse outlines the foundation of Karma Yoga. Krishna advises Arjuna to focus entirely on his duty (action) without anxiety about the outcomes (fruits) of those actions, and warns against resolving not to do work (inaction) just because he cannot control the results.',
              commentary: {
                author: 'Swami Sivananda',
                tradition: 'Divine Life Society',
                text: 'Work done with expectation of reward brings anxiety and bondage. Perform your duty with an unattached mind, treating success and failure with equanimity. By giving up claim to the fruits of action, you purify the mind and gain liberation.'
              },
              reflectionPrompt: 'Where in your life today are you clinging to results rather than bringing full presence and dedication to the action itself?',
              storyCaption: 'Arjuna raised his bow, and Krishna raised a hand. "Your right is to action alone," he said, "never to its fruit."',
              wordBreakdown: bg247WordBreakdown,
              teachingSlides: [],
              questions: [],
              parts: [
                {
                  partIndex: 1,
                  title: 'Part 1: Your Right to Action',
                  sanskrit: 'कर्मण्येवाधिकारस्ते',
                  transliteration: 'karmaṇy-evādhikāras te',
                  translation: 'You have a right to perform your prescribed duties.',
                  wordBreakdown: [
                    { word: 'karmaṇi', devanagari: 'कर्मणि', meaning: 'in action / duty', partOfSpeech: 'noun' },
                    { word: 'eva', devanagari: 'एव', meaning: 'only / certainly', partOfSpeech: 'particle' },
                    { word: 'adhikāraḥ', devanagari: 'अधिकारः', meaning: 'right / entitlement', partOfSpeech: 'noun' },
                    { word: 'te', devanagari: 'ते', meaning: 'your', partOfSpeech: 'pronoun' }
                  ],
                  questions: [
                    {
                      id: 'p1_q1',
                      type: 'phrase_matching',
                      warmup: true,
                      prompt: 'Match each word in Part 1 to its meaning.',
                      pairs: [
                        { sanskrit: 'karmaṇi', english: 'in action / duty' },
                        { sanskrit: 'eva', english: 'only / certainly' },
                        { sanskrit: 'adhikāraḥ', english: 'right / entitlement' },
                        { sanskrit: 'te', english: 'your' }
                      ]
                    },
                    {
                      id: 'p1_q2',
                      type: 'phrase_matching',
                      prompt: 'Now match the joined phrases to their meanings.',
                      pairs: [
                        { sanskrit: 'karmaṇi eva', english: 'in prescribed duty only' },
                        { sanskrit: 'adhikāraḥ te', english: 'your right is' }
                      ]
                    },
                    {
                      id: 'bg247_p1_t',
                      type: 'translate',
                      prompt: 'Write this in English',
                      sanskrit: 'karmaṇi eva adhikāraḥ te',
                      answer: 'your right is only in action',
                      tiles: ['your', 'right', 'is', 'only', 'in', 'action', 'fruits', 'never', 'results']
                    },
                    {
                      id: 'p1_q3',
                      type: 'sentence_rebuilding',
                      prompt: 'Arrange the words to form Part 1 of the verse.',
                      hint: 'You have a right to perform your prescribed duties.',
                      targetSentence: 'karmaṇi eva adhikāraḥ te',
                      tiles: ['karmaṇi', 'eva', 'adhikāraḥ', 'te'],
                      explanation: '"karmani eva adhikarah te" — Your right is in action only.'
                    }
                  ]
                },
                {
                  partIndex: 2,
                  title: 'Part 2: Detachment from Results',
                  sanskrit: 'मा फलेषु कदाचन',
                  transliteration: 'mā phaleṣu kadācana',
                  translation: 'Never in the fruits at any time.',
                  wordBreakdown: [
                    { word: 'mā', devanagari: 'मा', meaning: 'never / not', partOfSpeech: 'particle' },
                    { word: 'phaleṣu', devanagari: 'फलेषु', meaning: 'in the fruits / results', partOfSpeech: 'noun' },
                    { word: 'kadācana', devanagari: 'कदाचन', meaning: 'at any time', partOfSpeech: 'adverb' }
                  ],
                  questions: [
                    {
                      id: 'p2_q1',
                      type: 'phrase_matching',
                      warmup: true,
                      prompt: 'Match each word in Part 2 to its meaning.',
                      pairs: [
                        { sanskrit: 'mā', english: 'never / not' },
                        { sanskrit: 'phaleṣu', english: 'in the fruits / results' },
                        { sanskrit: 'kadācana', english: 'at any time' }
                      ]
                    },
                    {
                      id: 'p2_q2',
                      type: 'fill_in_the_blank',
                      prompt: 'Complete Part 2: "mā phaleṣu ______"',
                      translation: 'Never in the fruits at any time.',
                      options: ['kadācana', 'akarmaṇi', 'eva', 'karmasu'],
                      answer: 'kadācana',
                      explanation: '"kadachana" means at any time. You are never entitled to results.'
                    },
                    {
                      id: 'p2_q3',
                      type: 'phrase_matching',
                      prompt: 'Now match the joined phrases to their meanings.',
                      pairs: [
                        { sanskrit: 'mā phaleṣu', english: 'never in the fruits' },
                        { sanskrit: 'kadācana', english: 'at any time' }
                      ]
                    },
                    {
                      id: 'bg247_p2_t',
                      type: 'translate',
                      prompt: 'Write this in English',
                      sanskrit: 'mā phaleṣu kadācana',
                      answer: 'never in the fruits at any time',
                      tiles: ['never', 'in', 'the', 'fruits', 'at', 'any', 'time', 'action', 'right', 'duty']
                    },
                    {
                      id: 'bg247_p2_r',
                      type: 'sentence_rebuilding',
                      prompt: 'Arrange the words to form Part 2 of the verse.',
                      hint: 'Never in the fruits at any time.',
                      targetSentence: 'mā phaleṣu kadācana',
                      tiles: ['mā', 'phaleṣu', 'kadācana'],
                      explanation: 'Never in the fruits, at any time. You may act, but the results are not yours to claim.'
                    }
                  ]
                },
                {
                  partIndex: 3,
                  title: 'Part 3: Freedom from Motive',
                  sanskrit: 'मा कर्मफलहेतुर्भूः',
                  transliteration: 'mā karma-phala-hetur bhūḥ',
                  translation: 'Never be motivated by the fruits of action.',
                  wordBreakdown: [
                    { word: 'karma-phala', devanagari: 'कर्मफल', meaning: 'fruits of action', partOfSpeech: 'compound' },
                    { word: 'hetuḥ', devanagari: 'हेतुः', meaning: 'motive / cause', partOfSpeech: 'noun' },
                    { word: 'bhūḥ', devanagari: 'भूः', meaning: 'become', partOfSpeech: 'verb' }
                  ],
                  questions: [
                    {
                      id: 'p3_q1',
                      type: 'phrase_matching',
                      warmup: true,
                      prompt: 'Match each word in Part 3 to its meaning.',
                      pairs: [
                        { sanskrit: 'karma-phala', english: 'fruits of action' },
                        { sanskrit: 'hetuḥ', english: 'motive / cause' },
                        { sanskrit: 'bhūḥ', english: 'become' }
                      ]
                    },
                    {
                      id: 'bg247_p3_m',
                      type: 'phrase_matching',
                      prompt: 'Now match the joined phrases to their meanings.',
                      pairs: [
                        { sanskrit: 'karma-phala hetuḥ', english: 'the fruit of action as your motive' },
                        { sanskrit: 'mā bhūḥ', english: 'do not be' }
                      ]
                    },
                    {
                      id: 'bg247_p3_t',
                      type: 'translate',
                      prompt: 'Write this in English',
                      sanskrit: 'mā karma-phala hetuḥ bhūḥ',
                      answer: 'never be motivated by results',
                      tiles: ['never', 'be', 'motivated', 'by', 'results', 'duty', 'right', 'attached']
                    },
                    {
                      id: 'bg247_p3_r',
                      type: 'sentence_rebuilding',
                      prompt: 'Arrange the words to form Part 3 of the verse.',
                      hint: 'Never be motivated by the fruits of action.',
                      targetSentence: 'mā karma-phala hetuḥ bhūḥ',
                      tiles: ['mā', 'karma-phala', 'hetuḥ', 'bhūḥ'],
                      explanation: 'Never be motivated by the fruits of action.'
                    },
                    {
                      id: 'p3_q2',
                      type: 'multiple_choice',
                      prompt: 'What does "ma karma-phala-hetur bhuh" instruct us to do?',
                      options: [
                        { text: 'Do not let the desire for results be the motive for your work.', isCorrect: true, explanation: 'Correct! Work for the sake of duty, not greed for results.' },
                        { text: 'Always demand high rewards before working.', isCorrect: false, explanation: 'Incorrect.' }
                      ]
                    }
                  ]
                },
                {
                  partIndex: 4,
                  title: 'Part 4: Not Attached to Inaction',
                  sanskrit: 'मा ते सङ्गोऽस्त्वकर्मणि',
                  transliteration: 'mā te saṅgo \'stv akarmaṇi',
                  translation: 'Nor let your attachment be to inaction.',
                  wordBreakdown: [
                    { word: 'saṅgaḥ', devanagari: 'सङ्गः', meaning: 'attachment', partOfSpeech: 'noun' },
                    { word: 'astu', devanagari: 'अस्तु', meaning: 'let there be', partOfSpeech: 'verb (imperative)' },
                    { word: 'akarmaṇi', devanagari: 'अकर्मणि', meaning: 'in inaction', partOfSpeech: 'noun' }
                  ],
                  questions: [
                    {
                      id: 'p4_q1',
                      type: 'phrase_matching',
                      warmup: true,
                      prompt: 'Match each word in Part 4 to its meaning.',
                      pairs: [
                        { sanskrit: 'saṅgaḥ', english: 'attachment' },
                        { sanskrit: 'astu', english: 'let there be' },
                        { sanskrit: 'akarmaṇi', english: 'in inaction' }
                      ]
                    },
                    {
                      id: 'bg247_p4_m',
                      type: 'phrase_matching',
                      prompt: 'Now match the joined phrases to their meanings.',
                      pairs: [
                        { sanskrit: 'mā te', english: 'not your' },
                        { sanskrit: 'saṅgaḥ astu', english: 'let there be attachment' },
                        { sanskrit: 'akarmaṇi', english: 'in inaction' }
                      ]
                    },
                    {
                      id: 'bg247_p4_t',
                      type: 'translate',
                      prompt: 'Write this in English',
                      sanskrit: 'mā te saṅgaḥ astu akarmaṇi',
                      answer: 'do not be attached to inaction',
                      tiles: ['do', 'not', 'be', 'attached', 'to', 'inaction', 'fruits', 'right', 'duty']
                    },
                    {
                      id: 'bg247_p4_r',
                      type: 'sentence_rebuilding',
                      prompt: 'Arrange the words to form Part 4 of the verse.',
                      hint: 'Nor let your attachment be to inaction.',
                      targetSentence: 'mā te saṅgaḥ astu akarmaṇi',
                      tiles: ['mā', 'te', 'saṅgaḥ', 'astu', 'akarmaṇi'],
                      explanation: 'Nor let your attachment be to inaction.'
                    },
                    {
                      id: 'p4_q2',
                      type: 'fill_in_the_blank',
                      prompt: 'Complete: "mā te saṅgo \'stv ______"',
                      translation: '...let not your attachment be to inaction.',
                      options: ['akarmaṇi', 'karmaṇi', 'phaleṣu', 'karmasu'],
                      answer: 'akarmaṇi',
                      explanation: '"akarmani" means inaction. Krishna warns: never quit your duty out of frustration.'
                    }
                  ]
                }
              ],
              finalSynthesisQuestions: [
                {
                  id: 'syn_q1',
                  type: 'phrase_matching',
                  prompt: 'FINAL MASTER STAGE: Match all phrase parts of the complete verse!',
                  pairs: [
                    { sanskrit: 'karmaṇi eva', english: 'in duty only' },
                    { sanskrit: 'adhikāraḥ te', english: 'your right is' },
                    { sanskrit: 'mā phaleṣu', english: 'never in results' },
                    { sanskrit: 'akarmaṇi', english: 'in inaction' }
                  ]
                },
                {
                  id: 'syn_q2',
                  type: 'sentence_rebuilding',
                  prompt: 'REBUILD THE ENTIRE VERSE: Arrange the complete first half of BG 2.47!',
                  targetSentence: 'karmaṇi eva adhikāraḥ te mā phaleṣu kadācana',
                  tiles: ['karmaṇi', 'eva', 'adhikāraḥ', 'te', 'mā', 'phaleṣu', 'kadācana'],
                  explanation: '"karmani eva adhikarah te ma phaleshu kadachana" — You have a right to action alone, never to its fruits.'
                },
                {
                  id: 'syn_q3',
                  type: 'multiple_choice',
                  prompt: 'How does mastering BG 2.47 reduce performance anxiety in modern daily life?',
                  options: [
                    {
                      text: 'By focusing 100% on effort and preparation while releasing worry over outcome.',
                      isCorrect: true,
                      explanation: 'Correct! Directing mind power to the task itself eliminates fear of failure.'
                    },
                    {
                      text: 'By quitting difficult projects immediately.',
                      isCorrect: false,
                      explanation: 'Incorrect. Krishna warns against attachment to inaction ("ma te sango \'stv akarmani").'
                    }
                  ]
                },
                {
                  id: 'syn_q4',
                  type: 'reflection',
                  prompt: 'Personal Reflection on Karma Yoga:',
                  verseContext: 'BG 2.47: "karmany-evadhikaras te ma phaleshu kadachana — You have a right to perform your prescribed duties, but never to the fruits."',
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
              verseTransliteration: 'yoga-sthaḥ kuru karmāṇi saṅgaṁ tyaktvā dhanañjaya\nsiddhy-asiddhyoḥ samo bhūtvā samatvaṁ yoga ucyate',
              verseWordGuide: [
                { devanagari: 'योगस्थः', roman: 'yogasthaḥ' },
                { devanagari: 'कुरु', roman: 'kuru' },
                { devanagari: 'कर्माणि', roman: 'karmāṇi' },
                { devanagari: 'सङ्गं', roman: 'saṅgaṁ' },
                { devanagari: 'त्यक्त्वा', roman: 'tyaktvā' },
                { devanagari: 'धनञ्जय', roman: 'dhanañjaya' },
                { devanagari: 'सिद्ध्यसिद्ध्योः', roman: 'siddhy-asiddhyoḥ' },
                { devanagari: 'समो', roman: 'samo' },
                { devanagari: 'भूत्वा', roman: 'bhūtvā' },
                { devanagari: 'समत्वं', roman: 'samatvaṁ' },
                { devanagari: 'योग', roman: 'yoga' },
                { devanagari: 'उच्यते', roman: 'ucyate' }
              ],
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
                { word: 'yogasthaḥ', devanagari: 'योगस्थः', meaning: 'established in Yoga', partOfSpeech: 'adjective' },
                { word: 'samatvaṁ', devanagari: 'समत्वम्', meaning: 'evenness of mind', partOfSpeech: 'noun' }
              ],
              teachingSlides: [],
              questions: [],
              parts: [
                {
                  partIndex: 1,
                  title: 'Part 1: Established in Yoga',
                  sanskrit: 'योगस्थः कुरु कर्माणि',
                  transliteration: 'yoga-sthaḥ kuru karmāṇi',
                  translation: 'Established in Yoga, perform your duties.',
                  wordBreakdown: [
                    { word: 'yogasthaḥ', devanagari: 'योगस्थः', meaning: 'established in Yoga', partOfSpeech: 'adjective' },
                    { word: 'kuru', devanagari: 'कुरु', meaning: 'do / perform', partOfSpeech: 'verb' },
                    { word: 'karmāṇi', devanagari: 'कर्माणि', meaning: 'duties / actions', partOfSpeech: 'noun' }
                  ],
                  questions: [
                    {
                      id: 'bg248_p1_q1',
                      type: 'phrase_matching',
                      warmup: true,
                      prompt: 'Match each word in Part 1 to its meaning.',
                      pairs: [
                        { sanskrit: 'yogasthaḥ', english: 'established in Yoga' },
                        { sanskrit: 'kuru', english: 'do / perform' },
                        { sanskrit: 'karmāṇi', english: 'duties / actions' }
                      ]
                    },
                    {
                      id: 'bg248_p1_q2',
                      type: 'phrase_matching',
                      prompt: 'Now match the joined phrases to their meanings.',
                      pairs: [
                        { sanskrit: 'yogasthaḥ', english: 'established in Yoga' },
                        { sanskrit: 'kuru karmāṇi', english: 'perform duties' }
                      ]
                    },
                    {
                      id: 'bg248_p1_t',
                      type: 'translate',
                      prompt: 'Write this in English',
                      sanskrit: 'yogasthaḥ kuru karmāṇi',
                      answer: 'established in yoga perform actions',
                      tiles: ['established', 'in', 'yoga', 'perform', 'actions', 'abandon', 'failure', 'wealth']
                    },
                    {
                      id: 'bg248_p1_q3',
                      type: 'sentence_rebuilding',
                      prompt: 'Arrange the words to form Part 1 of the verse.',
                      hint: 'Established in Yoga, perform your duties.',
                      targetSentence: 'yogasthaḥ kuru karmāṇi',
                      tiles: ['yogasthaḥ', 'kuru', 'karmāṇi'],
                      explanation: '"yogasthah kuru karmani" — Established in Yoga, perform your duties.'
                    }
                  ]
                },
                {
                  partIndex: 2,
                  title: 'Part 2: Letting Go of Attachment',
                  sanskrit: 'सङ्गं त्यक्त्वा धनञ्जय',
                  transliteration: 'saṅgaṁ tyaktvā dhanañjaya',
                  translation: 'Abandoning all attachment, O Arjuna.',
                  wordBreakdown: [
                    { word: 'saṅgaṁ', devanagari: 'सङ्गं', meaning: 'attachment', partOfSpeech: 'noun' },
                    { word: 'tyaktvā', devanagari: 'त्यक्त्वा', meaning: 'abandoning', partOfSpeech: 'verb' },
                    { word: 'dhanañjaya', devanagari: 'धनञ्जय', meaning: 'O Arjuna (winner of wealth)', partOfSpeech: 'noun (vocative)' }
                  ],
                  questions: [
                    {
                      id: 'bg248_p2_q1',
                      type: 'phrase_matching',
                      warmup: true,
                      prompt: 'Match each word in Part 2 to its meaning.',
                      pairs: [
                        { sanskrit: 'saṅgaṁ', english: 'attachment' },
                        { sanskrit: 'tyaktvā', english: 'abandoning' },
                        { sanskrit: 'dhanañjaya', english: 'O Arjuna (winner of wealth)' }
                      ]
                    },
                    {
                      id: 'bg248_p2_q2',
                      type: 'phrase_matching',
                      prompt: 'Now match the joined phrases to their meanings.',
                      pairs: [
                        { sanskrit: 'saṅgaṁ tyaktvā', english: 'abandoning attachment' },
                        { sanskrit: 'dhanañjaya', english: 'O Arjuna' }
                      ]
                    },
                    {
                      id: 'bg248_p2_t',
                      type: 'translate',
                      prompt: 'Write this in English',
                      sanskrit: 'saṅgaṁ tyaktvā dhanañjaya',
                      answer: 'abandoning attachment O Arjuna',
                      tiles: ['abandoning', 'attachment', 'O', 'Arjuna', 'success', 'duties', 'equal']
                    },
                    {
                      id: 'bg248_p2_q3',
                      type: 'sentence_rebuilding',
                      prompt: 'Now arrange the whole first line of the verse.',
                      targetSentence: 'yogasthaḥ kuru karmāṇi saṅgaṁ tyaktvā dhanañjaya',
                      tiles: ['yogasthaḥ', 'kuru', 'karmāṇi', 'saṅgaṁ', 'tyaktvā', 'dhanañjaya'],
                      explanation: '"yogasthah kuru karmani sangam tyaktva dhananjaya" — Established in Yoga, perform your duties, abandoning attachment, O Arjuna.'
                    }
                  ]
                },
                {
                  partIndex: 3,
                  title: 'Part 3: Equal in Success and Failure',
                  sanskrit: 'सिद्ध्यसिद्ध्योः समो भूत्वा',
                  transliteration: 'siddhy-asiddhyoḥ samo bhūtvā',
                  translation: 'Being equal in success and failure.',
                  wordBreakdown: [
                    { word: 'siddhy-asiddhyoḥ', devanagari: 'सिद्ध्यसिद्ध्योः', meaning: 'in success and failure', partOfSpeech: 'noun (compound)' },
                    { word: 'samo', devanagari: 'समो', meaning: 'equal / equipoised', partOfSpeech: 'adjective' },
                    { word: 'bhūtvā', devanagari: 'भूत्वा', meaning: 'having become / being', partOfSpeech: 'verb (participle)' }
                  ],
                  questions: [
                    {
                      id: 'bg248_p3_q1',
                      type: 'phrase_matching',
                      warmup: true,
                      prompt: 'Match each word in Part 3 to its meaning.',
                      pairs: [
                        { sanskrit: 'siddhy-asiddhyoḥ', english: 'in success and failure' },
                        { sanskrit: 'samo', english: 'equal / equipoised' },
                        { sanskrit: 'bhūtvā', english: 'having become / being' }
                      ]
                    },
                    {
                      id: 'bg248_p3_q2',
                      type: 'phrase_matching',
                      prompt: 'Now match the joined phrases to their meanings.',
                      pairs: [
                        { sanskrit: 'siddhy-asiddhyoḥ', english: 'in success and failure' },
                        { sanskrit: 'samo bhūtvā', english: 'being equal' }
                      ]
                    },
                    {
                      id: 'bg248_p3_t',
                      type: 'translate',
                      prompt: 'Write this in English',
                      sanskrit: 'siddhy-asiddhyoḥ samo bhūtvā',
                      answer: 'being equal in success and failure',
                      tiles: ['being', 'equal', 'in', 'success', 'and', 'failure', 'attachment', 'abandoning', 'duties']
                    },
                    {
                      id: 'bg248_p3_r',
                      type: 'sentence_rebuilding',
                      prompt: 'Arrange the words to form Part 3 of the verse.',
                      hint: 'Being equal in success and failure.',
                      targetSentence: 'siddhy-asiddhyoḥ samo bhūtvā',
                      tiles: ['siddhy-asiddhyoḥ', 'samo', 'bhūtvā'],
                      explanation: 'Being equal in success and failure.'
                    }
                  ]
                },
                {
                  partIndex: 4,
                  title: 'Part 4: Definition of Yoga',
                  sanskrit: 'समत्वं योग उच्यते',
                  transliteration: 'samatvaṁ yoga ucyate',
                  translation: 'Such evenness of mind is called Yoga.',
                  wordBreakdown: [
                    { word: 'samatvaṁ', devanagari: 'समत्वम्', meaning: 'evenness of mind', partOfSpeech: 'noun' },
                    { word: 'yoga', devanagari: 'योग', meaning: 'Yoga', partOfSpeech: 'noun' },
                    { word: 'ucyate', devanagari: 'उच्यते', meaning: 'is called / is said to be', partOfSpeech: 'verb (passive)' }
                  ],
                  questions: [
                    {
                      id: 'bg248_p4_q1',
                      type: 'phrase_matching',
                      warmup: true,
                      prompt: 'Match each word in Part 4 to its meaning.',
                      pairs: [
                        { sanskrit: 'samatvaṁ', english: 'evenness of mind' },
                        { sanskrit: 'yoga', english: 'Yoga' },
                        { sanskrit: 'ucyate', english: 'is called / is said to be' }
                      ]
                    },
                    {
                      id: 'bg248_p4_m',
                      type: 'phrase_matching',
                      prompt: 'Now match the joined phrases to their meanings.',
                      pairs: [
                        { sanskrit: 'yoga ucyate', english: 'is called Yoga' },
                        { sanskrit: 'samatvaṁ', english: 'evenness of mind' },
                        { sanskrit: 'siddhy-asiddhyoḥ samo bhūtvā', english: 'being equal in success and failure' }
                      ]
                    },
                    {
                      id: 'bg248_p4_t',
                      type: 'translate',
                      prompt: 'Write this in English',
                      sanskrit: 'samatvaṁ yoga ucyate',
                      answer: 'evenness of mind is called yoga',
                      tiles: ['evenness', 'of', 'mind', 'is', 'called', 'yoga', 'action', 'skill', 'peace']
                    },
                    {
                      id: 'bg248_p4_r',
                      type: 'sentence_rebuilding',
                      prompt: 'Arrange the words to form Part 4 of the verse.',
                      hint: 'Such evenness of mind is called Yoga.',
                      targetSentence: 'samatvaṁ yoga ucyate',
                      tiles: ['samatvaṁ', 'yoga', 'ucyate'],
                      explanation: 'Such evenness of mind is called Yoga.'
                    },
                    {
                      id: 'bg248_p4_q2',
                      type: 'multiple_choice',
                      prompt: 'What does Krishna define as "Yoga" in BG 2.48?',
                      options: [
                        { text: 'Equanimity of mind in both success and failure ("samatvam yoga uchyate").', isCorrect: true, explanation: 'Correct! Evenness of mind is true Yoga.' },
                        { text: 'Only physical postures.', isCorrect: false, explanation: 'Incorrect.' }
                      ]
                    }
                  ]
                }
              ],
              finalSynthesisQuestions: [
                {
                  id: 'bg248_syn_q1',
                  type: 'sentence_rebuilding',
                  prompt: 'REBUILD FULL VERSE: Arrange the second half of BG 2.48!',
                  targetSentence: 'siddhy-asiddhyoḥ samo bhūtvā samatvaṁ yoga ucyate',
                  tiles: ['siddhy-asiddhyoḥ', 'samo', 'bhūtvā', 'samatvaṁ', 'yoga', 'ucyate'],
                  explanation: '"siddhy-asiddhyoh samo bhutva samatvam yoga uchyate" — Evenness in success and failure is called Yoga.'
                }
              ]
            },
            {
              id: 'ch2_sec1_l3',
              title: 'Skill in Action',
              verseRef: 'BG 2.50',
              essence: 'Wise action frees you from good and bad karma. Yoga is skill in action.',
              verseSanskrit: 'बुद्धियुक्तो जहातीह उभे सुकृतदुष्कृते ।\nतस्माद्योगाय युज्यस्व योगः कर्मसु कौशलम् ॥',
              verseTransliteration: 'buddhi-yukto jahātīha ubhe sukṛta-duṣkṛte\ntasmād yogāya yujyasva yogaḥ karmasu kauśalam',
              verseWordGuide: [
                { devanagari: 'बुद्धियुक्तो', roman: 'buddhi-yukto' },
                { devanagari: 'जहातीह', roman: 'jahātīha' },
                { devanagari: 'उभे', roman: 'ubhe' },
                { devanagari: 'सुकृतदुष्कृते', roman: 'sukṛta-duṣkṛte' },
                { devanagari: 'तस्माद्योगाय', roman: 'tasmād-yogāya' },
                { devanagari: 'युज्यस्व', roman: 'yujyasva' },
                { devanagari: 'योगः', roman: 'yogaḥ' },
                { devanagari: 'कर्मसु', roman: 'karmasu' },
                { devanagari: 'कौशलम्', roman: 'kauśalam' }
              ],
              translation: 'A person engaged in devotional service rids himself of both good and bad actions even in this life. Therefore, strive for Yoga, which is the art of all work.',
              purport: 'Yoga is skill in action ("yogah karmasu kaushalam").',
              storyCaption: 'Wisdom acts without being bound by its results. This skill in action, Krishna said, is the highest art of all.',
              wordBreakdown: [
                { word: 'kauśalam', devanagari: 'कौशलम्', meaning: 'skill / artfulness', partOfSpeech: 'noun' }
              ],
              teachingSlides: [],
              questions: [],
              parts: [
                {
                  partIndex: 1,
                  title: 'Part 1: Wisdom Overcomes Reaction',
                  sanskrit: 'बुद्धियुक्तो जहातीह उभे सुकृतदुष्कृते',
                  transliteration: 'buddhi-yukto jahātīha ubhe sukṛta-duṣkṛte',
                  translation: 'One endowed with wisdom casts off both good and bad karma in this life.',
                  wordBreakdown: [
                    { word: 'buddhi-yukto', devanagari: 'बुद्धियुक्तो', meaning: 'endowed with wisdom', partOfSpeech: 'adjective' },
                    { word: 'jahātīha', devanagari: 'जहातीह', meaning: 'casts off in this life', partOfSpeech: 'verb' },
                    { word: 'ubhe', devanagari: 'उभे', meaning: 'both', partOfSpeech: 'adjective' },
                    { word: 'sukṛta-duṣkṛte', devanagari: 'सुकृतदुष्कृते', meaning: 'good and bad actions', partOfSpeech: 'compound noun' }
                  ],
                  questions: [
                    {
                      id: 'bg250_p1_q1',
                      type: 'phrase_matching',
                      warmup: true,
                      prompt: 'Match Part 1 terms.',
                      pairs: [
                        { sanskrit: 'buddhi-yukto', english: 'endowed with wisdom' },
                        { sanskrit: 'jahātīha', english: 'casts off in this life' },
                        { sanskrit: 'ubhe', english: 'both' },
                        { sanskrit: 'sukṛta-duṣkṛte', english: 'good and bad actions' }
                      ]
                    },
                    {
                      id: 'bg250_p1_q2',
                      type: 'phrase_matching',
                      prompt: 'Now match the joined phrases to their meanings.',
                      pairs: [
                        { sanskrit: 'buddhi-yukto', english: 'endowed with wisdom' },
                        { sanskrit: 'jahātīha ubhe sukṛta-duṣkṛte', english: 'casts off both good and bad actions in this life' }
                      ]
                    },
                    {
                      id: 'bg250_p1_t',
                      type: 'translate',
                      prompt: 'Write this in English',
                      sanskrit: 'ubhe sukṛta-duṣkṛte',
                      answer: 'both good and bad actions',
                      tiles: ['both', 'good', 'and', 'bad', 'actions', 'skill', 'wisdom', 'therefore']
                    },
                    {
                      id: 'bg250_p1_r',
                      type: 'sentence_rebuilding',
                      prompt: 'Arrange the words to form Part 1 of the verse.',
                      hint: 'One endowed with wisdom casts off both good and bad karma in this life.',
                      targetSentence: 'buddhi-yukto jahātīha ubhe sukṛta-duṣkṛte',
                      tiles: ['buddhi-yukto', 'jahātīha', 'ubhe', 'sukṛta-duṣkṛte'],
                      explanation: 'One endowed with wisdom casts off both good and bad actions in this life.'
                    }
                  ]
                },
                {
                  partIndex: 2,
                  title: 'Part 2: Strive for Yoga',
                  sanskrit: 'तस्माद्योगाय युज्यस्व',
                  transliteration: 'tasmād yogāya yujyasva',
                  translation: 'Therefore, strive for Yoga.',
                  wordBreakdown: [
                    { word: 'tasmād', devanagari: 'तस्मात्', meaning: 'therefore', partOfSpeech: 'adverb' },
                    { word: 'yogāya', devanagari: 'योगाय', meaning: 'for Yoga', partOfSpeech: 'noun' },
                    { word: 'yujyasva', devanagari: 'युज्यस्व', meaning: 'strive / engage yourself', partOfSpeech: 'verb (imperative)' }
                  ],
                  questions: [
                    {
                      id: 'bg250_p2_q1',
                      type: 'phrase_matching',
                      warmup: true,
                      prompt: 'Match each word in Part 2 to its meaning.',
                      pairs: [
                        { sanskrit: 'tasmād', english: 'therefore' },
                        { sanskrit: 'yogāya', english: 'for Yoga' },
                        { sanskrit: 'yujyasva', english: 'strive / engage yourself' }
                      ]
                    },
                    {
                      id: 'bg250_p2_m',
                      type: 'phrase_matching',
                      prompt: 'Now match the joined phrases to their meanings.',
                      pairs: [
                        { sanskrit: 'tasmād yogāya', english: 'therefore, for Yoga' },
                        { sanskrit: 'yujyasva', english: 'strive' }
                      ]
                    },
                    {
                      id: 'bg250_p2_t',
                      type: 'translate',
                      prompt: 'Write this in English',
                      sanskrit: 'tasmād yogāya yujyasva',
                      answer: 'therefore strive for yoga',
                      tiles: ['therefore', 'strive', 'for', 'yoga', 'skill', 'both', 'wisdom']
                    },
                    {
                      id: 'bg250_p2_r',
                      type: 'sentence_rebuilding',
                      prompt: 'Arrange the words to form Part 2 of the verse.',
                      hint: 'Therefore, strive for Yoga.',
                      targetSentence: 'tasmād yogāya yujyasva',
                      tiles: ['tasmād', 'yogāya', 'yujyasva'],
                      explanation: 'Therefore, strive for Yoga.'
                    }
                  ]
                },
                {
                  partIndex: 3,
                  title: 'Part 3: Yoga is Skill in Action',
                  sanskrit: 'योगः कर्मसु कौशलम्',
                  transliteration: 'yogaḥ karmasu kauśalam',
                  translation: 'Yoga is skill in action.',
                  wordBreakdown: [
                    { word: 'yogaḥ', devanagari: 'योगः', meaning: 'Yoga', partOfSpeech: 'noun' },
                    { word: 'karmasu', devanagari: 'कर्मसु', meaning: 'in action / works', partOfSpeech: 'noun (locative)' },
                    { word: 'kauśalam', devanagari: 'कौशलम्', meaning: 'skill / mastery', partOfSpeech: 'noun' }
                  ],
                  questions: [
                    {
                      id: 'bg250_p3_q1',
                      type: 'phrase_matching',
                      warmup: true,
                      prompt: 'Match each word in Part 3 to its meaning.',
                      pairs: [
                        { sanskrit: 'yogaḥ', english: 'Yoga' },
                        { sanskrit: 'karmasu', english: 'in action / works' },
                        { sanskrit: 'kauśalam', english: 'skill / mastery' }
                      ]
                    },
                    {
                      id: 'bg250_p3_m',
                      type: 'phrase_matching',
                      prompt: 'Now match the joined phrases to their meanings.',
                      pairs: [
                        { sanskrit: 'yogaḥ kauśalam', english: 'Yoga is skill' },
                        { sanskrit: 'karmasu', english: 'in action / works' }
                      ]
                    },
                    {
                      id: 'bg250_p3_t',
                      type: 'translate',
                      prompt: 'Write this in English',
                      sanskrit: 'yogaḥ karmasu kauśalam',
                      answer: 'yoga is skill in action',
                      tiles: ['yoga', 'is', 'skill', 'in', 'action', 'wisdom', 'therefore', 'both']
                    },
                    {
                      id: 'bg250_p3_r',
                      type: 'sentence_rebuilding',
                      prompt: 'Arrange the words to form Part 3 of the verse.',
                      hint: 'Yoga is skill in action.',
                      targetSentence: 'yogaḥ karmasu kauśalam',
                      tiles: ['yogaḥ', 'karmasu', 'kauśalam'],
                      explanation: 'Yoga is skill in action.'
                    },
                    {
                      id: 'bg250_p3_q2',
                      type: 'multiple_choice',
                      prompt: 'What famous declaration is made in BG 2.50?',
                      options: [
                        { text: 'Yoga is skill in action ("yogah karmasu kaushalam").', isCorrect: true, explanation: 'Correct!' },
                        { text: 'Work is to be avoided.', isCorrect: false, explanation: 'Incorrect.' }
                      ]
                    }
                  ]
                }
              ],
              finalSynthesisQuestions: [
                {
                  id: 'bg250_syn_q1',
                  type: 'sentence_rebuilding',
                  prompt: 'FULL VERSE SYNTHESIS: Arrange the famous second line!',
                  targetSentence: 'tasmād yogāya yujyasva yogaḥ karmasu kauśalam',
                  tiles: ['tasmād', 'yogāya', 'yujyasva', 'yogaḥ', 'karmasu', 'kauśalam'],
                  explanation: '"yogah karmasu kaushalam" — Yoga is skill in action.'
                }
              ]
            },
            {
              id: 'ch2_sec1_l4',
              title: 'Attaining Peace',
              verseRef: 'BG 2.71',
              essence: 'Give up craving and ego, and real peace comes.',
              verseSanskrit: 'विहाय कामान्यः सर्वान्पुमांश्चरति निःस्पृहः ।\nनिर्ममो निरहङ्कारः स शान्तिमधिगच्छति ॥',
              verseTransliteration: 'vihāya kāmān yaḥ sarvān pumāṁś carati niḥspṛhaḥ\nnirmamo nirahaṅkāraḥ sa śāntim adhigacchati',
              verseWordGuide: [
                { devanagari: 'विहाय', roman: 'vihāya' },
                { devanagari: 'कामान्यः', roman: 'kāmān-yaḥ' },
                { devanagari: 'सर्वान्पुमांश्चरति', roman: 'sarvān-pumāṁś-carati' },
                { devanagari: 'निःस्पृहः', roman: 'niḥspṛhaḥ' },
                { devanagari: 'निर्ममो', roman: 'nirmamo' },
                { devanagari: 'निरहङ्कारः', roman: 'nirahaṅkāraḥ' },
                { devanagari: 'स', roman: 'sa' },
                { devanagari: 'शान्तिमधिगच्छति', roman: 'śāntim-adhigacchati' }
              ],
              translation: 'A person who has given up all desires for sense gratification, who lives free from desires, who has given up all sense of proprietorship and is devoid of false ego — he alone attains real peace.',
              purport: 'True peace comes when we drop possessiveness ("nirmamah") and false ego ("nirahankarah").',
              storyCaption: 'Free of craving, free of ego, Arjuna set down his fear — and found the peace that never fades.',
              wordBreakdown: [
                { word: 'nirmamo', devanagari: 'निर्ममः', meaning: 'without possessiveness', partOfSpeech: 'adjective' },
                { word: 'nirahaṅkāraḥ', devanagari: 'निरहङ्कारः', meaning: 'without false ego', partOfSpeech: 'adjective' }
              ],
              teachingSlides: [],
              questions: [],
              parts: [
                {
                  partIndex: 1,
                  title: 'Part 1: Giving Up Desires',
                  sanskrit: 'विहाय कामान्यः सर्वान्पुमांश्चरति निःस्पृहः',
                  transliteration: 'vihāya kāmān yaḥ sarvān pumāṁś carati niḥspṛhaḥ',
                  translation: 'That person who relinquishes all desires and moves about free from longing.',
                  wordBreakdown: [
                    { word: 'vihāya', devanagari: 'विहाय', meaning: 'giving up / abandoning', partOfSpeech: 'verb' },
                    { word: 'kāmān', devanagari: 'कामान्', meaning: 'desires', partOfSpeech: 'noun' },
                    { word: 'niḥspṛhaḥ', devanagari: 'निःस्पृहः', meaning: 'free from craving', partOfSpeech: 'adjective' }
                  ],
                  questions: [
                    {
                      id: 'bg271_p1_q1',
                      type: 'phrase_matching',
                      warmup: true,
                      prompt: 'Match each word in Part 1 to its meaning.',
                      pairs: [
                        { sanskrit: 'vihāya', english: 'giving up / abandoning' },
                        { sanskrit: 'kāmān', english: 'desires' },
                        { sanskrit: 'niḥspṛhaḥ', english: 'free from craving' }
                      ]
                    },
                    {
                      id: 'bg271_p1_q2',
                      type: 'phrase_matching',
                      prompt: 'Now match the joined phrases to their meanings.',
                      pairs: [
                        { sanskrit: 'vihāya kāmān', english: 'giving up desires' },
                        { sanskrit: 'niḥspṛhaḥ', english: 'free from craving' }
                      ]
                    },
                    {
                      id: 'bg271_p1_t',
                      type: 'translate',
                      prompt: 'Write this in English',
                      sanskrit: 'vihāya kāmān niḥspṛhaḥ',
                      answer: 'giving up desires free from craving',
                      tiles: ['giving', 'up', 'desires', 'free', 'from', 'craving', 'ego', 'peace', 'attains']
                    },
                    {
                      id: 'bg271_p1_r',
                      type: 'sentence_rebuilding',
                      prompt: 'Arrange the words to form Part 1 of the verse.',
                      hint: 'That person who relinquishes all desires and moves about free from longing.',
                      targetSentence: 'vihāya kāmān niḥspṛhaḥ',
                      tiles: ['vihāya', 'kāmān', 'niḥspṛhaḥ'],
                      explanation: 'Giving up desires, free from craving.'
                    }
                  ]
                },
                {
                  partIndex: 2,
                  title: 'Part 2: Without Ego & Possessiveness',
                  sanskrit: 'निर्ममो निरहङ्कारः',
                  transliteration: 'nirmamo nirahaṅkāraḥ',
                  translation: 'Free from possessiveness and false ego.',
                  wordBreakdown: [
                    { word: 'nirmamo', devanagari: 'निर्ममः', meaning: 'without possessiveness', partOfSpeech: 'adjective' },
                    { word: 'nirahaṅkāraḥ', devanagari: 'निरहङ्कारः', meaning: 'without false ego', partOfSpeech: 'adjective' }
                  ],
                  questions: [
                    {
                      id: 'bg271_p2_q1',
                      type: 'phrase_matching',
                      warmup: true,
                      prompt: 'Match each word in Part 2 to its meaning.',
                      pairs: [
                        { sanskrit: 'nirmamo', english: 'without possessiveness' },
                        { sanskrit: 'nirahaṅkāraḥ', english: 'without false ego' }
                      ]
                    },
                    {
                      id: 'bg271_p2_m',
                      type: 'phrase_matching',
                      prompt: 'Now match the joined phrases to their meanings.',
                      pairs: [
                        { sanskrit: 'nirmamo nirahaṅkāraḥ', english: 'free from possessiveness and false ego' },
                        { sanskrit: 'vihāya kāmān niḥspṛhaḥ', english: 'giving up desires, free from craving' }
                      ]
                    },
                    {
                      id: 'bg271_p2_t',
                      type: 'translate',
                      prompt: 'Write this in English',
                      sanskrit: 'nirmamo nirahaṅkāraḥ',
                      answer: 'free from possessiveness and false ego',
                      tiles: ['free', 'from', 'possessiveness', 'and', 'false', 'ego', 'desires', 'peace', 'attains']
                    },
                    {
                      id: 'bg271_p2_r',
                      type: 'sentence_rebuilding',
                      prompt: 'Arrange the words to form Part 2 of the verse.',
                      targetSentence: 'vihāya kāmān niḥspṛhaḥ nirmamo nirahaṅkāraḥ',
                      tiles: ['vihāya', 'kāmān', 'niḥspṛhaḥ', 'nirmamo', 'nirahaṅkāraḥ'],
                      explanation: 'Giving up desires and craving, free from possessiveness and false ego.'
                    }
                  ]
                },
                {
                  partIndex: 3,
                  title: 'Part 3: Attains Real Peace',
                  sanskrit: 'स शान्तिमधिगच्छति',
                  transliteration: 'sa śāntim adhigacchati',
                  translation: 'He alone attains real peace.',
                  wordBreakdown: [
                    { word: 'sa', devanagari: 'सः', meaning: 'he', partOfSpeech: 'pronoun' },
                    { word: 'śāntim', devanagari: 'शान्तिम्', meaning: 'peace', partOfSpeech: 'noun' },
                    { word: 'adhigacchati', devanagari: 'अधिगच्छति', meaning: 'attains', partOfSpeech: 'verb' }
                  ],
                  questions: [
                    {
                      id: 'bg271_p3_q1',
                      type: 'phrase_matching',
                      warmup: true,
                      prompt: 'Match each word in Part 3 to its meaning.',
                      pairs: [
                        { sanskrit: 'sa', english: 'he' },
                        { sanskrit: 'śāntim', english: 'peace' },
                        { sanskrit: 'adhigacchati', english: 'attains' }
                      ]
                    },
                    {
                      id: 'bg271_p3_m',
                      type: 'phrase_matching',
                      prompt: 'Now match the joined phrases to their meanings.',
                      pairs: [
                        { sanskrit: 'śāntim adhigacchati', english: 'attains peace' },
                        { sanskrit: 'sa adhigacchati', english: 'he attains' }
                      ]
                    },
                    {
                      id: 'bg271_p3_t',
                      type: 'translate',
                      prompt: 'Write this in English',
                      sanskrit: 'sa śāntim adhigacchati',
                      answer: 'he attains peace',
                      tiles: ['he', 'attains', 'peace', 'desires', 'ego', 'gives']
                    },
                    {
                      id: 'bg271_p3_r',
                      type: 'sentence_rebuilding',
                      prompt: 'Arrange the words to form Part 3 of the verse.',
                      hint: 'He alone attains real peace.',
                      targetSentence: 'sa śāntim adhigacchati',
                      tiles: ['sa', 'śāntim', 'adhigacchati'],
                      explanation: 'He alone attains real peace.'
                    },
                    {
                      id: 'bg271_p3_q2',
                      type: 'multiple_choice',
                      prompt: 'Who attains real peace according to BG 2.71?',
                      options: [
                        { text: 'One who lives free from false ego ("nirahankarah") and possessiveness ("nirmamah").', isCorrect: true, explanation: 'Correct!' },
                        { text: 'One who accumulates physical wealth.', isCorrect: false, explanation: 'Incorrect.' }
                      ]
                    }
                  ]
                }
              ],
              finalSynthesisQuestions: [
                {
                  id: 'bg271_syn_q1',
                  type: 'sentence_rebuilding',
                  prompt: 'FULL VERSE SYNTHESIS: Rebuild the final line of BG 2.71!',
                  targetSentence: 'nirmamo nirahaṅkāraḥ sa śāntim adhigacchati',
                  tiles: ['nirmamo', 'nirahaṅkāraḥ', 'sa', 'śāntim', 'adhigacchati'],
                  explanation: '"nirmamo nirahankarah sa shantim adhigachchhati" — Without possessiveness or false ego, one attains supreme peace.'
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
              verseTransliteration: 'dehino \'smin yathā dehe kaumāraṁ yauvanaṁ jarā\ntathā dehāntara-prāptir dhīras tatra na muhyati',
              verseWordGuide: [
                { devanagari: 'देहिनोऽस्मिन्', roman: "dehino-'smin" },
                { devanagari: 'यथा', roman: 'yathā' },
                { devanagari: 'देहे', roman: 'dehe' },
                { devanagari: 'कौमारं', roman: 'kaumāraṁ' },
                { devanagari: 'यौवनं', roman: 'yauvanaṁ' },
                { devanagari: 'जरा', roman: 'jarā' },
                { devanagari: 'तथा', roman: 'tathā' },
                { devanagari: 'देहान्तरप्राप्तिर्धीरस्तत्र', roman: 'dehāntara-prāptir-dhīras-tatra' },
                { devanagari: 'न', roman: 'na' },
                { devanagari: 'मुह्यति', roman: 'muhyati' }
              ],
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
                { word: 'dehinaḥ', devanagari: 'देहिनः', meaning: 'of the embodied soul', partOfSpeech: 'noun (genitive)' },
                { word: 'dehāntara-prāptiḥ', devanagari: 'देहान्तरप्राप्तिः', meaning: 'attainment of another body', partOfSpeech: 'compound noun' }
              ],
              teachingSlides: [],
              questions: [],
              parts: [
                {
                  partIndex: 1,
                  title: 'Part 1: The Embodied Soul',
                  sanskrit: 'देहिनोऽस्मिन् यथा देहे',
                  transliteration: "dehino 'smin yathā dehe",
                  translation: 'As, for the embodied soul, in this body...',
                  wordBreakdown: [
                    { word: 'dehinaḥ', devanagari: 'देहिनः', meaning: 'of the embodied soul', partOfSpeech: 'noun (genitive)' },
                    { word: 'asmin', devanagari: 'अस्मिन्', meaning: 'in this', partOfSpeech: 'pronoun (locative)' },
                    { word: 'yathā', devanagari: 'यथा', meaning: 'just as', partOfSpeech: 'adverb' },
                    { word: 'dehe', devanagari: 'देहे', meaning: 'in the body', partOfSpeech: 'noun (locative)' }
                  ],
                  questions: [
                    {
                      id: 'bg213_p1_q1',
                      type: 'phrase_matching',
                      warmup: true,
                      prompt: 'Match each word in Part 1 to its meaning.',
                      pairs: [
                        { sanskrit: 'dehinaḥ', english: 'of the embodied soul' },
                        { sanskrit: 'asmin', english: 'in this' },
                        { sanskrit: 'yathā', english: 'just as' },
                        { sanskrit: 'dehe', english: 'in the body' }
                      ]
                    },
                    {
                      id: 'bg213_p1_q2',
                      type: 'phrase_matching',
                      prompt: 'Now match the joined phrases to their meanings.',
                      pairs: [
                        { sanskrit: 'asmin dehe', english: 'in this body' },
                        { sanskrit: 'dehinaḥ', english: 'of the embodied soul' }
                      ]
                    },
                    {
                      id: 'bg213_p1_t',
                      type: 'translate',
                      prompt: 'Write this in English',
                      sanskrit: 'asmin dehe',
                      answer: 'in this body',
                      tiles: ['in', 'this', 'body', 'soul', 'old', 'another']
                    },
                    {
                      id: 'bg213_p1_q3',
                      type: 'sentence_rebuilding',
                      prompt: 'Arrange the words to form Part 1 of the verse.',
                      hint: 'As, for the embodied soul, in this body...',
                      targetSentence: 'dehinaḥ asmin yathā dehe',
                      tiles: ['dehinaḥ', 'asmin', 'yathā', 'dehe'],
                      explanation: '"dehinaḥ asmin yathā dehe" — As, for the embodied soul, in this body.'
                    }
                  ]
                },
                {
                  partIndex: 2,
                  title: 'Part 2: The Stages of Life',
                  sanskrit: 'कौमारं यौवनं जरा',
                  transliteration: 'kaumāraṁ yauvanaṁ jarā',
                  translation: 'childhood, youth, and old age.',
                  wordBreakdown: [
                    { word: 'kaumāram', devanagari: 'कौमारम्', meaning: 'childhood', partOfSpeech: 'noun' },
                    { word: 'yauvanam', devanagari: 'यौवनम्', meaning: 'youth', partOfSpeech: 'noun' },
                    { word: 'jarā', devanagari: 'जरा', meaning: 'old age', partOfSpeech: 'noun' }
                  ],
                  questions: [
                    {
                      id: 'bg213_p2_q1',
                      type: 'phrase_matching',
                      warmup: true,
                      prompt: 'Match each word in Part 2 to its meaning.',
                      pairs: [
                        { sanskrit: 'kaumāram', english: 'childhood' },
                        { sanskrit: 'yauvanam', english: 'youth' },
                        { sanskrit: 'jarā', english: 'old age' }
                      ]
                    },
                    {
                      id: 'bg213_p2_m',
                      type: 'phrase_matching',
                      prompt: 'Now match the joined phrases to their meanings.',
                      pairs: [
                        { sanskrit: 'kaumāram yauvanam', english: 'childhood and youth' },
                        { sanskrit: 'jarā', english: 'old age' },
                        { sanskrit: 'asmin dehe', english: 'in this body' }
                      ]
                    },
                    {
                      id: 'bg213_p2_t',
                      type: 'translate',
                      prompt: 'Write this in English',
                      sanskrit: 'kaumāram yauvanam jarā',
                      answer: 'childhood youth and old age',
                      tiles: ['childhood', 'youth', 'and', 'old', 'age', 'body', 'wise', 'death']
                    },
                    {
                      id: 'bg213_p2_r',
                      type: 'sentence_rebuilding',
                      prompt: 'Arrange the words to form Part 2 of the verse.',
                      hint: 'childhood, youth, and old age.',
                      targetSentence: 'kaumāram yauvanam jarā',
                      tiles: ['kaumāram', 'yauvanam', 'jarā'],
                      explanation: 'Childhood, youth, and old age.'
                    }
                  ]
                },
                {
                  partIndex: 3,
                  title: 'Part 3: Passing to Another Body',
                  sanskrit: 'तथा देहान्तरप्राप्तिर्धीरस्तत्र',
                  transliteration: 'tathā dehāntara-prāptir dhīras tatra',
                  translation: 'similarly, the wise are not bewildered by the attainment of another body.',
                  wordBreakdown: [
                    { word: 'tathā', devanagari: 'तथा', meaning: 'similarly', partOfSpeech: 'adverb' },
                    { word: 'dehāntara-prāptiḥ', devanagari: 'देहान्तरप्राप्तिः', meaning: 'attainment of another body', partOfSpeech: 'compound noun' },
                    { word: 'dhīraḥ', devanagari: 'धीरः', meaning: 'the wise / sober person', partOfSpeech: 'noun' },
                    { word: 'tatra', devanagari: 'तत्र', meaning: 'therein / at that', partOfSpeech: 'adverb' }
                  ],
                  questions: [
                    {
                      id: 'bg213_p3_q1',
                      type: 'phrase_matching',
                      warmup: true,
                      prompt: 'Match each word in Part 3 to its meaning.',
                      pairs: [
                        { sanskrit: 'tathā', english: 'similarly' },
                        { sanskrit: 'dehāntara-prāptiḥ', english: 'attainment of another body' },
                        { sanskrit: 'dhīraḥ', english: 'the wise / sober person' },
                        { sanskrit: 'tatra', english: 'therein / at that' }
                      ]
                    },
                    {
                      id: 'bg213_p3_q2',
                      type: 'phrase_matching',
                      prompt: 'Now match the joined phrases to their meanings.',
                      pairs: [
                        { sanskrit: 'tathā dehāntara-prāptiḥ', english: 'similarly, attaining another body' },
                        { sanskrit: 'dhīraḥ tatra', english: 'the wise person, in that' }
                      ]
                    },
                    {
                      id: 'bg213_p3_t',
                      type: 'translate',
                      prompt: 'Write this in English',
                      sanskrit: 'tathā dehāntara-prāptiḥ',
                      answer: 'similarly attaining another body',
                      tiles: ['similarly', 'attaining', 'another', 'body', 'wise', 'youth', 'deluded']
                    },
                    {
                      id: 'bg213_p3_r',
                      type: 'sentence_rebuilding',
                      prompt: 'Arrange the words to form Part 3 of the verse.',
                      hint: 'similarly, the wise are not bewildered by the attainment of another body.',
                      targetSentence: 'tathā dehāntara-prāptiḥ dhīraḥ tatra',
                      tiles: ['tathā', 'dehāntara-prāptiḥ', 'dhīraḥ', 'tatra'],
                      explanation: 'Similarly, the wise person is not bewildered by the attainment of another body.'
                    }
                  ]
                },
                {
                  partIndex: 4,
                  title: 'Part 4: Not Bewildered',
                  sanskrit: 'न मुह्यति',
                  transliteration: 'na muhyati',
                  translation: 'is not deluded.',
                  wordBreakdown: [
                    { word: 'na', devanagari: 'न', meaning: 'not', partOfSpeech: 'particle' },
                    { word: 'muhyati', devanagari: 'मुह्यति', meaning: 'is bewildered / deluded', partOfSpeech: 'verb' }
                  ],
                  questions: [
                    {
                      id: 'bg213_p4_q1',
                      type: 'phrase_matching',
                      warmup: true,
                      prompt: 'Match each word in Part 4 to its meaning.',
                      pairs: [
                        { sanskrit: 'na', english: 'not' },
                        { sanskrit: 'muhyati', english: 'is bewildered / deluded' }
                      ]
                    },
                    {
                      id: 'bg213_p4_m',
                      type: 'phrase_matching',
                      prompt: 'Now match the joined phrases to their meanings.',
                      pairs: [
                        { sanskrit: 'na muhyati', english: 'is not deluded' },
                        { sanskrit: 'dhīraḥ tatra', english: 'the wise person, in that' }
                      ]
                    },
                    {
                      id: 'bg213_p4_t',
                      type: 'translate',
                      prompt: 'Write this in English',
                      sanskrit: 'dhīraḥ tatra na muhyati',
                      answer: 'the wise person is not deluded',
                      tiles: ['the', 'wise', 'person', 'is', 'not', 'deluded', 'body', 'youth', 'born']
                    },
                    {
                      id: 'bg213_p4_r',
                      type: 'sentence_rebuilding',
                      prompt: 'Arrange the words to form Part 4 of the verse.',
                      hint: 'is not deluded.',
                      targetSentence: 'dhīraḥ tatra na muhyati',
                      tiles: ['dhīraḥ', 'tatra', 'na', 'muhyati'],
                      explanation: 'The wise person is not deluded by this.'
                    },
                    {
                      id: 'bg213_p4_q2',
                      type: 'multiple_choice',
                      prompt: 'According to BG 2.13, how does the wise person respond to the soul passing into a new body?',
                      options: [
                        { text: 'They are not bewildered by it, just as they were not bewildered by aging from childhood to youth.', isCorrect: true, explanation: 'Correct! Change of body is compared to the changes already accepted within one life.' },
                        { text: 'They become anxious and afraid.', isCorrect: false, explanation: 'Incorrect. Krishna says the wise are not deluded ("na muhyati") by this.' }
                      ]
                    }
                  ]
                }
              ],
              finalSynthesisQuestions: [
                {
                  id: 'bg213_syn_q1',
                  type: 'sentence_rebuilding',
                  prompt: 'FULL VERSE SYNTHESIS: Arrange the first half of BG 2.13!',
                  targetSentence: 'dehinaḥ asmin yathā dehe kaumāram yauvanam jarā',
                  tiles: ['dehinaḥ', 'asmin', 'yathā', 'dehe', 'kaumāram', 'yauvanam', 'jarā'],
                  explanation: '"dehino \'smin yathā dehe kaumāraṁ yauvanaṁ jarā" — As, for the embodied soul in this body, there is childhood, youth, and old age.'
                },
                {
                  id: 'bg213_syn_q2',
                  type: 'sentence_rebuilding',
                  prompt: 'FULL VERSE SYNTHESIS: Arrange the second half of BG 2.13!',
                  targetSentence: 'tathā dehāntara-prāptiḥ dhīraḥ tatra na muhyati',
                  tiles: ['tathā', 'dehāntara-prāptiḥ', 'dhīraḥ', 'tatra', 'na', 'muhyati'],
                  explanation: '"tathā dehāntara-prāptir dhīras tatra na muhyati" — Similarly, the wise are not bewildered by the soul\'s passing into another body.'
                },
                {
                  id: 'bg213_syn_q3',
                  type: 'reflection',
                  prompt: 'Personal Reflection on the Eternal Self:',
                  verseContext: 'BG 2.13: "dehino \'smin yathā dehe kaumāraṁ yauvanaṁ jarā tathā dehāntara-prāptir dhīras tatra na muhyati — As the embodied soul passes through childhood, youth, and old age, it likewise passes into another body; the wise are not bewildered by this."',
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
              verseTransliteration: "na jāyate mriyate vā kadācin nāyaṁ bhūtvā bhavitā vā na bhūyaḥ\najo nityaḥ śāśvato 'yaṁ purāṇo na hanyate hanyamāne śarīre",
              verseWordGuide: [
                { devanagari: 'न', roman: 'na' },
                { devanagari: 'जायते', roman: 'jāyate' },
                { devanagari: 'म्रियते', roman: 'mriyate' },
                { devanagari: 'वा', roman: 'vā' },
                { devanagari: 'कदाचिन्नायं', roman: "kadācin-nāyaṁ" },
                { devanagari: 'भूत्वा', roman: 'bhūtvā' },
                { devanagari: 'भविता', roman: 'bhavitā' },
                { devanagari: 'वा', roman: 'vā' },
                { devanagari: 'न', roman: 'na' },
                { devanagari: 'भूयः', roman: 'bhūyaḥ' },
                { devanagari: 'अजो', roman: 'ajo' },
                { devanagari: 'नित्यः', roman: 'nityaḥ' },
                { devanagari: 'शाश्वतोऽयं', roman: "śāśvato-'yaṁ" },
                { devanagari: 'पुराणो', roman: 'purāṇo' },
                { devanagari: 'न', roman: 'na' },
                { devanagari: 'हन्यते', roman: 'hanyate' },
                { devanagari: 'हन्यमाने', roman: 'hanyamāne' },
                { devanagari: 'शरीरे', roman: 'śarīre' }
              ],
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
                { word: 'ajaḥ', devanagari: 'अजः', meaning: 'unborn', partOfSpeech: 'adjective' },
                { word: 'nityaḥ', devanagari: 'नित्यः', meaning: 'eternal', partOfSpeech: 'adjective' }
              ],
              teachingSlides: [],
              questions: [],
              parts: [
                {
                  partIndex: 1,
                  title: 'Part 1: Never Born, Never Dies',
                  sanskrit: 'न जायते म्रियते वा',
                  transliteration: 'na jāyate mriyate vā',
                  translation: 'It is never born, nor does it ever die.',
                  wordBreakdown: [
                    { word: 'na', devanagari: 'न', meaning: 'not / never', partOfSpeech: 'particle' },
                    { word: 'jāyate', devanagari: 'जायते', meaning: 'is born', partOfSpeech: 'verb' },
                    { word: 'mriyate', devanagari: 'म्रियते', meaning: 'dies', partOfSpeech: 'verb' },
                    { word: 'vā', devanagari: 'वा', meaning: 'or', partOfSpeech: 'particle' }
                  ],
                  questions: [
                    {
                      id: 'bg220_p1_q1',
                      type: 'phrase_matching',
                      warmup: true,
                      prompt: 'Match each word in Part 1 to its meaning.',
                      pairs: [
                        { sanskrit: 'na', english: 'not / never' },
                        { sanskrit: 'jāyate', english: 'is born' },
                        { sanskrit: 'mriyate', english: 'dies' },
                        { sanskrit: 'vā', english: 'or' }
                      ]
                    },
                    {
                      id: 'bg220_p1_m',
                      type: 'phrase_matching',
                      prompt: 'Now match the joined phrases to their meanings.',
                      pairs: [
                        { sanskrit: 'na jāyate', english: 'is never born' },
                        { sanskrit: 'mriyate vā', english: 'or dies' }
                      ]
                    },
                    {
                      id: 'bg220_p1_t',
                      type: 'translate',
                      prompt: 'Write this in English',
                      sanskrit: 'na jāyate mriyate vā',
                      answer: 'it is never born nor does it die',
                      tiles: ['it', 'is', 'never', 'born', 'nor', 'does', 'it', 'die', 'slain', 'again', 'body']
                    },
                    {
                      id: 'bg220_p1_q3',
                      type: 'sentence_rebuilding',
                      prompt: 'Arrange the words to form Part 1 of the verse.',
                      hint: 'It is never born, nor does it ever die.',
                      targetSentence: 'na jāyate mriyate vā',
                      tiles: ['na', 'jāyate', 'mriyate', 'vā'],
                      explanation: '"na jāyate mriyate vā" — It is never born, nor does it ever die.'
                    }
                  ]
                },
                {
                  partIndex: 2,
                  title: 'Part 2: Never Ceases to Be',
                  sanskrit: 'कदाचिन्नायं भूत्वा',
                  transliteration: "kadācin nāyaṁ bhūtvā",
                  translation: 'At no time did it come into being...',
                  wordBreakdown: [
                    { word: 'kadācit', devanagari: 'कदाचित्', meaning: 'at any time', partOfSpeech: 'adverb' },
                    { word: 'ayam', devanagari: 'अयम्', meaning: 'this (soul)', partOfSpeech: 'pronoun' },
                    { word: 'bhūtvā', devanagari: 'भूत्वा', meaning: 'having come into being', partOfSpeech: 'verb (participle)' }
                  ],
                  questions: [
                    {
                      id: 'bg220_p2_q1',
                      type: 'phrase_matching',
                      warmup: true,
                      prompt: 'Match each word in Part 2 to its meaning.',
                      pairs: [
                        { sanskrit: 'kadācit', english: 'at any time' },
                        { sanskrit: 'ayam', english: 'this (soul)' },
                        { sanskrit: 'bhūtvā', english: 'having come into being' }
                      ]
                    },
                    {
                      id: 'bg220_p2_m',
                      type: 'phrase_matching',
                      prompt: 'Now match the joined phrases to their meanings.',
                      pairs: [
                        { sanskrit: 'kadācit na', english: 'at no time' },
                        { sanskrit: 'ayam bhūtvā', english: 'this soul, having come into being' }
                      ]
                    },
                    {
                      id: 'bg220_p2_t',
                      type: 'translate',
                      prompt: 'Write this in English',
                      sanskrit: 'kadācit na ayam bhūtvā',
                      answer: 'this soul never came into being',
                      tiles: ['this', 'soul', 'never', 'came', 'into', 'being', 'eternal', 'slain', 'body']
                    },
                    {
                      id: 'bg220_p2_r',
                      type: 'sentence_rebuilding',
                      prompt: 'Arrange the words to form Part 2 of the verse.',
                      hint: 'At no time did it come into being...',
                      targetSentence: 'kadācit na ayam bhūtvā',
                      tiles: ['kadācit', 'na', 'ayam', 'bhūtvā'],
                      explanation: 'At no time did this soul come into being.'
                    }
                  ]
                },
                {
                  partIndex: 3,
                  title: 'Part 3: Nor Will It Cease',
                  sanskrit: 'भविता वा न भूयः',
                  transliteration: 'bhavitā vā na bhūyaḥ',
                  translation: '...nor will it ever come to be again.',
                  wordBreakdown: [
                    { word: 'bhavitā', devanagari: 'भविता', meaning: 'will come into being', partOfSpeech: 'verb (future)' },
                    { word: 'bhūyaḥ', devanagari: 'भूयः', meaning: 'again', partOfSpeech: 'adverb' }
                  ],
                  questions: [
                    {
                      id: 'bg220_p3_q1',
                      type: 'phrase_matching',
                      warmup: true,
                      prompt: 'Match each word in Part 3 to its meaning.',
                      pairs: [
                        { sanskrit: 'bhavitā', english: 'will come into being' },
                        { sanskrit: 'bhūyaḥ', english: 'again' }
                      ]
                    },
                    {
                      id: 'bg220_p3_m',
                      type: 'phrase_matching',
                      prompt: 'Now match the joined phrases to their meanings.',
                      pairs: [
                        { sanskrit: 'bhavitā vā', english: 'or will come to be' },
                        { sanskrit: 'na bhūyaḥ', english: 'never again' }
                      ]
                    },
                    {
                      id: 'bg220_p3_t',
                      type: 'translate',
                      prompt: 'Write this in English',
                      sanskrit: 'bhavitā vā na bhūyaḥ',
                      answer: 'nor will it come to be again',
                      tiles: ['nor', 'will', 'it', 'come', 'to', 'be', 'again', 'born', 'body', 'slain']
                    },
                    {
                      id: 'bg220_p3_r',
                      type: 'sentence_rebuilding',
                      prompt: 'Arrange the words to form Part 3 of the verse.',
                      hint: '...nor will it ever come to be again.',
                      targetSentence: 'bhavitā vā na bhūyaḥ',
                      tiles: ['bhavitā', 'vā', 'na', 'bhūyaḥ'],
                      explanation: 'Nor will it ever come to be again.'
                    }
                  ]
                },
                {
                  partIndex: 4,
                  title: 'Part 4: Unborn, Eternal, Primeval',
                  sanskrit: 'अजो नित्यः शाश्वतोऽयं पुराणो',
                  transliteration: "ajo nityaḥ śāśvato 'yaṁ purāṇo",
                  translation: 'It is unborn, eternal, ever-existing, and primeval.',
                  wordBreakdown: [
                    { word: 'ajaḥ', devanagari: 'अजः', meaning: 'unborn', partOfSpeech: 'adjective' },
                    { word: 'nityaḥ', devanagari: 'नित्यः', meaning: 'eternal', partOfSpeech: 'adjective' },
                    { word: 'śāśvataḥ', devanagari: 'शाश्वतः', meaning: 'permanent / ever-existing', partOfSpeech: 'adjective' },
                    { word: 'purāṇaḥ', devanagari: 'पुराणः', meaning: 'primeval / most ancient', partOfSpeech: 'adjective' }
                  ],
                  questions: [
                    {
                      id: 'bg220_p4_q1',
                      type: 'phrase_matching',
                      warmup: true,
                      prompt: 'Match each word in Part 4 to its meaning.',
                      pairs: [
                        { sanskrit: 'ajaḥ', english: 'unborn' },
                        { sanskrit: 'nityaḥ', english: 'eternal' },
                        { sanskrit: 'śāśvataḥ', english: 'permanent / ever-existing' },
                        { sanskrit: 'purāṇaḥ', english: 'primeval / most ancient' }
                      ]
                    },
                    {
                      id: 'bg220_p4_m',
                      type: 'phrase_matching',
                      prompt: 'Now match the joined phrases to their meanings.',
                      pairs: [
                        { sanskrit: 'ajaḥ nityaḥ', english: 'unborn and eternal' },
                        { sanskrit: 'śāśvataḥ purāṇaḥ', english: 'ever-existing and primeval' }
                      ]
                    },
                    {
                      id: 'bg220_p4_t',
                      type: 'translate',
                      prompt: 'Write this in English',
                      sanskrit: 'ajaḥ nityaḥ',
                      answer: 'unborn and eternal',
                      tiles: ['unborn', 'and', 'eternal', 'slain', 'body', 'new']
                    },
                    {
                      id: 'bg220_p4_q2',
                      type: 'sentence_rebuilding',
                      prompt: 'Arrange the words to form Part 4 of the verse.',
                      hint: 'It is unborn, eternal, ever-existing, and primeval.',
                      targetSentence: 'ajaḥ nityaḥ śāśvataḥ purāṇaḥ',
                      tiles: ['ajaḥ', 'nityaḥ', 'śāśvataḥ', 'purāṇaḥ'],
                      explanation: '"ajo nityaḥ śāśvato \'yaṁ purāṇaḥ" — Unborn, eternal, ever-existing, and primeval.'
                    }
                  ]
                },
                {
                  partIndex: 5,
                  title: 'Part 5: Not Slain With the Body',
                  sanskrit: 'न हन्यते हन्यमाने शरीरे',
                  transliteration: 'na hanyate hanyamāne śarīre',
                  translation: 'it is not slain when the body is slain.',
                  wordBreakdown: [
                    { word: 'hanyate', devanagari: 'हन्यते', meaning: 'is slain', partOfSpeech: 'verb (passive)' },
                    { word: 'hanyamāne', devanagari: 'हन्यमाने', meaning: 'when being slain', partOfSpeech: 'verb (participle, locative)' },
                    { word: 'śarīre', devanagari: 'शरीरे', meaning: 'in the body', partOfSpeech: 'noun (locative)' }
                  ],
                  questions: [
                    {
                      id: 'bg220_p5_q1',
                      type: 'phrase_matching',
                      warmup: true,
                      prompt: 'Match each word in Part 5 to its meaning.',
                      pairs: [
                        { sanskrit: 'hanyate', english: 'is slain' },
                        { sanskrit: 'hanyamāne', english: 'when being slain' },
                        { sanskrit: 'śarīre', english: 'in the body' }
                      ]
                    },
                    {
                      id: 'bg220_p5_m',
                      type: 'phrase_matching',
                      prompt: 'Now match the joined phrases to their meanings.',
                      pairs: [
                        { sanskrit: 'na hanyate', english: 'is not slain' },
                        { sanskrit: 'hanyamāne śarīre', english: 'when the body is slain' }
                      ]
                    },
                    {
                      id: 'bg220_p5_t',
                      type: 'translate',
                      prompt: 'Write this in English',
                      sanskrit: 'na hanyate hanyamāne śarīre',
                      answer: 'not slain when the body is slain',
                      tiles: ['not', 'slain', 'when', 'the', 'body', 'is', 'slain', 'born', 'soul', 'eternal']
                    },
                    {
                      id: 'bg220_p5_r',
                      type: 'sentence_rebuilding',
                      prompt: 'Arrange the words to form Part 5 of the verse.',
                      hint: 'it is not slain when the body is slain.',
                      targetSentence: 'na hanyate hanyamāne śarīre',
                      tiles: ['na', 'hanyate', 'hanyamāne', 'śarīre'],
                      explanation: 'It is not slain when the body is slain.'
                    },
                    {
                      id: 'bg220_p5_q2',
                      type: 'multiple_choice',
                      prompt: 'What does BG 2.20 say happens to the soul when the body dies?',
                      options: [
                        { text: 'Nothing — the soul is not slain when the body is slain ("na hanyate hanyamāne śarīre").', isCorrect: true, explanation: 'Correct! The soul is entirely untouched by the body\'s death.' },
                        { text: 'The soul dies along with the body.', isCorrect: false, explanation: 'Incorrect. This verse says exactly the opposite.' }
                      ]
                    }
                  ]
                }
              ],
              finalSynthesisQuestions: [
                {
                  id: 'bg220_syn_q1',
                  type: 'sentence_rebuilding',
                  prompt: 'FULL VERSE SYNTHESIS: Rebuild the soul\'s four eternal qualities!',
                  targetSentence: 'ajaḥ nityaḥ śāśvataḥ purāṇaḥ',
                  tiles: ['ajaḥ', 'nityaḥ', 'śāśvataḥ', 'purāṇaḥ'],
                  explanation: '"ajo nityaḥ śāśvato \'yaṁ purāṇaḥ" — Unborn, eternal, ever-existing, and primeval.'
                },
                {
                  id: 'bg220_syn_q2',
                  type: 'sentence_rebuilding',
                  prompt: 'FULL VERSE SYNTHESIS: Rebuild the verse\'s famous closing line!',
                  targetSentence: 'na hanyate hanyamāne śarīre',
                  tiles: ['na', 'hanyate', 'hanyamāne', 'śarīre'],
                  explanation: '"na hanyate hanyamāne śarīre" — It is not slain when the body is slain.'
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
              verseTransliteration: "vāsāṁsi jīrṇāni yathā vihāya navāni gṛhṇāti naro 'parāṇi\ntathā śarīrāṇi vihāya jīrṇāny anyāni saṁyāti navāni dehī",
              verseWordGuide: [
                { devanagari: 'वासांसि', roman: 'vāsāṁsi' },
                { devanagari: 'जीर्णानि', roman: 'jīrṇāni' },
                { devanagari: 'यथा', roman: 'yathā' },
                { devanagari: 'विहाय', roman: 'vihāya' },
                { devanagari: 'नवानि', roman: 'navāni' },
                { devanagari: 'गृह्णाति', roman: 'gṛhṇāti' },
                { devanagari: 'नरोऽपराणि', roman: "naro-'parāṇi" },
                { devanagari: 'तथा', roman: 'tathā' },
                { devanagari: 'शरीराणि', roman: 'śarīrāṇi' },
                { devanagari: 'विहाय', roman: 'vihāya' },
                { devanagari: 'जीर्णान्यन्यानि', roman: 'jīrṇāny-anyāni' },
                { devanagari: 'संयाति', roman: 'saṁyāti' },
                { devanagari: 'नवानि', roman: 'navāni' },
                { devanagari: 'देही', roman: 'dehī' }
              ],
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
                { word: 'vihāya', devanagari: 'विहाय', meaning: 'having given up', partOfSpeech: 'verb (participle)' },
                { word: 'dehī', devanagari: 'देही', meaning: 'the embodied soul', partOfSpeech: 'noun' }
              ],
              teachingSlides: [],
              questions: [],
              parts: [
                {
                  partIndex: 1,
                  title: 'Part 1: Worn-Out Garments',
                  sanskrit: 'वासांसि जीर्णानि यथा विहाय',
                  transliteration: 'vāsāṁsi jīrṇāni yathā vihāya',
                  translation: 'As, giving up garments that are worn out...',
                  wordBreakdown: [
                    { word: 'vāsāṁsi', devanagari: 'वासांसि', meaning: 'garments', partOfSpeech: 'noun (plural)' },
                    { word: 'jīrṇāni', devanagari: 'जीर्णानि', meaning: 'worn out', partOfSpeech: 'adjective (plural)' },
                    { word: 'yathā', devanagari: 'यथा', meaning: 'as / just as', partOfSpeech: 'adverb' },
                    { word: 'vihāya', devanagari: 'विहाय', meaning: 'having given up', partOfSpeech: 'verb (participle)' }
                  ],
                  questions: [
                    {
                      id: 'bg222_p1_q1',
                      type: 'phrase_matching',
                      warmup: true,
                      prompt: 'Match each word in Part 1 to its meaning.',
                      pairs: [
                        { sanskrit: 'vāsāṁsi', english: 'garments' },
                        { sanskrit: 'jīrṇāni', english: 'worn out' },
                        { sanskrit: 'yathā', english: 'as / just as' },
                        { sanskrit: 'vihāya', english: 'having given up' }
                      ]
                    },
                    {
                      id: 'bg222_p1_m',
                      type: 'phrase_matching',
                      prompt: 'Now match the joined phrases to their meanings.',
                      pairs: [
                        { sanskrit: 'vāsāṁsi jīrṇāni', english: 'garments that are worn out' },
                        { sanskrit: 'yathā vihāya', english: 'just as, having given up' }
                      ]
                    },
                    {
                      id: 'bg222_p1_t',
                      type: 'translate',
                      prompt: 'Write this in English',
                      sanskrit: 'vāsāṁsi jīrṇāni yathā vihāya',
                      answer: 'just as giving up worn-out garments',
                      tiles: ['just', 'as', 'giving', 'up', 'worn-out', 'garments', 'new', 'bodies', 'takes']
                    },
                    {
                      id: 'bg222_p1_q3',
                      type: 'sentence_rebuilding',
                      prompt: 'Arrange the words to form Part 1 of the verse.',
                      hint: 'As, giving up garments that are worn out...',
                      targetSentence: 'vāsāṁsi jīrṇāni yathā vihāya',
                      tiles: ['vāsāṁsi', 'jīrṇāni', 'yathā', 'vihāya'],
                      explanation: '"vāsāṁsi jīrṇāni yathā vihāya" — As, giving up garments that are worn out.'
                    }
                  ]
                },
                {
                  partIndex: 2,
                  title: 'Part 2: Taking Up New Ones',
                  sanskrit: 'नवानि गृह्णाति नरोऽपराणि',
                  transliteration: "navāni gṛhṇāti naro 'parāṇi",
                  translation: 'a person takes up other, new ones.',
                  wordBreakdown: [
                    { word: 'navāni', devanagari: 'नवानि', meaning: 'new', partOfSpeech: 'adjective (plural)' },
                    { word: 'gṛhṇāti', devanagari: 'गृह्णाति', meaning: 'takes / accepts', partOfSpeech: 'verb' },
                    { word: 'naraḥ', devanagari: 'नरः', meaning: 'a person', partOfSpeech: 'noun' },
                    { word: 'aparāṇi', devanagari: 'अपराणि', meaning: 'other', partOfSpeech: 'adjective (plural)' }
                  ],
                  questions: [
                    {
                      id: 'bg222_p2_q1',
                      type: 'phrase_matching',
                      warmup: true,
                      prompt: 'Match each word in Part 2 to its meaning.',
                      pairs: [
                        { sanskrit: 'navāni', english: 'new' },
                        { sanskrit: 'gṛhṇāti', english: 'takes / accepts' },
                        { sanskrit: 'naraḥ', english: 'a person' },
                        { sanskrit: 'aparāṇi', english: 'other' }
                      ]
                    },
                    {
                      id: 'bg222_p2_m',
                      type: 'phrase_matching',
                      prompt: 'Now match the joined phrases to their meanings.',
                      pairs: [
                        { sanskrit: 'navāni aparāṇi', english: 'other, new ones' },
                        { sanskrit: 'naraḥ gṛhṇāti', english: 'a person takes' }
                      ]
                    },
                    {
                      id: 'bg222_p2_t',
                      type: 'translate',
                      prompt: 'Write this in English',
                      sanskrit: 'navāni gṛhṇāti naraḥ aparāṇi',
                      answer: 'a person takes other new ones',
                      tiles: ['a', 'person', 'takes', 'other', 'new', 'ones', 'bodies', 'worn-out', 'soul']
                    },
                    {
                      id: 'bg222_p2_r',
                      type: 'sentence_rebuilding',
                      prompt: 'Arrange the words to form Part 2 of the verse.',
                      hint: 'a person takes up other, new ones.',
                      targetSentence: 'navāni gṛhṇāti naraḥ aparāṇi',
                      tiles: ['navāni', 'gṛhṇāti', 'naraḥ', 'aparāṇi'],
                      explanation: 'A person takes up other, new ones.'
                    }
                  ]
                },
                {
                  partIndex: 3,
                  title: 'Part 3: Giving Up Worn-Out Bodies',
                  sanskrit: 'तथा शरीराणि विहाय जीर्णान्यन्यानि',
                  transliteration: 'tathā śarīrāṇi vihāya jīrṇāny anyāni',
                  translation: 'so too, giving up worn-out bodies, for other ones...',
                  wordBreakdown: [
                    { word: 'tathā', devanagari: 'तथा', meaning: 'so too / similarly', partOfSpeech: 'adverb' },
                    { word: 'śarīrāṇi', devanagari: 'शरीराणि', meaning: 'bodies', partOfSpeech: 'noun (plural)' },
                    { word: 'anyāni', devanagari: 'अन्यानि', meaning: 'other / different', partOfSpeech: 'adjective (plural)' }
                  ],
                  questions: [
                    {
                      id: 'bg222_p3_q1',
                      type: 'phrase_matching',
                      warmup: true,
                      prompt: 'Match each word in Part 3 to its meaning.',
                      pairs: [
                        { sanskrit: 'tathā', english: 'so too / similarly' },
                        { sanskrit: 'śarīrāṇi', english: 'bodies' },
                        { sanskrit: 'anyāni', english: 'other / different' }
                      ]
                    },
                    {
                      id: 'bg222_p3_m',
                      type: 'phrase_matching',
                      prompt: 'Now match the joined phrases to their meanings.',
                      pairs: [
                        { sanskrit: 'tathā śarīrāṇi', english: 'so too, the bodies' },
                        { sanskrit: 'vihāya jīrṇāni', english: 'giving up the worn-out ones' },
                        { sanskrit: 'anyāni', english: 'other ones' }
                      ]
                    },
                    {
                      id: 'bg222_p3_t',
                      type: 'translate',
                      prompt: 'Write this in English',
                      sanskrit: 'tathā śarīrāṇi vihāya jīrṇāni',
                      answer: 'so too giving up worn-out bodies',
                      tiles: ['so', 'too', 'giving', 'up', 'worn-out', 'bodies', 'garments', 'new', 'person']
                    },
                    {
                      id: 'bg222_p3_r',
                      type: 'sentence_rebuilding',
                      prompt: 'Arrange the words to form Part 3 of the verse.',
                      hint: 'so too, giving up worn-out bodies, for other ones...',
                      targetSentence: 'tathā śarīrāṇi vihāya jīrṇāni anyāni',
                      tiles: ['tathā', 'śarīrāṇi', 'vihāya', 'jīrṇāni', 'anyāni'],
                      explanation: 'So too, giving up worn-out bodies, for other ones.'
                    }
                  ]
                },
                {
                  partIndex: 4,
                  title: 'Part 4: The Soul Moves On',
                  sanskrit: 'संयाति नवानि देही',
                  transliteration: 'saṁyāti navāni dehī',
                  translation: 'the embodied soul enters into new ones.',
                  wordBreakdown: [
                    { word: 'saṁyāti', devanagari: 'संयाति', meaning: 'enters into / goes to', partOfSpeech: 'verb' },
                    { word: 'dehī', devanagari: 'देही', meaning: 'the embodied soul', partOfSpeech: 'noun' }
                  ],
                  questions: [
                    {
                      id: 'bg222_p4_q1',
                      type: 'phrase_matching',
                      warmup: true,
                      prompt: 'Match each word in Part 4 to its meaning.',
                      pairs: [
                        { sanskrit: 'saṁyāti', english: 'enters into / goes to' },
                        { sanskrit: 'dehī', english: 'the embodied soul' }
                      ]
                    },
                    {
                      id: 'bg222_p4_m',
                      type: 'phrase_matching',
                      prompt: 'Now match the joined phrases to their meanings.',
                      pairs: [
                        { sanskrit: 'saṁyāti navāni', english: 'enters into new ones' },
                        { sanskrit: 'dehī', english: 'the embodied soul' }
                      ]
                    },
                    {
                      id: 'bg222_p4_t',
                      type: 'translate',
                      prompt: 'Write this in English',
                      sanskrit: 'saṁyāti navāni dehī',
                      answer: 'the embodied soul enters new ones',
                      tiles: ['the', 'embodied', 'soul', 'enters', 'new', 'ones', 'garments', 'person', 'worn-out']
                    },
                    {
                      id: 'bg222_p4_r',
                      type: 'sentence_rebuilding',
                      prompt: 'Arrange the words to form Part 4 of the verse.',
                      hint: 'the embodied soul enters into new ones.',
                      targetSentence: 'saṁyāti navāni dehī',
                      tiles: ['saṁyāti', 'navāni', 'dehī'],
                      explanation: 'The embodied soul enters into new ones.'
                    },
                    {
                      id: 'bg222_p4_q2',
                      type: 'multiple_choice',
                      prompt: 'What does the garment simile in BG 2.22 teach?',
                      options: [
                        { text: 'Just as we replace old clothes with new ones, the soul takes on a new body when the old one wears out.', isCorrect: true, explanation: 'Correct! The body is what the soul wears, not what the soul is.' },
                        { text: 'The soul is destroyed along with the body, like a garment thrown away for good.', isCorrect: false, explanation: 'Incorrect. The garment is discarded, but the wearer — the soul — continues.' }
                      ]
                    }
                  ]
                }
              ],
              finalSynthesisQuestions: [
                {
                  id: 'bg222_syn_q1',
                  type: 'sentence_rebuilding',
                  prompt: 'FULL VERSE SYNTHESIS: Arrange the first half of BG 2.22!',
                  targetSentence: 'vāsāṁsi jīrṇāni yathā vihāya navāni gṛhṇāti naraḥ aparāṇi',
                  tiles: ['vāsāṁsi', 'jīrṇāni', 'yathā', 'vihāya', 'navāni', 'gṛhṇāti', 'naraḥ', 'aparāṇi'],
                  explanation: '"vāsāṁsi jīrṇāni yathā vihāya navāni gṛhṇāti naro \'parāṇi" — As a person casts off worn-out garments and takes up other, new ones.'
                },
                {
                  id: 'bg222_syn_q2',
                  type: 'sentence_rebuilding',
                  prompt: 'FULL VERSE SYNTHESIS: Arrange the second half of BG 2.22!',
                  targetSentence: 'tathā śarīrāṇi vihāya jīrṇāni anyāni saṁyāti navāni dehī',
                  tiles: ['tathā', 'śarīrāṇi', 'vihāya', 'jīrṇāni', 'anyāni', 'saṁyāti', 'navāni', 'dehī'],
                  explanation: '"tathā śarīrāṇi vihāya jīrṇāny anyāni saṁyāti navāni dehī" — Likewise, giving up worn-out bodies, the embodied soul enters others that are new.'
                }
              ]
            },
            {
              id: 'ch2_sec2_l4',
              title: 'Untouched by Any Element',
              verseRef: 'BG 2.23',
              essence: 'Weapons, fire, water and wind cannot harm the soul.',
              verseSanskrit: 'नैनं छिन्दन्ति शस्त्राणि नैनं दहति पावकः ।\nन चैनं क्लेदयन्त्यापो न शोषयति मारुतः ॥',
              verseTransliteration: 'nainaṁ chindanti śastrāṇi nainaṁ dahati pāvakaḥ\nna cainaṁ kledayanty āpo na śoṣayati mārutaḥ',
              verseWordGuide: [
                { devanagari: 'नैनं', roman: 'nainaṁ' },
                { devanagari: 'छिन्दन्ति', roman: 'chindanti' },
                { devanagari: 'शस्त्राणि', roman: 'śastrāṇi' },
                { devanagari: 'नैनं', roman: 'nainaṁ' },
                { devanagari: 'दहति', roman: 'dahati' },
                { devanagari: 'पावकः', roman: 'pāvakaḥ' },
                { devanagari: 'न', roman: 'na' },
                { devanagari: 'चैनं', roman: 'cainaṁ' },
                { devanagari: 'क्लेदयन्त्यापो', roman: 'kledayanty-āpo' },
                { devanagari: 'न', roman: 'na' },
                { devanagari: 'शोषयति', roman: 'śoṣayati' },
                { devanagari: 'मारुतः', roman: 'mārutaḥ' }
              ],
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
                { word: 'enam', devanagari: 'एनम्', meaning: 'it / this (the soul)', partOfSpeech: 'pronoun' },
                { word: 'chindanti', devanagari: 'छिन्दन्ति', meaning: 'they cut', partOfSpeech: 'verb' }
              ],
              teachingSlides: [],
              questions: [],
              parts: [
                {
                  partIndex: 1,
                  title: 'Part 1: Weapons Cannot Cut It',
                  sanskrit: 'नैनं छिन्दन्ति शस्त्राणि',
                  transliteration: 'nainaṁ chindanti śastrāṇi',
                  translation: 'Weapons cannot cut it.',
                  wordBreakdown: [
                    { word: 'na', devanagari: 'न', meaning: 'not', partOfSpeech: 'particle' },
                    { word: 'enam', devanagari: 'एनम्', meaning: 'it / this (the soul)', partOfSpeech: 'pronoun' },
                    { word: 'chindanti', devanagari: 'छिन्दन्ति', meaning: 'they cut', partOfSpeech: 'verb' },
                    { word: 'śastrāṇi', devanagari: 'शस्त्राणि', meaning: 'weapons', partOfSpeech: 'noun (plural)' }
                  ],
                  questions: [
                    {
                      id: 'bg223_p1_q1',
                      type: 'phrase_matching',
                      warmup: true,
                      prompt: 'Match each word in Part 1 to its meaning.',
                      pairs: [
                        { sanskrit: 'na', english: 'not' },
                        { sanskrit: 'enam', english: 'it / this (the soul)' },
                        { sanskrit: 'chindanti', english: 'they cut' },
                        { sanskrit: 'śastrāṇi', english: 'weapons' }
                      ]
                    },
                    {
                      id: 'bg223_p1_m',
                      type: 'phrase_matching',
                      prompt: 'Now match the joined phrases to their meanings.',
                      pairs: [
                        { sanskrit: 'na enam', english: 'not it (the soul)' },
                        { sanskrit: 'chindanti śastrāṇi', english: 'weapons cut' }
                      ]
                    },
                    {
                      id: 'bg223_p1_t',
                      type: 'translate',
                      prompt: 'Write this in English',
                      sanskrit: 'na enam chindanti śastrāṇi',
                      answer: 'weapons do not cut it',
                      tiles: ['weapons', 'do', 'not', 'cut', 'it', 'fire', 'burn', 'water']
                    },
                    {
                      id: 'bg223_p1_q3',
                      type: 'sentence_rebuilding',
                      prompt: 'Arrange the words to form Part 1 of the verse.',
                      hint: 'Weapons cannot cut it.',
                      targetSentence: 'na enam chindanti śastrāṇi',
                      tiles: ['na', 'enam', 'chindanti', 'śastrāṇi'],
                      explanation: '"nainaṁ chindanti śastrāṇi" — Weapons cannot cut it.'
                    }
                  ]
                },
                {
                  partIndex: 2,
                  title: 'Part 2: Fire Cannot Burn It',
                  sanskrit: 'नैनं दहति पावकः',
                  transliteration: 'nainaṁ dahati pāvakaḥ',
                  translation: 'Fire cannot burn it.',
                  wordBreakdown: [
                    { word: 'dahati', devanagari: 'दहति', meaning: 'burns', partOfSpeech: 'verb' },
                    { word: 'pāvakaḥ', devanagari: 'पावकः', meaning: 'fire', partOfSpeech: 'noun' }
                  ],
                  questions: [
                    {
                      id: 'bg223_p2_q1',
                      type: 'phrase_matching',
                      warmup: true,
                      prompt: 'Match each word in Part 2 to its meaning.',
                      pairs: [
                        { sanskrit: 'dahati', english: 'burns' },
                        { sanskrit: 'pāvakaḥ', english: 'fire' }
                      ]
                    },
                    {
                      id: 'bg223_p2_m',
                      type: 'phrase_matching',
                      prompt: 'Now match the joined phrases to their meanings.',
                      pairs: [
                        { sanskrit: 'na enam dahati', english: 'does not burn it' },
                        { sanskrit: 'pāvakaḥ', english: 'fire' },
                        { sanskrit: 'na enam chindanti', english: 'do not cut it' }
                      ]
                    },
                    {
                      id: 'bg223_p2_t',
                      type: 'translate',
                      prompt: 'Write this in English',
                      sanskrit: 'na enam dahati pāvakaḥ',
                      answer: 'fire does not burn it',
                      tiles: ['fire', 'does', 'not', 'burn', 'it', 'weapons', 'cut', 'wind']
                    },
                    {
                      id: 'bg223_p2_r',
                      type: 'sentence_rebuilding',
                      prompt: 'Arrange the words to form Part 2 of the verse.',
                      hint: 'Fire cannot burn it.',
                      targetSentence: 'na enam dahati pāvakaḥ',
                      tiles: ['na', 'enam', 'dahati', 'pāvakaḥ'],
                      explanation: 'Fire cannot burn it.'
                    }
                  ]
                },
                {
                  partIndex: 3,
                  title: 'Part 3: Water Cannot Wet It',
                  sanskrit: 'न चैनं क्लेदयन्त्यापो',
                  transliteration: "na cainaṁ kledayanty āpo",
                  translation: 'nor can water wet it.',
                  wordBreakdown: [
                    { word: 'ca', devanagari: 'च', meaning: 'and', partOfSpeech: 'particle' },
                    { word: 'kledayanti', devanagari: 'क्लेदयन्ति', meaning: 'wet / moisten', partOfSpeech: 'verb' },
                    { word: 'āpaḥ', devanagari: 'आपः', meaning: 'waters', partOfSpeech: 'noun (plural)' }
                  ],
                  questions: [
                    {
                      id: 'bg223_p3_q1',
                      type: 'phrase_matching',
                      warmup: true,
                      prompt: 'Match each word in Part 3 to its meaning.',
                      pairs: [
                        { sanskrit: 'ca', english: 'and' },
                        { sanskrit: 'kledayanti', english: 'wet / moisten' },
                        { sanskrit: 'āpaḥ', english: 'waters' }
                      ]
                    },
                    {
                      id: 'bg223_p3_m',
                      type: 'phrase_matching',
                      prompt: 'Now match the joined phrases to their meanings.',
                      pairs: [
                        { sanskrit: 'na ca enam', english: 'nor... it' },
                        { sanskrit: 'kledayanti āpaḥ', english: 'waters wet' }
                      ]
                    },
                    {
                      id: 'bg223_p3_t',
                      type: 'translate',
                      prompt: 'Write this in English',
                      sanskrit: 'na ca enam kledayanti āpaḥ',
                      answer: 'nor does water wet it',
                      tiles: ['nor', 'does', 'water', 'wet', 'it', 'fire', 'dry', 'weapons']
                    },
                    {
                      id: 'bg223_p3_r',
                      type: 'sentence_rebuilding',
                      prompt: 'Arrange the words to form Part 3 of the verse.',
                      hint: 'nor can water wet it.',
                      targetSentence: 'na ca enam kledayanti āpaḥ',
                      tiles: ['na', 'ca', 'enam', 'kledayanti', 'āpaḥ'],
                      explanation: 'Nor can water wet it.'
                    }
                  ]
                },
                {
                  partIndex: 4,
                  title: 'Part 4: Wind Cannot Dry It',
                  sanskrit: 'न शोषयति मारुतः',
                  transliteration: 'na śoṣayati mārutaḥ',
                  translation: 'nor can wind dry it.',
                  wordBreakdown: [
                    { word: 'śoṣayati', devanagari: 'शोषयति', meaning: 'dries', partOfSpeech: 'verb' },
                    { word: 'mārutaḥ', devanagari: 'मारुतः', meaning: 'wind', partOfSpeech: 'noun' }
                  ],
                  questions: [
                    {
                      id: 'bg223_p4_q1',
                      type: 'phrase_matching',
                      warmup: true,
                      prompt: 'Match each word in Part 4 to its meaning.',
                      pairs: [
                        { sanskrit: 'śoṣayati', english: 'dries' },
                        { sanskrit: 'mārutaḥ', english: 'wind' }
                      ]
                    },
                    {
                      id: 'bg223_p4_m',
                      type: 'phrase_matching',
                      prompt: 'Now match the joined phrases to their meanings.',
                      pairs: [
                        { sanskrit: 'na śoṣayati', english: 'does not dry' },
                        { sanskrit: 'mārutaḥ', english: 'wind' },
                        { sanskrit: 'kledayanti āpaḥ', english: 'waters wet' }
                      ]
                    },
                    {
                      id: 'bg223_p4_t',
                      type: 'translate',
                      prompt: 'Write this in English',
                      sanskrit: 'na śoṣayati mārutaḥ',
                      answer: 'wind does not dry it',
                      tiles: ['wind', 'does', 'not', 'dry', 'it', 'water', 'wet', 'burn']
                    },
                    {
                      id: 'bg223_p4_r',
                      type: 'sentence_rebuilding',
                      prompt: 'Arrange the words to form Part 4 of the verse.',
                      hint: 'nor can wind dry it.',
                      targetSentence: 'na śoṣayati mārutaḥ',
                      tiles: ['na', 'śoṣayati', 'mārutaḥ'],
                      explanation: 'Nor can wind dry it.'
                    },
                    {
                      id: 'bg223_p4_q2',
                      type: 'multiple_choice',
                      prompt: 'According to BG 2.23, what can harm the soul?',
                      options: [
                        { text: 'Nothing physical — weapons, fire, water, and wind are all named, and all are unable to touch it.', isCorrect: true, explanation: 'Correct! The soul is beyond the reach of every physical force.' },
                        { text: 'Only fire, which can burn away anything.', isCorrect: false, explanation: 'Incorrect. The verse explicitly says fire cannot burn it either.' }
                      ]
                    }
                  ]
                }
              ],
              finalSynthesisQuestions: [
                {
                  id: 'bg223_syn_q1',
                  type: 'sentence_rebuilding',
                  prompt: 'FULL VERSE SYNTHESIS: Rebuild the first line of BG 2.23!',
                  targetSentence: 'na enam chindanti śastrāṇi na enam dahati pāvakaḥ',
                  tiles: ['na', 'enam', 'chindanti', 'śastrāṇi', 'na', 'enam', 'dahati', 'pāvakaḥ'],
                  explanation: '"nainaṁ chindanti śastrāṇi nainaṁ dahati pāvakaḥ" — Weapons cannot cut it, nor can fire burn it.'
                },
                {
                  id: 'bg223_syn_q2',
                  type: 'sentence_rebuilding',
                  prompt: 'FULL VERSE SYNTHESIS: Rebuild the second line of BG 2.23!',
                  targetSentence: 'na ca enam kledayanti āpaḥ na śoṣayati mārutaḥ',
                  tiles: ['na', 'ca', 'enam', 'kledayanti', 'āpaḥ', 'na', 'śoṣayati', 'mārutaḥ'],
                  explanation: '"na cainaṁ kledayanty āpo na śoṣayati mārutaḥ" — Nor can water wet it, nor can wind dry it.'
                },
                {
                  id: 'bg223_syn_q3',
                  type: 'reflection',
                  prompt: 'Personal Reflection on the Indestructible Self:',
                  verseContext: 'BG 2.23: "nainaṁ chindanti śastrāṇi nainaṁ dahati pāvakaḥ na cainaṁ kledayanty āpo na śoṣayati mārutaḥ — Weapons cannot cut it, fire cannot burn it, water cannot wet it, nor wind dry it."',
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
