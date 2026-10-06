<script lang="ts">
  import { onMount } from 'svelte';
  import type { JourneyWord } from '../data/journey';
  import { gameState } from '../state/gameState.svelte';
  import SpeakButton from './SpeakButton.svelte';

  // A flip card for one word: the Hindi on the front (with a voice), the English meaning on the back (with a voice).
  let { word, flipped = false, onFlip, delay = 0 } = $props<{
    word: JourneyWord;
    flipped?: boolean;
    onFlip: () => void;
    /** Stagger for the entrance animation when several cards appear together */
    delay?: number;
  }>();

  let entered = $state(false);

  onMount(() => {
    const t = setTimeout(() => (entered = true), 30 + delay);
    return () => clearTimeout(t);
  });

  // The difficulty tier decides the script: Roman Hindi on Beginner, Devanagari on Medium and Hard
  const isDeva = $derived(gameState.tierScriptMode === 'devanagari');

  // Grid cards are narrow, so long compounds step down a size rather than wrap mid-word
  const devSize = $derived(word.hindi.dev.length > 13 ? 'text-lg' : word.hindi.dev.length > 9 ? 'text-2xl' : 'text-3xl');
  const romanSize = $derived(word.hindi.roman.length > 13 ? 'text-xl' : 'text-2xl');
  const meaningSize = $derived(word.english.length > 14 ? 'text-base' : 'text-xl');
</script>

<div
  class="card-scene w-full select-none cursor-pointer"
  style="height: 200px;"
  onclick={onFlip}
  role="button"
  tabindex="0"
  onkeydown={(e) => e.key === ' ' && (e.preventDefault(), onFlip())}
  aria-label="Vocabulary card for {word.hindi.roman}. Tap to flip."
  aria-pressed={flipped}
>
  <div class="card-inner w-full h-full {flipped ? 'card-flipped' : ''} {entered ? 'card-entered' : 'card-pending'}">
    <!-- FRONT -->
    <div class="card-face card border-b-[5px]! flex flex-col items-center justify-center gap-2 p-3">
      {#if isDeva}
        <p class="{devSize} font-bold text-primary font-deva leading-tight text-center">{word.hindi.dev}</p>
      {:else}
        <p class="{romanSize} font-black text-primary leading-tight text-center">{word.hindi.roman}</p>
      {/if}
      <div class="flex items-center gap-1.5 mt-1">
        <SpeakButton text={word.hindi.dev} lang="hi" label="Hindi" size="sm" />
        <SpeakButton text={word.hindi.dev} lang="hi" label="Slow" size="sm" rate={0.4} />
      </div>
    </div>

    <!-- BACK -->
    <div class="card-face card-back card border-b-[5px]! border-primary-edge! bg-primary-soft! flex flex-col items-center justify-center gap-1.5 p-3">
      <p class="text-[10px] font-black uppercase tracking-wider text-primary-dark dark:text-primary">Meaning</p>
      <p class="{meaningSize} font-black text-center leading-tight">{word.english}</p>
      <SpeakButton text={word.english} lang="en" label="English" size="sm" />
      <!-- One-line reminder of which word this is, in the learner's script -->
      {#if isDeva}
        <p class="text-lg text-primary-dark dark:text-primary font-deva leading-tight">{word.hindi.dev}</p>
      {:else}
        <p class="text-sm font-black text-primary-dark dark:text-primary text-center leading-tight">{word.hindi.roman}</p>
      {/if}
    </div>
  </div>
</div>

<style>
  .card-scene { perspective: 1000px; }
  .card-inner {
    position: relative;
    transform-style: preserve-3d;
    transition: transform 0.55s cubic-bezier(0.4, 0.2, 0.2, 1);
  }
  .card-pending { transform: scale(0.88); opacity: 0; }
  .card-entered {
    transform: scale(1);
    opacity: 1;
    transition: transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1), opacity 0.3s ease;
  }
  .card-flipped.card-entered {
    transform: scale(1) rotateY(180deg);
    transition: transform 0.55s cubic-bezier(0.4, 0.2, 0.2, 1);
  }
  .card-face {
    position: absolute;
    inset: 0;
    backface-visibility: hidden;
    -webkit-backface-visibility: hidden;
  }
  .card-back { transform: rotateY(180deg); }
</style>
