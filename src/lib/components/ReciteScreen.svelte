<script lang="ts">
  import { onMount } from 'svelte';
  import { gameState } from '../state/gameState.svelte';
  import { scriptText } from '../data/hindi';
  import { scoreRecital, type JourneyWord, type RecitalScore } from '../data/journey';
  import type { HindiText } from '../data/gitaData';
  import { hasRecognition, listen, speak, stopSpeaking, type Listener } from '../utils/speech';
  import SpeakButton from './SpeakButton.svelte';
  import Mascot from './Mascot.svelte';

  // An audio recital: the learner chooses Hindi or English, then says the text aloud (speech recognition)
  // or, where the browser can't listen, types it. Grading is lenient and nothing here costs a heart.
  let { hindi, english, pool, hideText = false, title, onDone } = $props<{
    hindi: HindiText;
    english: string;
    /** The verse's words, to report which ones were missed */
    pool: JourneyWord[];
    /** Start with the text hidden behind a "Show hint" button, leaving only the audio clue */
    hideText?: boolean;
    title: string;
    /** `null` when the learner skipped */
    onDone: (result: { passed: boolean; missedKeys: string[] } | null) => void;
  }>();

  type Lang = 'hi' | 'en';

  let lang = $state<Lang | null>(null);
  // Captured once: the page remounts this component, so the starting state never needs to follow the prop
  // svelte-ignore state_referenced_locally
  let showText = $state(!hideText);
  let voiceSupported = $state(false);
  let typing = $state(false);
  let listening = $state(false);
  let typed = $state('');
  let transcript = $state('');
  let result = $state<RecitalScore | null>(null);
  let message = $state('');
  let listener: Listener | null = null;

  onMount(() => {
    voiceSupported = hasRecognition();
    typing = !voiceSupported;
    return () => {
      listener?.stop();
      stopSpeaking();
    };
  });

  const target = $derived(lang === 'hi' ? scriptText(hindi, gameState.tierScriptMode) : english);
  const spoken = $derived(lang === 'hi' ? hindi.dev : english);

  function choose(l: Lang) {
    lang = l;
    result = null;
    message = '';
    transcript = '';
    typed = '';
    // The clue: hear it once, straight away
    speak(l === 'hi' ? hindi.dev : english, l);
  }

  function evaluate(text: string) {
    if (!lang) return;
    transcript = text;
    result = scoreRecital(text, lang === 'hi' ? hindi : english, lang, pool);
    if (result.passed) showText = true;
  }

  function toggleListening() {
    if (!lang) return;
    if (listening) {
      listener?.stop();
      return;
    }
    stopSpeaking();
    result = null;
    message = '';
    listening = true;
    listener = listen(lang, {
      onResult: evaluate,
      onError: (reason) => {
        if (reason === 'none') message = "I didn't hear anything — tap the microphone and try again.";
        else {
          typing = true;
          message =
            reason === 'denied'
              ? 'The microphone is blocked, so type it instead.'
              : "Voice isn't available here, so type it instead.";
        }
      },
      onEnd: () => (listening = false)
    });
    if (!listener) listening = false;
  }

  function checkTyped() {
    if (typed.trim()) evaluate(typed.trim());
  }

  function retry() {
    result = null;
    transcript = '';
    typed = '';
    message = '';
  }

  const percent = $derived(result ? Math.round(result.score * 100) : 0);
</script>

<div class="flex-1 overflow-y-auto scrollbar-none px-5 pt-4 pb-6 flex flex-col gap-5 select-none">
  <div class="flex items-end gap-3">
    <div class="flex-1 min-w-0">
      <p class="text-sm font-extrabold uppercase tracking-wider text-accent">Audio recital</p>
      <h2 class="text-2xl font-black leading-tight">{title}</h2>
      <p class="text-[15px] font-bold text-text-muted mt-1">
        {lang ? 'Say it out loud, in your own time.' : 'Which language would you like to recite in?'}
      </p>
    </div>
    <Mascot mood={result ? (result.passed ? 'amazed' : 'cheerful') : 'default'} size="lg" />
  </div>

  {#if !lang}
    <div class="grid grid-cols-2 gap-3">
      <button type="button" onclick={() => choose('hi')} class="tile px-3 py-5 flex flex-col items-center gap-1">
        <span class="text-2xl font-black font-deva">हिन्दी</span>
        <span class="text-base font-black">Recite in Hindi</span>
      </button>
      <button type="button" onclick={() => choose('en')} class="tile px-3 py-5 flex flex-col items-center gap-1">
        <span class="text-2xl font-black">English</span>
        <span class="text-base font-black">Recite in English</span>
      </button>
    </div>
  {:else}
    <div class="card p-4 flex flex-col gap-3">
      <div class="flex items-center justify-between gap-2">
        <p class="text-xs font-black uppercase tracking-wider text-primary">{lang === 'hi' ? 'In Hindi' : 'In English'}</p>
        <div class="flex items-center gap-2">
          <SpeakButton text={spoken} {lang} label="Hear it" />
          <button
            type="button"
            onclick={() => { lang = null; result = null; transcript = ''; message = ''; }}
            class="text-xs font-black uppercase tracking-wide text-text-muted underline"
          >Change</button>
        </div>
      </div>
      {#if showText}
        <p class="text-xl leading-relaxed whitespace-pre-line {lang === 'hi' && gameState.tierScriptMode === 'devanagari' ? 'font-deva font-bold' : 'font-black'}">{target}</p>
      {:else}
        <p class="text-[15px] font-bold text-text-muted leading-relaxed">
          Listen to the clue, then say it from memory.
        </p>
        <button type="button" onclick={() => (showText = true)} class="btn btn-secondary self-start px-4 py-2 text-sm">Show hint</button>
      {/if}
    </div>

    {#if result}
      <div class="rounded-2xl p-4 flex flex-col gap-1 animate-pop-in {result.passed ? 'bg-success-soft text-success-dark dark:text-success' : 'bg-error-soft text-error-dark dark:text-error'}" role="status">
        <p class="text-xl font-black">{result.passed ? 'Beautifully said!' : 'Almost there'}</p>
        <p class="text-sm font-bold opacity-90">You said {percent}% of the words.</p>
        {#if transcript}<p class="text-sm font-semibold opacity-80 leading-snug">“{transcript}”</p>{/if}
      </div>
    {:else if typing}
      <div class="flex flex-col gap-3">
        <textarea
          bind:value={typed}
          rows="3"
          placeholder={lang === 'hi' ? 'Type it in Hindi (Roman letters or Devanagari)…' : 'Type it in English…'}
          aria-label="Type your recital"
          class="w-full bg-bg-surface-alt border-2 border-border-warm focus:border-info rounded-2xl p-4 text-base font-bold text-text-primary placeholder-text-muted/60 focus:outline-none focus:ring-4 focus:ring-info/20 resize-none leading-relaxed"
        ></textarea>
        <button type="button" onclick={checkTyped} disabled={!typed.trim()} class="btn w-full {typed.trim() ? 'btn-primary' : 'btn-disabled'}">Check</button>
        {#if voiceSupported}
          <button type="button" onclick={() => { typing = false; message = ''; }} class="text-sm font-black uppercase tracking-wide text-info underline self-center">Use my voice instead</button>
        {/if}
      </div>
    {:else}
      <div class="flex flex-col items-center gap-3">
        <button
          type="button"
          onclick={toggleListening}
          aria-label={listening ? 'Stop listening' : 'Start speaking'}
          class="relative w-24 h-24 rounded-full flex items-center justify-center text-white active:translate-y-1 transition-transform {listening ? 'bg-error' : 'bg-info'}"
          style="box-shadow: 0 6px 0 {listening ? 'var(--color-error-dark)' : 'var(--color-info-dark)'}"
        >
          {#if listening}<span class="absolute -inset-2 rounded-full animate-pulse-ring pointer-events-none"></span>{/if}
          <svg viewBox="0 0 24 24" fill="currentColor" class="w-10 h-10" aria-hidden="true">
            <path d="M12 14a3 3 0 003-3V6a3 3 0 10-6 0v5a3 3 0 003 3zm5-3a5 5 0 01-10 0H5a7 7 0 006 6.92V21h2v-3.08A7 7 0 0019 11h-2z" />
          </svg>
        </button>
        <p class="text-sm font-black uppercase tracking-wide text-text-muted">{listening ? 'Listening… tap when you finish' : 'Tap and speak'}</p>
        <button type="button" onclick={() => { typing = true; message = ''; }} class="text-sm font-black uppercase tracking-wide text-info underline">Type it instead</button>
      </div>
    {/if}

    {#if message}
      <p class="text-sm font-bold text-text-muted text-center leading-snug">{message}</p>
    {/if}
  {/if}
</div>

<div class="lesson-footer flex flex-col gap-3">
  {#if result}
    {#if !result.passed}
      <button type="button" onclick={retry} class="btn btn-primary w-full">Try again</button>
    {/if}
    <button
      type="button"
      onclick={() => onDone({ passed: result!.passed, missedKeys: result!.missedKeys })}
      class="btn w-full {result.passed ? 'btn-success' : 'btn-secondary'}"
    >{result.passed ? 'Continue' : 'Continue anyway'}</button>
  {:else}
    <button type="button" onclick={() => onDone(null)} class="btn btn-ghost w-full">Skip this one</button>
  {/if}
</div>
