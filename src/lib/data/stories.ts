import type { Section } from './gitaData';

/**
 * The unit-completion reward: a short narrated, illustrated retelling of what the
 * learner just studied. Scenes are generated from the section's own lessons (one
 * scene per lesson, in order) rather than hand-authored per unit, so a new chapter
 * gets a working story automatically — only `Lesson.storyCaption` needs writing for
 * best quality; lessons without one fall back to their `translation`.
 */
export type IllustrationKey = 'battlefield' | 'teaching' | 'balance' | 'discipline' | 'peace';

// The narrative arc a unit's scenes cycle through: conflict -> teaching -> reflection
// -> resolve -> peace. A unit with more lessons repeats the cycle rather than running out.
const ARC: IllustrationKey[] = ['battlefield', 'teaching', 'balance', 'discipline', 'peace'];

export interface StoryScene {
  illustration: IllustrationKey;
  caption: string;
  verseRef: string;
}

export interface UnitStory {
  sectionId: string;
  title: string;
  scenes: StoryScene[];
}

export function storyForSection(section: Section): UnitStory {
  return {
    sectionId: section.id,
    title: `The Story of ${section.title}`,
    scenes: section.lessons.map((lesson, i) => ({
      illustration: ARC[i % ARC.length],
      caption: lesson.storyCaption ?? lesson.translation,
      verseRef: lesson.verseRef
    }))
  };
}
