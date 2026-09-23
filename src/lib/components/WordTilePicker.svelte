<script lang="ts">
  import { onMount } from 'svelte';
  import { playPopSound } from '../utils/soundEffects';
  import SanskritWord from './SanskritWord.svelte';

  let { tiles, onChange, disabled = false } = $props<{
    tiles: string[];
    onChange: (selectedWords: string[]) => void;
    disabled?: boolean;
  }>();

  interface TileItem {
    id: number;
    text: string;
  }

  let bank = $state<TileItem[]>([]);
  let selectedIds = $state<number[]>([]);

  onMount(() => {
    bank = tiles.map((text: string, id: number) => ({ id, text })).sort(() => Math.random() - 0.5);
  });

  const selected = $derived(selectedIds.map((id) => bank.find((t) => t.id === id)!).filter(Boolean));

  function toggle(tile: TileItem) {
    if (disabled) return;
    playPopSound();
    selectedIds = selectedIds.includes(tile.id) ? selectedIds.filter((id) => id !== tile.id) : [...selectedIds, tile.id];
    onChange(selectedIds.map((id) => bank.find((t) => t.id === id)!.text));
  }
</script>

<div class="flex flex-col gap-10 w-full select-none">
  <!-- Answer lines -->
  <div
    class="min-h-[128px] flex flex-wrap content-start gap-x-2 gap-y-[10px] pt-1"
    style="background: repeating-linear-gradient(to bottom, transparent 0, transparent 60px, var(--color-border-warm) 60px, var(--color-border-warm) 62px, transparent 62px, transparent 64px)"
  >
    {#each selected as tile (tile.id)}
      <button type="button" onclick={() => toggle(tile)} class="tile h-[54px] px-3 flex flex-col items-center justify-center animate-pop-in">
        <SanskritWord text={tile.text} />
      </button>
    {/each}
  </div>

  <!-- Word bank: used words leave a placeholder behind -->
  <div class="flex flex-wrap justify-center gap-2.5">
    {#each bank as tile (tile.id)}
      {@const used = selectedIds.includes(tile.id)}
      <button
        type="button"
        onclick={() => !used && toggle(tile)}
        disabled={used}
        class="tile h-[54px] px-3 flex flex-col items-center justify-center {used ? 'tile-spent' : ''}"
        aria-hidden={used}
      >
        <span class="flex flex-col items-center {used ? 'invisible' : ''}"><SanskritWord text={tile.text} /></span>
      </button>
    {/each}
  </div>
</div>
