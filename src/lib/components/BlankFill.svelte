<script lang="ts">
  import { onMount } from 'svelte';
  import { playPopSound } from '../utils/soundEffects';
  import { speak } from '../utils/speech';

  // A sentence with `___` gaps and a bank of options. Tapping an option fills the next empty gap;
  // tapping a filled gap puts its word back. Used by every fill-in-the-blank page of the journey.
  let { template, options, onChange, disabled = false, answers, checked = false, spoken } = $props<{
    template: string;
    options: string[];
    /** Called with one entry per gap: the chosen option, or null while the gap is empty */
    onChange: (filled: (string | null)[]) => void;
    disabled?: boolean;
    /** The correct options, one per gap — used to colour the gaps once the page is checked */
    answers: string[];
    checked?: boolean;
    /** What to say for an option when it isn't what is written, e.g. Roman Sanskrit spoken from its Devanagari */
    spoken?: Record<string, string>;
  }>();

  // The template is fixed for this component's lifetime (the page remounts it), so capture it once
  // svelte-ignore state_referenced_locally
  const segments = template.split('___');
  const gaps = segments.length - 1;

  let filled = $state<(string | null)[]>(Array(gaps).fill(null));
  let bank = $state<string[]>([]);

  onMount(() => {
    bank = [...options].sort(() => Math.random() - 0.5);
  });

  const norm = (s: string | null) => (s ?? '').trim().toLowerCase();
  const usedCount = (option: string) => filled.filter((f) => f === option).length;
  // The same option text can be offered once only, so "used" is simply "currently sitting in a gap"
  const isUsed = (option: string) => usedCount(option) > 0;

  function pick(option: string) {
    if (disabled || isUsed(option)) return;
    const slot = filled.indexOf(null);
    if (slot === -1) return;
    playPopSound();
    // Devanagari (the verse's own words) is spoken in Hindi's voice, everything else in English
    const say = spoken?.[option] ?? option;
    speak(say, /[\u0900-\u097F]/.test(say) ? 'hi' : 'en');
    filled[slot] = option;
    onChange([...filled]);
  }

  function clear(slot: number) {
    if (disabled || filled[slot] === null) return;
    playPopSound();
    filled[slot] = null;
    onChange([...filled]);
  }

  const gapState = (i: number) =>
    !checked ? '' : norm(filled[i]) === norm(answers[i]) ? 'tile-correct' : 'tile-wrong';
</script>

<div class="flex flex-col gap-7 w-full select-none">
  <div class="card px-4 py-4 text-lg font-bold leading-[2.6rem]">
    {#each segments as segment, i}
      <span>{segment}</span>
      {#if i < gaps}
        {#if filled[i]}
          <button
            type="button"
            onclick={() => clear(i)}
            aria-label="Remove {filled[i]}"
            class="tile inline-flex px-3 py-1 mx-0.5 align-middle animate-pop-in {gapState(i)}"
          >
            <span class="text-base font-black leading-tight">{filled[i]}</span>
          </button>
        {:else}
          <span class="inline-block align-middle mx-1 w-20 h-8 border-b-[3px] border-text-muted/60" aria-label="Blank {i + 1}"></span>
        {/if}
      {/if}
    {/each}
  </div>

  <div class="flex flex-wrap justify-center gap-3">
    {#each bank as option}
      {@const used = isUsed(option)}
      <button
        type="button"
        onclick={() => pick(option)}
        disabled={disabled || used}
        class="tile px-4 py-2.5 flex flex-col items-center {used ? 'tile-spent' : ''}"
        aria-label={option}
      >
        <span class="text-base font-bold leading-tight {used ? 'invisible' : ''}">{option}</span>
      </button>
    {/each}
  </div>
</div>
