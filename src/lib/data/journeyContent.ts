// Hand-authored journey content, keyed by lesson id. A verse without an entry here has its journey
// generated from its parts (see generateJourney in journey.ts), so any verse can be overridden later.

import type { JourneyContent } from './journey';
import type { DifficultyTier } from './onboarding';

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
        { hindi: { dev: 'तथा योग में स्थित होकर', roman: 'tatha yog mein sthit hokar' }, english: 'while being established in yoga (Equanimity)' },
        { hindi: { dev: 'अपने कर्तव्य का पालन करो', roman: 'apne kartavya ka palan karo' }, english: 'and perform your duty' }
      ],
      words: [
        { key: 'he', hindi: { dev: 'हे', roman: 'He' }, english: 'O / Hey', kind: 'grammar' },
        { key: 'dhananjaya', hindi: { dev: 'धनञ्जय', roman: 'Dhananjaya' }, english: 'Dhananjaya (Arjuna)', kind: 'noun', note: 'Another name of Arjuna. It means “winner of wealth”.' },
        { key: 'tum', hindi: { dev: 'तुम', roman: 'Tum' }, english: 'you', kind: 'grammar' },
        { key: 'aasakti', hindi: { dev: 'आसक्ति', roman: 'aasakti' }, english: 'attachment', kind: 'noun' },
        { key: 'tyagkar', hindi: { dev: 'त्याग कर', roman: 'tyag kar' }, english: 'abandoning / leaving', kind: 'other' },
        { key: 'tatha', hindi: { dev: 'तथा', roman: 'tatha' }, english: 'as well as / and', kind: 'grammar' },
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
        { key: 'tatha', hindi: { dev: 'तथा', roman: 'tatha' }, english: 'as well as / and', kind: 'grammar' },
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

// ─── Medium and Hard: BG 2.48 in the original Sanskrit (from the Medium doc) ─
// The field names say "hindi" but hold the Sanskrit here. Medium shows `roman` (the doc's IAST) and Hard shows `dev`
// (Devanagari); the voice always speaks `dev`. Diacritics fold away when matching and typing (see foldRoman). The blanks
// are in Sanskrit with the English as the clue: the Roman set is the base and `dev` is its Devanagari twin (same
// order), and each answer lists the word keys behind it for the re-exam. The doc's "siddhyi" is read as "siddhy", the
// form it takes inside the compound siddhy-asiddhyoḥ.
const bg248Sanskrit: JourneyContent = {
  language: 'sanskrit',
  variant: 'sanskrit',
  blankClue: 'english',
  // Page 13 shows the text, 14 plays the opposite language as the clue, 15 plays the clue for the whole verse
  recitalClues: ['text', 'opposite-audio', 'audio'],
  verseHindi: {
    dev: 'योगस्थः कुरु कर्माणि सङ्गं त्यक्त्वा धनञ्जय।\nसिद्ध्यसिद्ध्योः समो भूत्वा समत्वं योग उच्यते॥',
    roman: 'yoga-sthaḥ kuru karmāṇi saṅgaṁ tyaktvā dhanañjaya\nsiddhy-asiddhyoḥ samo bhūtvā samatvaṁ yoga uchyate'
  },
  verseEnglish:
    'O Dhanañjaya, abandon all attachment and perform your duty while being established in yoga, and remain equal in both success and failure. This equanimity is called yoga.',
  // The explanation names the verse's own words (saṅgaṁ, siddhy-asiddhyoḥ, samatvaṁ) where the Hindi one names aasakti and
  // samabhav: in Roman for Medium and in Devanagari for Hard, as the Hard doc has them
  deeperMeaning: [
    'Bhagavad Gita Verse 2.48 teaches the art of selfless action (Nishkama Karma) by advising us to anchor our minds in Yoga (spiritual oneness) before acting. By consciously detaching from personal cravings (saṅgaṁ) and anxiety over the final outcome (siddhy-asiddhyoḥ), we free ourselves from mental turbulence.',
    'The core message is to maintain equanimity (samatvaṁ) — treating both success and failure with an identical, calm mindset. When you stop letting external results dictate your internal happiness, your daily work itself becomes a form of peaceful meditation.'
  ],
  deeperMeaningDev: [
    'Bhagavad Gita Verse 2.48 teaches the art of selfless action (Nishkama Karma) by advising us to anchor our minds in Yoga (spiritual oneness) before acting. By consciously detaching from personal cravings (सङ्गं) and anxiety over the final outcome (सिद्ध्यसिद्ध्योः), we free ourselves from mental turbulence.',
    'The core message is to maintain equanimity (समत्वं) — treating both success and failure with an identical, calm mindset. When you stop letting external results dictate your internal happiness, your daily work itself becomes a form of peaceful meditation.'
  ],
  halves: [
    {
      hindi: {
        dev: 'योगस्थः कुरु कर्माणि सङ्गं त्यक्त्वा धनञ्जय।',
        roman: 'yoga-sthaḥ kuru karmāṇi saṅgaṁ tyaktvā dhanañjaya'
      },
      english: 'O Dhanañjaya, abandon all attachment and perform your duty while being established in yoga,',
      phrases: [
        { hindi: { dev: 'योगस्थः', roman: 'yoga-sthaḥ' }, english: 'while being established in yoga' },
        { hindi: { dev: 'कुरु कर्माणि', roman: 'kuru karmāṇi' }, english: 'perform your duty' },
        { hindi: { dev: 'सङ्गं त्यक्त्वा', roman: 'saṅgaṁ tyaktvā' }, english: 'abandon all attachment' },
        { hindi: { dev: 'धनञ्जय', roman: 'dhanañjaya' }, english: 'O Dhanañjaya!' }
      ],
      words: [
        { key: 'yogasthah', hindi: { dev: 'योगस्थः', roman: 'yoga-sthaḥ' }, english: 'established / steady in yoga', kind: 'other', note: 'Here, yoga-sthaḥ means established in equanimity.', noteDev: 'Here, योगस्थः means established in equanimity.' },
        { key: 'kuru', hindi: { dev: 'कुरु', roman: 'kuru' }, english: 'perform / do', kind: 'other' },
        { key: 'karmani', hindi: { dev: 'कर्माणि', roman: 'karmāṇi' }, english: 'duties / actions', kind: 'noun' },
        { key: 'sangam', hindi: { dev: 'सङ्गं', roman: 'saṅgaṁ' }, english: 'attachment', kind: 'noun' },
        { key: 'tyaktva', hindi: { dev: 'त्यक्त्वा', roman: 'tyaktvā' }, english: 'abandoning / leaving', kind: 'other' },
        { key: 'dhananjaya', hindi: { dev: 'धनञ्जय', roman: 'dhanañjaya' }, english: 'Dhanañjaya (Arjuna)', kind: 'noun', note: 'Another name of Arjuna. It means “winner of wealth”.' }
      ]
    },
    {
      hindi: {
        dev: 'सिद्ध्यसिद्ध्योः समो भूत्वा समत्वं योग उच्यते॥',
        roman: 'siddhy-asiddhyoḥ samo bhūtvā samatvaṁ yoga uchyate'
      },
      english: 'and remain equal in both success and failure. This equanimity is called yoga.',
      phrases: [
        { hindi: { dev: 'सिद्ध्यसिद्ध्योः', roman: 'siddhy-asiddhyoḥ' }, english: 'and in success as well as failure' },
        { hindi: { dev: 'समो भूत्वा', roman: 'samo bhūtvā' }, english: 'remain equal / unchanged' },
        { hindi: { dev: 'समत्वं', roman: 'samatvaṁ' }, english: 'This equanimity (evenness of mind) indeed' },
        { hindi: { dev: 'योग उच्यते', roman: 'yoga uchyate' }, english: 'is called yoga' }
      ],
      words: [
        { key: 'siddhy', hindi: { dev: 'सिद्ध्य', roman: 'siddhy' }, english: 'success / achievement', kind: 'noun' },
        { key: 'asiddhyoh', hindi: { dev: 'असिद्ध्योः', roman: 'asiddhyoḥ' }, english: 'failure / non-achievement', kind: 'noun' },
        { key: 'samo', hindi: { dev: 'समो', roman: 'samo' }, english: 'equal / same', kind: 'other' },
        { key: 'bhutva', hindi: { dev: 'भूत्वा', roman: 'bhūtvā' }, english: 'becoming / remaining', kind: 'other' },
        { key: 'samatvam', hindi: { dev: 'समत्वं', roman: 'samatvaṁ' }, english: 'equanimity / evenness', kind: 'noun' },
        { key: 'yoga', hindi: { dev: 'योग', roman: 'yoga' }, english: 'yoga', kind: 'noun' },
        { key: 'uchyate', hindi: { dev: 'उच्यते', roman: 'uchyate' }, english: 'is called', kind: 'other' }
      ]
    }
  ],
  wordBlanks: [
    {
      template: '___ kuru ___ saṅgaṁ ___ dhanañjaya',
      options: ['tyaktvā', 'karmāṇi', 'samatvaṁ', 'yoga-sthaḥ', 'samo', 'uchyate'],
      answers: ['yoga-sthaḥ', 'karmāṇi', 'tyaktvā'],
      answerKeys: [['yogasthah'], ['karmani'], ['tyaktva']],
      dev: {
        template: '___ कुरु ___ सङ्गं ___ धनञ्जय',
        options: ['त्यक्त्वा', 'कर्माणि', 'समत्वं', 'योगस्थः', 'समो', 'उच्यते'],
        answers: ['योगस्थः', 'कर्माणि', 'त्यक्त्वा']
      }
    },
    {
      template: 'siddhy-asiddhyoḥ ___ bhūtvā ___ yoga ___',
      options: ['samatvaṁ', 'tyaktvā', 'uchyate', 'samo', 'karmāṇi', 'yoga-sthaḥ'],
      answers: ['samo', 'samatvaṁ', 'uchyate'],
      answerKeys: [['samo'], ['samatvam'], ['uchyate']],
      dev: {
        template: 'सिद्ध्यसिद्ध्योः ___ भूत्वा ___ योग ___',
        options: ['समत्वं', 'त्यक्त्वा', 'उच्यते', 'समो', 'कर्माणि', 'योगस्थः'],
        answers: ['समो', 'समत्वं', 'उच्यते']
      }
    }
  ],
  chunkBlanks: [
    {
      template: '___ ___ dhanañjaya',
      options: ['siddhy-asiddhyoḥ samo', 'yoga-sthaḥ kuru karmāṇi', 'samatvaṁ yoga uchyate', 'saṅgaṁ tyaktvā'],
      answers: ['yoga-sthaḥ kuru karmāṇi', 'saṅgaṁ tyaktvā'],
      answerKeys: [['yogasthah', 'kuru', 'karmani'], ['sangam', 'tyaktva']],
      dev: {
        template: '___ ___ धनञ्जय',
        options: ['सिद्ध्यसिद्ध्योः समो', 'योगस्थः कुरु कर्माणि', 'समत्वं योग उच्यते', 'सङ्गं त्यक्त्वा'],
        answers: ['योगस्थः कुरु कर्माणि', 'सङ्गं त्यक्त्वा']
      }
    },
    {
      template: '___ bhūtvā ___',
      options: ['yoga-sthaḥ kuru karmāṇi', 'saṅgaṁ tyaktvā', 'siddhy-asiddhyoḥ samo', 'samatvaṁ yoga uchyate'],
      answers: ['siddhy-asiddhyoḥ samo', 'samatvaṁ yoga uchyate'],
      answerKeys: [['siddhy', 'asiddhyoh', 'samo'], ['samatvam', 'yoga', 'uchyate']],
      dev: {
        template: '___ भूत्वा ___',
        options: ['योगस्थः कुरु कर्माणि', 'सङ्गं त्यक्त्वा', 'सिद्ध्यसिद्ध्योः समो', 'समत्वं योग उच्यते'],
        answers: ['सिद्ध्यसिद्ध्योः समो', 'समत्वं योग उच्यते']
      }
    }
  ],
  singleBlanks: [
    {
      template: '___ dhanañjaya',
      options: ['yoga-sthaḥ kuru karmāṇi saṅgaṁ tyaktvā', 'siddhy-asiddhyoḥ samo bhūtvā samatvaṁ', 'samatvaṁ yoga uchyate saṅgaṁ tyaktvā'],
      answers: ['yoga-sthaḥ kuru karmāṇi saṅgaṁ tyaktvā'],
      answerKeys: [['yogasthah', 'kuru', 'karmani', 'sangam', 'tyaktva']],
      dev: {
        template: '___ धनञ्जय',
        options: ['योगस्थः कुरु कर्माणि सङ्गं त्यक्त्वा', 'सिद्ध्यसिद्ध्योः समो भूत्वा समत्वं', 'समत्वं योग उच्यते सङ्गं त्यक्त्वा'],
        answers: ['योगस्थः कुरु कर्माणि सङ्गं त्यक्त्वा']
      }
    },
    {
      template: 'siddhy-asiddhyoḥ samo bhūtvā ___',
      options: ['yoga-sthaḥ kuru karmāṇi dhanañjaya', 'samatvaṁ yoga uchyate', 'saṅgaṁ tyaktvā kuru karmāṇi'],
      answers: ['samatvaṁ yoga uchyate'],
      answerKeys: [['samatvam', 'yoga', 'uchyate']],
      dev: {
        template: 'सिद्ध्यसिद्ध्योः समो भूत्वा ___',
        options: ['योगस्थः कुरु कर्माणि धनञ्जय', 'समत्वं योग उच्यते', 'सङ्गं त्यक्त्वा कुरु कर्माणि'],
        answers: ['समत्वं योग उच्यते']
      }
    }
  ],
  fullBlanks: {
    template: '___ kuru ___ saṅgaṁ ___ dhanañjaya siddhy-asiddhyoḥ ___ bhūtvā ___ yoga ___',
    options: ['samatvaṁ', 'tyaktvā', 'uchyate', 'samo', 'karmāṇi', 'yoga-sthaḥ'],
    answers: ['yoga-sthaḥ', 'karmāṇi', 'tyaktvā', 'samo', 'samatvaṁ', 'uchyate'],
    answerKeys: [['yogasthah'], ['karmani'], ['tyaktva'], ['samo'], ['samatvam'], ['uchyate']],
    dev: {
      template: '___ कुरु ___ सङ्गं ___ धनञ्जय सिद्ध्यसिद्ध्योः ___ भूत्वा ___ योग ___',
      options: ['समत्वं', 'त्यक्त्वा', 'उच्यते', 'समो', 'कर्माणि', 'योगस्थः'],
      answers: ['योगस्थः', 'कर्माणि', 'त्यक्त्वा', 'समो', 'समत्वं', 'उच्यते']
    }
  },
  reflectionPrompt: bg248.reflectionPrompt
};

export const JOURNEY_OVERRIDES: Record<string, JourneyContent> = {
  ch2_sec1_l2: bg248
};

/**
 * Content written for particular tiers; it replaces JOURNEY_OVERRIDES and the generated journey at those tiers.
 * Medium (Sanskrit in Roman) and Hard (Sanskrit in Devanagari) play the same Sanskrit content: the script is the tier's.
 */
export const TIER_JOURNEY_OVERRIDES: Partial<Record<DifficultyTier, Record<string, JourneyContent>>> = {
  medium: { ch2_sec1_l2: bg248Sanskrit },
  hard: { ch2_sec1_l2: bg248Sanskrit }
};
