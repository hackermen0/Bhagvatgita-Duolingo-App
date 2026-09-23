<script lang="ts">
  import Icon from './Icon.svelte';
  import WeekCalendar from './WeekCalendar.svelte';

  let { streak, activeDays, onContinue } = $props<{
    streak: number;
    activeDays: string[];
    onContinue: () => void;
  }>();

  const MILESTONES = [3, 7, 14, 30, 50, 100, 365];

  const message = $derived(
    streak === 1
      ? 'Every journey begins with a single step. Practice tomorrow to build your streak!'
      : MILESTONES.includes(streak)
        ? `${streak} days of steady practice — a real milestone! Abhyāsa is how the mind is trained.`
        : "Practice each day so your streak won't reset!"
  );
</script>

<div class="w-full h-full flex flex-col bg-bg-base animate-[fade-in_0.3s_ease-out]">
  <div class="flex-1 flex flex-col items-center justify-center px-6 text-center">
    <div class="relative animate-lotus-bloom">
      <Icon name="flame" class="w-36 h-36 text-primary drop-shadow-lg" />
    </div>
    <p class="text-8xl font-black text-primary tabular-nums leading-none -mt-2">{streak}</p>
    <p class="text-3xl font-black text-primary mt-1">day streak!</p>

    <div class="card p-5 w-full mt-10">
      <WeekCalendar {activeDays} />
      <p class="text-[15px] font-bold text-text-muted mt-5 leading-snug">{message}</p>
    </div>
  </div>

  <div class="lesson-footer">
    <button onclick={onContinue} class="btn btn-primary w-full">Continue</button>
  </div>
</div>
