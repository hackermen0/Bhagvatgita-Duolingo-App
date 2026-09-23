<script lang="ts">
  import { onMount } from 'svelte';
  import type { ListeningOption } from '../data/gitaData';
  import { playPopSound } from '../utils/soundEffects';
  import SanskritWord from './SanskritWord.svelte';

  let { audioText, options, onSelect } = $props<{
    audioText: string;
    options: ListeningOption[];
    onSelect: (word: string) => void;
  }>();

  let selected = $state<string | null>(null);
  let isSpeaking = $state(false);
  let rate = $state<'normal' | 'slow'>('normal');
  let speechSupported = $state(false);
  let currentUtterance: SpeechSynthesisUtterance | null = null;

  onMount(() => {
    speechSupported = 'speechSynthesis' in window;
    const t = setTimeout(play, 350);
    return () => {
      clearTimeout(t);
      if (speechSupported) window.speechSynthesis.cancel();
    };
  });

  function play() {
    if (!speechSupported) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(audioText);
    utterance.lang = 'hi-IN';
    utterance.rate = rate === 'slow' ? 0.4 : 0.75;
    // A cancelled utterance fires onend late; ignore it if a newer one has started
    utterance.onend = utterance.onerror = () => {
      if (currentUtterance === utterance) isSpeaking = false;
    };
    currentUtterance = utterance;
    isSpeaking = true;
    window.speechSynthesis.speak(utterance);
  }

  function setRate(newRate: 'normal' | 'slow') {
    rate = newRate;
    play();
  }

  function choose(word: string) {
    playPopSound();
    selected = word;
    onSelect(word);
  }
</script>

<div class="flex flex-col items-center gap-6 w-full max-w-lg mx-auto select-none">
  <div class="flex flex-col items-center gap-3">
    <button
      type="button"
      onclick={play}
      aria-label="Play audio"
      class="relative w-20 h-20 rounded-3xl bg-primary text-bg-base flex items-center justify-center shadow-lg btn-3d border-b-4 border-accent active:scale-95 transition-all"
    >
      {#if isSpeaking}
        <div class="absolute -inset-1.5 rounded-[1.75rem] border-2 border-primary/40 animate-pulse-ring pointer-events-none"></div>
      {/if}
      <svg viewBox="0 0 24 24" fill="currentColor" class="w-9 h-9">
        <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3a4.5 4.5 0 00-2.5-4.03v8.06A4.5 4.5 0 0016.5 12zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z" />
      </svg>
    </button>

    <div class="flex items-center rounded-full border border-border-warm bg-bg-surface p-0.5">
      {#each ['slow', 'normal'] as const as r}
        <button
          type="button"
          onclick={() => setRate(r)}
          class="px-3.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide transition-all
            {rate === r ? 'bg-primary text-bg-base shadow-sm' : 'text-text-muted hover:text-text-primary'}"
        >
          {r}
        </button>
      {/each}
    </div>
  </div>

  <div class="grid grid-cols-2 gap-3 w-full">
    {#each options as option (option.word)}
      {@const isSelected = selected === option.word}
      <button
        type="button"
        onclick={() => choose(option.word)}
        class="flex flex-col items-center justify-center gap-1 p-4 rounded-2xl border border-b-4 tile-3d transition-all
          {isSelected
            ? 'bg-primary/20 border-primary text-text-primary shadow-md'
            : 'bg-bg-surface hover:bg-bg-surface-alt border-border-warm text-text-primary'}"
      >
        <SanskritWord text={option.word} size="lg" />
      </button>
    {/each}
  </div>
</div>
