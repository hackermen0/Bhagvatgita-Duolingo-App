<script lang="ts">
  import { goto } from '$app/navigation';
  import { gameState, DAILY_GOAL_OPTIONS } from '$lib/state/gameState.svelte';
  import { planById, type PracticePreference } from '$lib/data/onboarding';
  import Icon from '$lib/components/Icon.svelte';
  import ScriptToggle from '$lib/components/ScriptToggle.svelte';

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
        <span class="text-base font-black">Sanskrit script</span>
        <ScriptToggle />
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

  <section class="pb-6">
    <button type="button" onclick={resetProgress} class="btn btn-secondary w-full text-error!">
      Reset progress
    </button>
  </section>
</div>
</div>
