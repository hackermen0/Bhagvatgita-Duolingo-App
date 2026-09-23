<script lang="ts">
  import { gameState, type ScriptDisplay } from '../state/gameState.svelte';

  const OPTIONS: { value: ScriptDisplay; label: string; sample: string }[] = [
    { value: 'script', label: 'Devanāgarī', sample: 'कर्म' },
    { value: 'both', label: 'Both', sample: 'कर्म · karma' },
    { value: 'roman', label: 'Roman', sample: 'karma' }
  ];
</script>

<div class="grid grid-cols-3 gap-2">
  {#each OPTIONS as option}
    <button
      type="button"
      onclick={() => gameState.setScriptDisplay(option.value)}
      class="tile flex flex-col items-center py-2.5 {gameState.scriptDisplay === option.value ? 'tile-selected' : ''}"
    >
      <span class="text-sm font-black">{option.label}</span>
      <span class="text-xs font-bold text-text-muted">{option.sample}</span>
    </button>
  {/each}
</div>
