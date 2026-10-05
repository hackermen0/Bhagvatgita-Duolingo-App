<script lang="ts">
  import { onMount } from 'svelte';
  import { lookupMeaning } from '../data/practice';
  import { hindiTokens, wordKey } from '../data/hindi';
  import type { HindiText } from '../data/gitaData';
  import { playPopSound } from '../utils/soundEffects';
  import HindiWord from './HindiWord.svelte';
  import Mascot, { type MascotMood } from './Mascot.svelte';

  // The Hindi phrase is the clue; the learner completes its English sentence from the options
  let { hindi, sentence, options, onSelect, disabled = false, mascotMood = 'default' } = $props<{
    hindi: HindiText;
    /** English sentence with a `____` gap */
    sentence: string;
    options: string[];
    onSelect: (selectedWord: string | null) => void;
    disabled?: boolean;
    mascotMood?: MascotMood;
  }>();

  let selectedWord = $state<string | null>(null);
  let hintIndex = $state<number | null>(null);
  // Options arrive with the answer first; shuffle once per question (this component is re-created per question)
  let bank = $state<string[]>([]);

  onMount(() => {
    bank = [...options].sort(() => Math.random() - 0.5);
  });

  const hindiWords = $derived(hindiTokens(hindi));
  const englishTokens = $derived(sentence.split(/\s+/).filter(Boolean));

  function choose(word: string | null) {
    if (disabled) return;
    playPopSound();
    selectedWord = word;
    onSelect(word);
  }
</script>

<div class="flex flex-col gap-8 w-full select-none">
  <div class="flex items-center gap-2">
    <div class="shrink-0 -ml-1"><Mascot mood={mascotMood} size="md" /></div>
    <div class="bubble bubble-left flex-1 min-w-0">
      <!-- Each Hindi word is tappable for its meaning -->
      <div class="flex flex-wrap gap-x-2 gap-y-3 items-end">
        {#each hindiWords as word, i}
          {@const meaning = lookupMeaning(wordKey(word.roman))}
          <button
            type="button"
            disabled={!meaning}
            onclick={() => (hintIndex = hintIndex === i ? null : i)}
            aria-label={meaning ? `Show meaning of ${word.roman}` : undefined}
            class="relative flex flex-col items-center px-1 border-b-2 disabled:cursor-default
              {meaning ? 'border-dashed border-primary-edge cursor-help' : 'border-transparent'}"
          >
            <HindiWord hindi={word} />
            {#if hintIndex === i && meaning}
              <span class="absolute top-full mt-2 left-1/2 -translate-x-1/2 z-20 whitespace-nowrap px-3 py-1.5 rounded-xl bg-bg-surface border-2 border-border-warm text-sm font-bold text-text-primary shadow-lg animate-pop-in">
                {meaning}
              </span>
            {/if}
          </button>
        {/each}
      </div>

      <div class="mt-3 pt-3 border-t-2 border-border-warm flex flex-wrap gap-x-2 gap-y-3 items-end">
        {#each englishTokens as token}
          {#if token.includes('___')}
            {#if selectedWord}
              <button type="button" onclick={() => choose(null)} class="tile px-3 py-1.5 animate-pop-in" aria-label="Remove answer">
                <span class="text-base font-bold leading-tight">{selectedWord}</span>
              </button>
            {:else}
              <span class="inline-block w-20 h-10 border-b-2 border-text-muted/60"></span>
            {/if}
          {:else}
            <span class="text-base font-bold leading-tight">{token}</span>
          {/if}
        {/each}
      </div>
    </div>
  </div>

  <div class="flex flex-wrap justify-center gap-3">
    {#each bank as option}
      {@const used = selectedWord === option}
      <button
        type="button"
        onclick={() => (used ? choose(null) : choose(option))}
        class="tile min-w-24 px-4 py-2.5 flex flex-col items-center {used ? 'tile-spent' : ''}"
        aria-label={used ? `Remove ${option}` : option}
      >
        <span class="text-base font-bold leading-tight {used ? 'invisible' : ''}">{option}</span>
      </button>
    {/each}
  </div>
</div>
