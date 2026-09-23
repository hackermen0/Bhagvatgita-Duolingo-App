<script lang="ts">
  import type { PhrasePair } from '../data/gitaData';
  import { playPopSound, playSuccessSound, playErrorSound } from '../utils/soundEffects';
  import SanskritWord from './SanskritWord.svelte';

  let { pairs, onIncorrect, onAllMatched } = $props<{
    pairs: PhrasePair[];
    onIncorrect: (confusedTerms: string[]) => void;
    onAllMatched: () => void;
  }>();

  let selectedSanskrit = $state<string | null>(null);
  let selectedEnglish = $state<string | null>(null);

  let sanskritList = $state<string[]>([]);
  let englishList = $state<string[]>([]);

  let matchedSanskrit = $state<string[]>([]);
  let matchedEnglish = $state<string[]>([]);
  // A correct pair flashes green briefly before greying out
  let flashSanskrit = $state<string | null>(null);
  let flashEnglish = $state<string | null>(null);

  let errorSanskrit = $state<string | null>(null);
  let errorEnglish = $state<string | null>(null);

  // Re-initialize whenever `pairs` changes — the same component instance is reused
  // across consecutive phrase_matching questions rather than remounted, so onMount
  // alone would leave stale matches/lists from the previous question on screen.
  $effect(() => {
    sanskritList = pairs.map((p: PhrasePair) => p.sanskrit).sort(() => Math.random() - 0.5);
    englishList = pairs.map((p: PhrasePair) => p.english).sort(() => Math.random() - 0.5);
    selectedSanskrit = null;
    selectedEnglish = null;
    matchedSanskrit = [];
    matchedEnglish = [];
    flashSanskrit = null;
    flashEnglish = null;
    errorSanskrit = null;
    errorEnglish = null;
  });

  const busy = () => !!(errorSanskrit || flashSanskrit);

  function selectSanskrit(term: string) {
    if (busy() || matchedSanskrit.includes(term)) return;
    playPopSound();
    selectedSanskrit = selectedSanskrit === term ? null : term;
    checkMatch();
  }

  function selectEnglish(term: string) {
    if (busy() || matchedEnglish.includes(term)) return;
    playPopSound();
    selectedEnglish = selectedEnglish === term ? null : term;
    checkMatch();
  }

  function checkMatch() {
    if (!selectedSanskrit || !selectedEnglish) return;
    const s = selectedSanskrit;
    const e = selectedEnglish;
    selectedSanskrit = null;
    selectedEnglish = null;

    if (pairs.some((p: PhrasePair) => p.sanskrit === s && p.english === e)) {
      playSuccessSound();
      flashSanskrit = s;
      flashEnglish = e;
      setTimeout(() => {
        matchedSanskrit.push(s);
        matchedEnglish.push(e);
        flashSanskrit = null;
        flashEnglish = null;
        if (matchedSanskrit.length === pairs.length) onAllMatched();
      }, 350);
    } else {
      playErrorSound();
      errorSanskrit = s;
      errorEnglish = e;
      // Both the tapped term and the term that actually owns the tapped meaning were confused
      const ownerOfMeaning = pairs.find((p: PhrasePair) => p.english === e)?.sanskrit;
      onIncorrect([s, ...(ownerOfMeaning ? [ownerOfMeaning] : [])]);
      setTimeout(() => {
        errorSanskrit = null;
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
    {#each sanskritList as term, i}
      {@const matched = matchedSanskrit.includes(term)}
      <button
        type="button"
        onclick={() => selectSanskrit(term)}
        disabled={matched}
        class="tile min-h-[62px] px-3 py-2 flex items-center gap-2 {stateClass(matched, flashSanskrit === term, errorSanskrit === term, selectedSanskrit === term)}"
      >
        <span class="key-hint shrink-0">{i + 1}</span>
        <span class="flex-1 flex flex-col items-center"><SanskritWord text={term} size="sm" /></span>
      </button>
    {/each}
  </div>

  <div class="flex flex-col gap-3">
    {#each englishList as term, i}
      {@const matched = matchedEnglish.includes(term)}
      <button
        type="button"
        onclick={() => selectEnglish(term)}
        disabled={matched}
        class="tile min-h-[62px] px-3 py-2 flex items-center gap-2 {stateClass(matched, flashEnglish === term, errorEnglish === term, selectedEnglish === term)}"
      >
        <span class="key-hint shrink-0">{sanskritList.length + i + 1}</span>
        <span class="flex-1 text-center text-[15px] font-bold leading-snug">{term}</span>
      </button>
    {/each}
  </div>
</div>
