<script lang="ts">
  import { onMount } from 'svelte';
  import type { VersePart } from '../data/gitaData';
  import { chunkColor } from '../data/chunkColors';
  import VerseText from './VerseText.svelte';

  let { part, partIndex, totalParts, onComplete } = $props<{
    part: VersePart;
    partIndex: number;
    totalParts: number;
    onComplete: () => void;
  }>();

  let isSpeaking = $state(false);
  let rate = $state<'normal' | 'slow'>('normal');
  let speechSupported = $state(false);
  let currentUtterance: SpeechSynthesisUtterance | null = null;

  onMount(() => {
    speechSupported = typeof window !== 'undefined' && 'speechSynthesis' in window;
    return () => {
      currentUtterance = null;
      if (speechSupported) window.speechSynthesis.cancel();
    };
  });

  function toggleListen() {
    if (!speechSupported) return;
    if (isSpeaking) {
      currentUtterance = null;
      window.speechSynthesis.cancel();
      isSpeaking = false;
      return;
    }
    startSpeaking();
  }

  function setRate(newRate: 'normal' | 'slow') {
    if (rate === newRate) return;
    rate = newRate;
    // Switching speed mid-playback restarts the phrase at the new rate
    if (isSpeaking) startSpeaking();
  }

  function startSpeaking() {
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(part.sanskrit);
    utterance.lang = 'hi-IN';
    utterance.rate = rate === 'slow' ? 0.4 : 0.75;
    // Cancelling fires the old utterance's callbacks late; the identity check ignores stale ones
    utterance.onend = utterance.onerror = () => {
      if (currentUtterance === utterance) isSpeaking = false;
    };
    currentUtterance = utterance;
    isSpeaking = true;
    window.speechSynthesis.speak(utterance);
  }
</script>

<svelte:window onkeydown={(e) => e.key === 'Enter' && onComplete()} />

<div class="flex-1 overflow-y-auto scrollbar-none px-5 pt-4 pb-6 flex flex-col gap-5 select-none">
  <div>
    <p class="text-sm font-extrabold uppercase tracking-wider text-accent">Build the phrases · {partIndex} of {totalParts}</p>
    <h2 class="text-2xl font-black leading-tight mt-1">Now say it in pieces</h2>
  </div>

  <!-- Where this phrase sits in the verse: done pieces filled, this one numbered, the rest still to come -->
  <div class="flex items-center gap-2" role="img" aria-label="Phrase {partIndex} of {totalParts}">
    {#each { length: totalParts } as _, i}
      {@const n = i + 1}
      <span
        class="h-7 rounded-full flex items-center justify-center text-sm font-black transition-all
          {n === partIndex ? 'w-7 text-white' : n < partIndex ? 'w-7 text-white opacity-60' : 'w-7 border-2 border-border-warm text-text-muted'}"
        style={n <= partIndex ? `background: ${chunkColor(i)}` : ''}
      >{n}</span>
      {#if n < totalParts}<span class="flex-1 h-0.5 bg-border-warm"></span>{/if}
    {/each}
  </div>

  <div class="card px-4 py-5 flex flex-col items-center gap-4 text-center" style="border-color: {chunkColor(partIndex - 1)}">
    <VerseText sanskrit={part.sanskrit} transliteration={part.transliteration} class="text-xl font-black text-primary-dark dark:text-primary leading-relaxed" />
    <p class="text-base font-bold text-text-muted leading-snug pt-3 border-t-2 border-border-warm w-full">{part.translation}</p>
  </div>

  {#if speechSupported}
    <div class="flex flex-col items-center gap-3">
    <button
      type="button"
      onclick={toggleListen}
      aria-label={isSpeaking ? 'Stop' : 'Listen to this phrase'}
      class="relative flex items-center justify-center gap-3 h-14 px-8 rounded-2xl bg-info text-white active:translate-y-1 transition-transform"
      style="box-shadow: 0 5px 0 var(--color-info-dark)"
    >
      {#if isSpeaking}
        <span class="absolute -inset-1.5 rounded-[1.4rem] animate-pulse-ring pointer-events-none"></span>
      {/if}
      <svg viewBox="0 0 24 24" fill="currentColor" class="w-7 h-7">
        {#if isSpeaking}
          <path d="M6 6h4v12H6zm8 0h4v12h-4z" />
        {:else}
          <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3a4.5 4.5 0 00-2.5-4.03v8.06A4.5 4.5 0 0016.5 12zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z" />
        {/if}
      </svg>
      <span class="text-base font-black uppercase tracking-wide">{isSpeaking ? 'Stop' : 'Listen'}</span>
    </button>

    <!-- Speed toggle — only shown while actively speaking -->
    {#if isSpeaking}
      <div class="flex items-center rounded-full border-2 mt-2 border-border-warm bg-bg-surface p-0.5 animate-[fade-in_0.2s_ease-out]">
        {#each ['slow', 'normal'] as const as r}
          <button
            type="button"
            onclick={() => setRate(r)}
            class="px-4 py-1 rounded-full text-xs font-black uppercase tracking-wide {rate === r ? 'bg-info text-white' : 'text-text-muted hover:text-text-primary'}"
          >
            {r}
          </button>
        {/each}
      </div>
    {/if}
    </div>
  {/if}
</div>

<div class="lesson-footer">
  <button type="button" onclick={onComplete} class="btn btn-primary w-full">Let's build it</button>
</div>
