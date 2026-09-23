<script lang="ts">
  import { gameState } from '../state/gameState.svelte';

  let { sanskrit, transliteration, class: primaryClass = '' } = $props<{
    sanskrit: string;
    transliteration: string;
    class?: string;
  }>();

  const mode = $derived(gameState.scriptDisplay);
</script>

{#if mode === 'roman'}
  <p class="{primaryClass} whitespace-pre-line">{transliteration}</p>
  <p class="text-[11px] font-cinzel text-text-muted leading-relaxed whitespace-pre-line mt-1">{sanskrit}</p>
{:else}
  <p class="{primaryClass} font-cinzel whitespace-pre-line">{sanskrit}</p>
  {#if mode === 'both'}
    <p class="text-[11px] italic text-text-muted leading-relaxed whitespace-pre-line mt-1">{transliteration}</p>
  {/if}
{/if}
