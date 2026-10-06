import type { Lesson, Question, WordMeaning } from './gitaData';
import type { LearningConfig } from './learningConfig';
import { allLessons, lessonWords, listeningQuestion, reverseQuestion, shuffle, wordMatchingQuestion } from './practice';

const pickOne = <T>(items: T[]): T | undefined => items[Math.floor(Math.random() * items.length)];

/**
 * Returns a copy of a curriculum lesson adjusted to the learner. The authored content is
 * never mutated; this only removes steps the learner doesn't need and adds generated ones:
 * - listening-focused learners get a "tap what you hear" exercise after each part
 * - everyone else with listening on gets one in the final stage
 * - Deep-plan learners get extra recall exercises at the end
 * - Hard-tier learners close each verse with a vocabulary word-matching round and recall exercises
 * - meaning-focused learners get the lesson's reflection prompt if it has none
 */
export function personalizeLesson(lesson: Lesson, cfg: LearningConfig, opts: { speech: boolean }): Lesson {
  const pool = lessonWords(lesson);
  const canListen = opts.speech && cfg.listening !== 'none';
  const listenedWords = new Set<string>();

  const parts = (lesson.parts ?? []).map((part, pi) => {
    let questions = part.questions;
    if (canListen && cfg.listening === 'heavy') {
      const target = pickOne(part.wordBreakdown);
      if (target) {
        listenedWords.add(target.word);
        questions = [...questions, listeningQuestion(target, `${lesson.id}_p${pi}`, pool)];
      }
    }
    return { ...part, questions };
  });

  const base = lesson.finalSynthesisQuestions?.length ? lesson.finalSynthesisQuestions : lesson.questions;
  const graded = base.filter((q) => q.type !== 'reflection');
  const reflections = base.filter((q) => q.type === 'reflection');
  const extras: Question[] = [];

  const fresh = pool.filter((w) => !listenedWords.has(w.word));
  if (canListen && (cfg.listening === 'light' || cfg.deepRecall)) {
    const target = pickOne(fresh.length ? fresh : pool);
    if (target) extras.push(listeningQuestion(target, `${lesson.id}_syn`, pool));
  }
  if (cfg.vocabDrills && pool.length >= 2) {
    extras.push(wordMatchingQuestion(shuffle(pool).slice(0, 5), `${lesson.id}_vocab`));
  }
  if (cfg.deepRecall || cfg.vocabDrills) {
    for (const [i, w] of shuffle(pool).slice(0, 2).entries()) {
      extras.push(reverseQuestion(w, `${lesson.id}_syn_${i}`, pool));
    }
  }
  if (cfg.meaningFocus && reflections.length === 0 && lesson.reflectionPrompt) {
    reflections.push({
      id: `${lesson.id}_reflection`,
      type: 'reflection',
      prompt: 'Personal Reflection',
      verseContext: `${lesson.verseRef}: "${lesson.translation}"`,
      guidance: lesson.reflectionPrompt
    });
  }

  return { ...lesson, parts, finalSynthesisQuestions: [...graded, ...extras, ...reflections] };
}

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
