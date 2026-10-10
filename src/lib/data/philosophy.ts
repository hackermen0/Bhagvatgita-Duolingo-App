// Philosophy mode has its own path: Chapter 1 (the story before the Gita, then BG 1.1–1.5, from the philosophy
// doc, see philosophyChapter1.ts) followed by the Chapter 2 verses the normal mode teaches. A verse is a short
// session: an optional backstory (a video, or narrated scenes), the verse with its meaning on one page, then
// multiple-choice questions on what it means and how it applies.
//
// The Chapter 2 backstories and questions below were written by Claude and have not been reviewed by a Gita
// scholar. Review before release, like the glosses in gitaData.ts.

import { gitaData, type Chapter, type Commentary, type HindiText, type Lesson, type MCQOption } from './gitaData';
import { hindiOf } from './hindi';
import type { LearningMode } from './onboarding';
import type { IllustrationKey } from './stories';
import { CHAPTER_1_VERSES, PRELUDE_PAGES } from './philosophyChapter1';

// ─── The story before the Gita ──────────────────────────────────────────────
// Inline text may use **bold** and *italic*.

/** A paragraph, a line of Sanskrit (shown in Roman, spoken from its Devanagari), or a narrator's pause */
export type StoryPara = string | { sanskrit: string; dev: string } | { pause: true };

export interface StorySection {
  /** "The story", "The modern mirror", … */
  heading?: string;
  /** mirror sections are set apart, as the present-day reflection of the story */
  tone?: 'story' | 'mirror';
  paragraphs: StoryPara[];
}

export interface StoryPage {
  /** Small line above the title: "Opening", "Part 3", … */
  kicker: string;
  title: string;
  sections: StorySection[];
}

/**
 * A recorded backstory video. `file` plays from `static/` (e.g. `/videos/bg2-47.mp4`) or any URL;
 * `youtube` embeds by video id. A verse without one plays its narrated scenes instead.
 */
export type BackstoryVideo =
  | { kind: 'file'; src: string; poster?: string }
  | { kind: 'youtube'; id: string };

/** One beat of the backstory: an illustration and the line narrated over it. */
export interface BackstoryScene {
  illustration: IllustrationKey;
  text: string;
}

/** meaning: what the verse says · context: the story around it · apply: using it in life */
export type PhilosophyQuestionKind = 'meaning' | 'context' | 'apply';

/**
 * A quiz question. Chapter 2's are written as the answer plus wrong options, shuffled when asked; Chapter 1's keep
 * the doc's fixed A–D order with the index of the right one.
 */
export type PhilosophyQuestion = { id: string; kind?: PhilosophyQuestionKind; prompt: string; explanation: string } & (
  | { answer: string; wrong: string[] }
  | { options: string[]; correct: number }
);

/** The question's options as the multiple-choice exercise takes them: Chapter 2's shuffled, Chapter 1's in the doc's order */
export function questionOptions(q: PhilosophyQuestion): MCQOption[] {
  if ('options' in q) return q.options.map((text, i) => ({ text, isCorrect: i === q.correct, explanation: q.explanation }));
  const options = [q.answer, ...q.wrong].map((text, i) => ({ text, isCorrect: i === 0, explanation: q.explanation }));
  for (let i = options.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [options[i], options[j]] = [options[j], options[i]];
  }
  return options;
}

export function correctAnswer(q: PhilosophyQuestion): string {
  return 'options' in q ? q.options[q.correct] : q.answer;
}

/** A Chapter 2 verse's backstory and questions; the verse itself comes from gitaData */
export interface PhilosophyContent {
  /** Title of the backstory page */
  backstoryTitle: string;
  video?: BackstoryVideo;
  /** Narrated when there is no video, and the transcript when there is */
  scenes: BackstoryScene[];
  questions: PhilosophyQuestion[];
}

/** What the backstory player needs */
export type Backstory = Pick<PhilosophyContent, 'backstoryTitle' | 'video' | 'scenes'>;

/** A verse written only for philosophy mode (Chapter 1): everything the session shows is here */
export interface PhilosophyVerse {
  id: string;
  verseRef: string;
  title: string;
  /** The Sanskrit: `roman` is the IAST shown on Beginner and Medium, `dev` is shown on Hard and always spoken */
  sanskrit: HindiText;
  english: string;
  /** "The philosophy": titled reflections, each one or more paragraphs (split on newlines) */
  sections: { heading: string; text: string }[];
  questions: PhilosophyQuestion[];
  /** A backstory video or narrated scenes, if the verse gets one later */
  backstory?: Backstory;
}

const PHILOSOPHY: Record<string, PhilosophyContent> = {
  // ─── Unit 1: Duty and Right Action ────────────────────────────────────────
  ch2_sec1_l1: {
    backstoryTitle: 'The fear of results',
    scenes: [
      {
        illustration: 'battlefield',
        text: 'Arjuna had laid down his bow. He feared what this war would bring: his family dead, the sin of killing them, and a kingdom won through grief.'
      },
      {
        illustration: 'teaching',
        text: 'Krishna had already taught him that the self is eternal. Now he turned to action itself: how can a person do their duty without being crushed by its results?'
      },
      {
        illustration: 'discipline',
        text: 'His answer became one of the most famous verses ever spoken. Your right is to the action, never to its fruit.'
      }
    ],
    questions: [
      {
        id: 'ph247_1',
        kind: 'meaning',
        prompt: 'According to this verse, what do you have a right to?',
        answer: 'Your actions: doing your duty',
        wrong: ['The results of your actions', 'Neither action nor its results'],
        explanation: 'The verse says your right is to the action alone, never to its fruits.'
      },
      {
        id: 'ph247_2',
        kind: 'meaning',
        prompt: 'What does the verse warn against at its end?',
        answer: 'Being attached to not acting at all',
        wrong: ['Working too hard', 'Thinking about your duty'],
        explanation: 'Letting go of results is not a reason to stop acting. Krishna warns Arjuna against clinging to inaction.'
      },
      {
        id: 'ph247_3',
        kind: 'context',
        prompt: 'What was Arjuna struggling with when Krishna said this?',
        answer: 'He feared the results of fighting, so he wanted to stop acting',
        wrong: ['He did not know how to use his bow', 'He wanted a bigger reward for fighting'],
        explanation: 'Fear of the outcome had frozen Arjuna. The verse separates the action, which is his, from the result, which is not.'
      },
      {
        id: 'ph247_4',
        kind: 'apply',
        prompt: 'A student is preparing for an exam. Which attitude matches this verse?',
        answer: 'Study with full effort, and accept the result calmly',
        wrong: ["Don't study, since the result isn't in your control", 'Only study if a top grade is guaranteed'],
        explanation: 'Give the action everything, and let go of the anxiety about its fruit. Giving up the effort is exactly what the verse warns against.'
      }
    ]
  },

  ch2_sec1_l2: {
    backstoryTitle: 'A mind like a balanced scale',
    scenes: [
      {
        illustration: 'teaching',
        text: "Krishna had told Arjuna that his right is to action, not to its fruits. But Arjuna's mind still swung between hope of winning and fear of losing."
      },
      {
        illustration: 'balance',
        text: 'So Krishna described the state of mind to act from: steady, like a scale that stays level whether victory or defeat is placed on it.'
      },
      {
        illustration: 'teaching',
        text: 'He gave that steadiness a name. Evenness of mind, he said, is Yoga.'
      }
    ],
    questions: [
      {
        id: 'ph248_1',
        kind: 'meaning',
        prompt: 'What does this verse call Yoga?',
        answer: 'Evenness of mind in success and failure',
        wrong: ['Holding difficult body postures', 'Winning every battle'],
        explanation: 'Samatvam yoga uchyate: equanimity is called Yoga.'
      },
      {
        id: 'ph248_2',
        kind: 'meaning',
        prompt: 'What should Arjuna give up while acting?',
        answer: 'Attachment to success or failure',
        wrong: ['His duty', 'All effort'],
        explanation: 'He keeps acting, fully. What he drops is the attachment to how it turns out.'
      },
      {
        id: 'ph248_3',
        kind: 'context',
        prompt: 'Which teaching does this verse build on?',
        answer: 'That we have a right to action, not to its results',
        wrong: ['That the war was already lost', 'That Arjuna should leave the battlefield'],
        explanation: 'BG 2.47 separates action from its fruit. BG 2.48 describes the steady mind that comes from living that way.'
      },
      {
        id: 'ph248_4',
        kind: 'apply',
        prompt: 'Your team loses a match you played well in. What would this verse suggest?',
        answer: "Stay steady: you did your part, and the result doesn't shake you",
        wrong: ["Quit, since effort doesn't guarantee a win", 'Blame your teammates so you feel better'],
        explanation: 'Equanimity means the result, good or bad, does not throw the mind off balance.'
      }
    ]
  },

  ch2_sec1_l3: {
    backstoryTitle: 'What really binds us',
    scenes: [
      {
        illustration: 'battlefield',
        text: 'Arjuna worried that fighting would bind him with sin, and that the good and bad of his deeds would follow him forever.'
      },
      {
        illustration: 'discipline',
        text: 'Krishna explained that it is not action itself that binds a person, but the selfish craving behind it.'
      },
      {
        illustration: 'teaching',
        text: 'One whose understanding is steady acts freely. And Krishna gave a definition still quoted today: Yoga is skill in action.'
      }
    ],
    questions: [
      {
        id: 'ph250_1',
        kind: 'meaning',
        prompt: 'How does this verse define Yoga?',
        answer: 'Skill in action',
        wrong: ['Giving up all action', 'Living alone in a forest'],
        explanation: 'Yogah karmasu kaushalam: Yoga is skill in action.'
      },
      {
        id: 'ph250_2',
        kind: 'meaning',
        prompt: 'What does a person of steady wisdom leave behind, even in this life?',
        answer: 'The binding effects of both good and bad deeds',
        wrong: ['Only their bad deeds', 'Their family and duties'],
        explanation: 'Acting without selfish craving frees a person from both kinds of karma, the good and the bad.'
      },
      {
        id: 'ph250_3',
        kind: 'context',
        prompt: 'Which worry of Arjuna does this verse answer?',
        answer: 'That his actions in the war would bind him with sin',
        wrong: ['That he was not skilled with the bow', 'That the war would last too long'],
        explanation: 'Krishna shows that it is selfish desire, not action itself, that binds.'
      },
      {
        id: 'ph250_4',
        kind: 'apply',
        prompt: 'Which is closest to "skill in action" as this verse means it?',
        answer: 'Doing your work well, with a clear mind and no craving for reward',
        wrong: ['Being the fastest at every task', 'Avoiding difficult work'],
        explanation: 'The skill is inner as much as outer: full attention to the work, free of the craving that binds.'
      }
    ]
  },

  ch2_sec1_l4: {
    backstoryTitle: 'The one of steady wisdom',
    scenes: [
      {
        illustration: 'teaching',
        text: "Arjuna had one more question. 'Krishna, what is a person of steady wisdom like? How do they speak, how do they sit, how do they walk?'"
      },
      {
        illustration: 'discipline',
        text: "Krishna described someone whose mind does not chase every desire, who draws the senses in the way a tortoise draws in its limbs."
      },
      {
        illustration: 'peace',
        text: "Near the end of the chapter he summed it up. Peace comes to the one who lets go of craving, of the sense of 'mine', and of ego."
      }
    ],
    questions: [
      {
        id: 'ph271_1',
        kind: 'meaning',
        prompt: 'According to the verse, who attains real peace?',
        answer: 'One who gives up craving, possessiveness and ego',
        wrong: ['One who gets everything they desire', 'One who owns the most'],
        explanation: 'Peace comes from letting go: of desires, of "mine" (nirmamah) and of ego (nirahankarah).'
      },
      {
        id: 'ph271_2',
        kind: 'meaning',
        prompt: 'What does being free of the sense of "mine" mean here?',
        answer: 'Not clinging to things and people as possessions',
        wrong: ['Giving away everything you own', 'Not caring about anyone'],
        explanation: 'It is about the grip of possessiveness, not about owning nothing or caring for no one.'
      },
      {
        id: 'ph271_3',
        kind: 'context',
        prompt: 'This verse is part of Krishna\'s answer to which question?',
        answer: 'What is a person of steady wisdom like?',
        wrong: ['How can I win the war?', 'Who is the strongest warrior?'],
        explanation: 'Arjuna asked about the sthita-prajna, the one of steady wisdom. This verse closes Krishna\'s description.'
      },
      {
        id: 'ph271_4',
        kind: 'apply',
        prompt: "A friend can't stop comparing their phone with everyone else's. What would this verse suggest?",
        answer: 'Peace comes from letting go of craving, not from getting the next thing',
        wrong: ['Buy the newest phone, then you will feel at peace', 'Keep comparing until you have the best one'],
        explanation: 'Each desire met makes room for the next. The verse places peace in letting craving go.'
      }
    ]
  },

  // ─── Unit 2: The Eternal Self ─────────────────────────────────────────────
  ch2_sec2_l1: {
    backstoryTitle: 'Arjuna puts down his bow',
    scenes: [
      {
        illustration: 'battlefield',
        text: 'On the field of Kurukshetra two great armies stood ready. Arjuna asked Krishna, his charioteer, to drive between them so he could see who he would fight.'
      },
      {
        illustration: 'battlefield',
        text: "Across the field he saw his grandfather Bhishma and his teacher Drona. Overcome with grief, he let his bow slip from his hands. 'I will not fight,' he said."
      },
      {
        illustration: 'teaching',
        text: "Krishna smiled. 'You grieve for those who should not be grieved for. The wise mourn neither the living nor the dead.'"
      },
      {
        illustration: 'teaching',
        text: 'To show why, he began with something Arjuna already knew: his body had grown from a child\'s into a man\'s, and yet he was still Arjuna.'
      }
    ],
    questions: [
      {
        id: 'ph213_1',
        kind: 'meaning',
        prompt: 'What passes from childhood to youth to old age, according to this verse?',
        answer: 'The embodied soul, the self living in the body',
        wrong: ['The mind, which forgets its past', 'Only the body; nothing else continues'],
        explanation: 'The body changes at every stage, but the one living in it stays the same.'
      },
      {
        id: 'ph213_2',
        kind: 'meaning',
        prompt: 'What does the verse say happens to the soul at death?',
        answer: 'It passes into another body',
        wrong: ['It ends along with the body', 'It stays with the old body'],
        explanation: 'Death is one more change of body, like the change from youth to old age.'
      },
      {
        id: 'ph213_3',
        kind: 'context',
        prompt: 'Why did Krishna begin teaching Arjuna about the soul?',
        answer: 'Arjuna was grieving at having to fight his elders and teachers',
        wrong: ['Arjuna asked how to win the war quickly', 'Arjuna wanted to become king'],
        explanation: 'Seeing Bhishma and Drona across the field, Arjuna refused to fight. Krishna\'s teaching begins with that grief.'
      },
      {
        id: 'ph213_4',
        kind: 'apply',
        prompt: 'A friend is upset about growing older. Which response reflects this verse?',
        answer: "You were a child, then a teenager, and you're still you. The body changes; you don't",
        wrong: ['Ageing is the end of who you are', "Just don't think about it"],
        explanation: 'We already accept the body changing through life. The verse asks us to see the self as what stays.'
      }
    ]
  },

  ch2_sec2_l2: {
    backstoryTitle: 'Who kills, and who is killed?',
    scenes: [
      {
        illustration: 'battlefield',
        text: "Arjuna's deepest fear was simple: if he fought, he would be the one who killed Bhishma and Drona."
      },
      {
        illustration: 'teaching',
        text: "Krishna answered that fear directly. 'One who thinks the self kills, and one who thinks it is killed, neither understands. The self does not kill, and it is not killed.'"
      },
      {
        illustration: 'peace',
        text: 'Then he described what the self truly is: never born, never dying, always existing.'
      }
    ],
    questions: [
      {
        id: 'ph220_1',
        kind: 'meaning',
        prompt: 'According to this verse, when was the soul born?',
        answer: 'Never: it is unborn',
        wrong: ['When its body was born', 'At the beginning of time'],
        explanation: 'The soul has not come into being, does not, and will not. It is unborn and eternal.'
      },
      {
        id: 'ph220_2',
        kind: 'meaning',
        prompt: 'What happens to the soul when the body is slain?',
        answer: 'It is not slain',
        wrong: ['It is slain with the body', 'It sleeps until the body is reborn'],
        explanation: 'Only the body dies. The one who lived in it is never destroyed.'
      },
      {
        id: 'ph220_3',
        kind: 'context',
        prompt: 'Which fear of Arjuna does this verse answer?',
        answer: 'That he would be the one who killed his elders',
        wrong: ['That he would lose his kingdom', 'That Krishna would leave him'],
        explanation: 'Krishna says the self neither kills nor is killed, so Arjuna\'s grief rests on a mistaken view of who his elders are.'
      },
      {
        id: 'ph220_4',
        kind: 'apply',
        prompt: 'Someone says, "When a person dies, nothing of them remains." How would this verse respond?',
        answer: 'Only the body dies; the self within it is never destroyed',
        wrong: ['That is right, nothing remains', 'Only good people survive death'],
        explanation: 'The verse is direct: the self is not slain when the body is slain.'
      }
    ]
  },

  ch2_sec2_l3: {
    backstoryTitle: 'A picture anyone can understand',
    scenes: [
      {
        illustration: 'teaching',
        text: 'Krishna had told Arjuna that the self is never born and never dies. But Arjuna could still see the bodies that would fall in battle.'
      },
      {
        illustration: 'teaching',
        text: 'So Krishna gave him a picture anyone could understand, taken from something every person does.'
      },
      {
        illustration: 'balance',
        text: "When clothes grow old and torn, we put them aside and wear new ones. We don't grieve the old shirt, because we know we are not the shirt."
      }
    ],
    questions: [
      {
        id: 'ph222_1',
        kind: 'meaning',
        prompt: 'In this verse, what are worn-out garments compared to?',
        answer: 'Worn-out bodies',
        wrong: ['Old habits', 'Past mistakes'],
        explanation: 'As we change old clothes for new ones, the soul leaves worn-out bodies and takes on new ones.'
      },
      {
        id: 'ph222_2',
        kind: 'meaning',
        prompt: 'Who changes bodies, like a person changing clothes?',
        answer: 'The embodied soul',
        wrong: ['Krishna', 'The body itself'],
        explanation: 'The self is the wearer; the body is what is worn.'
      },
      {
        id: 'ph222_3',
        kind: 'context',
        prompt: 'Why does Krishna use the image of changing clothes?',
        answer: 'To make the soul changing bodies easy to picture',
        wrong: ['To tell Arjuna how to dress for battle', 'To show that bodies are not worth caring for'],
        explanation: 'After abstract teaching, Krishna gives Arjuna an everyday image he cannot miss.'
      },
      {
        id: 'ph222_4',
        kind: 'apply',
        prompt: 'How might this verse change the way you see your body?',
        answer: 'As something I wear and care for, but not all of who I am',
        wrong: ['As worthless, so it can be ignored', 'As the only thing I really am'],
        explanation: 'We look after good clothes, but we never mistake them for ourselves.'
      }
    ]
  },

  ch2_sec2_l4: {
    backstoryTitle: 'Beyond the reach of weapons',
    scenes: [
      {
        illustration: 'battlefield',
        text: 'Arjuna stood among arrows, swords and spears, the very weapons he feared turning on his own family.'
      },
      {
        illustration: 'teaching',
        text: "Krishna pointed to those very things. 'Weapons cannot cut the self,' he said. 'Fire cannot burn it, water cannot wet it, and wind cannot dry it.'"
      },
      {
        illustration: 'peace',
        text: 'What can destroy a body cannot even touch the one who lives in it.'
      }
    ],
    questions: [
      {
        id: 'ph223_1',
        kind: 'meaning',
        prompt: 'Which of these does the verse say cannot harm the soul?',
        answer: 'Weapons, fire, water and wind',
        wrong: ['Only weapons', 'Only fire and water'],
        explanation: 'Blade, flame, water and wind: nothing in the physical world can reach the self.'
      },
      {
        id: 'ph223_2',
        kind: 'meaning',
        prompt: 'The verse says wind cannot ___ the soul.',
        answer: 'dry',
        wrong: ['cut', 'burn'],
        explanation: 'Weapons cannot cut it, fire cannot burn it, water cannot wet it, wind cannot dry it.'
      },
      {
        id: 'ph223_3',
        kind: 'context',
        prompt: 'Why does Krishna name weapons in particular?',
        answer: 'Arjuna feared what weapons would do to his family',
        wrong: ['He wanted Arjuna to give up weapons forever', 'Weapons were the only danger in the war'],
        explanation: 'Arjuna\'s fear was of what weapons can do. The verse says they cannot touch what a person truly is.'
      },
      {
        id: 'ph223_4',
        kind: 'apply',
        prompt: 'What is the main idea of this verse?',
        answer: 'The true self is beyond the reach of anything physical',
        wrong: ['The soul is strong, so it wins every fight', 'We never need to fear fire or water'],
        explanation: 'The body still needs care and protection. The point is that the self is not the kind of thing that can be harmed.'
      }
    ]
  }
};

// ─── The philosophy path ────────────────────────────────────────────────────

/** The first node of Chapter 1: the story before the Gita */
export const PRELUDE_ID = 'ph_prelude';
export const PRELUDE_TITLE = 'The Story Before the Gita';
export { PRELUDE_PAGES };

/** Sections only philosophy mode has: no guidebook and no word review, since they teach no words */
const PHILOSOPHY_ONLY_SECTIONS = new Set(['ph_ch1_sec1']);
export const isPhilosophyOnlySection = (sectionId: string): boolean => PHILOSOPHY_ONLY_SECTIONS.has(sectionId);

// The path is drawn from Chapter/Section/Lesson, so the philosophy-only nodes get minimal Lesson records. Their
// content lives in PRELUDE_PAGES and CHAPTER_1_VERSES; nothing reads their word fields.
const stubLesson = (id: string, title: string, verseRef: string, translation: string): Lesson => ({
  id,
  title,
  verseRef,
  translation,
  purport: '',
  hindiTranslationDevanagari: '',
  hindiTranslationRoman: '',
  wordBreakdown: [],
  questions: []
});

const PHILOSOPHY_CHAPTERS: Chapter[] = [
  {
    id: 'ph_ch1',
    number: 1,
    title: 'Arjuna Vishada Yoga',
    summary: "The Yoga of Arjuna's Despair",
    sections: [
      {
        id: 'ph_ch1_sec1',
        title: 'The Armies Gather',
        lessons: [
          stubLesson(PRELUDE_ID, PRELUDE_TITLE, 'Before 1.1', ''),
          ...CHAPTER_1_VERSES.map((v) => stubLesson(v.id, v.title, v.verseRef, v.english))
        ]
      }
    ]
  },
  ...gitaData.chapters
];

/** The chapters a mode's path shows: philosophy mode adds Chapter 1 before the verses the normal mode teaches */
export const pathChaptersFor = (mode: LearningMode): Chapter[] => (mode === 'philosophy' ? PHILOSOPHY_CHAPTERS : gitaData.chapters);

/** Any lesson on either path, by id */
export function findLesson(lessonId: string): Lesson | undefined {
  return PHILOSOPHY_CHAPTERS.flatMap((c) => c.sections.flatMap((s) => s.lessons)).find((l) => l.id === lessonId);
}

// ─── A verse's session ──────────────────────────────────────────────────────

/** Everything the philosophy screen shows for one verse, whichever chapter it comes from */
export interface PhilosophySession {
  id: string;
  verseRef: string;
  title: string;
  essence?: string;
  /** The verse itself: the Sanskrit (Chapter 1) or its Hindi translation (Chapter 2) */
  verse: { language: 'sanskrit' | 'hindi'; text: HindiText };
  english: string;
  /** Titled explanations: "The philosophy" (Chapter 1) or "What it means" (Chapter 2) */
  sectionsTitle: string;
  sections: { heading: string; text: string }[];
  commentary?: Commentary;
  backstory?: Backstory;
  questions: PhilosophyQuestion[];
}

/** The philosophy session for a verse, or undefined when that verse has none written yet. */
export function philosophySession(lessonId: string): PhilosophySession | undefined {
  const v = CHAPTER_1_VERSES.find((x) => x.id === lessonId);
  if (v) {
    return {
      id: v.id,
      verseRef: v.verseRef,
      title: v.title,
      verse: { language: 'sanskrit', text: v.sanskrit },
      english: v.english,
      sectionsTitle: 'The philosophy',
      sections: v.sections,
      backstory: v.backstory,
      questions: v.questions
    };
  }
  const content = PHILOSOPHY[lessonId];
  const lesson = gitaData.chapters.flatMap((c) => c.sections.flatMap((s) => s.lessons)).find((l) => l.id === lessonId);
  if (!content || !lesson) return undefined;
  return {
    id: lesson.id,
    verseRef: lesson.verseRef,
    title: lesson.title,
    essence: lesson.essence,
    verse: { language: 'hindi', text: hindiOf(lesson) },
    english: lesson.translation,
    sectionsTitle: 'What it means',
    sections: [{ heading: '', text: lesson.purport }],
    commentary: lesson.commentary,
    backstory: { backstoryTitle: content.backstoryTitle, video: content.video, scenes: content.scenes },
    questions: content.questions
  };
}

/** One line for a path node's popover: what the session holds */
export function philosophySummary(lessonId: string): string {
  if (lessonId === PRELUDE_ID) return `${PRELUDE_PAGES.length} short story pages · read or listen`;
  const s = philosophySession(lessonId);
  if (!s) return 'Coming soon';
  const quiz = `${s.questions.length} questions`;
  return s.backstory ? `Story video · verse · ${quiz}` : `Verse · philosophy · ${quiz}`;
}
