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

  // `flips` is what each card currently shows; `seen` remembers every card revealed at least
  // once, so flipping one back to its front doesn't undo the progress toward continuing.
  let flips = $state<boolean[]>([]);
  let seen = $state<boolean[]>([]);

  const words = $derived(part.wordBreakdown);
  const allSeen = $derived(words.length > 0 && words.every((_: unknown, i: number) => seen[i]));
  const seenCount = $derived(words.filter((_: unknown, i: number) => seen[i]).length);

  // Reset when part changes
  $effect(() => {
    void part.partIndex;
    flips = [];
    seen = [];
  });

  function toggle(i: number) {
    flips[i] = !flips[i];
    if (flips[i]) seen[i] = true;
  }

  function revealAll() {
    flips = words.map(() => true);
    seen = words.map(() => true);
  }

  function primary() {
    if (allSeen) onComplete();
    else revealAll();
  }
</script>

<svelte:window onkeydown={(e) => e.key === 'Enter' && primary()} />

<div class="flex-1 overflow-y-auto scrollbar-none px-5 pt-4 pb-6 flex flex-col">
  <div class="flex items-start justify-between gap-3">
    <div>
      <p class="text-sm font-extrabold uppercase tracking-wider text-accent">New words · Part {partIndex} of {totalParts}</p>
      <h2 class="text-2xl font-black leading-tight mt-1">
        {allSeen ? 'Tap a card to flip it back' : 'Tap each card to reveal'}
      </h2>
    </div>
    {#if canSkip}
      <button type="button" onclick={onComplete} class="btn btn-ghost min-h-9! px-3! text-xs! shrink-0">Skip words</button>
    {/if}
  </div>

  <div class="card bg-bg-surface-alt! px-4 py-3 text-center mt-4">
    <VerseText sanskrit={part.sanskrit} transliteration={part.transliteration} class="text-base font-bold text-primary-dark dark:text-primary leading-relaxed" />
  </div>

  <div class="flex items-center justify-center gap-2 mt-5" aria-label="{seenCount} of {words.length} revealed">
    {#each words as _, i}
      <span class="h-2 rounded-full transition-all duration-300 {seen[i] ? 'w-6 bg-primary' : 'w-2 bg-border-warm'}"></span>
    {/each}
  </div>

  <div class="grid grid-cols-2 gap-3 mt-5 pb-2">
    {#each words as word, i (part.partIndex + word.word)}
      <div class={words.length % 2 === 1 && i === words.length - 1 ? 'col-span-2 justify-self-center w-[calc(50%-0.375rem)]' : ''}>
        <WordCard {word} flipped={!!flips[i]} onFlip={() => toggle(i)} delay={i * 90} />
      </div>
    {/each}
  </div>
</div>

<div class="lesson-footer">
  <button type="button" onclick={primary} class="btn w-full {allSeen ? 'btn-primary' : 'btn-secondary'}">
    {allSeen ? "Let's practice" : 'Reveal all'}
  </button>
</div>
