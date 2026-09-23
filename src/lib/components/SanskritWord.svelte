<script lang="ts">
  import { gameState } from '../state/gameState.svelte';
  import { getSanskritDisplay } from '../data/sanskritHelper';

  // `text` is an IAST word or phrase. Layout follows the learner's script setting:
  // script → Devanāgarī only; both → syllable guide above Devanāgarī; roman → IAST first, Devanāgarī beneath.
  let { text, size = 'md', inverted = false } = $props<{
    text: string;
    size?: 'sm' | 'md' | 'lg';
    inverted?: boolean;
  }>();

  const display = $derived(getSanskritDisplay(text));
  const mode = $derived(gameState.scriptDisplay);

  const mainSize = $derived(size === 'lg' ? 'text-2xl' : size === 'sm' ? 'text-sm' : 'text-base');
  const mainColor = $derived(inverted ? 'text-bg-base' : 'text-text-primary');
  const captionColor = $derived(inverted ? 'text-bg-base/80' : 'text-text-muted');
</script>

{#if mode === 'roman'}
  <span class="{mainSize} font-bold {mainColor} leading-tight">{text}</span>
  <span class="text-[10px] font-cinzel {captionColor} mt-0.5 leading-none">{display.devanagari}</span>
{:else if mode === 'script'}
  <span class="{mainSize} font-black font-cinzel {mainColor} leading-tight">{display.devanagari}</span>
{:else}
  <span class="text-[9px] font-semibold {captionColor} tracking-wider">{display.englishSyllables}</span>
  <span class="{mainSize} font-black font-cinzel {mainColor} leading-tight mt-0.5">{display.devanagari}</span>
{/if}
