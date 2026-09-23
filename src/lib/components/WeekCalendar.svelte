<script lang="ts">
  import { dateKey } from '../state/gameState.svelte';
  import Icon from './Icon.svelte';

  let { activeDays } = $props<{ activeDays: string[] }>();

  const DAY_LABELS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
  const today = new Date();
  const todayKey = dateKey(today);
  const week = DAY_LABELS.map((label, i) => {
    const d = new Date(today);
    d.setDate(today.getDate() - today.getDay() + i);
    const key = dateKey(d);
    return { label, key, isToday: key === todayKey, isFuture: d > today && key !== todayKey };
  });
</script>

<div class="flex justify-between gap-1 w-full">
  {#each week as day}
    {@const done = activeDays.includes(day.key)}
    <div class="flex flex-col items-center gap-1.5 flex-1">
      <span class="text-xs font-extrabold {day.isToday ? 'text-primary' : 'text-text-muted'}">{day.label}</span>
      <div
        class="w-8 h-8 rounded-full flex items-center justify-center
          {done
            ? 'bg-primary text-white animate-check-pop'
            : day.isToday
              ? 'border-2 border-primary-edge bg-primary-soft'
              : 'bg-border-warm'}"
      >
        {#if done}
          <Icon name="check" class="w-4 h-4" />
        {/if}
      </div>
    </div>
  {/each}
</div>
