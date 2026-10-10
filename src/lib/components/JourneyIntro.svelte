<script lang="ts">
  import { gameState } from '../state/gameState.svelte';
  import type { Lesson } from '../data/gitaData';
  import { languageName, type JourneyContent } from '../data/journey';
  import SpokenText, { englishLines, hindiLines } from './SpokenText.svelte';
  import Mascot from './Mascot.svelte';

  // Page 1: the verse in Hindi and English, and its deeper meaning. Each is read aloud with every word lit up
  // as it is spoken; tapping a Hindi word speaks just that word.
  let { lesson, content, onComplete } = $props<{
    lesson: Lesson;
    content: JourneyContent;
    onComplete: () => void;
  }>();

  const isDeva = $derived(gameState.tierScriptMode === 'devanagari');
  // The verse's own language: Hindi, or Sanskrit on Medium's BG 2.48
  const langName = $derived(languageName(content));

  const hindi = $derived(hindiLines(content.verseHindi, isDeva));
  const english = $derived(englishLines(content.verseEnglish));
  // Hard writes the verse's key words in the explanation in Devanagari
  const meaning = $derived(englishLines((isDeva && content.deeperMeaningDev ? content.deeperMeaningDev : content.deeperMeaning).join('\n')));
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

  <div class="card p-4 flex flex-col gap-3">
    <p class="text-xs font-black uppercase tracking-wider text-primary">In {langName}</p>
    <SpokenText lines={hindi} lang="hi" label="Hear {langName}" tappable textClass="text-xl leading-tight {isDeva ? 'font-deva' : 'font-black'}" />
    <p class="text-xs font-bold text-text-muted">Tap any word to hear it.</p>
  </div>

  <div class="card p-4 flex flex-col gap-3">
    <p class="text-xs font-black uppercase tracking-wider text-primary">In English</p>
    <SpokenText lines={english} lang="en" label="Hear English" tappable textClass="text-[17px] font-bold leading-relaxed" />
    <p class="text-xs font-bold text-text-muted">Tap any word to hear it.</p>
  </div>

  <div class="card p-4 flex flex-col gap-3">
    <p class="text-xs font-black uppercase tracking-wider text-accent">Deeper meaning</p>
    <SpokenText lines={meaning} lang="en" label="Listen" textClass="text-[15px] font-semibold leading-relaxed" />
  </div>
</div>

<div class="lesson-footer">
  <button onclick={onComplete} class="btn btn-primary w-full">Let's begin</button>
</div>
