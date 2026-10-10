// The verse journey: every verse is one node that plays a fixed sequence of pages (see JOURNEY_PAGES).
// A verse's content is either hand-authored (journeyContent.ts) or generated here from its parts.
// This file must not import practice.ts — practice.ts imports it for the word list.

import { gitaData, type HindiText, type Lesson, type PhrasePair, type VersePart, type WordMeaning } from './gitaData';
import { foldRoman, hindiOf, wordKey } from './hindi';
import { JOURNEY_OVERRIDES, TIER_JOURNEY_OVERRIDES } from './journeyContent';
import type { DifficultyTier } from './onboarding';

// ─── Types ──────────────────────────────────────────────────────────────────

/** Nouns carry meaning best, so they lead the word-matching pages; grammar words are tested later. */
export type WordKind = 'noun' | 'other' | 'grammar';

export interface JourneyWord {
  /** `wordKey()` of the Roman spelling — the spaced-repetition identity */
  key: string;
  hindi: HindiText;
  english: string;
  kind: WordKind;
  /** A short aside shown with the word's flashcard */
  note?: string;
  /** The same aside as the Devanagari tier writes it, when it names the word itself */
  noteDev?: string;
}

export interface JourneyHalf {
  hindi: HindiText;
  english: string;
  /** Phrase-level matching pairs */
  phrases: PhrasePair[];
  /** Every word of the half (about twelve) — only some are shown at a time, see pickWordBatch */
  words: JourneyWord[];
}

/** A sentence with `___` gaps and a bank of options (the answers plus decoys). */
export interface BlankSet {
  template: string;
  options: string[];
  answers: string[];
  /** Word keys behind each answer, for the re-exam. Needed when the answers aren't English (see keysFromAnswer). */
  answerKeys?: string[][];
  /** The same set in Devanagari, option for option in the same order, for the tier that reads Devanagari; `template` etc. are Roman then. */
  dev?: { template: string; options: string[]; answers: string[] };
}

/** The set as the tier's script writes it: Devanagari where the set has that twin and the tier reads Devanagari. */
export function blankInScript(set: BlankSet, devanagari: boolean): BlankSet {
  return devanagari && set.dev ? { ...set, ...set.dev } : set;
}

export interface JourneyContent {
  verseHindi: HindiText;
  verseEnglish: string;
  /** Paragraphs of the verse's deeper meaning */
  deeperMeaning: string[];
  /** The same paragraphs as the Devanagari tier writes them (they name the verse's key words), when those differ */
  deeperMeaningDev?: string[];
  halves: [JourneyHalf, JourneyHalf];
  wordBlanks: [BlankSet, BlankSet];
  chunkBlanks: [BlankSet, BlankSet];
  singleBlanks: [BlankSet, BlankSet];
  fullBlanks: BlankSet;
  reflectionPrompt: string;
  /** The language of `verseHindi`, the words and the phrases (the field names say Hindi, but they hold Sanskrit too). Hindi if absent. */
  language?: 'hindi' | 'sanskrit';
  /** Names this version of the content for checkpoints, when more than one tier plays it (default: the tier's name) */
  variant?: string;
  /** What the fill-in-the-blank pages show above the sentence: the English meaning, when the blanks are in the verse's own language. By default the verse itself. */
  blankClue?: 'english';
  /** How each recital page gives its clue — first half, second half, whole verse. Default: text, text, audio. */
  recitalClues?: [RecitalClue, RecitalClue, RecitalClue];
}

/** text: the text to recite is shown · audio: hidden, the clue is spoken in the chosen language · opposite-audio: hidden, the clue is spoken in the other language (hear the meaning, say the verse) */
export type RecitalClue = 'text' | 'audio' | 'opposite-audio';

export const languageName = (content: JourneyContent): 'Hindi' | 'Sanskrit' => (content.language === 'sanskrit' ? 'Sanskrit' : 'Hindi');

export type PageKind = 'intro' | 'flashcards' | 'word_match' | 'phrase_match' | 'blanks' | 'recital' | 'reexam' | 'reflection';
export type BlankKind = 'word' | 'chunk' | 'single' | 'full';

export interface JourneyPageSpec {
  kind: PageKind;
  title: string;
  /** Which half of the verse the page covers; absent for whole-verse pages */
  half?: 0 | 1;
  blank?: BlankKind;
}

/**
 * In each half the word flashcards come first, then word matching on those same words, then phrase matching.
 */
export const JOURNEY_PAGES: readonly JourneyPageSpec[] = [
  { kind: 'intro', title: 'Meet the verse' },
  { kind: 'flashcards', half: 0, title: 'Learn the words' },
  { kind: 'word_match', half: 0, title: 'Match the words' },
  { kind: 'phrase_match', half: 0, title: 'Match the phrases' },
  { kind: 'flashcards', half: 1, title: 'Learn the words' },
  { kind: 'word_match', half: 1, title: 'Match the words' },
  { kind: 'phrase_match', half: 1, title: 'Match the phrases' },
  { kind: 'blanks', half: 0, blank: 'word', title: 'Fill in the words' },
  { kind: 'blanks', half: 1, blank: 'word', title: 'Fill in the words' },
  { kind: 'blanks', half: 0, blank: 'chunk', title: 'Fill in the phrases' },
  { kind: 'blanks', half: 1, blank: 'chunk', title: 'Fill in the phrases' },
  { kind: 'blanks', half: 0, blank: 'single', title: 'Finish the line' },
  { kind: 'blanks', half: 1, blank: 'single', title: 'Finish the line' },
  { kind: 'blanks', blank: 'full', title: 'Complete the verse' },
  { kind: 'recital', half: 0, title: 'Recite the first half' },
  { kind: 'recital', half: 1, title: 'Recite the second half' },
  { kind: 'recital', title: 'Recite the whole verse' },
  { kind: 'reexam', title: 'Fix your mistakes' },
  { kind: 'reflection', title: 'Reflect' }
];

export const JOURNEY_PAGE_COUNT = JOURNEY_PAGES.length;

// ─── Seeded randomness ──────────────────────────────────────────────────────
// A resumed checkpoint must rebuild the same pages, so everything random is driven by the checkpoint's seed.

export function seededRandom(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function seededShuffle<T>(items: T[], seed: number): T[] {
  const rnd = seededRandom(seed);
  const a = [...items];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rnd() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export const newSeed = (): number => Math.floor(Math.random() * 2 ** 31);

// ─── Words ──────────────────────────────────────────────────────────────────

function kindOf(partOfSpeech: string): WordKind {
  if (partOfSpeech.startsWith('noun')) return 'noun';
  if (partOfSpeech === 'verb' || partOfSpeech === 'adjective' || partOfSpeech === 'adverb') return 'other';
  return 'grammar';
}

export function toJourneyWord(w: WordMeaning): JourneyWord {
  return {
    key: wordKey(w.word),
    hindi: { dev: w.devanagari, roman: w.word },
    english: w.meaning,
    kind: kindOf(w.partOfSpeech)
  };
}

/** A journey word as the practice engine's vocabulary entry, whose `word` is the memory key. */
export function toWordMeaning(w: JourneyWord): WordMeaning {
  return {
    word: w.key,
    roman: w.hindi.roman,
    devanagari: w.hindi.dev,
    meaning: w.english,
    partOfSpeech: w.kind === 'noun' ? 'noun' : w.kind === 'other' ? 'verb' : 'particle'
  };
}

function dedupeWords(words: JourneyWord[]): JourneyWord[] {
  const seen = new Map<string, JourneyWord>();
  for (const w of words) if (!seen.has(w.key)) seen.set(w.key, w);
  return [...seen.values()];
}

/** Splits a verse's parts into its two halves, matching the verse's two Hindi lines where it has them. */
function splitParts(lesson: Lesson): [VersePart[], VersePart[]] {
  const parts = lesson.parts ?? [];
  if (parts.length < 2) return [parts, parts];
  const count = (s: string) => s.split(/\s+/).filter(Boolean).length;
  const lines = lesson.hindiTranslationRoman.split('\n');
  let k = Math.ceil(parts.length / 2);
  if (lines.length === 2) {
    const target = count(lines[0]);
    let run = 0;
    let best = Infinity;
    for (let i = 0; i < parts.length - 1; i++) {
      run += count(parts[i].hindiTranslationRoman);
      const d = Math.abs(run - target);
      if (d < best) {
        best = d;
        k = i + 1;
      }
    }
  }
  return [parts.slice(0, k), parts.slice(k)];
}

/** Every word a verse teaches. Cheap — no blanks are built — so practice can call it for every lesson. */
export function journeyWordsFor(lesson: Lesson): JourneyWord[] {
  const override = JOURNEY_OVERRIDES[lesson.id];
  if (override) return dedupeWords(override.halves.flatMap((h) => h.words));
  const fromParts = splitParts(lesson).flatMap((ps) => ps.flatMap((p) => p.wordBreakdown.map(toJourneyWord)));
  return dedupeWords([...fromParts, ...(lesson.wordBreakdown ?? []).map(toJourneyWord)]);
}

type Memory = Record<string, { strength: number; lastPracticed: number }>;

/** The fewest words a half's flashcards and word-matching page work on; a run uses this many or one more. */
export const WORD_BATCH_SIZE = 4;

/** 4 or 5 words per half, decided by the run's seed, so the page isn't always the same length either. */
export const batchSizeFor = (seed: number): number => WORD_BATCH_SIZE + (seed % 2);

/**
 * The words a half's flashcards and word-matching page work on: a random pick (fixed by the seed, so a resumed
 * checkpoint rebuilds it) from the half's content words. A noun is three times as likely to be drawn as a verb or
 * adjective, and a word the learner already knows less likely (unseen words count as weakest), so a replay leans
 * towards words not yet met. Whether a word has a flashcard picture plays no part. Grammar words (he, mein, tatha…)
 * are only drawn to pad a half that has too few content words; the re-exam and practice test them instead.
 * Every new start gets a new seed, so the words change from one start to the next.
 */
export function pickWordBatch(pool: JourneyWord[], memory: Memory, seed: number, size = batchSizeFor(seed)): JourneyWord[] {
  const rnd = seededRandom(seed);
  const strength = (w: JourneyWord) => memory[w.key]?.strength ?? -1;
  const weight = (w: JourneyWord) => (w.kind === 'noun' ? 3 : 1) / (1 + Math.max(0, strength(w) + 1));
  // Weighted draw without replacement: each word gets rnd^(1/weight), and the highest scores are taken first
  const drawOrder = (ws: JourneyWord[]) =>
    ws
      .map((w) => ({ w, score: Math.pow(rnd(), 1 / weight(w)) }))
      .sort((a, b) => b.score - a.score)
      .map((x) => x.w);

  const picked: JourneyWord[] = [];
  const keys = new Set<string>();
  const meanings = new Set<string>();
  const take = (ws: JourneyWord[]) => {
    for (const w of drawOrder(ws)) {
      if (picked.length >= size) break;
      const m = w.english.toLowerCase();
      // Two words sharing an English meaning would make the matching ambiguous
      if (keys.has(w.key) || meanings.has(m)) continue;
      keys.add(w.key);
      meanings.add(m);
      picked.push(w);
    }
  };
  take(pool.filter((w) => w.kind !== 'grammar'));
  if (picked.length < size) take(pool.filter((w) => w.kind === 'grammar'));
  return seededShuffle(picked, seed + 1);
}

/** Words in the order they are said in the Hindi, so flashcards walk through the verse. */
export function inVerseOrder(words: JourneyWord[], hindiRoman: string): JourneyWord[] {
  const text = ` ${plain(hindiRoman)} `;
  const at = (w: JourneyWord) => {
    const i = text.indexOf(` ${plain(w.hindi.roman)} `);
    return i < 0 ? Infinity : i;
  };
  return [...words].sort((a, b) => at(a) - at(b));
}

/**
 * The re-exam's words: the ones the learner got wrong. With no mistakes, a short spot-check on words the
 * word pages never showed (grammar words included), weakest first, so every word gets tested.
 */
export function reexamWords(
  pool: JourneyWord[],
  missedKeys: string[],
  seenKeys: string[],
  memory: Memory,
  seed: number,
  spotCheck = 4
): { words: JourneyWord[]; isSpotCheck: boolean } {
  const missed = new Set(missedKeys);
  const wrong = pool.filter((w) => missed.has(w.key));
  if (wrong.length) return { words: seededShuffle(wrong, seed).slice(0, 8), isSpotCheck: false };

  const seen = new Set(seenKeys);
  const strength = (w: JourneyWord) => memory[w.key]?.strength ?? -1;
  const ranked = seededShuffle(pool, seed).sort(
    (a, b) => Number(seen.has(a.key)) - Number(seen.has(b.key)) || strength(a) - strength(b)
  );
  const words: JourneyWord[] = [];
  const meanings = new Set<string>();
  for (const w of ranked) {
    if (words.length >= spotCheck) break;
    const m = w.english.toLowerCase();
    if (meanings.has(m)) continue;
    meanings.add(m);
    words.push(w);
  }
  return { words, isSpotCheck: true };
}

// ─── Text matching helpers ──────────────────────────────────────────────────

const plain = (s: string) => foldRoman(s).replace(/[^a-z\s]/g, ' ').replace(/\s+/g, ' ').trim();

/** Whether the Roman phrase contains `needle` as whole words in order. */
export function containsPhrase(haystackRoman: string, needleRoman: string): boolean {
  const n = plain(needleRoman);
  return n.length > 0 && ` ${plain(haystackRoman)} `.includes(` ${n} `);
}

export function wordsInText(pool: JourneyWord[], roman: string): JourneyWord[] {
  return pool.filter((w) => containsPhrase(roman, w.hindi.roman));
}

/** English alternatives of a meaning: "action / duty" → ["action / duty", "action", "duty"] */
function alternatives(english: string): string[] {
  const base = english.toLowerCase().replace(/\([^)]*\)/g, '').trim();
  return [base, ...base.split('/').map((s) => s.trim())].filter(Boolean);
}

const allHalfWords = (content: JourneyContent) => dedupeWords(content.halves.flatMap((h) => h.words));

/** The word keys a pair's Hindi side stands for: one word, or every word inside a phrase. */
export function keysFromRoman(content: JourneyContent, roman: string): string[] {
  const pool = allHalfWords(content);
  const exact = pool.find((w) => plain(w.hindi.roman) === plain(roman));
  return exact ? [exact.key] : wordsInText(pool, roman).map((w) => w.key);
}

/** The word keys behind a correct blank answer, so a wrong blank can be corrected word by word. */
export function keysFromAnswer(content: JourneyContent, answer: string): string[] {
  const a = plain(answer);
  if (!a) return [];
  const pool = allHalfWords(content);
  const keys = new Set<string>();
  for (const w of pool) {
    const hit = alternatives(w.english).some(
      (alt) => plain(alt) === a || (a.length >= 4 && plain(alt).length >= 4 && (plain(alt).startsWith(a) || a.startsWith(plain(alt))))
    );
    if (hit) keys.add(w.key);
  }
  // A single word that is itself a vocabulary word needs no phrase lookup — that would blame its neighbours too
  if (keys.size > 0 && !a.includes(' ')) return [...keys];
  for (const half of content.halves) {
    for (const p of half.phrases) {
      const en = plain(p.english);
      if (en && (en.includes(a) || a.includes(en))) wordsInText(pool, p.hindi.roman).forEach((w) => keys.add(w.key));
    }
  }
  return [...keys];
}

/** The phrase a word came from, as a clue for the re-exam. A half that teaches the word is searched first (yoga is also inside yoga-sthaḥ). */
export function clueFor(content: JourneyContent, word: JourneyWord): { hindi: HindiText; english: string } {
  const owning = content.halves.filter((h) => h.words.some((w) => w.key === word.key));
  for (const half of [...owning, ...content.halves.filter((h) => !owning.includes(h))]) {
    for (const p of half.phrases) {
      if (containsPhrase(p.hindi.roman, word.hindi.roman)) return { hindi: p.hindi, english: p.english };
    }
  }
  const half = content.halves.find((h) => containsPhrase(h.hindi.roman, word.hindi.roman)) ?? content.halves[0];
  return { hindi: half.hindi, english: half.english };
}

// ─── Recital scoring ────────────────────────────────────────────────────────

export const RECITAL_PASS = 0.6;

const DEVANAGARI = /[\u0900-\u097F]/;
const stripMarks = (s: string) => s.replace(/[^\p{L}\p{M}\s]/gu, ' ').replace(/\s+/g, ' ').trim();

export interface RecitalScore {
  /** 0–1: the share of the target's words that were said */
  score: number;
  passed: boolean;
  /** Word keys of the target words that were not heard (Hindi only) */
  missedKeys: string[];
}

/**
 * Lenient on purpose — recognition and spelling both vary. A word counts as said if it appears among the
 * spoken words, or inside the spoken text with the spaces removed (so "tyag kar" matches "tyagkar").
 * Hindi accepts Devanagari (what recognition returns) or Roman (what the learner types).
 */
export function scoreRecital(spoken: string, target: HindiText | string, lang: 'hi' | 'en', pool: JourneyWord[] = []): RecitalScore {
  let targetTokens: string[];
  let heard: string;
  let targetRoman: string[] = [];
  if (lang === 'en') {
    targetTokens = plain(target as string).split(' ').filter(Boolean);
    heard = plain(spoken);
  } else {
    const t = target as HindiText;
    const deva = DEVANAGARI.test(spoken);
    const toks = (s: string) => (deva ? stripMarks(s) : plain(s)).split(' ').filter(Boolean);
    targetTokens = toks(deva ? t.dev : t.roman);
    targetRoman = plain(t.roman).split(' ').filter(Boolean);
    heard = deva ? stripMarks(spoken) : plain(spoken);
  }
  const heardTokens = new Set(heard.split(' ').filter(Boolean));
  const compact = heard.replace(/\s/g, '');
  const said = targetTokens.map((tok) => heardTokens.has(tok) || (tok.length >= 3 && compact.includes(tok)));
  const score = targetTokens.length ? said.filter(Boolean).length / targetTokens.length : 0;

  const missedKeys: string[] = [];
  if (lang === 'hi' && targetRoman.length === targetTokens.length) {
    const missedRoman = targetRoman.filter((_, i) => !said[i]).join(' ');
    for (const w of pool) if (containsPhrase(missedRoman, w.hindi.roman)) missedKeys.push(w.key);
  }
  return { score, passed: score >= RECITAL_PASS, missedKeys };
}

// ─── Generation (verses without hand-authored content) ──────────────────────

const STOP_WORDS = new Set([
  'the', 'and', 'for', 'with', 'your', 'this', 'that', 'are', 'was', 'not', 'you', 'his', 'her', 'its', 'all', 'who',
  'one', 'from', 'into', 'but', 'nor', 'such', 'upon', 'they', 'them', 'their', 'our', 'will', 'may', 'can', 'only'
]);

const trimEnd = (s: string) => s.replace(/[.,;:\s]+$/, '');
const escapeRe = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

let decoyCache: string[] | null = null;

/** Single English words from every verse's vocabulary — plausible wrong answers for word blanks. */
function decoyWordPool(): string[] {
  if (decoyCache) return decoyCache;
  const out = new Set<string>();
  for (const chapter of gitaData.chapters) {
    for (const section of chapter.sections) {
      for (const lesson of section.lessons) {
        for (const p of lesson.parts ?? []) {
          for (const w of p.wordBreakdown) {
            for (const alt of alternatives(w.meaning)) if (/^[a-z]{4,}$/.test(alt) && !STOP_WORDS.has(alt)) out.add(alt);
          }
        }
      }
    }
  }
  return (decoyCache = [...out]);
}

const CONNECTORS = new Set(['and', 'in', 'of', 'to', 'with', 'for', 'on', 'that', 'nor', 'from', 'at', 'by', 'while', 'which', 'who', 'as', 'but']);

/**
 * Splits one English clause in two near its middle, preferring to break before a connecting word or after a comma.
 * A half with a single part has nothing else to blank out, so its one clause is split instead.
 */
function splitEnglish(text: string): string[] {
  const t = trimEnd(text);
  const words = t.split(/\s+/);
  if (words.length < 6) return [t];
  const mid = words.length / 2;
  let best = -1;
  let bestCost = Infinity;
  for (let i = 2; i <= words.length - 3; i++) {
    const natural = CONNECTORS.has(words[i].toLowerCase().replace(/[^a-z]/g, '')) || /[,;]$/.test(words[i - 1]);
    const cost = Math.abs(i - mid) + (natural ? 0 : 1.5);
    if (cost < bestCost) {
      bestCost = cost;
      best = i;
    }
  }
  return [words.slice(0, best).join(' '), words.slice(best).join(' ')];
}

/** Other verses' clauses (or, for a split clause, their fragments) to use as wrong options. */
function decoyChunks(lessonId: string, exclude: string[], fragments: boolean): string[] {
  const skip = new Set(exclude.map(plain));
  const out: string[] = [];
  for (const chapter of gitaData.chapters) {
    for (const section of chapter.sections) {
      for (const lesson of section.lessons) {
        if (lesson.id === lessonId) continue;
        for (const p of lesson.parts ?? []) {
          const text = trimEnd(p.translation);
          const pieces = fragments ? splitEnglish(text) : [text];
          for (const piece of pieces) if (!skip.has(plain(piece))) out.push(piece);
        }
      }
    }
  }
  return out;
}

function pickDecoys(candidates: string[], taken: string[], count: number, seed: number): string[] {
  const used = new Set(taken.map((t) => t.toLowerCase()));
  const out: string[] = [];
  for (const c of seededShuffle(candidates, seed)) {
    if (out.length >= count) break;
    if (used.has(c.toLowerCase())) continue;
    used.add(c.toLowerCase());
    out.push(c);
  }
  return out;
}

/** Up to three words of the half's English that are vocabulary words, blanked out. Null when none can be. */
function wordBlankSet(english: string, words: JourneyWord[], seed: number): BlankSet | null {
  const found: { start: number; end: number; text: string }[] = [];
  for (const w of words) {
    if (w.kind === 'grammar') continue;
    for (const alt of alternatives(w.english)) {
      if (!/^[a-z]{4,}$/.test(alt) || STOP_WORDS.has(alt)) continue;
      const m = new RegExp(`\\b${escapeRe(alt)}\\b`, 'i').exec(english);
      if (m) {
        found.push({ start: m.index, end: m.index + m[0].length, text: m[0] });
        break;
      }
    }
  }
  found.sort((a, b) => a.start - b.start);
  const spans = found.filter((f, i) => i === 0 || f.start >= found[i - 1].end);
  if (!spans.length) return null;
  const chosen = spans.length > 3 ? [spans[0], spans[Math.floor(spans.length / 2)], spans[spans.length - 1]] : spans;

  let template = english;
  for (const s of [...chosen].reverse()) template = template.slice(0, s.start) + '___' + template.slice(s.end);
  const answers = chosen.map((s) => s.text);
  const extra = pickDecoys(decoyWordPool(), answers, Math.max(3, 8 - answers.length), seed);
  return { template, options: [...answers, ...extra], answers };
}

/** Blanks whole parts of the half's English: the chosen part indexes become gaps. */
function chunkBlankSet(lessonId: string, partsEn: string[], blankAt: number[], seed: number, fragments: boolean): BlankSet {
  const texts = partsEn.map(trimEnd);
  const answers = blankAt.map((i) => texts[i]);
  const template = texts.map((t, i) => (blankAt.includes(i) ? '___' : t)).join(' ');
  const extra = pickDecoys(decoyChunks(lessonId, texts, fragments), answers, answers.length + 1, seed);
  return { template, options: [...answers, ...extra], answers };
}

function generateHalf(parts: VersePart[]): JourneyHalf {
  const words = dedupeWords(parts.flatMap((p) => p.wordBreakdown.map(toJourneyWord)));
  return {
    hindi: {
      dev: parts.map((p) => p.hindiTranslationDevanagari).join(' '),
      roman: parts.map((p) => p.hindiTranslationRoman).join(' ')
    },
    english: parts.map((p) => p.translation).join(' '),
    phrases: parts.slice(0, 4).map((p) => ({ hindi: hindiOf(p), english: trimEnd(p.translation) })),
    words
  };
}

function generateJourney(lesson: Lesson, seed: number): JourneyContent {
  const [partsA, partsB] = splitParts(lesson);
  const halves = [generateHalf(partsA), generateHalf(partsB)] as [JourneyHalf, JourneyHalf];
  const partsEn = [partsA, partsB].map((ps) => ps.map((p) => p.translation));
  // A half with a single part is split into two clauses, so its chunk pages blank something different from each other
  const splitHalf = partsEn.map((ps) => ps.length === 1 && splitEnglish(ps[0]).length > 1);
  const chunkParts = partsEn.map((ps, h) => (splitHalf[h] ? splitEnglish(ps[0]) : ps));

  const chunk = (h: 0 | 1, blankAt: (n: number) => number[], s: number) =>
    chunkBlankSet(lesson.id, chunkParts[h], blankAt(chunkParts[h].length), seed + s, splitHalf[h]);
  const wordBlanks = [0, 1].map(
    (h) =>
      wordBlankSet(halves[h].english, halves[h].words, seed + 10 + h) ??
      chunk(h as 0 | 1, (n) => [n - 1], 20 + h)
  ) as [BlankSet, BlankSet];
  // The "all but the first part" chunk page and the "just the first part" page differ, so neither repeats the other
  const chunkBlanks = [0, 1].map((h) =>
    chunk(h as 0 | 1, (n) => (n > 1 ? Array.from({ length: n - 1 }, (_, i) => i + 1) : [0]), 30 + h)
  ) as [BlankSet, BlankSet];
  const singleBlanks = [0, 1].map((h) => chunk(h as 0 | 1, () => [0], 40 + h)) as [BlankSet, BlankSet];

  const fullOptions = [...new Set([...wordBlanks[0].options, ...wordBlanks[1].options])];
  const fullBlanks: BlankSet = {
    template: `${wordBlanks[0].template} ${wordBlanks[1].template}`,
    options: fullOptions,
    answers: [...wordBlanks[0].answers, ...wordBlanks[1].answers]
  };

  const deeperMeaning = [
    lesson.purport,
    lesson.commentary ? `${lesson.commentary.text} — ${lesson.commentary.author}` : ''
  ].filter(Boolean);
  return {
    verseHindi: hindiOf(lesson),
    verseEnglish: lesson.translation,
    deeperMeaning,
    halves,
    wordBlanks,
    chunkBlanks,
    singleBlanks,
    fullBlanks,
    reflectionPrompt:
      lesson.reflectionPrompt ?? `What does ${lesson.verseRef} mean for your own life? Write a thought or two.`
  };
}

/**
 * The journey's content for a verse at a tier: hand-authored for that tier where it exists (Medium's BG 2.48 is
 * the Sanskrit verse), else hand-authored for every tier, else generated from the verse's parts.
 */
export function getJourneyContent(lesson: Lesson, seed: number, tier: DifficultyTier = 'beginner'): JourneyContent {
  return TIER_JOURNEY_OVERRIDES[tier]?.[lesson.id] ?? JOURNEY_OVERRIDES[lesson.id] ?? generateJourney(lesson, seed);
}

/**
 * Names which version of a verse's content a tier plays: the tier's own (tiers sharing one content share its
 * variant, so a checkpoint carries across them), or 'base' (every tier without one). A checkpoint is only resumable
 * under the variant it was saved with.
 */
export function journeyVariantFor(lessonId: string, tier: DifficultyTier): string {
  const own = TIER_JOURNEY_OVERRIDES[tier]?.[lessonId];
  return own ? (own.variant ?? tier) : 'base';
}

/** Every word across both halves, once each. */
export const journeyPool = (content: JourneyContent): JourneyWord[] => allHalfWords(content);
