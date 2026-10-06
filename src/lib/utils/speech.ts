// Text-to-speech and speech recognition, shared by every screen that talks or listens.
// Hindi is always spoken from its Devanagari text, whichever script the tier displays.

export type SpeechLang = 'hi' | 'en';

const hasWindow = () => typeof window !== 'undefined';

export const hasTTS = (): boolean => hasWindow() && 'speechSynthesis' in window;

type RecognitionCtor = new () => SpeechRecognitionLike;

interface SpeechRecognitionLike {
  lang: string;
  interimResults: boolean;
  continuous: boolean;
  maxAlternatives: number;
  onresult: ((e: { results: ArrayLike<ArrayLike<{ transcript: string }>> }) => void) | null;
  onerror: ((e: { error: string }) => void) | null;
  onend: (() => void) | null;
  start(): void;
  stop(): void;
  abort(): void;
}

function recognitionCtor(): RecognitionCtor | null {
  if (!hasWindow()) return null;
  const w = window as unknown as { SpeechRecognition?: RecognitionCtor; webkitSpeechRecognition?: RecognitionCtor };
  return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null;
}

export const hasRecognition = (): boolean => recognitionCtor() !== null;

/** Picks the best installed voice for a language, or undefined to let the browser choose by `lang`. */
function pickVoice(lang: SpeechLang): { voice?: SpeechSynthesisVoice; tag: string } {
  const voices = window.speechSynthesis.getVoices();
  const order = lang === 'hi' ? ['hi-IN', 'hi'] : ['en-IN', 'en-GB', 'en-US', 'en'];
  for (const tag of order) {
    const voice = voices.find((v) => v.lang === tag || v.lang.replace('_', '-').startsWith(tag));
    if (voice) return { voice, tag: voice.lang.replace('_', '-') };
  }
  return { tag: lang === 'hi' ? 'hi-IN' : 'en-US' };
}

export interface SpeakOptions {
  /** 1 is the voice's normal pace. Hindi sounds clearer a little slower. */
  rate?: number;
  onStart?: () => void;
  onEnd?: () => void;
}

/** Speaks `text` in the given language, cutting off anything already being spoken. */
export function speak(text: string, lang: SpeechLang, opts: SpeakOptions = {}): void {
  if (!hasTTS() || !text.trim()) {
    opts.onEnd?.();
    return;
  }
  window.speechSynthesis.cancel();
  // A slash between alternatives ("action / duty") reads better as a pause
  const utterance = new SpeechSynthesisUtterance(text.replace(/\s*\/\s*/g, ', '));
  const { voice, tag } = pickVoice(lang);
  if (voice) utterance.voice = voice;
  utterance.lang = tag;
  utterance.rate = opts.rate ?? (lang === 'hi' ? 0.75 : 0.95);
  if (opts.onStart) utterance.onstart = opts.onStart;
  utterance.onend = () => opts.onEnd?.();
  utterance.onerror = () => opts.onEnd?.();
  window.speechSynthesis.speak(utterance);
}

export function stopSpeaking(): void {
  if (hasTTS()) window.speechSynthesis.cancel();
}

// Voices load asynchronously in Chromium: touching the list once makes sure they are ready by the first tap.
if (hasTTS()) window.speechSynthesis.getVoices();

export interface Listener {
  stop: () => void;
}

export interface ListenOptions {
  onResult: (transcript: string) => void;
  /** `denied` = microphone blocked, `none` = nothing was heard, `unsupported`, or `other` */
  onError: (reason: 'denied' | 'none' | 'unsupported' | 'other') => void;
  onEnd: () => void;
}

/** Listens once for the learner's voice. Returns null when the browser has no speech recognition. */
export function listen(lang: SpeechLang, opts: ListenOptions): Listener | null {
  const Ctor = recognitionCtor();
  if (!Ctor) {
    opts.onError('unsupported');
    return null;
  }
  const rec = new Ctor();
  rec.lang = lang === 'hi' ? 'hi-IN' : 'en-IN';
  rec.interimResults = false;
  rec.continuous = true;
  rec.maxAlternatives = 1;
  let heard = '';
  let errored = false;
  rec.onresult = (e) => {
    heard = Array.from(e.results)
      .map((r) => r[0]?.transcript ?? '')
      .join(' ')
      .trim();
  };
  rec.onerror = (e) => {
    errored = true;
    if (e.error === 'not-allowed' || e.error === 'service-not-allowed') opts.onError('denied');
    else if (e.error === 'no-speech') opts.onError('none');
    else if (e.error === 'aborted') errored = false;
    else opts.onError('other');
  };
  rec.onend = () => {
    if (!errored) {
      if (heard) opts.onResult(heard);
      else opts.onError('none');
    }
    opts.onEnd();
  };
  try {
    rec.start();
  } catch {
    opts.onError('other');
    opts.onEnd();
    return null;
  }
  return { stop: () => rec.stop() };
}
