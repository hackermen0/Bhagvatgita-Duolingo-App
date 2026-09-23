<script lang="ts">
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import { gameState, MAX_STRENGTH } from '$lib/state/gameState.svelte';
  import { practiceStatus, learnedWordList, MIN_PRACTICE_WORDS } from '$lib/data/practice';
  import Mascot from '$lib/components/Mascot.svelte';
  import Icon from '$lib/components/Icon.svelte';
  import SanskritWord from '$lib/components/SanskritWord.svelte';

  const status = $derived(practiceStatus());
  const words = $derived(
    [...learnedWordList()].sort(
      (a, b) => (gameState.wordMemory[a.word]?.strength ?? 0) - (gameState.wordMemory[b.word]?.strength ?? 0)
    )
  );

  let speechSupported = $state(false);
  onMount(() => (speechSupported = 'speechSynthesis' in window));

  function speak(devanagari: string) {
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(devanagari);
    u.lang = 'hi-IN';
    u.rate = 0.75;
    window.speechSynthesis.speak(u);
  }

  // Memory strength (0–6) shown as Duolingo's four signal bars
  const bars = (word: string) => Math.round(((gameState.wordMemory[word]?.strength ?? 0) / MAX_STRENGTH) * 4);
</script>

<header class="shrink-0 h-14 flex items-center justify-center border-b-2 border-border-warm bg-bg-base">
  <h1 class="text-lg font-black">Practice Hub</h1>
</header>

<div class="flex-1 overflow-y-auto scrollbar-none">
<div class="px-4 py-5 flex flex-col gap-6">
  <!-- Hero: smart review -->
  <div class="card p-5 flex flex-col gap-4 relative overflow-hidden">
    <div class="flex items-start gap-3">
      <div class="flex-1">
        <p class="text-xs font-extrabold uppercase tracking-wider text-accent">Recommended</p>
        <h2 class="text-2xl font-black mt-1">Smart Review</h2>
        <p class="text-[15px] text-text-muted mt-1 leading-snug">
          {#if !status.available}
            Finish your first lesson and your words will show up here.
          {:else if status.dueCount > 0}
            {status.dueCount} word{status.dueCount === 1 ? ' is' : 's are'} ready — review them before they fade.
          {:else}
            All caught up! A quick review keeps words fresh.
          {/if}
        </p>
      </div>
      <Mascot mood="happy" size="md" />
    </div>
    <button
      type="button"
      class="btn btn-primary w-full"
      disabled={!status.available}
      onclick={() => goto('/practice/session?kind=review')}
    >
      {status.available ? 'Start +15 XP' : 'Locked'}
    </button>
  </div>

  <!-- Practice types -->
  <div>
    <h3 class="text-xl font-black mb-3">Practice types</h3>
    <div class="grid grid-cols-2 gap-3">
      <button
        type="button"
        class="tile p-4 flex flex-col items-start gap-3 text-left disabled:opacity-60 disabled:cursor-not-allowed"
        disabled={!status.available || !speechSupported}
        onclick={() => goto('/practice/session?kind=listening')}
      >
        <span class="w-12 h-12 rounded-2xl bg-info text-white flex items-center justify-center" style="box-shadow: 0 3px 0 var(--color-info-dark)">
          <Icon name="headphones" class="w-7 h-7" />
        </span>
        <span>
          <span class="block text-base font-black">Listening</span>
          <span class="block text-[13px] text-text-muted leading-snug">Hear a word, pick what you heard</span>
        </span>
      </button>

      <button
        type="button"
        class="tile p-4 flex flex-col items-start gap-3 text-left relative disabled:opacity-60 disabled:cursor-not-allowed"
        disabled={status.mistakeCount === 0 || !status.available}
        onclick={() => goto('/practice/session?kind=mistakes')}
      >
        <span class="w-12 h-12 rounded-2xl bg-error text-white flex items-center justify-center" style="box-shadow: 0 3px 0 var(--color-error-dark)">
          <Icon name="retry" class="w-7 h-7" />
        </span>
        <span>
          <span class="block text-base font-black">Mistakes</span>
          <span class="block text-[13px] text-text-muted leading-snug">
            {status.mistakeCount > 0 ? `${status.mistakeCount} word${status.mistakeCount === 1 ? '' : 's'} to fix` : 'No recent mistakes'}
          </span>
        </span>
      </button>
    </div>
  </div>

  <!-- Words list -->
  <div class="pb-4">
    <div class="flex items-baseline justify-between mb-3">
      <h3 class="text-xl font-black">Words</h3>
      <span class="text-sm font-bold text-text-muted">{status.learnedCount} learned</span>
    </div>
    {#if words.length === 0}
      <div class="card p-5 text-center text-text-muted text-[15px]">
        Words you learn appear here{status.learnedCount < MIN_PRACTICE_WORDS ? ' after your first lesson' : ''}.
      </div>
    {:else}
      <ul class="card divide-y-2 divide-border-warm">
        {#each words as w (w.word)}
          {@const b = bars(w.word)}
          <li class="flex items-center gap-3 px-4 py-3">
            {#if speechSupported}
              <button
                type="button"
                aria-label="Hear {w.word}"
                onclick={() => speak(w.devanagari)}
                class="shrink-0 w-10 h-10 rounded-xl bg-info/15 text-info flex items-center justify-center active:scale-95"
              >
                <Icon name="speaker" class="w-5 h-5" />
              </button>
            {/if}
            <div class="flex-1 min-w-0 flex flex-col">
              <div class="flex flex-col items-start"><SanskritWord text={w.word} /></div>
              <span class="text-sm text-text-muted truncate">{w.meaning}</span>
            </div>
            <div class="flex items-end gap-0.5 shrink-0" aria-label="Strength {b} of 4">
              {#each [1, 2, 3, 4] as level}
                <span class="w-1.5 rounded-full {level <= b ? 'bg-gold' : 'bg-border-warm'}" style="height: {6 + level * 4}px"></span>
              {/each}
            </div>
          </li>
        {/each}
      </ul>
    {/if}
  </div>
</div>
</div>
