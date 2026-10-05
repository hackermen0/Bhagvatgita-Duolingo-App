<script lang="ts">
  import { gameState } from '../state/gameState.svelte';
  import { scriptText } from '../data/hindi';
  import type { HindiText } from '../data/gitaData';

  // A verse or phrase of Hindi, one line per `\n`, in the script the difficulty tier calls for.
  let { hindi, class: primaryClass = '' } = $props<{
    hindi: HindiText;
    class?: string;
  }>();

  const isDeva = $derived(gameState.tierScriptMode === 'devanagari');
</script>

<p class="{primaryClass} {isDeva ? 'font-deva' : ''} whitespace-pre-line">{scriptText(hindi, gameState.tierScriptMode)}</p>
