import type { HindiText } from './gitaData';
import type { TierScriptMode } from '../state/gameState.svelte';

export interface HindiToken {
  dev: string;
  roman: string;
}

/** The text of a Hindi word, phrase or verse in the script the learner's tier calls for. */
export function scriptText(h: HindiText, mode: TierScriptMode): string {
  return mode === 'roman_hindi' ? h.roman : h.dev;
}

/** A verse or part's Hindi, as a HindiText pair. */
export function hindiOf(e: { hindiTranslationDevanagari: string; hindiTranslationRoman: string }): HindiText {
  return { dev: e.hindiTranslationDevanagari, roman: e.hindiTranslationRoman };
}

/** Pairs each Devanagari word with its romanization by position (the two are parallel by construction). */
export function hindiTokens(h: HindiText): HindiToken[] {
  const dev = h.dev.split(/\s+/).filter(Boolean);
  const roman = h.roman.split(/\s+/).filter(Boolean);
  return dev.map((d, i) => ({ dev: d, roman: roman[i] ?? d }));
}

/** Lowercase Roman text with its diacritics folded away, so IAST Sanskrit and plain Roman agree (karmāṇi → karmani). */
export const foldRoman = (s: string): string => s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');

/** Glossary / memory key for a romanized word: lowercase letters only ("hai," → "hai", "karmāṇi" → "karmani"). */
export const wordKey = (token: string): string => foldRoman(token).replace(/[^a-z]/g, '');

/** The glossary keys of every word in a romanized phrase. */
export const romanWords = (text: string): string[] => text.split(/\s+/).map(wordKey).filter(Boolean);
