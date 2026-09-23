<script lang="ts">
  import { gameState } from '$lib/state/gameState.svelte';
  import { planById } from '$lib/data/onboarding';
  import Icon, { type IconName } from '$lib/components/Icon.svelte';
  import Mascot from '$lib/components/Mascot.svelte';

  const joined = $derived(
    new Date(gameState.joinedDate + 'T00:00:00').toLocaleDateString(undefined, { month: 'long', year: 'numeric' })
  );
  const wordsLearned = $derived(Object.keys(gameState.wordMemory).length);
  const reflections = $derived(Object.keys(gameState.userReflections).length);

  const stats = $derived<{ icon: IconName; color: string; value: number; label: string }[]>([
    { icon: 'flame', color: 'text-primary', value: gameState.streak, label: 'Day streak' },
    { icon: 'bolt', color: 'text-gold', value: gameState.xp, label: 'Total XP' },
    { icon: 'book', color: 'text-success', value: gameState.completedLessons.length, label: 'Verses learned' },
    { icon: 'star', color: 'text-info', value: wordsLearned, label: 'Words learned' }
  ]);

  interface Achievement {
    title: string;
    icon: IconName;
    color: string;
    value: number;
    tiers: number[];
    describe: (n: number) => string;
  }

  const achievements = $derived<Achievement[]>([
    { title: 'Wildfire', icon: 'flame', color: 'var(--color-primary)', value: gameState.streak, tiers: [3, 7, 14, 30, 60, 100], describe: (n) => `Reach a ${n} day streak` },
    { title: 'Sage', icon: 'bolt', color: 'var(--color-gold)', value: gameState.xp, tiers: [100, 250, 500, 1000, 2500, 5000], describe: (n) => `Earn ${n} XP` },
    { title: 'Scholar', icon: 'book', color: 'var(--color-success)', value: gameState.completedLessons.length, tiers: [1, 3, 5, 10, 25], describe: (n) => `Learn ${n} verse${n === 1 ? '' : 's'}` },
    { title: 'Wordsmith', icon: 'star', color: 'var(--color-info)', value: wordsLearned, tiers: [10, 25, 50, 100, 200], describe: (n) => `Learn ${n} words` },
    { title: 'Reflective', icon: 'pencil', color: 'var(--color-accent)', value: reflections, tiers: [1, 3, 5, 10, 25], describe: (n) => `Write ${n} reflection${n === 1 ? '' : 's'}` }
  ]);

  const levelOf = (a: Achievement) => a.tiers.filter((t) => a.value >= t).length;
</script>

<header class="shrink-0 h-14 flex items-center justify-between px-4 border-b-2 border-border-warm bg-bg-base">
  <span class="w-10"></span>
  <h1 class="text-lg font-black">Profile</h1>
  <a href="/settings" aria-label="Settings" class="w-10 h-10 flex items-center justify-center rounded-xl text-text-muted hover:bg-bg-surface-alt">
    <Icon name="gear" class="w-6 h-6" />
  </a>
</header>

<div class="flex-1 overflow-y-auto scrollbar-none">
  <!-- Identity -->
  <div class="bg-primary-soft border-b-2 border-border-warm flex justify-center pt-8 pb-6">
    <div class="w-28 h-28 rounded-full border-4 border-dashed border-primary-edge bg-bg-surface flex items-center justify-center">
      <Mascot mood="happy" size="lg" />
    </div>
  </div>
  <div class="px-4 py-5 border-b-2 border-border-warm">
    <h2 class="text-2xl font-black">Gītā Learner</h2>
    <p class="text-[15px] text-text-muted font-bold mt-0.5">Joined {joined}</p>
    {#if gameState.profile}
      <p class="mt-3 inline-flex items-center gap-2 text-sm font-extrabold px-3 py-1.5 rounded-xl bg-bg-surface border-2 border-border-warm">
        <span class="font-deva text-primary text-base leading-none">ॐ</span>
        Bhagavad Gītā · {planById(gameState.profile.plan).name} plan
      </p>
    {/if}
  </div>

  <div class="px-4 py-6 flex flex-col gap-8">
    <!-- Statistics -->
    <section>
      <h3 class="text-xl font-black mb-3">Statistics</h3>
      <div class="grid grid-cols-2 gap-3">
        {#each stats as s}
          <div class="card px-4 py-3 flex items-center gap-3">
            <Icon name={s.icon} class="w-7 h-7 shrink-0 {s.color}" />
            <div class="min-w-0">
              <p class="text-lg font-black tabular-nums leading-tight">{s.value}</p>
              <p class="text-sm text-text-muted font-bold truncate">{s.label}</p>
            </div>
          </div>
        {/each}
      </div>
    </section>

    <!-- Achievements -->
    <section class="pb-4">
      <h3 class="text-xl font-black mb-3">Achievements</h3>
      <ul class="card divide-y-2 divide-border-warm">
        {#each achievements as a}
          {@const level = levelOf(a)}
          {@const maxed = level >= a.tiers.length}
          {@const next = maxed ? a.tiers[a.tiers.length - 1] : a.tiers[level]}
          <li class="flex items-center gap-4 p-4">
            <div
              class="shrink-0 w-16 h-[72px] rounded-xl flex flex-col items-center justify-center gap-1 text-white {level === 0 ? 'opacity-40 grayscale' : ''}"
              style="background: {a.color}; box-shadow: 0 4px 0 rgba(0,0,0,0.2)"
            >
              <Icon name={a.icon} class="w-8 h-8" />
              <span class="text-[10px] font-black uppercase tracking-wide">Level {Math.max(level, 1)}</span>
            </div>
            <div class="flex-1 min-w-0">
              <div class="flex items-baseline justify-between gap-2">
                <p class="text-base font-black">{a.title}</p>
                <span class="text-sm font-bold text-text-muted tabular-nums">{Math.min(a.value, next)}/{next}</span>
              </div>
              <div class="progress-track h-3! mt-1.5" style="--fill: var(--color-gold)">
                <div class="progress-fill" style="width: {Math.min(100, (a.value / next) * 100)}%"></div>
              </div>
              <p class="text-sm text-text-muted mt-1.5">{maxed ? 'Max level reached!' : a.describe(next)}</p>
            </div>
          </li>
        {/each}
      </ul>
    </section>
  </div>
</div>
