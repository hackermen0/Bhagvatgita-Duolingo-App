<script lang="ts">
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import { page } from '$app/stores';
  import { gameState } from '$lib/state/gameState.svelte';
  import { gitaData } from '$lib/data/gitaData';
  import { lessonWords } from '$lib/data/practice';
  import Icon from '$lib/components/Icon.svelte';
  import SanskritWord from '$lib/components/SanskritWord.svelte';
  import VerseText from '$lib/components/VerseText.svelte';

  const found = $derived.by(() => {
    for (const chapter of gitaData.chapters) {
      const idx = chapter.sections.findIndex((s) => s.id === $page.params.sectionId);
      if (idx >= 0) return { chapter, section: chapter.sections[idx], unitNumber: idx + 1 };
    }
    return null;
  });

  let speechSupported = $state(false);
  onMount(() => (speechSupported = 'speechSynthesis' in window));

  function speak(text: string) {
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.lang = 'hi-IN';
    u.rate = 0.75;
    window.speechSynthesis.speak(u);
  }
</script>

<header class="shrink-0 h-14 flex items-center justify-between px-2 border-b-2 border-border-warm bg-bg-base">
  <button type="button" onclick={() => goto('/')} aria-label="Back" class="w-10 h-10 flex items-center justify-center rounded-xl text-text-muted hover:bg-bg-surface-alt">
    <Icon name="back" class="w-6 h-6" />
  </button>
  <h1 class="text-lg font-black">Guidebook</h1>
  <span class="w-10"></span>
</header>

<div class="flex-1 overflow-y-auto scrollbar-none px-4 py-6">
  {#if found}
    <p class="text-sm font-extrabold uppercase tracking-wider text-text-muted">Chapter {found.chapter.number}, Unit {found.unitNumber}</p>
    <h2 class="text-3xl font-black mt-1">{found.section.title}</h2>
    <p class="text-[15px] text-text-muted mt-2 leading-relaxed">
      Key words for each verse in this unit. Guides unlock as you complete their lessons, so no meaning is spoiled before you learn it.
    </p>

    <div class="flex flex-col gap-8 mt-8 pb-6">
      {#each found.section.lessons as lesson, i}
        {@const unlocked = gameState.completedLessons.includes(lesson.id)}
        <section>
          <p class="text-xs font-extrabold uppercase tracking-wider text-primary">Lesson {i + 1} · {lesson.verseRef}</p>
          <h3 class="text-xl font-black mt-0.5 mb-3">{lesson.title}</h3>

          {#if unlocked}
            <div class="card p-4 mb-3">
              <div class="text-center">
                <VerseText sanskrit={lesson.verseSanskrit} transliteration={lesson.verseTransliteration} class="text-lg font-bold leading-relaxed" />
              </div>
              <p class="text-[15px] text-text-muted leading-relaxed mt-3 pt-3 border-t-2 border-border-warm">{lesson.translation}</p>
            </div>

            <p class="text-sm font-extrabold uppercase tracking-wider text-text-muted mb-2">Key words</p>
            <ul class="flex flex-col gap-2">
              {#each lessonWords(lesson) as w (w.word)}
                <li class="card flex items-center gap-3 px-3 py-2.5">
                  {#if speechSupported}
                    <button
                      type="button"
                      aria-label="Hear {w.word}"
                      onclick={() => speak(w.devanagari)}
                      class="shrink-0 w-10 h-10 rounded-xl bg-info text-white flex items-center justify-center active:translate-y-0.5"
                      style="box-shadow: 0 3px 0 var(--color-info-dark)"
                    >
                      <Icon name="speaker" class="w-5 h-5" />
                    </button>
                  {/if}
                  <div class="flex flex-col items-start min-w-0">
                    <SanskritWord text={w.word} />
                  </div>
                  <span class="ml-auto text-sm font-bold text-text-muted text-right">{w.meaning}</span>
                </li>
              {/each}
            </ul>
          {:else}
            <div class="card p-5 flex items-center gap-3 text-text-muted bg-bg-surface-alt!">
              <Icon name="lock" class="w-6 h-6 shrink-0" />
              <p class="text-[15px] font-bold">Complete this lesson to unlock its guide.</p>
            </div>
          {/if}
        </section>
      {/each}
    </div>
  {:else}
    <p class="text-center text-text-muted mt-10">This unit doesn't exist.</p>
  {/if}
</div>
