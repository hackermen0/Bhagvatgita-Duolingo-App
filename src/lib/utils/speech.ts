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
  /** The microphone is open and audio is being captured */
  onaudiostart: (() => void) | null;
  onspeechstart: (() => void) | null;
  onspeechend: (() => void) | null;
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

const defaultRate = (lang: SpeechLang) => (lang === 'hi' ? 0.75 : 0.95);

// Word highlighting needs to know when each word starts. Desktop voices report that via `onboundary`, so the
// phrase plays as one smooth utterance. Many mobile voices (Android Chrome's Hindi voice especially) never fire
// `onboundary`; there the phrase is queued as one utterance per word instead, and each word's `onstart` — reliable
// everywhere — drives the highlight in exact sync. Phones start in word-by-word mode; elsewhere a full playback that
// finishes without a single boundary switches that device over. (No mid-playback timeout: network voices can start
// reporting boundaries well after `onstart`, which once misclassified desktops — hence the versioned key.)
const BOUNDARY_KEY = 'gita_tts_word_boundaries_v2';
const boundaryKey = (lang: SpeechLang) => (lang === 'hi' ? BOUNDARY_KEY : `${BOUNDARY_KEY}_${lang}`);

const isMobileDevice = () =>
  !!(navigator as Navigator & { userAgentData?: { mobile: boolean } }).userAgentData?.mobile ||
  /Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent);

function readBoundarySupport(lang: SpeechLang): boolean | null {
  try {
    const v = localStorage.getItem(boundaryKey(lang));
    return v === null ? null : v === '1';
  } catch {
    return null;
  }
}

function saveBoundarySupport(lang: SpeechLang, supported: boolean) {
  try {
    localStorage.setItem(boundaryKey(lang), supported ? '1' : '0');
  } catch {
    // Private mode: the next playback just re-detects
  }
}

export interface TokenPlayback {
  stop: () => void;
}

export interface SpeakTokensOptions {
  rate?: number;
  /** The word about to be spoken, as an index into `tokens` */
  onWord: (index: number) => void;
  /** Playback finished, was stopped, or was cut off by other speech */
  onEnd: () => void;
}

/**
 * Speaks `tokens` as one phrase and reports each word as it is spoken, so the screen can highlight it.
 * Tokens are joined with single spaces, so a boundary event's character offset maps back to a word unambiguously.
 */
export function speakTokens(tokens: string[], lang: SpeechLang, opts: SpeakTokensOptions): TokenPlayback {
  if (!hasTTS() || tokens.length === 0) {
    opts.onEnd();
    return { stop: () => {} };
  }
  window.speechSynthesis.cancel();

  // Each playback gets a fresh token. Cancelling speech fires the OLD utterances' onend/onerror asynchronously,
  // after the new playback has started — comparing against the token lets those stale callbacks no-op.
  const session = {};
  let active: object | null = session;
  const finish = () => {
    if (active !== session) return;
    active = null;
    opts.onEnd();
  };

  const rate = opts.rate ?? defaultRate(lang);
  const { voice, tag } = pickVoice(lang);
  const utter = (text: string) => {
    const u = new SpeechSynthesisUtterance(text);
    if (voice) u.voice = voice;
    u.lang = tag;
    u.rate = rate;
    return u;
  };

  const supported = readBoundarySupport(lang);
  if (supported === false || (supported === null && isMobileDevice())) {
    tokens.forEach((token, i) => {
      const u = utter(token);
      u.onstart = () => {
        if (active === session) opts.onWord(i);
      };
      u.onerror = finish;
      if (i === tokens.length - 1) u.onend = finish;
      window.speechSynthesis.speak(u);
    });
  } else {
    let offset = 0;
    const offsets = tokens.map((t) => {
      const start = offset;
      offset += t.length + 1; // +1 for the joining space
      return start;
    });
    let boundaryFired = false;
    const u = utter(tokens.join(' '));
    u.onboundary = (event) => {
      if (active !== session) return;
      if (event.name === 'word' || event.name === undefined) {
        if (!boundaryFired) saveBoundarySupport(lang, true);
        boundaryFired = true;
        let found = 0;
        for (let i = 0; i < offsets.length; i++) {
          if (offsets[i] <= event.charIndex) found = i;
          else break;
        }
        opts.onWord(found);
      }
    };
    u.onend = () => {
      // Only a playback that ran to the end counts; stop/restart null the session first
      if (active === session && !boundaryFired) saveBoundarySupport(lang, false);
      finish();
    };
    u.onerror = finish;
    window.speechSynthesis.speak(u);
  }

  return {
    stop() {
      if (active !== session) return;
      active = null;
      window.speechSynthesis.cancel();
      opts.onEnd();
    }
  };
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
  /** The microphone is open: from here on, speaking will be heard */
  onReady?: () => void;
  /** Voice is being picked up (true), or has gone quiet again (false). Drives the "I can hear you" waveform. */
  onSpeaking?: (speaking: boolean) => void;
}

/** How long after the last sign of voice the learner counts as having stopped speaking. */
const QUIET_AFTER_MS = 1000;

/** Listens once for the learner's voice. Returns null when the browser has no speech recognition. */
export function listen(lang: SpeechLang, opts: ListenOptions): Listener | null {
  const Ctor = recognitionCtor();
  if (!Ctor) {
    opts.onError('unsupported');
    return null;
  }
  const rec = new Ctor();
  rec.lang = lang === 'hi' ? 'hi-IN' : 'en-IN';
  // Interim results arrive while the learner is still talking, which is what keeps the waveform alive
  rec.interimResults = true;
  rec.continuous = true;
  rec.maxAlternatives = 1;
  let heard = '';
  let errored = false;

  // Voice counts as "being heard" from the engine's speech-start (or any partial result) until things go quiet.
  // This uses the recognition engine's own events rather than a second microphone stream, which some phones
  // can't share with recognition.
  let speaking = false;
  let quietTimer: ReturnType<typeof setTimeout> | undefined;
  const setSpeaking = (value: boolean) => {
    if (speaking === value) return;
    speaking = value;
    opts.onSpeaking?.(value);
  };
  const heardVoice = () => {
    setSpeaking(true);
    clearTimeout(quietTimer);
    quietTimer = setTimeout(() => setSpeaking(false), QUIET_AFTER_MS);
  };
  rec.onaudiostart = () => opts.onReady?.();
  rec.onspeechstart = heardVoice;
  rec.onspeechend = () => {
    clearTimeout(quietTimer);
    setSpeaking(false);
  };
  rec.onresult = (e) => {
    heard = Array.from(e.results)
      .map((r) => r[0]?.transcript ?? '')
      .join(' ')
      .trim();
    if (heard) heardVoice();
  };
  rec.onerror = (e) => {
    errored = true;
    if (e.error === 'not-allowed' || e.error === 'service-not-allowed') opts.onError('denied');
    else if (e.error === 'no-speech') opts.onError('none');
    else if (e.error === 'aborted') errored = false;
    else opts.onError('other');
  };
  rec.onend = () => {
    clearTimeout(quietTimer);
    setSpeaking(false);
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
