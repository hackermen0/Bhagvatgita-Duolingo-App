<script lang="ts">
  import { gameState } from '$lib/state/gameState.svelte';
  import { dailyQuests, hoursLeftToday, QUEST_REWARD_XP } from '$lib/data/quests';
  import { playSuccessSound } from '$lib/utils/soundEffects';
  import Icon from '$lib/components/Icon.svelte';
  import Mascot from '$lib/components/Mascot.svelte';

  const quests = $derived(dailyQuests());
  const doneCount = $derived(quests.filter((q) => q.done).length);
  let justClaimed = $state<string | null>(null);

  function claim(id: string) {
    gameState.claimQuest(id, QUEST_REWARD_XP);
    playSuccessSound();
    justClaimed = id;
    setTimeout(() => (justClaimed = null), 1200);
  }
</script>

<header class="shrink-0 h-14 flex items-center justify-center border-b-2 border-border-warm bg-bg-base">
  <h1 class="text-lg font-black">Quests</h1>
</header>

<div class="flex-1 overflow-y-auto scrollbar-none">
<div class="px-4 py-5 flex flex-col gap-6">
  <!-- Banner -->
  <div class="rounded-2xl bg-accent text-white p-5 flex items-center gap-4" style="box-shadow: 0 4px 0 var(--color-accent-dark)">
    <div class="flex-1">
      <p class="text-xs font-extrabold uppercase tracking-wider opacity-80">Today's sādhanā</p>
      <h2 class="text-2xl font-black leading-tight mt-1">Complete quests to earn rewards!</h2>
      <p class="text-sm font-bold opacity-85 mt-1">{doneCount} of {quests.length} done</p>
    </div>
    <Mascot mood="happy" size="md" />
  </div>

  <div>
    <div class="flex items-center justify-between mb-3">
      <h3 class="text-xl font-black">Daily Quests</h3>
      <span class="flex items-center gap-1.5 text-sm font-extrabold text-gold-dark dark:text-gold">
        <Icon name="clock" class="w-4 h-4" />
        {hoursLeftToday()} hours
      </span>
    </div>

    <ul class="card divide-y-2 divide-border-warm">
      {#each quests as q (q.id)}
        <li class="flex items-center gap-4 px-4 py-4">
          <span class="shrink-0 w-11 h-11 rounded-xl flex items-center justify-center {q.done ? 'bg-gold text-white' : 'bg-gold-soft text-gold-dark dark:text-gold'}">
            <Icon name={q.icon} class="w-6 h-6" />
          </span>
          <div class="flex-1 min-w-0">
            <p class="text-base font-black mb-2">{q.title}</p>
            <div class="progress-track h-[18px]!" style="--fill: var(--color-gold)">
              <div class="progress-fill" style="width: {(q.progress / q.target) * 100}%"></div>
              <span class="absolute inset-0 flex items-center justify-center text-[12px] font-black text-text-primary/70 dark:text-white tabular-nums [text-shadow:0_1px_2px_rgba(0,0,0,0.25)]">
                {q.progress} / {q.target}
              </span>
            </div>
          </div>
          {#if q.done && !q.claimed}
            <button type="button" class="btn btn-gold min-h-10! px-3! text-[13px]!" onclick={() => claim(q.id)}>
              Claim
            </button>
          {:else}
            <span class="shrink-0 relative {q.claimed ? 'text-gold' : 'text-node-locked-edge'}">
              <Icon name={q.claimed ? 'chest-open' : 'chest'} class="w-9 h-9" />
              {#if justClaimed === q.id}
                <span class="absolute -top-5 left-1/2 -translate-x-1/2 text-sm font-black text-gold animate-float-xp whitespace-nowrap">
                  +{QUEST_REWARD_XP} XP
                </span>
              {/if}
            </span>
          {/if}
        </li>
      {/each}
    </ul>
    <p class="text-sm text-text-muted mt-3 text-center">Each completed quest opens a chest worth {QUEST_REWARD_XP} XP.</p>
  </div>

  <!-- Daily goal -->
  <a href="/settings" class="card p-4 flex items-center gap-4 hover:bg-bg-surface-alt transition-colors">
    <Icon name="bolt" class="w-9 h-9 text-gold" />
    <div class="flex-1">
      <p class="text-base font-black">Daily goal: {gameState.dailyGoal} XP</p>
      <p class="text-sm text-text-muted">Change your goal in Settings</p>
    </div>
    <Icon name="chevron-right" class="w-5 h-5 text-text-muted" />
  </a>
</div>
</div>
