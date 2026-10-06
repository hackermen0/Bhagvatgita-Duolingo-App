<script lang="ts">
  import { goto } from '$app/navigation';
  import { gameState, DAILY_GOAL_OPTIONS } from '$lib/state/gameState.svelte';
  import { planById, DIFFICULTY_TIERS, type PracticePreference } from '$lib/data/onboarding';
  import { gitaData } from '$lib/data/gitaData';
  import { JOURNEY_PAGE_COUNT } from '$lib/data/journey';
  import Icon from '$lib/components/Icon.svelte';

  const PRACTICE_STYLES: { value: PracticePreference; label: string }[] = [
    { value: 'listening', label: 'Listening' },
    { value: 'balanced', label: 'Balanced' },
    { value: 'reading', label: 'Reading' }
  ];

  const back = () => (history.length > 1 ? history.back() : goto('/profile'));

  function redoOnboarding() {
    if (confirm('Retake the onboarding questions? Your lesson progress will not be affected.')) {
      gameState.resetOnboarding();
    }
  }

  // ─── Developer menu (testing) ──────────────────────────────────────────────
  let devOpen = $state(false);
  const units = gitaData.chapters.flatMap((c) => c.sections.map((s) => ({ chapter: c, section: s })));
  const allIds = units.flatMap((u) => u.section.lessons.map((l) => l.id));

  function devStatus(id: string): { label: string; tone: 'done' | 'progress' | 'idle' } {
    if (gameState.completedLessons.includes(id)) return { label: 'Completed', tone: 'done' };
    const cp = gameState.checkpointFor(id);
    if (cp) return { label: `Page ${cp.page + 1} of ${JOURNEY_PAGE_COUNT}`, tone: 'progress' };
    return { label: 'Not started', tone: 'idle' };
  }

  function devResetAllVerses() {
    if (confirm('Put every verse back to "not started"? XP, streak and hearts are kept.')) {
      gameState.devSetLessonsComplete(allIds, false);
    }
  }

  function resetProgress() {
    if (confirm('Reset all lesson progress, streak, and XP? This cannot be undone.')) {
      gameState.resetState();
      goto('/');
    }
  }
</script>

<header class="shrink-0 h-14 flex items-center justify-between px-2 border-b-2 border-border-warm bg-bg-base">
  <button type="button" onclick={back} aria-label="Back" class="w-10 h-10 flex items-center justify-center rounded-xl text-text-muted hover:bg-bg-surface-alt">
    <Icon name="back" class="w-6 h-6" />
  </button>
  <h1 class="text-lg font-black">Settings</h1>
  <span class="w-10"></span>
</header>

<div class="flex-1 overflow-y-auto scrollbar-none">
<div class="px-4 py-5 flex flex-col gap-7">
  <section>
    <h2 class="text-sm font-extrabold uppercase tracking-wider text-text-muted mb-2">Preferences</h2>
    <div class="card divide-y-2 divide-border-warm">
      <div class="flex items-center justify-between px-4 py-4">
        <span class="text-base font-black">Dark mode</span>
        <button
          type="button"
          role="switch"
          aria-checked={gameState.themeMode === 'dark'}
          aria-label="Dark mode"
          onclick={() => gameState.toggleTheme()}
          class="relative w-14 h-8 rounded-full transition-colors {gameState.themeMode === 'dark' ? 'bg-primary' : 'bg-border-warm'}"
        >
          <span class="absolute top-1 left-1 w-6 h-6 rounded-full bg-white shadow transition-transform {gameState.themeMode === 'dark' ? 'translate-x-6' : ''}"></span>
        </button>
      </div>
      <div class="px-4 py-4 flex flex-col gap-3">
        <div class="flex items-center justify-between">
          <span class="text-base font-black">Difficulty tier</span>
          <span class="text-xs font-extrabold text-primary uppercase tracking-wide">
            {gameState.difficultyTier} tier
          </span>
        </div>
        <div class="grid grid-cols-3 gap-2">
          {#each DIFFICULTY_TIERS as tierOpt}
            <button
              type="button"
              onclick={() => gameState.setDifficultyTier(tierOpt.tier)}
              class="tile py-2.5 px-1.5 flex flex-col items-center text-center {gameState.difficultyTier === tierOpt.tier ? 'tile-selected' : ''}"
            >
              <span class="text-sm font-black">{tierOpt.title}</span>
              <span class="text-[10px] font-bold text-text-muted mt-0.5">{tierOpt.short}</span>
            </button>
          {/each}
        </div>
        <p class="text-xs font-bold text-text-muted leading-relaxed">
          {DIFFICULTY_TIERS.find((t) => t.tier === gameState.difficultyTier)?.description} You always answer in English.
        </p>
      </div>
      {#if gameState.profile}
        <div class="px-4 py-4 flex flex-col gap-3">
          <span class="text-base font-black">Exercise style</span>
          <div class="grid grid-cols-3 gap-2">
            {#each PRACTICE_STYLES as style}
              <button
                type="button"
                onclick={() => gameState.setPracticePreference(style.value)}
                class="tile py-2.5 text-sm font-black {gameState.profile.practicePreference === style.value ? 'tile-selected' : ''}"
              >
                {style.label}
              </button>
            {/each}
          </div>
        </div>
      {/if}
    </div>
  </section>

  <section>
    <h2 class="text-sm font-extrabold uppercase tracking-wider text-text-muted mb-2">Daily goal</h2>
    <div class="flex flex-col gap-2.5">
      {#each DAILY_GOAL_OPTIONS as option}
        {@const active = gameState.dailyGoal === option.xp}
        <button
          type="button"
          onclick={() => gameState.setDailyGoal(option.xp)}
          class="tile px-4 py-3.5 flex items-center justify-between {active ? 'tile-selected' : ''}"
        >
          <span class="text-base font-black">{option.label}</span>
          <span class="text-base font-bold {active ? '' : 'text-text-muted'}">{option.xp} XP per day</span>
        </button>
      {/each}
    </div>
  </section>

  <section>
    <h2 class="text-sm font-extrabold uppercase tracking-wider text-text-muted mb-2">Learning plan</h2>
    <div class="card divide-y-2 divide-border-warm">
      {#if gameState.profile}
        {@const plan = planById(gameState.profile.plan)}
        <div class="flex items-center justify-between px-4 py-4">
          <span class="text-base font-black">Your plan</span>
          <span class="text-base font-extrabold text-primary">{plan.name} · {plan.timeLabel}</span>
        </div>
      {/if}
      <button type="button" onclick={redoOnboarding} class="w-full flex items-center justify-between px-4 py-4 hover:bg-bg-surface-alt text-left">
        <span class="text-base font-black">Retake onboarding</span>
        <Icon name="chevron-right" class="w-5 h-5 text-text-muted" />
      </button>
    </div>
  </section>

  <section>
    <button
      type="button"
      onclick={() => (devOpen = !devOpen)}
      aria-expanded={devOpen}
      class="w-full flex items-center justify-between text-sm font-extrabold uppercase tracking-wider text-text-muted mb-2"
    >
      <span>Developer menu · for testing</span>
      <Icon name="chevron-right" class="w-4 h-4 transition-transform {devOpen ? 'rotate-90' : ''}" />
    </button>

    {#if devOpen}
      <div class="flex flex-col gap-4 animate-[fade-in_0.2s_ease-out]">
        <div class="card p-3 grid grid-cols-2 gap-2">
          <button type="button" onclick={() => gameState.devSetLessonsComplete(allIds, true)} class="tile py-2.5 px-2 text-sm font-black">Complete all verses</button>
          <button type="button" onclick={devResetAllVerses} class="tile py-2.5 px-2 text-sm font-black">Reset all verses</button>
          <button type="button" onclick={() => gameState.refillHearts()} class="tile py-2.5 px-2 text-sm font-black">Refill hearts ({gameState.hearts}/5)</button>
          <button type="button" onclick={() => gameState.devClearWordMemory()} class="tile py-2.5 px-2 text-sm font-black">Forget learned words</button>
        </div>

        {#each units as { chapter, section }}
          <div>
            <p class="text-xs font-extrabold uppercase tracking-wider text-text-muted mb-1.5">Chapter {chapter.number} · {section.title}</p>
            <div class="card divide-y-2 divide-border-warm">
              {#each section.lessons as lesson}
                {@const status = devStatus(lesson.id)}
                <div class="px-4 py-3 flex items-center gap-3">
                  <div class="flex-1 min-w-0">
                    <p class="text-base font-black leading-tight">{lesson.verseRef} · {lesson.title}</p>
                    <p class="text-xs font-extrabold {status.tone === 'done' ? 'text-success' : status.tone === 'progress' ? 'text-primary' : 'text-text-muted'}">{status.label}</p>
                  </div>
                  <button
                    type="button"
                    onclick={() => gameState.devSetLessonsComplete([lesson.id], true)}
                    disabled={status.tone === 'done'}
                    class="tile px-3 py-1.5 text-xs font-black disabled:opacity-40"
                  >Complete</button>
                  <button
                    type="button"
                    onclick={() => gameState.devSetLessonsComplete([lesson.id], false)}
                    disabled={status.tone === 'idle'}
                    class="tile px-3 py-1.5 text-xs font-black disabled:opacity-40"
                  >Reset</button>
                </div>
              {/each}
            </div>
          </div>
        {/each}
        <p class="text-xs font-bold text-text-muted leading-relaxed">
          Complete marks a verse done without playing it (no XP). Reset puts it back to not started, drops any saved page and lets the unit story play again. Neither touches XP or streak.
        </p>
      </div>
    {/if}
  </section>

  <section class="pb-6">
    <button type="button" onclick={resetProgress} class="btn btn-secondary w-full text-error!">
      Reset progress
    </button>
  </section>
</div>
</div>
