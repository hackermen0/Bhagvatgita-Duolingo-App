<script lang="ts">
  import { onDestroy, onMount, tick } from 'svelte';
  import { playPopSound } from '../utils/soundEffects';

  // The learner builds their English answer from these word tiles
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
  // Display order of the answer line (what gets checked)
  let selectedIds = $state<number[]>([]);
  // Order the answer tiles exist in the DOM. Reordering is done with CSS `order`, never by moving
  // nodes, so a tile being dragged stays attached and keeps receiving its pointer events.
  let domIds = $state<number[]>([]);

  let container = $state<HTMLElement | null>(null);
  const els: Record<number, HTMLElement | null> = {};

  onMount(() => {
    bank = tiles.map((text: string, id: number) => ({ id, text })).sort(() => Math.random() - 0.5);
  });

  const textOf = (id: number) => bank.find((t) => t.id === id)!.text;
  const byId = (id: number) => bank.find((t) => t.id === id)!;
  const domTiles = $derived(domIds.map(byId).filter(Boolean));

  function emit() {
    onChange(selectedIds.map(textOf));
  }

  function add(tile: TileItem) {
    if (disabled) return;
    playPopSound();
    selectedIds = [...selectedIds, tile.id];
    domIds = [...domIds, tile.id];
    emit();
  }

  function remove(tile: TileItem) {
    if (disabled) return;
    playPopSound();
    selectedIds = selectedIds.filter((id) => id !== tile.id);
    domIds = domIds.filter((id) => id !== tile.id);
    emit();
  }

  // ─── Reordering ────────────────────────────────────────────────────────────
  // FLIP: remember where every tile is, apply the new order, then slide each from its old spot.
  async function reorder(next: number[]) {
    const first = new Map<number, DOMRect>();
    for (const id of selectedIds) {
      const el = els[id];
      if (el) first.set(id, el.getBoundingClientRect());
    }
    selectedIds = next;
    emit();
    await tick();
    for (const id of next) {
      const el = els[id];
      const from = first.get(id);
      if (!el || !from) continue;
      const to = el.getBoundingClientRect();
      const dx = from.left - to.left;
      const dy = from.top - to.top;
      if (dx || dy) {
        el.animate(
          [{ transform: `translate(${dx}px, ${dy}px)` }, { transform: 'translate(0, 0)' }],
          { duration: 160, easing: 'ease-out' }
        );
      }
    }
  }

  const DRAG_THRESHOLD = 6;
  let drag = $state<{ id: number; x: number; y: number; w: number; h: number } | null>(null);
  let pending: { id: number; startX: number; startY: number; offX: number; offY: number; w: number; h: number } | null = null;
  // The click that follows a drag's pointerup must not count as a tap-to-remove
  let suppressClick = false;

  function onPointerDown(e: PointerEvent, tile: TileItem) {
    if (disabled || (e.pointerType === 'mouse' && e.button !== 0)) return;
    const el = els[tile.id];
    if (!el) return;
    const r = el.getBoundingClientRect();
    pending = { id: tile.id, startX: e.clientX, startY: e.clientY, offX: e.clientX - r.left, offY: e.clientY - r.top, w: r.width, h: r.height };
    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', endDrag);
    window.addEventListener('pointercancel', endDrag);
  }

  function onPointerMove(e: PointerEvent) {
    if (!pending) return;
    if (!drag) {
      if (Math.hypot(e.clientX - pending.startX, e.clientY - pending.startY) < DRAG_THRESHOLD) return;
    }
    drag = { id: pending.id, x: e.clientX - pending.offX, y: e.clientY - pending.offY, w: pending.w, h: pending.h };
    reorderTo(pending.id, e.clientX, e.clientY);
  }

  // The dragged tile lands where the pointer is in reading order: every other tile the pointer
  // has passed (a row below it, or to its right on the same row) comes before it.
  function reorderTo(dragId: number, clientX: number, clientY: number) {
    if (!container) return;
    const box = container.getBoundingClientRect();
    const px = clientX - box.left;
    const py = clientY - box.top;
    const others = selectedIds.filter((id) => id !== dragId);
    let before = 0;
    for (const id of others) {
      const el = els[id];
      if (!el) continue;
      // offset* is layout position, unaffected by an in-flight slide animation, so it can't jitter
      const top = el.offsetTop;
      const bottom = top + el.offsetHeight;
      const mid = el.offsetLeft + el.offsetWidth / 2;
      if (py > bottom || (py >= top && px > mid)) before += 1;
    }
    const next = [...others.slice(0, before), dragId, ...others.slice(before)];
    if (next.some((id, i) => id !== selectedIds[i])) reorder(next);
  }

  function endDrag() {
    window.removeEventListener('pointermove', onPointerMove);
    window.removeEventListener('pointerup', endDrag);
    window.removeEventListener('pointercancel', endDrag);
    if (drag) {
      suppressClick = true;
      setTimeout(() => (suppressClick = false), 0);
    }
    drag = null;
    pending = null;
  }

  onDestroy(() => {
    if (typeof window === 'undefined') return;
    window.removeEventListener('pointermove', onPointerMove);
    window.removeEventListener('pointerup', endDrag);
    window.removeEventListener('pointercancel', endDrag);
  });

  function onTileClick(tile: TileItem) {
    if (suppressClick) return;
    remove(tile);
  }

  function onTileKey(e: KeyboardEvent, tile: TileItem) {
    if (disabled) return;
    const delta = e.key === 'ArrowLeft' || e.key === 'ArrowUp' ? -1 : e.key === 'ArrowRight' || e.key === 'ArrowDown' ? 1 : 0;
    if (!delta) return;
    const from = selectedIds.indexOf(tile.id);
    const to = from + delta;
    if (to < 0 || to >= selectedIds.length) return;
    e.preventDefault();
    const next = [...selectedIds];
    next.splice(from, 1);
    next.splice(to, 0, tile.id);
    reorder(next);
  }
</script>

{#snippet label(text: string)}
  <span class="text-base font-bold leading-tight">{text}</span>
{/snippet}

<div class="flex flex-col gap-10 w-full select-none">
  <!-- Answer lines: tap a word to take it back, drag it to change its place -->
  <div
    bind:this={container}
    class="relative min-h-[128px] flex flex-wrap content-start gap-x-2 gap-y-[10px] pt-1"
    style="background: repeating-linear-gradient(to bottom, transparent 0, transparent 60px, var(--color-border-warm) 60px, var(--color-border-warm) 62px, transparent 62px, transparent 64px)"
  >
    {#each domTiles as tile (tile.id)}
      <button
        bind:this={els[tile.id]}
        type="button"
        onpointerdown={(e) => onPointerDown(e, tile)}
        onclick={() => onTileClick(tile)}
        onkeydown={(e) => onTileKey(e, tile)}
        aria-label="{tile.text}. Tap to remove, or use the arrow keys to move it."
        class="tile h-[54px] px-3 flex flex-col items-center justify-center animate-pop-in {disabled ? '' : 'cursor-grab'}"
        style="order: {selectedIds.indexOf(tile.id)}; touch-action: none; {drag?.id === tile.id ? 'opacity: 0.25' : ''}"
      >
        {@render label(tile.text)}
      </button>
    {/each}
  </div>

  <!-- Word bank: used words leave a placeholder behind -->
  <div class="flex flex-wrap justify-center gap-2.5">
    {#each bank as tile (tile.id)}
      {@const used = selectedIds.includes(tile.id)}
      <button
        type="button"
        onclick={() => !used && add(tile)}
        disabled={used}
        class="tile h-[54px] px-3 flex flex-col items-center justify-center {used ? 'tile-spent' : ''}"
        aria-hidden={used}
      >
        <span class="flex flex-col items-center {used ? 'invisible' : ''}">{@render label(tile.text)}</span>
      </button>
    {/each}
  </div>
</div>

<!-- The tile under the finger, following it -->
{#if drag}
  <div
    class="tile fixed z-[60] flex flex-col items-center justify-center px-3 pointer-events-none cursor-grabbing"
    style="left: {drag.x}px; top: {drag.y}px; width: {drag.w}px; height: {drag.h}px; transform: scale(1.06) rotate(-2deg); box-shadow: 0 10px 22px rgba(0,0,0,0.22)"
  >
    {@render label(textOf(drag.id))}
  </div>
{/if}
