<script lang="ts">
  import type { MCQOption } from '../data/gitaData';
  import { playPopSound } from '../utils/soundEffects';

  let { options, onSelect, disabled = false } = $props<{
    options: MCQOption[];
    onSelect: (selected: MCQOption) => void;
    disabled?: boolean;
  }>();

  let selectedIndex = $state<number | null>(null);

  function handleSelect(option: MCQOption, idx: number) {
    if (disabled) return;
    playPopSound();
    selectedIndex = idx;
    onSelect(option);
  }

  function onKey(e: KeyboardEvent) {
    const n = Number(e.key);
    if (n >= 1 && n <= options.length) handleSelect(options[n - 1], n - 1);
  }
</script>

<svelte:window onkeydown={onKey} />

<div class="flex flex-col gap-3 w-full select-none">
  {#each options as option, idx}
    <button
      type="button"
      onclick={() => handleSelect(option, idx)}
      class="tile w-full text-left px-4 py-3.5 flex items-center gap-4 {selectedIndex === idx ? 'tile-selected' : ''}"
    >
      <span class="key-hint shrink-0">{idx + 1}</span>
      <span class="text-base font-bold leading-snug">{option.text}</span>
    </button>
  {/each}
</div>
