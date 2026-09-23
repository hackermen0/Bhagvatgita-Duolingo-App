<script lang="ts">
  import { lookupMeaning } from '../data/practice';
  import { playPopSound } from '../utils/soundEffects';
  import SanskritWord from './SanskritWord.svelte';

  let { prompt, translation, options, onSelect, showTranslation = true } = $props<{
    prompt: string;
    translation: string;
    options: string[];
    onSelect: (selectedWord: string) => void;
    showTranslation?: boolean;
  }>();

  let selectedWord = $state<string | null>(null);
  let hintIndex = $state<number | null>(null);
  let translationRevealed = $state(false);

  function toggleHint(i: number) {
    hintIndex = hintIndex === i ? null : i;
  }

  function handleSelect(word: string) {
    playPopSound();
    selectedWord = word;
    onSelect(word);
  }

  let parsedPrompt = $derived(() => {
    let instruction = '';
    let template = prompt;

    const quoteMatch = prompt.match(/^(.*?):?\s*["“](.*?)["”]\s*$/);
    if (quoteMatch) {
      instruction = quoteMatch[1].trim();
      template = quoteMatch[2].trim();
    } else if (prompt.includes(':')) {
      const parts = prompt.split(':');
      instruction = parts[0].trim();
      template = parts.slice(1).join(':').trim();
    }

    const rawTokens = template.split(/\s+/).filter(Boolean);
    const tokens = rawTokens.map((tok: string) => {
      const isBlank = tok.includes('______') || tok === '___';
      const cleanWord = tok.replace(/[^a-zA-Zāīūēōṛḷṁḥñṅṇtṭdḍsṣś']/g, '');
      return {
        raw: tok,
        isBlank,
        word: cleanWord || tok
      };
    });

    return { instruction, tokens };
  });
</script>

<div class="flex flex-col gap-4 w-full select-none max-w-lg mx-auto">
  
  <!-- Verse Display Box -->
  <div class="bg-bg-surface border border-border-warm p-4 sm:p-5 rounded-3xl text-center shadow-lg flex flex-col gap-3 items-center justify-center min-h-[110px]">
    
    {#if parsedPrompt().instruction}
      <span class="text-[10px] font-black uppercase tracking-[0.2em] text-primary">
        {parsedPrompt().instruction}
      </span>
    {/if}

    <!-- Verse Token Cards Row -->
    <div class="flex flex-wrap gap-2 items-center justify-center py-1">
      {#each parsedPrompt().tokens as token, i}
        {#if token.isBlank}
          {#if selectedWord}
            <div class="px-3.5 py-2 rounded-2xl bg-primary text-bg-base border-b-4 border-accent shadow-md flex flex-col items-center justify-center min-w-[70px] animate-[pop_0.12s_ease-out]">
              <SanskritWord text={selectedWord} inverted />
            </div>
          {:else}
            <div class="px-3.5 py-2 rounded-2xl bg-bg-surface-alt border-2 border-dashed border-primary/50 flex flex-col items-center justify-center min-w-[75px] min-h-[50px] shadow-inner animate-pulse">
              <span class="text-xs font-black text-primary font-cinzel tracking-widest">
                ______
              </span>
            </div>
          {/if}
        {:else}
          {@const meaning = lookupMeaning(token.word)}
          <button
            type="button"
            disabled={!meaning}
            onclick={() => toggleHint(i)}
            aria-label={meaning ? `Show meaning of ${token.word}` : undefined}
            class="relative px-3.5 py-2 rounded-2xl bg-bg-surface-alt border border-border-warm shadow-sm border-b-4 flex flex-col items-center justify-center min-w-[65px] disabled:cursor-default
              {meaning ? 'cursor-help active:scale-95 transition-transform border-b-primary/50' : ''}"
          >
            <SanskritWord text={token.word} />
            {#if hintIndex === i && meaning}
              <span class="absolute top-full mt-2 left-1/2 -translate-x-1/2 z-20 whitespace-nowrap px-2.5 py-1 rounded-lg bg-text-primary text-bg-base text-[11px] font-bold shadow-lg animate-[fade-in_0.15s_ease-out]">
                {meaning}
              </span>
            {/if}
          </button>
        {/if}
      {/each}
    </div>

    {#if translation}
      {#if showTranslation || translationRevealed}
        <p class="text-xs text-text-muted italic leading-snug border-t border-border-warm pt-2 w-full max-w-md">
          "{translation}"
        </p>
      {:else}
        <button
          type="button"
          onclick={() => (translationRevealed = true)}
          class="text-[10px] font-bold uppercase tracking-wider text-primary/80 hover:text-primary border-t border-border-warm pt-2 w-full max-w-md"
        >
          Show translation hint
        </button>
      {/if}
    {/if}
  </div>

  <div class="h-px bg-border-warm"></div>

  <!-- Options bank with 3D tactile buttons -->
  <div class="flex flex-wrap justify-center gap-2.5">
    {#each options as option}
      {@const isSelected = selectedWord === option}
      <button
        type="button"
        onclick={() => handleSelect(option)}
        class="min-w-[90px] px-4 py-2 rounded-2xl shadow border-b-4 tile-3d flex flex-col items-center justify-center transition-all
          {isSelected
            ? 'bg-primary text-bg-base border-accent shadow-primary/20'
            : 'bg-bg-surface hover:bg-bg-surface-alt border-border-warm text-text-primary'}"
      >
        <SanskritWord text={option} inverted={isSelected} />
      </button>
    {/each}
  </div>
</div>

<style>
  @keyframes pop {
    0% { transform: scale(0.85); opacity: 0; }
    100% { transform: scale(1); opacity: 1; }
  }
</style>
