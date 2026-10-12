<script lang="ts">
  import { gameState } from '../state/gameState.svelte';
  import { DIFFICULTY_TIERS, LEARNING_MODES, learningModeInfo } from '../data/onboarding';
  import Mascot from './Mascot.svelte';

  // TEMPORARY, for testing: shown before every verse session so the learning mode and difficulty tier can be switched
  // without a trip to Settings. Remove it (and its use in routes/lesson/[lessonId]) when testing is done.
  let { eyebrow, title, blocked = '', onStart, onBack } = $props<{
    eyebrow: string;
    title: string;
    /** Why the verse can't start in the current mode; the Start button is disabled while it is set */
    blocked?: string;
    onStart: () => void;
    onBack: () => void;
  }>();

  const mode = $derived(learningModeInfo(gameState.learningMode));
  const tier = $derived(DIFFICULTY_TIERS.find((t) => t.tier === gameState.difficultyTier) ?? DIFFICULTY_TIERS[0]);

  function onKey(e: KeyboardEvent) {
    if (e.key !== 'Enter' || blocked) return;
    if ((e.target as HTMLElement | null)?.closest?.('button')) return;
    onStart();
  }
</script>

<svelte:window onkeydown={onKey} />

<div class="w-full h-full flex flex-col bg-bg-base text-text-primary select-none">
  <div class="flex-1 overflow-y-auto scrollbar-none px-5 pt-5 pb-6 flex flex-col gap-4">
    <div class="flex items-end gap-3">
      <div class="flex-1 min-w-0">
        <span class="inline-block rounded-full bg-accent/15 text-accent text-[11px] font-black uppercase tracking-wider px-2.5 py-1 mb-2">
          Testing only
        </span>
        <p class="text-sm font-extrabold uppercase tracking-wider text-accent mb-1">{eyebrow}</p>
        <h1 class="text-2xl font-black leading-tight">{title}</h1>
      </div>
      <Mascot mood="determined" size="lg" />
    </div>

    <div class="card p-4 flex flex-col gap-3">
      <p class="text-xs font-black uppercase tracking-wider text-primary">Learning mode</p>
      <div class="grid grid-cols-2 gap-2">
        {#each LEARNING_MODES as opt}
          <button
            type="button"
            onclick={() => gameState.setLearningMode(opt.mode)}
            class="tile py-2.5 px-2 flex flex-col items-center text-center {gameState.learningMode === opt.mode ? 'tile-selected' : ''}"
          >
            <span class="text-sm font-black">{opt.mode === 'normal' ? 'Learning' : 'Philosophy'}</span>
            <span class="text-[10px] font-bold text-text-muted mt-0.5">{opt.subtitle}</span>
          </button>
        {/each}
      </div>
      <div class="flex flex-wrap items-center gap-1.5">
        {#each mode.steps as step, i}
          {#if i > 0}<span class="text-text-muted text-xs font-black">→</span>{/if}
          <span class="rounded-full bg-bg-surface-alt px-2.5 py-1 text-xs font-extrabold text-text-muted">{step}</span>
        {/each}
      </div>
    </div>

    <div class="card p-4 flex flex-col gap-3">
      <p class="text-xs font-black uppercase tracking-wider text-primary">Level</p>
      <div class="grid grid-cols-3 gap-2">
        {#each DIFFICULTY_TIERS as opt}
          <button
            type="button"
            onclick={() => gameState.setDifficultyTier(opt.tier)}
            class="tile py-2.5 px-1.5 flex flex-col items-center text-center {gameState.difficultyTier === opt.tier ? 'tile-selected' : ''}"
          >
            <span class="text-sm font-black">{opt.title}</span>
            <span class="text-[10px] font-bold text-text-muted mt-0.5">{opt.short}</span>
          </button>
        {/each}
      </div>
      <p class="text-[15px] leading-snug {tier.tier === 'hard' ? 'font-deva font-bold' : 'font-black italic'}">{tier.sample}</p>
    </div>

    {#if blocked}
      <p class="text-sm font-bold text-error-dark dark:text-error leading-snug rounded-2xl bg-error-soft px-4 py-3">{blocked}</p>
    {/if}
  </div>

  <div class="lesson-footer flex flex-col gap-2">
    <button onclick={onStart} disabled={!!blocked} class="btn w-full {blocked ? 'btn-disabled' : 'btn-primary'}">Start</button>
    <button onclick={onBack} class="btn btn-ghost w-full">Back to the path</button>
  </div>
</div>
