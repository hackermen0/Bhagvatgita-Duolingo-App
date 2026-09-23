<script lang="ts">
  import { dateKey } from '../state/gameState.svelte';
  import Mascot from './Mascot.svelte';

  let { streak, activeDays, onContinue } = $props<{
    streak: number;
    activeDays: string[];
    onContinue: () => void;
  }>();

  const DAY_LABELS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
  const MILESTONES = [3, 7, 14, 30, 50, 100, 365];

  const today = new Date();
  const todayKey = dateKey(today);
  const week = DAY_LABELS.map((label, i) => {
    const d = new Date(today);
    d.setDate(today.getDate() - today.getDay() + i);
    const key = dateKey(d);
    return { label, key, isToday: key === todayKey, isFuture: d > today && key !== todayKey };
  });

  let message = $derived.by(() => {
    if (streak === 1) return 'Every journey begins with a single step. Come back tomorrow to build your streak.';
    if (MILESTONES.includes(streak)) return `${streak} days of steady practice — a real milestone! Abhyāsa (steady practice) is how the mind is trained.`;
    return 'Consistency is the heart of sadhana. Keep your practice going tomorrow!';
  });
</script>

<div class="absolute inset-0 bg-bg-base flex flex-col items-center justify-center p-6 text-center z-50 animate-[fade-in_0.3s_ease-out]">
  <div class="relative mb-2 animate-lotus-bloom">
    <svg viewBox="0 0 24 24" fill="currentColor" class="w-28 h-28 text-primary drop-shadow-lg">
      <path d="M12 23c-4.97 0-9-4.03-9-9 0-4.13 2.84-7.58 6.72-8.62.44-.12.88.2.88.66v.83c0 2.21 1.79 4 4 4s4-1.79 4-4v-.83c0-.46.44-.78.88-.66C20.16 6.42 23 9.87 23 14c0 4.97-4.03 9-9 9z" />
    </svg>
    <span class="absolute inset-0 flex items-center justify-center pt-6 text-4xl font-black text-bg-base tabular-nums">{streak}</span>
  </div>

  <h1 class="text-3xl font-black text-primary font-cinzel tracking-wide">
    {streak === 1 ? 'Streak Started!' : 'Streak Extended!'}
  </h1>
  <p class="text-sm font-bold text-text-primary mt-1">{streak} day streak</p>

  <div class="flex gap-2 mt-6 mb-5 p-3 rounded-2xl bg-bg-surface border border-border-warm shadow-sm">
    {#each week as day}
      {@const done = activeDays.includes(day.key)}
      <div class="flex flex-col items-center gap-1.5">
        <span class="text-[10px] font-bold {day.isToday ? 'text-primary' : 'text-text-muted'}">{day.label}</span>
        <div
          class="w-7 h-7 rounded-full flex items-center justify-center transition-all
            {done ? 'bg-primary text-bg-base animate-check-pop' : day.isFuture ? 'border-2 border-dashed border-border-warm' : 'bg-border-warm'}"
        >
          {#if done}
            <svg viewBox="0 0 24 24" fill="currentColor" class="w-4 h-4">
              <path fill-rule="evenodd" d="M19.916 4.626a.75.75 0 01.208 1.04l-9 13.5a.75.75 0 01-1.154.114l-6-6a.75.75 0 011.06-1.06l5.353 5.353 8.493-12.739a.75.75 0 011.04-.208z" clip-rule="evenodd" />
            </svg>
          {/if}
        </div>
      </div>
    {/each}
  </div>

  <div class="flex items-center gap-3 max-w-xs mb-8">
    <Mascot mood="happy" size="sm" />
    <p class="text-xs text-text-muted leading-relaxed text-left">{message}</p>
  </div>

  <button
    onclick={onContinue}
    class="w-full max-w-xs bg-primary hover:bg-primary-dark text-bg-base font-black py-4 rounded-2xl shadow-lg btn-3d border-b-4 border-accent transition-all text-sm"
  >
    Continue
  </button>
</div>
