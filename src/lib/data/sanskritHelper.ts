import type { DifficultyTier } from './onboarding';

export interface SanskritDisplay {
  englishSyllables: string;
  devanagari: string;
}

const PHONETIC_LETTERS: Record<string, string> = {
  ā: 'a', ī: 'i', ū: 'u', ṛ: 'ri', ṝ: 'ri', ḷ: 'lri',
  ṅ: 'n', ñ: 'n', ṇ: 'n', ṭ: 't', ḍ: 'd', ś: 'sh', ṣ: 'sh', ḥ: 'h', ṁ: 'm', ṃ: 'm',
  Ā: 'A', Ī: 'I', Ū: 'U', Ṛ: 'Ri', Ṅ: 'N', Ñ: 'N', Ṇ: 'N', Ṭ: 'T', Ḍ: 'D', Ś: 'Sh', Ṣ: 'Sh', Ḥ: 'H', Ṁ: 'M', Ṃ: 'M'
};

/**
 * IAST → English-friendly spelling for display (kadācana → kadachana, Kṛṣṇa → Krishna).
 * IAST stays the internal identity because dropping vowel length collides words
 * (karmaṇi / karmāṇi). Not idempotent — IAST "ch" becomes "chh" — so apply exactly once.
 */
export function toPhonetic(iast: string): string {
  return iast
    .normalize('NFC')
    .replace(/[ṁṃ](?=[kgcjṭḍtdnśṣsyrlh])/g, 'n')
    .replace(/([cC])(h?)/g, (_, c: string, h: string) => (c === 'c' ? 'ch' : 'Ch') + h)
    .replace(/[āīūṛṝḷṅñṇṭḍśṣḥṁṃĀĪŪṚṄÑṆṬḌŚṢḤṀṂ]/g, (ch) => PHONETIC_LETTERS[ch]);
}

/**
 * Converts IAST or Devanagari into clean Romanized Hindi / English phonetics
 * with no diacritics (e.g. kadācana -> kadachana, karmāṇi -> karmani).
 */
export function toHindiRoman(input: string): string {
  if (!input) return '';
  if (/[\u0900-\u097F]/.test(input)) {
    const clean = input.replace(/[।॥]/g, '').trim();
    for (const [iast, entry] of Object.entries(SANSKRIT_DICT)) {
      if (entry.devanagari === clean) {
        return toPhonetic(iast);
      }
    }
  }
  return toPhonetic(input);
}

/**
 * Returns the appropriate verse text corresponding strictly to the selected difficulty tier:
 * - beginner: Romanized Hindi / English phonetics (no Sanskrit Devanagari or IAST)
 * - medium: Sanskrit in IAST / Roman script
 * - hard: Full Sanskrit in Devanagari script
 */
export function getVerseText(
  item: {
    verseSanskrit?: string;
    sanskrit?: string;
    verseTransliteration?: string;
    transliteration?: string;
    verseHindiRoman?: string;
    hindiRoman?: string;
  },
  tier: DifficultyTier
): string {
  if (tier === 'hard') {
    return item.verseSanskrit ?? item.sanskrit ?? '';
  }
  if (tier === 'medium') {
    return item.verseTransliteration ?? item.transliteration ?? '';
  }
  // beginner
  return item.verseHindiRoman ?? item.hindiRoman ?? toHindiRoman(item.verseTransliteration ?? item.transliteration ?? '');
}

/**
 * Returns word display text strictly for the given difficulty tier.
 */
export function getWordText(
  word: string,
  tier: DifficultyTier,
  devanagariFallback?: string
): string {
  if (tier === 'hard') {
    return devanagariFallback || getSanskritDisplay(word).devanagari;
  }
  if (tier === 'medium') {
    return word;
  }
  return toHindiRoman(word);
}

// Dictionary of predefined Sanskrit words & phrases to English syllable breakdowns and Devanagari
const SANSKRIT_DICT: Record<string, SanskritDisplay> = {
  // BG 2.47
  'karmaṇi': { englishSyllables: 'kar · ma · ṇi', devanagari: 'कर्मणि' },
  'karmaṇy': { englishSyllables: 'kar · ma · ṇy', devanagari: 'कर्मण्य्' },
  'eva': { englishSyllables: 'e · va', devanagari: 'एव' },
  'evādhikāras': { englishSyllables: 'e · vā · dhi · kā · ras', devanagari: 'एवाधिकारः' },
  'adhikāraḥ': { englishSyllables: 'a · dhi · kā · raḥ', devanagari: 'अधिकारः' },
  'te': { englishSyllables: 'te', devanagari: 'ते' },
  'mā': { englishSyllables: 'mā', devanagari: 'मा' },
  'phaleṣu': { englishSyllables: 'pha · le · ṣu', devanagari: 'फलेषु' },
  'kadācana': { englishSyllables: 'ka · dā · ca · na', devanagari: 'कदाचन' },
  'karma-phala': { englishSyllables: 'kar · ma · pha · la', devanagari: 'कर्मफल' },
  'hetuḥ': { englishSyllables: 'he · tuḥ', devanagari: 'हेतुः' },
  'bhūḥ': { englishSyllables: 'bhūḥ', devanagari: 'भूः' },
  'saṅgaḥ': { englishSyllables: 'saṅ · gaḥ', devanagari: 'सङ्गः' },
  'saṅgo': { englishSyllables: 'saṅ · go', devanagari: 'सङ्गो' },
  'astv': { englishSyllables: 'astv', devanagari: 'अस्तु' },
  'astu': { englishSyllables: 'as · tu', devanagari: 'अस्तु' },
  '\'stv': { englishSyllables: '\'stv', devanagari: 'ऽस्तु' },
  'akarmaṇi': { englishSyllables: 'a · kar · ma · ṇi', devanagari: 'अकर्मणि' },
  'karmasu': { englishSyllables: 'kar · ma · su', devanagari: 'कर्मसु' },

  // Phrases
  'karmaṇi eva': { englishSyllables: 'kar · ma · ṇi   e · va', devanagari: 'कर्मणि एव' },
  'adhikāraḥ te': { englishSyllables: 'a · dhi · kā · raḥ   te', devanagari: 'अधिकारः ते' },
  'mā phaleṣu': { englishSyllables: 'mā   pha · le · ṣu', devanagari: 'मा फलेषु' },

  // BG 2.48
  'yogasthaḥ': { englishSyllables: 'yo · ga · sthaḥ', devanagari: 'योगस्थः' },
  'kuru': { englishSyllables: 'ku · ru', devanagari: 'कुरु' },
  'karmāṇi': { englishSyllables: 'kar · mā · ṇi', devanagari: 'कर्माणि' },
  'saṅgaṁ': { englishSyllables: 'saṅ · gaṁ', devanagari: 'सङ्गम्' },
  'tyaktvā': { englishSyllables: 'tyak · tvā', devanagari: 'त्यक्त्वा' },
  'dhanañjaya': { englishSyllables: 'dha · nañ · ja · ya', devanagari: 'धनञ्जय' },
  'siddhy-asiddhyoḥ': { englishSyllables: 'sid · dhy  a · sid · dhyoḥ', devanagari: 'सिद्ध्यसिद्ध्योः' },
  'siddhy': { englishSyllables: 'sid · dhy', devanagari: 'सिद्ध्य्' },
  'asiddhyoḥ': { englishSyllables: 'a · sid · dhyoḥ', devanagari: 'असिद्ध्योः' },
  'samo': { englishSyllables: 'sa · mo', devanagari: 'समो' },
  'bhūtvā': { englishSyllables: 'bhū · tvā', devanagari: 'भूत्वा' },
  'samatvaṁ': { englishSyllables: 'sa · ma · tvaṁ', devanagari: 'समत्वम्' },
  'yoga': { englishSyllables: 'yo · ga', devanagari: 'योग' },
  'yogaḥ': { englishSyllables: 'yo · gaḥ', devanagari: 'योगः' },
  'ucyate': { englishSyllables: 'u · cya · te', devanagari: 'उच्यते' },

  // BG 2.50
  'buddhi-yukto': { englishSyllables: 'bud · dhi  yuk · to', devanagari: 'बुद्धियुक्तो' },
  'jahātīha': { englishSyllables: 'ja · hā · tī · ha', devanagari: 'जहातीह' },
  'ubhe': { englishSyllables: 'u · bhe', devanagari: 'उभे' },
  'sukṛta-duṣkṛte': { englishSyllables: 'su · kṛ · ta  duṣ · kṛ · te', devanagari: 'सुकृतदुष्कृते' },
  'tasmād': { englishSyllables: 'tas · mād', devanagari: 'तस्मात्' },
  'yogāya': { englishSyllables: 'yo · gā · ya', devanagari: 'योगाय' },
  'yujyasva': { englishSyllables: 'yuj · yas · va', devanagari: 'युज्यस्व' },
  'kauśalam': { englishSyllables: 'kau · śa · lam', devanagari: 'कौशलम्' },

  // BG 2.71
  'vihāya': { englishSyllables: 'vi · hā · ya', devanagari: 'विहाय' },
  'kāmān': { englishSyllables: 'kā · mān', devanagari: 'कामान्' },
  'yaḥ': { englishSyllables: 'yaḥ', devanagari: 'यः' },
  'sarvān': { englishSyllables: 'sar · vān', devanagari: 'सर्वान्' },
  'pumāṁś': { englishSyllables: 'pu · māṁś', devanagari: 'पुमांश्च' },
  'carati': { englishSyllables: 'ca · ra · ti', devanagari: 'चरति' },
  'niḥspṛhaḥ': { englishSyllables: 'niḥ · spṛ · haḥ', devanagari: 'निःस्पृहः' },
  'nirmamo': { englishSyllables: 'nir · ma · mo', devanagari: 'निर्ममः' },
  'nirahaṅkāraḥ': { englishSyllables: 'nir · a · haṅ · kā · raḥ', devanagari: 'निरहङ्कारः' },
  'sa': { englishSyllables: 'sa', devanagari: 'सः' },
  'śāntim': { englishSyllables: 'śān · tim', devanagari: 'शान्तिम्' },
  'adhigacchati': { englishSyllables: 'a · dhi · gac · cha · ti', devanagari: 'अधिगच्छति' },

  // BG 2.13
  'dehinaḥ': { englishSyllables: 'de · hi · naḥ', devanagari: 'देहिनः' },
  'asmin': { englishSyllables: 'as · min', devanagari: 'अस्मिन्' },
  'dehe': { englishSyllables: 'de · he', devanagari: 'देहे' },
  'yathā': { englishSyllables: 'ya · thā', devanagari: 'यथा' },
  'kaumāram': { englishSyllables: 'kau · mā · ram', devanagari: 'कौमारम्' },
  'yauvanam': { englishSyllables: 'yau · va · nam', devanagari: 'यौवनम्' },
  'jarā': { englishSyllables: 'ja · rā', devanagari: 'जरा' },
  'tathā': { englishSyllables: 'ta · thā', devanagari: 'तथा' },
  'dehāntara-prāptiḥ': { englishSyllables: 'de · hān · ta · ra prāp · tiḥ', devanagari: 'देहान्तरप्राप्तिः' },
  'dhīraḥ': { englishSyllables: 'dhī · raḥ', devanagari: 'धीरः' },
  'tatra': { englishSyllables: 'tat · ra', devanagari: 'तत्र' },
  'na': { englishSyllables: 'na', devanagari: 'न' },
  'muhyati': { englishSyllables: 'muh · ya · ti', devanagari: 'मुह्यति' },

  // BG 2.20
  'jāyate': { englishSyllables: 'jā · ya · te', devanagari: 'जायते' },
  'mriyate': { englishSyllables: 'mri · ya · te', devanagari: 'म्रियते' },
  'vā': { englishSyllables: 'vā', devanagari: 'वा' },
  'kadācit': { englishSyllables: 'ka · dā · cit', devanagari: 'कदाचित्' },
  'ayam': { englishSyllables: 'a · yam', devanagari: 'अयम्' },
  'bhavitā': { englishSyllables: 'bha · vi · tā', devanagari: 'भविता' },
  'bhūyaḥ': { englishSyllables: 'bhū · yaḥ', devanagari: 'भूयः' },
  'ajaḥ': { englishSyllables: 'a · jaḥ', devanagari: 'अजः' },
  'nityaḥ': { englishSyllables: 'ni · tyaḥ', devanagari: 'नित्यः' },
  'śāśvataḥ': { englishSyllables: 'śāś · va · taḥ', devanagari: 'शाश्वतः' },
  'purāṇaḥ': { englishSyllables: 'pu · rā · ṇaḥ', devanagari: 'पुराणः' },
  'hanyate': { englishSyllables: 'han · ya · te', devanagari: 'हन्यते' },
  'hanyamāne': { englishSyllables: 'han · ya · mā · ne', devanagari: 'हन्यमाने' },
  'śarīre': { englishSyllables: 'śa · rī · re', devanagari: 'शरीरे' },

  // BG 2.22
  'vāsāṁsi': { englishSyllables: 'vā · sāṁ · si', devanagari: 'वासांसि' },
  'jīrṇāni': { englishSyllables: 'jīr · ṇā · ni', devanagari: 'जीर्णानि' },
  'navāni': { englishSyllables: 'na · vā · ni', devanagari: 'नवानि' },
  'gṛhṇāti': { englishSyllables: 'gṛh · ṇā · ti', devanagari: 'गृह्णाति' },
  'naraḥ': { englishSyllables: 'na · raḥ', devanagari: 'नरः' },
  'aparāṇi': { englishSyllables: 'a · pa · rā · ṇi', devanagari: 'अपराणि' },
  'śarīrāṇi': { englishSyllables: 'śa · rī · rā · ṇi', devanagari: 'शरीराणि' },
  'anyāni': { englishSyllables: 'an · yā · ni', devanagari: 'अन्यानि' },
  'saṁyāti': { englishSyllables: 'saṁ · yā · ti', devanagari: 'संयाति' },
  'dehī': { englishSyllables: 'de · hī', devanagari: 'देही' },

  // BG 2.23
  'enam': { englishSyllables: 'e · nam', devanagari: 'एनम्' },
  'chindanti': { englishSyllables: 'chin · dan · ti', devanagari: 'छिन्दन्ति' },
  'śastrāṇi': { englishSyllables: 'śas · trā · ṇi', devanagari: 'शस्त्राणि' },
  'dahati': { englishSyllables: 'da · ha · ti', devanagari: 'दहति' },
  'pāvakaḥ': { englishSyllables: 'pā · va · kaḥ', devanagari: 'पावकः' },
  'ca': { englishSyllables: 'ca', devanagari: 'च' },
  'kledayanti': { englishSyllables: 'kle · da · yan · ti', devanagari: 'क्लेदयन्ति' },
  'āpaḥ': { englishSyllables: 'ā · paḥ', devanagari: 'आपः' },
  'śoṣayati': { englishSyllables: 'śo · ṣa · ya · ti', devanagari: 'शोषयति' },
  'mārutaḥ': { englishSyllables: 'mā · ru · taḥ', devanagari: 'मारुतः' }
};

// Map of IAST/Roman letters to basic Devanagari script for fallback
const IAST_TO_DEVANAGARI: [RegExp, string][] = [
  [/karmaṇy/gi, 'कर्मण्य्'],
  [/karmaṇi/gi, 'कर्मणि'],
  [/evādhikāras/gi, 'एवाधिकारः'],
  [/eva/gi, 'एव'],
  [/adhikāraḥ/gi, 'अधिकारः'],
  [/phaleṣu/gi, 'फलेषु'],
  [/kadācana/gi, 'कदाचन'],
  [/saṅgo/gi, 'सङ्गो'],
  [/saṅgaḥ/gi, 'सङ्गः'],
  [/akarmaṇi/gi, 'अकर्मणि'],
  [/karmasu/gi, 'कर्मसु'],
  [/te/gi, 'ते'],
  [/mā/gi, 'मा'],
  [/astv/gi, 'अस्तु']
];

/**
 * Returns top English syllables and bottom Sanskrit Devanagari representation for a given word or phrase
 */
export function getSanskritDisplay(input: string): SanskritDisplay {
  const cleanInput = input.trim();
  const lowerInput = cleanInput.toLowerCase();

  // Check dictionary
  const entry = SANSKRIT_DICT[lowerInput];
  if (entry) {
    return { ...entry, englishSyllables: toPhonetic(entry.englishSyllables) };
  }

  // If input is already Devanagari (contains Unicode Sanskrit characters 0900-097F)
  if (/[\u0900-\u097F]/.test(cleanInput)) {
    return {
      englishSyllables: cleanInput, // Fallback transliteration
      devanagari: cleanInput
    };
  }

  // Multi-word phrase not registered as its own dictionary key \u2014 resolve each word on its
  // own (which usually IS in the dictionary) and join, rather than falling through to the
  // single-word regex substitution below, which garbles multi-word input (a short pattern
  // like /m\u0101/ can match mid-word inside an unrelated neighbouring word, e.g. "karm\u0101\u1E47i").
  if (/\s/.test(cleanInput)) {
    const parts = cleanInput.split(/\s+/).filter(Boolean).map((w) => getSanskritDisplay(w));
    return {
      englishSyllables: parts.map((p) => p.englishSyllables).join('   '),
      devanagari: parts.map((p) => p.devanagari).join(' ')
    };
  }

  // Fallback: generate syllable separators for English transliteration
  const syllables = cleanInput.replace(/([aeiouāīūēōṛḷṁḥñṅṇtṭdḍsṣś])/gi, '$1 · ').replace(/ · $/g, '').replace(/ ·\s+/g, '   ');

  // Derive Devanagari fallback
  let dev = cleanInput;
  for (const [pattern, devText] of IAST_TO_DEVANAGARI) {
    if (pattern.test(dev)) {
      dev = dev.replace(pattern, devText);
    }
  }

  return {
    englishSyllables: toPhonetic(syllables || cleanInput),
    devanagari: dev
  };
}
