<script lang="ts">
  import { onMount } from 'svelte';
  import type { ListeningOption } from '../data/gitaData';
  import { playPopSound } from '../utils/soundEffects';
  import SanskritWord from './SanskritWord.svelte';
  import Icon from './Icon.svelte';

  let { audioText, options, onSelect, disabled = false } = $props<{
    audioText: string;
    options: ListeningOption[];
    onSelect: (word: string) => void;
    disabled?: boolean;
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
      currentUtterance = null;
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
    if (disabled) return;
    playPopSound();
    selected = word;
    onSelect(word);
  }
</script>

<div class="flex flex-col items-center gap-8 w-full select-none">
  <div class="flex flex-col items-center gap-3">
    <button
      type="button"
      onclick={play}
      aria-label="Play audio"
      class="relative w-24 h-24 rounded-3xl bg-info text-white flex items-center justify-center transition-transform active:translate-y-1"
      style="box-shadow: 0 5px 0 var(--color-info-dark)"
    >
      {#if isSpeaking}
        <span class="absolute -inset-2 rounded-[1.9rem] border-4 border-info/30 animate-pulse-ring pointer-events-none"></span>
      {/if}
      <Icon name="speaker" class="w-12 h-12" />
    </button>

    <div class="flex items-center rounded-full border-2 border-border-warm bg-bg-surface p-0.5">
      {#each ['slow', 'normal'] as const as r}
        <button
          type="button"
          onclick={() => setRate(r)}
          class="px-4 py-1 rounded-full text-xs font-black uppercase tracking-wide transition-all
            {rate === r ? 'bg-info text-white' : 'text-text-muted hover:text-text-primary'}"
        >
          {r}
        </button>
      {/each}
    </div>
  </div>

  <div class="grid grid-cols-2 gap-3 w-full">
    {#each options as option (option.word)}
      <button
        type="button"
        onclick={() => choose(option.word)}
        class="tile flex flex-col items-center justify-center gap-1 p-4 min-h-24 {selected === option.word ? 'tile-selected' : ''}"
      >
        <SanskritWord text={option.word} size="lg" />
      </button>
    {/each}
  </div>
</div>
