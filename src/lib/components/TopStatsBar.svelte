<script lang="ts">
  import { gameState, dateKey } from '../state/gameState.svelte';
  import { gitaData } from '../data/gitaData';
  import Icon from './Icon.svelte';
  import WeekCalendar from './WeekCalendar.svelte';

  type Panel = 'course' | 'streak' | 'xp' | 'hearts';
  let open = $state<Panel | null>(null);

  const toggle = (p: Panel) => (open = open === p ? null : p);

  const streakActiveToday = $derived(gameState.lastActiveDate === dateKey());
  const totalLessons = gitaData.chapters.flatMap((c) => c.sections.flatMap((s) => s.lessons)).length;
  const goalPct = $derived(Math.min(100, Math.round((gameState.today.xp / gameState.dailyGoal) * 100)));
</script>

<header class="relative z-40 shrink-0 bg-bg-base border-b-2 border-border-warm">
  <div class="flex items-center justify-between px-4 h-14">
    <button
      type="button"
      onclick={() => toggle('course')}
      aria-label="Course"
      class="w-9 h-9 rounded-xl border-2 border-border-warm bg-bg-surface flex items-center justify-center text-lg font-deva text-primary
        {open === 'course' ? 'border-primary-edge bg-primary-soft' : ''}"
    >
      ॐ
    </button>

    <button type="button" onclick={() => toggle('streak')} aria-label="Streak"
      class="flex items-center gap-1.5 px-2 py-1 rounded-xl {open === 'streak' ? 'bg-bg-surface-alt' : ''}">
      <Icon name="flame" class="w-6 h-6 {streakActiveToday ? 'text-primary' : 'text-node-locked-edge'}" />
      <span class="font-black text-base tabular-nums {streakActiveToday ? 'text-primary' : 'text-text-muted'}">{gameState.streak}</span>
    </button>

    <button type="button" onclick={() => toggle('xp')} aria-label="Experience points"
      class="flex items-center gap-1.5 px-2 py-1 rounded-xl {open === 'xp' ? 'bg-bg-surface-alt' : ''}">
      <Icon name="bolt" class="w-6 h-6 text-gold" />
      <span class="font-black text-base tabular-nums text-gold-dark dark:text-gold">{gameState.xp}</span>
    </button>

    <button type="button" onclick={() => toggle('hearts')} aria-label="Hearts"
      class="flex items-center gap-1.5 px-2 py-1 rounded-xl {open === 'hearts' ? 'bg-bg-surface-alt' : ''}">
      <Icon name="heart" class="w-6 h-6 text-error" />
      <span class="font-black text-base tabular-nums text-error">{gameState.hearts}</span>
    </button>
  </div>

  {#if open}
    <button
      type="button"
      aria-label="Close panel"
      class="absolute left-0 right-0 top-full h-[100dvh] bg-black/30 animate-[fade-in_0.15s_ease-out]"
      onclick={() => (open = null)}
    ></button>
    <div class="absolute left-0 right-0 top-full bg-bg-base border-b-2 border-border-warm px-5 py-5 animate-[fade-in_0.15s_ease-out]">
      {#if open === 'course'}
        <p class="text-xs font-extrabold uppercase tracking-wider text-text-muted">My course</p>
        <div class="mt-3 flex items-center gap-3">
          <div class="w-14 h-14 rounded-2xl bg-primary-soft border-2 border-primary-edge flex items-center justify-center text-3xl font-deva text-primary">ॐ</div>
          <div class="flex-1">
            <p class="text-lg font-black">Bhagavad Gītā</p>
            <p class="text-sm text-text-muted">{gameState.completedLessons.length} of {totalLessons} verses learned</p>
          </div>
        </div>
      {:else if open === 'streak'}
        <div class="flex items-center gap-4">
          <div class="flex-1">
            <p class="text-2xl font-black text-primary">{gameState.streak} day streak</p>
            <p class="text-sm text-text-muted mt-0.5">
              {streakActiveToday ? "You've practiced today. See you tomorrow!" : 'Do a lesson today to extend your streak!'}
            </p>
          </div>
          <Icon name="flame" class="w-14 h-14 {streakActiveToday ? 'text-primary' : 'text-node-locked-edge'}" />
        </div>
        <div class="card p-4 mt-4">
          <WeekCalendar activeDays={gameState.activeDays} />
        </div>
      {:else if open === 'xp'}
        <p class="text-xs font-extrabold uppercase tracking-wider text-text-muted">Daily goal</p>
        <div class="mt-3 flex items-center gap-3">
          <Icon name="bolt" class="w-10 h-10 text-gold" />
          <div class="flex-1">
            <div class="progress-track" style="--fill: var(--color-gold)">
              <div class="progress-fill" style="width: {goalPct}%"></div>
            </div>
            <p class="text-sm text-text-muted mt-1.5 font-bold">{gameState.today.xp} / {gameState.dailyGoal} XP today · {gameState.xp} total</p>
          </div>
        </div>
      {:else if open === 'hearts'}
        <p class="text-xl font-black text-center">Hearts</p>
        <div class="flex justify-center gap-2 mt-3">
          {#each Array(5) as _, i}
            <Icon name="heart" class="w-9 h-9 {i < gameState.hearts ? 'text-error' : 'text-node-locked'}" />
          {/each}
        </div>
        <p class="text-sm text-text-muted text-center mt-2">
          {gameState.hearts >= 5 ? 'You have full hearts. Keep on learning!' : 'You lose a heart for each mistake in a lesson.'}
        </p>
        <button
          type="button"
          class="btn btn-secondary w-full mt-4"
          disabled={gameState.hearts >= 5}
          onclick={() => { gameState.refillHearts(); open = null; }}
        >
          <Icon name="heart" class="w-5 h-5 text-error" />
          {gameState.hearts >= 5 ? 'Full hearts' : 'Refill hearts'}
        </button>
      {/if}
    </div>
  {/if}
</header>
