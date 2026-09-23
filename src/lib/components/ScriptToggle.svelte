<script lang="ts">
  import { gameState, type ScriptDisplay } from '../state/gameState.svelte';

  const OPTIONS: { value: ScriptDisplay; label: string; sample: string }[] = [
    { value: 'script', label: 'Devanāgarī', sample: 'कर्म' },
    { value: 'both', label: 'Both', sample: 'कर्म + ka·rma' },
    { value: 'roman', label: 'Roman', sample: 'karma' }
  ];
</script>

<div class="grid grid-cols-3 gap-1.5">
  {#each OPTIONS as option}
    <button
      type="button"
      onclick={() => gameState.setScriptDisplay(option.value)}
      class="flex flex-col items-center py-2 rounded-xl border transition-colors
        {gameState.scriptDisplay === option.value
          ? 'bg-primary/15 border-primary text-primary'
          : 'bg-bg-surface-alt border-border-warm text-text-muted hover:text-text-primary'}"
    >
      <span class="text-[11px] font-black">{option.label}</span>
      <span class="text-[9px] font-bold font-cinzel">{option.sample}</span>
    </button>
  {/each}
</div>
