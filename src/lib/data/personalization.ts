import type { Lesson, Question, WordMeaning } from './gitaData';
import { allLessons, lessonWords } from './practice';

export interface JumpTest {
  lesson: Lesson;
  skippedLessonIds: string[];
}

/**
 * Duolingo's "Jump here?": one test covering every incomplete lesson before the target.
 * Draws each skipped lesson's final-stage exercises plus the closing exercise of each part.
 */
export function buildJumpTest(targetId: string, completed: string[]): JumpTest | null {
  const targetIdx = allLessons.findIndex((l) => l.id === targetId);
  if (targetIdx <= 0) return null;
  const target = allLessons[targetIdx];
  const skipped = allLessons.slice(0, targetIdx).filter((l) => !completed.includes(l.id));
  if (skipped.length === 0) return null;

  const testable = (q: Question) => q.type !== 'reflection' && !q.warmup;
  const questions: Question[] = [];
  for (const l of skipped) {
    const partFinals = (l.parts ?? [])
      .map((p) => [...p.questions].reverse().find(testable))
      .filter((q): q is Question => !!q);
    const finals = (l.finalSynthesisQuestions ?? []).filter(testable);
    for (const q of [...partFinals, ...finals]) {
      if (!questions.some((existing) => existing.id === q.id)) questions.push(q);
    }
  }

  const words = new Map<string, WordMeaning>();
  for (const l of skipped) for (const w of lessonWords(l)) if (!words.has(w.word)) words.set(w.word, w);

  return {
    skippedLessonIds: skipped.map((l) => l.id),
    lesson: {
      id: `jump_${targetId}`,
      title: `Jump to ${target.verseRef}`,
      verseRef: target.verseRef,
      hindiTranslationDevanagari: '',
      hindiTranslationRoman: '',
      translation: '',
      purport: 'Show what you already know to skip ahead.',
      wordBreakdown: [...words.values()],
      questions: [],
      parts: [],
      finalSynthesisQuestions: questions
    }
  };
}
