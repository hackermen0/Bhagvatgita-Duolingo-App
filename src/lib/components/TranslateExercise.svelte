<script lang="ts">
  import { onMount } from 'svelte';
  import { lookupMeaning } from '../data/practice';
  import { hindiTokens, wordKey } from '../data/hindi';
  import type { HindiText } from '../data/gitaData';
  import HindiWord from './HindiWord.svelte';
  import WordTilePicker from './WordTilePicker.svelte';
  import Mascot, { type MascotMood } from './Mascot.svelte';

  // "Write this in English": Krishna says a Hindi phrase; the learner builds its meaning from English tiles
  let { hindi, tiles, onChange, disabled = false, mascotMood = 'default', autoPlay = false } = $props<{
    hindi: HindiText;
    tiles: string[];
    onChange: (words: string[]) => void;
    disabled?: boolean;
    mascotMood?: MascotMood;
    autoPlay?: boolean;
  }>();

  const words = $derived(hindiTokens(hindi));
  let hintIndex = $state<number | null>(null);

  let speechSupported = $state(false);
  let isSpeaking = $state(false);
  let currentUtterance: SpeechSynthesisUtterance | null = null;

  onMount(() => {
    speechSupported = typeof window !== 'undefined' && 'speechSynthesis' in window;
    const t = autoPlay && speechSupported ? setTimeout(speak, 500) : undefined;
    return () => {
      clearTimeout(t);
      currentUtterance = null;
      if (speechSupported) window.speechSynthesis.cancel();
    };
  });

  function speak() {
    if (!speechSupported) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(hindi.dev);
    utterance.lang = 'hi-IN';
    utterance.rate = 0.7;
    // Cancelling fires the old utterance's callbacks late; the identity check ignores stale ones
    utterance.onend = utterance.onerror = () => {
      if (currentUtterance === utterance) isSpeaking = false;
    };
    currentUtterance = utterance;
    isSpeaking = true;
    window.speechSynthesis.speak(utterance);
  }
</script>

<div class="flex flex-col gap-8 w-full select-none">
  <div class="flex items-center gap-2">
    <div class="shrink-0 -ml-1"><Mascot mood={mascotMood} size="md" /></div>
    <div class="bubble bubble-left flex-1 min-w-0 flex items-center gap-2">
      {#if speechSupported}
        <button
          type="button"
          onclick={speak}
          aria-label="Listen"
          class="shrink-0 w-10 h-10 rounded-xl flex items-center justify-center text-info {isSpeaking ? 'animate-pulse' : ''}"
        >
          <svg viewBox="0 0 24 24" fill="currentColor" class="w-7 h-7">
            <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3a4.5 4.5 0 00-2.5-4.03v8.06A4.5 4.5 0 0016.5 12zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z" />
          </svg>
        </button>
      {/if}
      <!-- Each word is tappable for its meaning, like Duolingo's dotted-underline hints -->
      <div class="flex flex-wrap gap-x-2 gap-y-2 items-end">
        {#each words as word, i}
          {@const meaning = lookupMeaning(wordKey(word.roman))}
          <button
            type="button"
            disabled={!meaning}
            onclick={() => (hintIndex = hintIndex === i ? null : i)}
            aria-label={meaning ? `Show meaning of ${word.roman}` : undefined}
            class="relative flex flex-col items-center px-0.5 border-b-2 disabled:cursor-default
              {meaning ? 'border-dashed border-primary-edge cursor-help' : 'border-transparent'}"
          >
            <HindiWord hindi={word} />
            {#if hintIndex === i && meaning}
              <span class="absolute top-full mt-2 left-1/2 -translate-x-1/2 z-20 whitespace-nowrap px-3 py-1.5 rounded-xl bg-bg-surface border-2 border-border-warm text-sm font-bold text-text-primary shadow-lg animate-pop-in">
                {meaning}
              </span>
            {/if}
          </button>
        {/each}
      </div>
    </div>
  </div>

  <WordTilePicker {tiles} onChange={(w: string[]) => { hintIndex = null; onChange(w); }} {disabled} />
</div>
