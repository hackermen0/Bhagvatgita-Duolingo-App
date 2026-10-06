<script lang="ts">
  import { gameState } from '../state/gameState.svelte';
  import { hindiTokens } from '../data/hindi';
  import type { Lesson } from '../data/gitaData';
  import type { JourneyContent } from '../data/journey';
  import { speak } from '../utils/speech';
  import SpeakButton from './SpeakButton.svelte';
  import Mascot from './Mascot.svelte';

  // Page 1: the verse in Hindi and English, and its deeper meaning — every piece can be heard.
  let { lesson, content, onComplete } = $props<{
    lesson: Lesson;
    content: JourneyContent;
    onComplete: () => void;
  }>();

  const isDeva = $derived(gameState.tierScriptMode === 'devanagari');

  const lines = $derived.by(() => {
    const dev = content.verseHindi.dev.split('\n');
    const roman = content.verseHindi.roman.split('\n');
    return dev.map((d: string, i: number) => ({ dev: d, roman: roman[i] ?? d }));
  });
  const spokenHindi = $derived(lines.map((l: { dev: string }) => l.dev).join(' '));
  const spokenMeaning = $derived(content.deeperMeaning.join(' '));
</script>

<div class="flex-1 overflow-y-auto scrollbar-none px-5 pt-4 pb-6 flex flex-col gap-4 select-none">
  <div class="flex items-end gap-3">
    <div class="flex-1 min-w-0">
      <p class="text-sm font-extrabold uppercase tracking-wider text-accent">{lesson.verseRef} · {lesson.title}</p>
      <h2 class="text-2xl font-black leading-tight mt-1">Meet the verse</h2>
    </div>
    <Mascot mood="cheerful" size="lg" />
  </div>

  {#if lesson.essence}
    <div class="card bg-bg-surface-alt! px-4 py-3">
      <p class="text-lg font-black leading-snug">{lesson.essence}</p>
    </div>
  {/if}

  <!-- Hindi: tap any word to hear it, or hear the whole verse -->
  <div class="card p-4 flex flex-col gap-3">
    <div class="flex items-center justify-between gap-2">
      <p class="text-xs font-black uppercase tracking-wider text-primary">In Hindi</p>
      <SpeakButton text={spokenHindi} lang="hi" label="Hear Hindi" />
    </div>
    {#each lines as line}
      <div class="flex flex-wrap gap-x-2 gap-y-2">
        {#each hindiTokens(line) as token}
          <button
            type="button"
            onclick={() => speak(token.dev, 'hi')}
            aria-label="Hear {token.roman}"
            class="rounded-lg px-1.5 py-0.5 -mx-0.5 hover:bg-primary-soft active:bg-primary-soft text-xl leading-tight
              {isDeva ? 'font-deva' : 'font-black'} text-text-primary"
          >{isDeva ? token.dev : token.roman}</button>
        {/each}
      </div>
    {/each}
    <p class="text-xs font-bold text-text-muted">Tap any word to hear it.</p>
  </div>

  <div class="card p-4 flex flex-col gap-3">
    <div class="flex items-center justify-between gap-2">
      <p class="text-xs font-black uppercase tracking-wider text-primary">In English</p>
      <SpeakButton text={content.verseEnglish} lang="en" label="Hear English" />
    </div>
    <p class="text-[17px] font-bold leading-relaxed">{content.verseEnglish}</p>
  </div>

  <div class="card p-4 flex flex-col gap-3">
    <div class="flex items-center justify-between gap-2">
      <p class="text-xs font-black uppercase tracking-wider text-accent">Deeper meaning</p>
      <SpeakButton text={spokenMeaning} lang="en" label="Listen" />
    </div>
    {#each content.deeperMeaning as paragraph}
      <p class="text-[15px] font-semibold leading-relaxed">{paragraph}</p>
    {/each}
  </div>
</div>

<div class="lesson-footer">
  <button onclick={onComplete} class="btn btn-primary w-full">Let's begin</button>
</div>
