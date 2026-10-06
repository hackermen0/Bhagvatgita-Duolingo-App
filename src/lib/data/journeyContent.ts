// Hand-authored journey content, keyed by lesson id. A verse without an entry here has its journey
// generated from its parts (see generateJourney in journey.ts), so any verse can be overridden later.

import type { JourneyContent } from './journey';

const bg248: JourneyContent = {
  verseHindi: {
    dev: 'हे धनञ्जय! तुम आसक्ति को त्याग कर तथा योग में स्थित होकर अपने कर्तव्य का पालन करो,\nऔर सफलता तथा असफलता में एक समान रहो। यह समभाव ही योग कहलाता है।',
    roman: 'He Dhananjaya! Tum aasakti ko tyag kar tatha yog mein sthit hokar apne kartavya ka palan karo,\naur safalta tatha asafalta mein ek saman raho. Yeh samabhav hi yog kehlata hai.'
  },
  verseEnglish:
    'O Dhananjaya, abandon all attachment and perform your duty while being established in yoga, and remain equal in both success and failure. This equanimity is called yoga.',
  deeperMeaning: [
    'Bhagavad Gita Verse 2.48 teaches the art of selfless action (Nishkama Karma) by advising us to anchor our minds in Yoga (spiritual oneness) before acting. By consciously detaching from personal cravings (aasakti) and anxiety over the final outcome, we free ourselves from mental turbulence.',
    'The core message is to maintain equanimity (samabhav) — treating both success and failure with an identical, calm mindset. When you stop letting external results dictate your internal happiness, your daily work itself becomes a form of peaceful meditation.'
  ],
  halves: [
    {
      hindi: {
        dev: 'हे धनञ्जय! तुम आसक्ति को त्याग कर तथा योग में स्थित होकर अपने कर्तव्य का पालन करो,',
        roman: 'He Dhananjaya! Tum aasakti ko tyag kar tatha yog mein sthit hokar apne kartavya ka palan karo,'
      },
      english: 'O Dhananjaya, abandon all attachment and perform your duty while being established in yoga,',
      phrases: [
        { hindi: { dev: 'हे धनञ्जय!', roman: 'He Dhananjaya!' }, english: 'O Dhananjaya!' },
        { hindi: { dev: 'तुम आसक्ति को त्याग कर', roman: 'Tum aasakti ko tyag kar' }, english: 'abandon all attachment' },
        { hindi: { dev: 'तथा योग में स्थित होकर', roman: 'tatha yog mein sthit hokar' }, english: 'while being established in yoga' },
        { hindi: { dev: 'अपने कर्तव्य का पालन करो', roman: 'apne kartavya ka palan karo' }, english: 'and perform your duty' }
      ],
      words: [
        { key: 'he', hindi: { dev: 'हे', roman: 'He' }, english: 'O / Hey', kind: 'grammar' },
        { key: 'dhananjaya', hindi: { dev: 'धनञ्जय', roman: 'Dhananjaya' }, english: 'Dhananjaya (Arjuna)', kind: 'noun', note: 'Another name of Arjuna. It means “winner of wealth”.' },
        { key: 'tum', hindi: { dev: 'तुम', roman: 'Tum' }, english: 'you', kind: 'grammar' },
        { key: 'aasakti', hindi: { dev: 'आसक्ति', roman: 'aasakti' }, english: 'attachment', kind: 'noun' },
        { key: 'tyagkar', hindi: { dev: 'त्याग कर', roman: 'tyag kar' }, english: 'abandoning / leaving', kind: 'other' },
        { key: 'tatha', hindi: { dev: 'तथा', roman: 'tatha' }, english: 'as well as', kind: 'grammar' },
        { key: 'yog', hindi: { dev: 'योग', roman: 'yog' }, english: 'yoga', kind: 'noun', note: 'In this verse, yog means equanimity.' },
        { key: 'mein', hindi: { dev: 'में', roman: 'mein' }, english: 'in', kind: 'grammar' },
        { key: 'sthithokar', hindi: { dev: 'स्थित होकर', roman: 'sthit hokar' }, english: 'established / steady', kind: 'other' },
        { key: 'apne', hindi: { dev: 'अपने', roman: 'apne' }, english: 'your own', kind: 'grammar' },
        { key: 'kartavya', hindi: { dev: 'कर्तव्य', roman: 'kartavya' }, english: 'duty', kind: 'noun' },
        { key: 'palankaro', hindi: { dev: 'पालन करो', roman: 'palan karo' }, english: 'perform / follow', kind: 'other' }
      ]
    },
    {
      hindi: {
        dev: 'और सफलता तथा असफलता में एक समान रहो। यह समभाव ही योग कहलाता है।',
        roman: 'aur safalta tatha asafalta mein ek saman raho. Yeh samabhav hi yog kehlata hai.'
      },
      english: 'and remain equal in both success and failure. This equanimity is called yoga.',
      phrases: [
        { hindi: { dev: 'और सफलता तथा असफलता में', roman: 'aur safalta tatha asafalta mein' }, english: 'and in success as well as failure' },
        { hindi: { dev: 'एक समान रहो', roman: 'ek saman raho' }, english: 'remain equal / unchanged' },
        { hindi: { dev: 'यह समभाव ही', roman: 'Yeh samabhav hi' }, english: 'This equanimity (evenness of mind) indeed' },
        { hindi: { dev: 'योग कहलाता है', roman: 'yog kehlata hai' }, english: 'is called yoga' }
      ],
      words: [
        { key: 'aur', hindi: { dev: 'और', roman: 'aur' }, english: 'and', kind: 'grammar' },
        { key: 'safalta', hindi: { dev: 'सफलता', roman: 'safalta' }, english: 'success', kind: 'noun' },
        { key: 'tatha', hindi: { dev: 'तथा', roman: 'tatha' }, english: 'as well as', kind: 'grammar' },
        { key: 'asafalta', hindi: { dev: 'असफलता', roman: 'asafalta' }, english: 'failure', kind: 'noun' },
        { key: 'mein', hindi: { dev: 'में', roman: 'mein' }, english: 'in', kind: 'grammar' },
        { key: 'eksaman', hindi: { dev: 'एक समान', roman: 'ek saman' }, english: 'equal / same', kind: 'other' },
        { key: 'raho', hindi: { dev: 'रहो', roman: 'raho' }, english: 'remain / stay', kind: 'other' },
        { key: 'yeh', hindi: { dev: 'यह', roman: 'Yeh' }, english: 'this', kind: 'grammar' },
        { key: 'samabhav', hindi: { dev: 'समभाव', roman: 'samabhav' }, english: 'evenness / equanimity', kind: 'noun' },
        { key: 'hi', hindi: { dev: 'ही', roman: 'hi' }, english: 'only / indeed', kind: 'grammar' },
        { key: 'yog', hindi: { dev: 'योग', roman: 'yog' }, english: 'yoga', kind: 'noun' },
        { key: 'kehlatahai', hindi: { dev: 'कहलाता है', roman: 'kehlata hai' }, english: 'is called', kind: 'other' }
      ]
    }
  ],
  wordBlanks: [
    {
      template: 'O Dhananjaya, ___ all attachment and perform your ___ while being ___ in yoga,',
      options: ['abandon', 'duty', 'results', 'equal', 'failure', 'equanimity', 'peace', 'established'],
      answers: ['abandon', 'duty', 'established']
    },
    {
      template: 'and remain ___ in both success and ___. This ___ is called yoga.',
      options: ['equal', 'peace', 'duty', 'failure', 'established', 'results', 'equanimity'],
      answers: ['equal', 'failure', 'equanimity']
    }
  ],
  chunkBlanks: [
    {
      template: 'O Dhananjaya, ___ and perform your duty ___,',
      options: ['abandon all attachment', 'while being established in yoga', 'focus completely', 'remain equal', 'This equanimity'],
      answers: ['abandon all attachment', 'while being established in yoga']
    },
    {
      template: 'and ___ in both success and failure. ___ is called yoga.',
      options: ['abandon all attachment', 'remain equal', 'focus completely', 'This equanimity', 'while being established in yoga', 'work hard'],
      answers: ['remain equal', 'This equanimity']
    }
  ],
  singleBlanks: [
    {
      template: '___ perform your duty while being established in yoga,',
      options: ['O Dhananjaya, abandon all attachment and', 'Forget about your work and', 'This equanimity is called yoga'],
      answers: ['O Dhananjaya, abandon all attachment and']
    },
    {
      template: 'and remain equal in both success and failure. ___.',
      options: ['This equanimity is called yoga', 'Forget about your work and', 'You must achieve your goals'],
      answers: ['This equanimity is called yoga']
    }
  ],
  fullBlanks: {
    template:
      'O Dhananjaya, ___ all attachment and perform your ___ while being ___ in yoga, and remain ___ in both ___ and failure. This ___ is called yoga.',
    options: ['success', 'abandon', 'duty', 'equanimity', 'established', 'equal', 'results', 'peace', 'yoga'],
    answers: ['abandon', 'duty', 'established', 'equal', 'success', 'equanimity']
  },
  reflectionPrompt:
    'Recall a recent situation where an unexpected outcome disturbed your peace. How could practicing "samatvam" (evenness of mind) help you respond differently next time?'
};

export const JOURNEY_OVERRIDES: Record<string, JourneyContent> = {
  ch2_sec1_l2: bg248
};
