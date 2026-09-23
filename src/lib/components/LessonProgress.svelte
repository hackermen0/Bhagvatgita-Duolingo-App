<script lang="ts">
  import { gameState } from '../state/gameState.svelte';
  import Icon from './Icon.svelte';

  let { progress, onCancel, showHearts = true, combo = 0 } = $props<{
    /** 0–1 across the whole session */
    progress: number;
    onCancel: () => void;
    showHearts?: boolean;
    combo?: number;
  }>();

  const pct = $derived(Math.min(100, Math.max(0, progress * 100)));

  let prevHearts = $state(gameState.hearts);
  let heartLost = $state(false);

  $effect(() => {
    if (gameState.hearts < prevHearts) {
      heartLost = true;
      const t = setTimeout(() => (heartLost = false), 600);
      prevHearts = gameState.hearts;
      return () => clearTimeout(t);
    }
    prevHearts = gameState.hearts;
  });
</script>

<div class="shrink-0 flex items-center gap-3 px-4 pt-4 pb-2 select-none">
  <button
    onclick={onCancel}
    class="shrink-0 text-node-locked-edge hover:text-text-muted transition-colors"
    aria-label="Quit"
    type="button"
  >
    <Icon name="close" class="w-7 h-7" />
  </button>

  <div class="relative flex-1">
    {#if combo >= 3}
      <span class="absolute -top-4 left-0 text-[12px] font-black uppercase tracking-wider text-primary animate-pop-in">
        {combo} in a row
      </span>
    {/if}
    <div class="progress-track">
      <div class="progress-fill" style="width: {pct}%"></div>
    </div>
  </div>

  {#if showHearts}
    <div class="shrink-0 flex items-center gap-1.5 min-w-11 justify-end">
      <span class="text-error transition-transform duration-200 {heartLost ? 'scale-125 animate-shake' : ''}">
        <Icon name="heart" class="w-7 h-7" />
      </span>
      <span class="font-black text-error text-lg tabular-nums">{gameState.hearts}</span>
    </div>
  {/if}
</div>
