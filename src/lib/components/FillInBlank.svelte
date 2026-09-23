<script lang="ts">
  import { lookupMeaning } from '../data/practice';
  import { playPopSound } from '../utils/soundEffects';
  import SanskritWord from './SanskritWord.svelte';
  import Mascot from './Mascot.svelte';

  let { prompt, translation, options, onSelect, showTranslation = true, disabled = false } = $props<{
    prompt: string;
    translation: string;
    options: string[];
    onSelect: (selectedWord: string | null) => void;
    showTranslation?: boolean;
    disabled?: boolean;
  }>();

  let selectedWord = $state<string | null>(null);
  let hintIndex = $state<number | null>(null);
  let translationRevealed = $state(false);

  function toggleHint(i: number) {
    hintIndex = hintIndex === i ? null : i;
  }

  function choose(word: string | null) {
    if (disabled) return;
    playPopSound();
    selectedWord = word;
    onSelect(word);
  }

  // Only the quoted verse fragment is shown; the instruction is the screen title
  const tokens = $derived.by(() => {
    const quoted = prompt.match(/["“](.*?)["”]\s*$/);
    const template = quoted ? quoted[1].trim() : prompt.includes(':') ? prompt.split(':').slice(1).join(':').trim() : prompt;
    return template.split(/\s+/).filter(Boolean).map((tok: string) => ({
      isBlank: tok.includes('___'),
      word: tok.replace(/[^a-zA-Zāīūēōṛḷṁḥñṅṇtṭdḍsṣś']/g, '') || tok
    }));
  });
</script>

<div class="flex flex-col gap-8 w-full select-none">
  <div class="flex items-center gap-2">
    <div class="shrink-0 -ml-1"><Mascot mood="guide" size="md" /></div>
    <div class="bubble bubble-left flex-1 min-w-0">
      <div class="flex flex-wrap gap-x-2 gap-y-3 items-end">
        {#each tokens as token, i}
          {#if token.isBlank}
            {#if selectedWord}
              <button type="button" onclick={() => choose(null)} class="tile px-3 py-1.5 flex flex-col items-center animate-pop-in" aria-label="Remove answer">
                <SanskritWord text={selectedWord} />
              </button>
            {:else}
              <span class="inline-block w-20 h-10 border-b-2 border-text-muted/60"></span>
            {/if}
          {:else}
            {@const meaning = lookupMeaning(token.word)}
            <button
              type="button"
              disabled={!meaning}
              onclick={() => toggleHint(i)}
              aria-label={meaning ? `Show meaning of ${token.word}` : undefined}
              class="relative flex flex-col items-center px-1 border-b-2 disabled:cursor-default
                {meaning ? 'border-dashed border-primary-edge cursor-help' : 'border-transparent'}"
            >
              <SanskritWord text={token.word} />
              {#if hintIndex === i && meaning}
                <span class="absolute top-full mt-2 left-1/2 -translate-x-1/2 z-20 whitespace-nowrap px-3 py-1.5 rounded-xl bg-bg-surface border-2 border-border-warm text-sm font-bold text-text-primary shadow-lg animate-pop-in">
                  {meaning}
                </span>
              {/if}
            </button>
          {/if}
        {/each}
      </div>

      {#if translation}
        <div class="mt-3 pt-2 border-t-2 border-border-warm">
          {#if showTranslation || translationRevealed}
            <p class="text-sm text-text-muted font-bold leading-snug">{translation}</p>
          {:else}
            <button type="button" onclick={() => (translationRevealed = true)} class="text-xs font-black uppercase tracking-wider text-info">
              Show translation hint
            </button>
          {/if}
        </div>
      {/if}
    </div>
  </div>

  <div class="flex flex-wrap justify-center gap-3">
    {#each options as option}
      {@const used = selectedWord === option}
      <button
        type="button"
        onclick={() => (used ? choose(null) : choose(option))}
        class="tile min-w-24 px-4 py-2.5 flex flex-col items-center {used ? 'tile-spent' : ''}"
        aria-label={used ? `Remove ${option}` : option}
      >
        <span class={used ? 'invisible flex flex-col items-center' : 'flex flex-col items-center'}>
          <SanskritWord text={option} />
        </span>
      </button>
    {/each}
  </div>
</div>
