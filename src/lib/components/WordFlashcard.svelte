<script lang="ts">
  import { base } from '$app/paths';
  import type { JourneyWord } from '../data/journey';
  import { WORD_IMAGES } from '../data/wordImages';
  import { gameState } from '../state/gameState.svelte';
  import SpeakButton from './SpeakButton.svelte';
  import Mascot from './Mascot.svelte';

  // One word on its own screen, with a picture to hang it on: the Hindi word and the English meaning, each with a voice.
  // A word with no picture yet shows Krishna in its place, with a note that the picture is still to come.
  let { word, langName = 'Hindi' } = $props<{
    word: JourneyWord;
    /** The language the word is in: Hindi, or Sanskrit on Medium's BG 2.48 */
    langName?: string;
  }>();

  const image = $derived(WORD_IMAGES[word.key]);
  const isDeva = $derived(gameState.tierScriptMode === 'devanagari');
  const shown = $derived(isDeva ? word.hindi.dev : word.hindi.roman);
  // Hard writes a note that names the word itself in Devanagari
  const note = $derived(isDeva && word.noteDev ? word.noteDev : word.note);
  // Long compounds step down a size rather than wrap mid-word
  const wordSize = $derived(shown.length > 13 ? 'text-2xl' : 'text-3xl');
</script>

<div class="flex flex-col items-center gap-3 animate-pop-in">
  <!-- White behind the picture: most of the illustrations are drawn on white and should sit in the card, not float -->
  <div
    class="aspect-square rounded-3xl overflow-hidden border-2 border-border-warm bg-white flex items-center justify-center"
    style="width: min(100%, 33vh)"
  >
    {#if image}
      <img src="{base}/words/{image}.webp" alt="" width="720" height="720" draggable="false" class="w-full h-full object-contain" />
    {:else}
      <Mascot mood="cheerful" size="xl" />
    {/if}
  </div>
  {#if !image}
    <p class="-mt-1 text-xs font-bold text-text-muted">Default picture will be updated</p>
  {/if}

  <div class="card w-full px-4 py-3 flex flex-col items-center gap-2.5 text-center">
    <p class="{wordSize} leading-tight text-primary {isDeva ? 'font-deva font-bold' : 'font-black'}">{shown}</p>
    <div class="flex items-center gap-2">
      <SpeakButton text={word.hindi.dev} lang="hi" label={langName} />
      <SpeakButton text={word.hindi.dev} lang="hi" label="Slow" rate={0.4} />
    </div>

    <div class="w-full border-t-2 border-border-warm pt-2.5 flex items-center justify-between gap-3 text-left">
      <div class="min-w-0">
        <p class="text-xs font-black uppercase tracking-wider text-text-muted">Meaning</p>
        <p class="text-xl font-black leading-tight">{word.english}</p>
      </div>
      <SpeakButton text={word.english} lang="en" label="English" />
    </div>

    {#if note}
      <p class="text-sm font-bold text-text-muted leading-snug bg-bg-surface-alt rounded-xl px-3 py-2">{note}</p>
    {/if}
  </div>
</div>
