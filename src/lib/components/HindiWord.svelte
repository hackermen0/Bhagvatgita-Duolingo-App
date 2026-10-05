<script lang="ts">
  import { gameState } from '../state/gameState.svelte';
  import { scriptText } from '../data/hindi';
  import type { HindiText } from '../data/gitaData';

  // A Hindi word or short phrase, written in the script the difficulty tier calls for:
  // Roman letters (Hinglish) on Beginner, Devanagari on Medium and Hard.
  let { hindi, size = 'md', inverted = false } = $props<{
    hindi: HindiText;
    size?: 'sm' | 'md' | 'lg';
    inverted?: boolean;
  }>();

  const isDeva = $derived(gameState.tierScriptMode === 'devanagari');
  const mainSize = $derived(size === 'lg' ? 'text-2xl' : size === 'sm' ? 'text-sm' : 'text-base');
  const mainColor = $derived(inverted ? 'text-bg-base' : 'text-text-primary');
</script>

<span class="{mainSize} font-black {isDeva ? 'font-deva' : ''} {mainColor} leading-tight">{scriptText(hindi, gameState.tierScriptMode)}</span>
