<script lang="ts">
  import { gameState } from '../state/gameState.svelte';
  import Mascot from './Mascot.svelte';

  let { promptId, prompt, verseContext, guidance, onComplete } = $props<{
    promptId: string;
    prompt: string;
    verseContext?: string;
    guidance?: string;
    onComplete: () => void;
  }>();

  // Load existing entry if previously reflected; the parent remounts this per question
  // svelte-ignore state_referenced_locally
  let reflectionText = $state(gameState.userReflections[promptId] || '');
  let selectedTag = $state<string | null>(null);
  let isSaved = $state(false);

  const INTENT_TAGS = ['Detachment', 'Clarity', 'Equanimity', 'Self-Growth', 'Peace'];

  function handleSave() {
    if (!reflectionText.trim()) return onComplete();
    gameState.saveReflection(promptId, reflectionText.trim());
    isSaved = true;
    setTimeout(onComplete, 400);
  }
</script>

<div class="w-full flex flex-col gap-5 select-none">
  <div>
    <p class="text-sm font-extrabold uppercase tracking-wider text-success">Reflection · no wrong answers</p>
    <h2 class="text-2xl font-black leading-tight mt-1">{prompt.replace(/:$/, '')}</h2>
  </div>

  {#if verseContext}
    <div class="flex items-center gap-2">
      <div class="shrink-0 -ml-1"><Mascot mood="thinking" size="md" /></div>
      <div class="bubble bubble-left flex-1">
        <p class="text-[15px] font-bold leading-relaxed">{verseContext}</p>
      </div>
    </div>
  {/if}

  {#if guidance}
    <p class="text-base text-text-muted font-bold leading-relaxed">{guidance}</p>
  {/if}

  <div class="flex flex-wrap gap-2">
    {#each INTENT_TAGS as tag}
      <button
        type="button"
        onclick={() => (selectedTag = selectedTag === tag ? null : tag)}
        class="tile px-3 py-1.5 text-sm font-black {selectedTag === tag ? 'tile-selected' : ''}"
      >
        {tag}
      </button>
    {/each}
  </div>

  <textarea
    bind:value={reflectionText}
    placeholder="Write your reflection here…"
    rows="5"
    aria-label="Your reflection"
    class="w-full bg-bg-surface-alt border-2 border-border-warm focus:border-info rounded-2xl p-4 text-base font-bold text-text-primary placeholder-text-muted/60 focus:outline-none focus:ring-4 focus:ring-info/20 transition-all resize-none leading-relaxed"
  ></textarea>

  <div class="flex gap-3">
    <button type="button" onclick={onComplete} class="btn btn-secondary flex-1">Skip</button>
    <button type="button" onclick={handleSave} class="btn btn-success flex-[2]">
      {isSaved ? 'Saved!' : 'Save'}
    </button>
  </div>
</div>
