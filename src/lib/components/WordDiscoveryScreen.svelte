<script lang="ts">
  import type { VersePart } from '../data/gitaData';
  import WordCard from './WordCard.svelte';
  import VerseText from './VerseText.svelte';

  let { part, partIndex, totalParts, onComplete, canSkip = false } = $props<{
    part: VersePart;
    partIndex: number;
    totalParts: number;
    onComplete: () => void;
    canSkip?: boolean;
  }>();

  let wordIndex = $state(0);
  let flipped = $state(false);

  let currentWord = $derived(part.wordBreakdown[wordIndex]);
  let totalWords = $derived(part.wordBreakdown.length);

  // Reset when part changes
  $effect(() => {
    void part.partIndex;
    wordIndex = 0;
    flipped = false;
  });

  function next() {
    if (!flipped) {
      flipped = true;
      return;
    }
    if (wordIndex < totalWords - 1) {
      wordIndex += 1;
      flipped = false;
    } else {
      onComplete();
    }
  }
</script>

<svelte:window onkeydown={(e) => e.key === 'Enter' && next()} />

<div class="flex-1 overflow-y-auto scrollbar-none px-5 pt-4 pb-6 flex flex-col">
  <div class="flex items-start justify-between gap-3">
    <div>
      <p class="text-sm font-extrabold uppercase tracking-wider text-accent">New word · Part {partIndex} of {totalParts}</p>
      <h2 class="text-2xl font-black leading-tight mt-1">
        {flipped ? 'Remember this meaning' : 'Tap the card to reveal'}
      </h2>
    </div>
    {#if canSkip}
      <button type="button" onclick={onComplete} class="btn btn-ghost min-h-9! px-3! text-xs! shrink-0">Skip words</button>
    {/if}
  </div>

  <div class="card bg-bg-surface-alt! px-4 py-3 text-center mt-4">
    <VerseText sanskrit={part.sanskrit} transliteration={part.transliteration} class="text-base font-bold text-primary-dark dark:text-primary leading-relaxed" />
  </div>

  <div class="flex items-center justify-center gap-1.5 mt-5">
    {#each part.wordBreakdown as _, i}
      <span class="h-2 rounded-full transition-all duration-300 {i < wordIndex ? 'w-2 bg-primary' : i === wordIndex ? 'w-6 bg-primary' : 'w-2 bg-border-warm'}"></span>
    {/each}
  </div>

  <div class="flex-1 flex items-center justify-center py-6">
    {#if currentWord}
      {#key wordIndex}
        <WordCard word={currentWord} bind:flipped />
      {/key}
    {/if}
  </div>
</div>

<div class="lesson-footer">
  <button type="button" onclick={next} class="btn w-full {flipped ? 'btn-primary' : 'btn-secondary'}">
    {flipped ? (wordIndex < totalWords - 1 ? 'Continue' : "Let's practice") : 'Reveal meaning'}
  </button>
</div>
