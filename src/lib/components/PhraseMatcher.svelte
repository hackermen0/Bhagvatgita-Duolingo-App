<script lang="ts">
  import type { HindiText, PhrasePair } from '../data/gitaData';
  import { playPopSound, playSuccessSound, playErrorSound } from '../utils/soundEffects';
  import HindiWord from './HindiWord.svelte';

  let { pairs, onIncorrect, onAllMatched } = $props<{
    pairs: PhrasePair[];
    /** Romanized Hindi of the two terms that were confused, for spaced review */
    onIncorrect: (confusedTerms: string[]) => void;
    onAllMatched: () => void;
  }>();

  // Terms are identified by their pair's index, so two pairs may share a spelling without clashing
  interface Term {
    id: number;
    hindi: HindiText;
  }
  interface Meaning {
    id: number;
    english: string;
  }

  let selectedHindi = $state<number | null>(null);
  let selectedEnglish = $state<number | null>(null);

  let hindiList = $state<Term[]>([]);
  let englishList = $state<Meaning[]>([]);

  let matched = $state<number[]>([]);
  // A correct pair flashes green briefly before greying out
  let flashId = $state<number | null>(null);

  let errorHindi = $state<number | null>(null);
  let errorEnglish = $state<number | null>(null);

  // Re-initialize whenever `pairs` changes — the same component instance is reused
  // across consecutive phrase_matching questions rather than remounted, so onMount
  // alone would leave stale matches/lists from the previous question on screen.
  $effect(() => {
    hindiList = pairs.map((p: PhrasePair, id: number) => ({ id, hindi: p.hindi })).sort(() => Math.random() - 0.5);
    englishList = pairs.map((p: PhrasePair, id: number) => ({ id, english: p.english })).sort(() => Math.random() - 0.5);
    selectedHindi = null;
    selectedEnglish = null;
    matched = [];
    flashId = null;
    errorHindi = null;
    errorEnglish = null;
  });

  const busy = () => errorHindi !== null || flashId !== null;

  function selectHindi(id: number) {
    if (busy() || matched.includes(id)) return;
    playPopSound();
    selectedHindi = selectedHindi === id ? null : id;
    checkMatch();
  }

  function selectEnglish(id: number) {
    if (busy() || matched.includes(id)) return;
    playPopSound();
    selectedEnglish = selectedEnglish === id ? null : id;
    checkMatch();
  }

  function checkMatch() {
    if (selectedHindi === null || selectedEnglish === null) return;
    const h = selectedHindi;
    const e = selectedEnglish;
    selectedHindi = null;
    selectedEnglish = null;

    if (h === e) {
      playSuccessSound();
      flashId = h;
      setTimeout(() => {
        matched.push(h);
        flashId = null;
        if (matched.length === pairs.length) onAllMatched();
      }, 350);
    } else {
      playErrorSound();
      errorHindi = h;
      errorEnglish = e;
      // Both the tapped Hindi term and the one that actually owns the tapped meaning were confused
      onIncorrect([pairs[h].hindi.roman, pairs[e].hindi.roman]);
      setTimeout(() => {
        errorHindi = null;
        errorEnglish = null;
      }, 700);
    }
  }

  function stateClass(matched: boolean, flash: boolean, error: boolean, selected: boolean): string {
    if (matched) return 'opacity-40 shadow-none! cursor-default';
    if (flash) return 'tile-correct';
    if (error) return 'tile-wrong animate-shake';
    if (selected) return 'tile-selected';
    return '';
  }
</script>

<div class="grid grid-cols-2 gap-3 w-full select-none">
  <div class="flex flex-col gap-3">
    {#each hindiList as term, i (term.id)}
      {@const done = matched.includes(term.id)}
      <button
        type="button"
        onclick={() => selectHindi(term.id)}
        disabled={done}
        class="tile min-h-[62px] px-3 py-2 flex items-center gap-2 {stateClass(done, flashId === term.id, errorHindi === term.id, selectedHindi === term.id)}"
      >
        <span class="key-hint shrink-0">{i + 1}</span>
        <span class="flex-1 flex flex-col items-center text-center"><HindiWord hindi={term.hindi} size="sm" /></span>
      </button>
    {/each}
  </div>

  <div class="flex flex-col gap-3">
    {#each englishList as term, i (term.id)}
      {@const done = matched.includes(term.id)}
      <button
        type="button"
        onclick={() => selectEnglish(term.id)}
        disabled={done}
        class="tile min-h-[62px] px-3 py-2 flex items-center gap-2 {stateClass(done, flashId === term.id, errorEnglish === term.id, selectedEnglish === term.id)}"
      >
        <span class="key-hint shrink-0">{hindiList.length + i + 1}</span>
        <span class="flex-1 text-center text-[15px] font-bold leading-snug">{term.english}</span>
      </button>
    {/each}
  </div>
</div>
