import { gitaData, type Lesson, type Question, type WordMeaning } from './gitaData';
import { gameState, isDue } from '../state/gameState.svelte';
import { learningConfig } from './learningConfig';

export const allLessons: Lesson[] = gitaData.chapters.flatMap((c) => c.sections.flatMap((s) => s.lessons));

/** Every curated word a lesson teaches (part breakdowns + lesson-level highlights), deduped. */
export function lessonWords(lesson: Lesson): WordMeaning[] {
  const seen = new Map<string, WordMeaning>();
  const entries = [...(lesson.parts ?? []).flatMap((p) => p.wordBreakdown), ...(lesson.wordBreakdown ?? [])];
  for (const w of entries) if (!seen.has(w.word)) seen.set(w.word, w);
  return [...seen.values()];
}

const glossary = new Map<string, WordMeaning>();
for (const lesson of allLessons) {
  for (const w of lessonWords(lesson)) {
    if (!glossary.has(w.word.toLowerCase())) glossary.set(w.word.toLowerCase(), w);
  }
}
const glossaryWords = [...glossary.values()];

export function lookupMeaning(word: string): string | undefined {
  return glossary.get(word.toLowerCase())?.meaning;
}

/** IAST words an exercise tests, for attributing mistakes to specific words. */
export function wordsTestedBy(q: Question): string[] {
  if (q.targetWords) return q.targetWords;
  switch (q.type) {
    case 'fill_in_the_blank':
    case 'listening':
      return [q.answer];
    case 'sentence_rebuilding':
      return q.tiles;
    default:
      return [];
  }
}

function learnedWords(): WordMeaning[] {
  const seen = new Map<string, WordMeaning>();
  for (const lesson of allLessons) {
    if (!gameState.completedLessons.includes(lesson.id)) continue;
    for (const w of lessonWords(lesson)) if (!seen.has(w.word)) seen.set(w.word, w);
  }
  return [...seen.values()];
}

export const MIN_PRACTICE_WORDS = 3;

export function practiceStatus(): { available: boolean; dueCount: number } {
  const pool = learnedWords();
  const now = Date.now();
  return {
    available: pool.length >= MIN_PRACTICE_WORDS,
    dueCount: pool.filter((w) => isDue(gameState.wordMemory[w.word], now)).length
  };
}

export function shuffle<T>(items: T[]): T[] {
  const a = [...items];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/** Distractors come from `preferred` first (e.g. words the learner has just seen), then the glossary. */
function distractors(target: WordMeaning, count: number, preferred: WordMeaning[] = []): WordMeaning[] {
  const usedMeanings = new Set([target.meaning.toLowerCase()]);
  const usedWords = new Set([target.word]);
  const picked: WordMeaning[] = [];
  for (const w of [...shuffle(preferred), ...shuffle(glossaryWords)]) {
    if (picked.length >= count) break;
    const m = w.meaning.toLowerCase();
    if (usedWords.has(w.word) || usedMeanings.has(m)) continue;
    usedMeanings.add(m);
    usedWords.add(w.word);
    picked.push(w);
  }
  return picked;
}

/**
 * Due words first, then the weakest remaining ones, so a session is always available
 * once enough words are learned. Words sharing a meaning are skipped — identical
 * English tiles would make the matching exercise ambiguous.
 */
function pickTargets(max: number): WordMeaning[] {
  const now = Date.now();
  const weakness = (a: WordMeaning, b: WordMeaning) => {
    const ma = gameState.wordMemory[a.word];
    const mb = gameState.wordMemory[b.word];
    return (ma?.strength ?? 0) - (mb?.strength ?? 0) || (ma?.lastPracticed ?? 0) - (mb?.lastPracticed ?? 0);
  };
  const pool = shuffle(learnedWords());
  const due = pool.filter((w) => isDue(gameState.wordMemory[w.word], now)).sort(weakness);
  const rest = pool.filter((w) => !isDue(gameState.wordMemory[w.word], now)).sort(weakness);

  const meanings = new Set<string>();
  const targets: WordMeaning[] = [];
  for (const w of [...due, ...rest]) {
    if (targets.length >= max) break;
    const m = w.meaning.toLowerCase();
    if (meanings.has(m)) continue;
    meanings.add(m);
    targets.push(w);
  }
  return targets;
}

const label = (w: WordMeaning) => `${w.devanagari} (${w.word})`;

export function meaningQuestion(w: WordMeaning, id: string | number, pool: WordMeaning[] = []): Question {
  const wrong = distractors(w, 2, pool);
  return {
    id: `practice_meaning_${id}`,
    type: 'multiple_choice',
    prompt: `What does ${label(w)} mean?`,
    targetWords: [w.word],
    options: shuffle([
      { text: w.meaning, isCorrect: true, explanation: `Yes — "${w.word}" means "${w.meaning}".` },
      ...wrong.map((d) => ({ text: d.meaning, isCorrect: false, explanation: `"${w.word}" means "${w.meaning}".` }))
    ])
  };
}

export function reverseQuestion(w: WordMeaning, id: string | number, pool: WordMeaning[] = []): Question {
  const wrong = distractors(w, 2, pool);
  return {
    id: `practice_reverse_${id}`,
    type: 'multiple_choice',
    prompt: `Which word means "${w.meaning}"?`,
    targetWords: [w.word],
    options: shuffle([
      { text: label(w), isCorrect: true, explanation: `Yes — "${w.meaning}" is ${label(w)}.` },
      ...wrong.map((d) => ({ text: label(d), isCorrect: false, explanation: `${label(d)} means "${d.meaning}".` }))
    ])
  };
}

export function listeningQuestion(w: WordMeaning, id: string | number, pool: WordMeaning[] = []): Question {
  return {
    id: `practice_listen_${id}`,
    type: 'listening',
    prompt: 'Tap the word you hear',
    targetWords: [w.word],
    audioText: w.devanagari,
    answer: w.word,
    options: shuffle([w, ...distractors(w, 3, pool)]).map((o) => ({ word: o.word, devanagari: o.devanagari })),
    explanation: `${label(w)} means "${w.meaning}".`
  };
}

/**
 * A short mixed-review session: recognition (matching) first, then recall in both
 * directions, with listening — the hardest — saved for the end. Session size follows the
 * learner's plan and the exercise mix follows their listening preference.
 */
export function buildPracticeLesson(opts: { listening: boolean }): Lesson | null {
  const cfg = learningConfig(gameState.profile);
  const targets = pickTargets(cfg.practiceSize);
  if (targets.length < MIN_PRACTICE_WORDS) return null;

  const level = opts.listening ? cfg.listening : 'none';
  const kinds =
    level === 'none' ? ['meaning', 'reverse']
    : level === 'heavy' ? ['listening', 'meaning', 'listening', 'reverse']
    : ['meaning', 'reverse', 'listening'];
  const rank: Record<string, number> = { meaning: 0, reverse: 1, listening: 2 };
  const perWord = targets
    .map((w, i) => ({ w, i, kind: kinds[i % kinds.length] }))
    .sort((a, b) => rank[a.kind] - rank[b.kind])
    .map(({ w, i, kind }) =>
      kind === 'meaning' ? meaningQuestion(w, i) : kind === 'reverse' ? reverseQuestion(w, i) : listeningQuestion(w, i)
    );

  const matching: Question = {
    id: 'practice_match',
    type: 'phrase_matching',
    prompt: 'Match each word to its meaning.',
    targetWords: targets.map((w) => w.word),
    pairs: targets.map((w) => ({ sanskrit: w.word, english: w.meaning }))
  };

  return {
    id: 'practice',
    title: 'Practice',
    verseRef: 'Review',
    verseSanskrit: '',
    verseTransliteration: '',
    translation: '',
    purport: 'Reviewing a word just as you begin to forget it is what makes it last.',
    wordBreakdown: targets,
    teachingSlides: [],
    questions: [],
    parts: [],
    finalSynthesisQuestions: [matching, ...perWord]
  };
}
