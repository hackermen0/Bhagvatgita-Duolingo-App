<script lang="ts">
  import { gameState } from '../state/gameState.svelte';
</script>

<!-- Script Mode Toggle Switch -->
<div class="inline-flex items-center bg-bg-surface-alt border border-border-warm p-0.5 rounded-full select-none shadow-inner">
  <button
    onclick={() => gameState.setScriptMode('devanagari')}
    class="px-2.5 py-1 text-[10px] font-bold rounded-full transition-all duration-200 flex items-center gap-1 cursor-pointer
      {gameState.scriptMode === 'devanagari'
        ? 'bg-success/20 text-success border border-success/40 shadow-sm'
        : 'text-text-muted hover:text-text-primary'}"
    title="Switch to Devanagari Script (देवनागरी)"
    type="button"
  >
    <span class="font-cinzel font-bold text-xs">ॐ</span>
    <span class="font-cinzel">देव</span>
  </button>

  <button
    onclick={() => gameState.setScriptMode('english')}
    class="px-2.5 py-1 text-[10px] font-bold rounded-full transition-all duration-200 flex items-center gap-1 cursor-pointer
      {gameState.scriptMode === 'english'
        ? 'bg-success/20 text-success border border-success/40 shadow-sm'
        : 'text-text-muted hover:text-text-primary'}"
    title="Switch to English Phonetic (IAST / Roman)"
    type="button"
  >
    <span class="font-black text-[9px]">Aa</span>
    <span>Eng</span>
  </button>
</div>
