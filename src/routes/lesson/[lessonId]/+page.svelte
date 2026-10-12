<script lang="ts">
  import { goto } from '$app/navigation';
  import { page } from '$app/stores';
  import { gitaData } from '$lib/data/gitaData';
  import { PRELUDE_ID, PRELUDE_TITLE, findLesson, philosophySession } from '$lib/data/philosophy';
  import { gameState } from '$lib/state/gameState.svelte';
  import JourneyScreen from '$lib/components/JourneyScreen.svelte';
  import PhilosophyScreen from '$lib/components/PhilosophyScreen.svelte';
  import PreludeStory from '$lib/components/PreludeStory.svelte';
  import TestSwitcher from '$lib/components/TestSwitcher.svelte';
  import Mascot from '$lib/components/Mascot.svelte';

  const lessonId = $derived($page.params.lessonId ?? '');
  const philosophyMode = $derived(gameState.learningMode === 'philosophy');

  // TEMPORARY (testing): every session opens on a mode / level switcher; the verse starts once it is dismissed
  let startedFor = $state('');
  const atSwitcher = $derived(startedFor !== lessonId);
  const known = $derived(findLesson(lessonId));
  const normalLesson = $derived(gitaData.chapters.flatMap((c) => c.sections.flatMap((s) => s.lessons)).find((l) => l.id === lessonId));
  const blocked = $derived(
    !known
      ? ''
      : philosophyMode && lessonId !== PRELUDE_ID && !philosophySession(lessonId)
        ? 'The philosophy lesson for this verse is still being written. Switch to Learning mode to play it.'
        : !philosophyMode && !normalLesson
          ? 'This part of the story only exists in Philosophy mode. Switch to Philosophy to play it.'
          : ''
  );

  // The normal mode teaches only gitaData's verses; philosophy mode's path also has Chapter 1 and its story page
  const lesson = $derived(
    philosophyMode
      ? findLesson(lessonId)
      : gitaData.chapters.flatMap((c) => c.sections.flatMap((s) => s.lessons)).find((l) => l.id === lessonId)
  );
  const session = $derived(philosophyMode && lesson ? philosophySession(lesson.id) : undefined);

  function handleExit() {
    goto('/');
  }
</script>

{#if atSwitcher && known}
  <TestSwitcher
    eyebrow={lessonId === PRELUDE_ID ? 'Before the Gita' : known.verseRef}
    title={lessonId === PRELUDE_ID ? PRELUDE_TITLE : known.title}
    {blocked}
    onStart={() => (startedFor = lessonId)}
    onBack={handleExit}
  />
{:else if philosophyMode && lessonId === PRELUDE_ID}
  <PreludeStory onExit={handleExit} />
{:else if philosophyMode && session}
  {#key session.id}
    <PhilosophyScreen {session} onExit={handleExit} />
  {/key}
{:else if philosophyMode && lesson}
  <div class="w-full h-full flex flex-col bg-bg-base select-none">
    <div class="flex-1 flex flex-col items-center justify-center p-6 text-center gap-3">
      <Mascot mood="thinking" size="xl" />
      <h1 class="text-2xl font-black mt-4">Coming soon</h1>
      <p class="text-base font-bold text-text-muted max-w-xs leading-relaxed">
        The philosophy lesson for {lesson.verseRef} is still being written. You can learn it word by word in the other mode from Settings.
      </p>
    </div>
    <div class="lesson-footer">
      <button onclick={handleExit} class="btn btn-primary w-full">Back to the path</button>
    </div>
  </div>
{:else if lesson}
  <!-- Keyed per verse: the journey reads its checkpoint once, on entry, and saving progress must not rebuild it -->
  {#key lesson.id}
    <JourneyScreen {lesson} onExit={handleExit} />
  {/key}
{:else}
  <div class="w-full h-full flex flex-col bg-bg-base select-none">
    <div class="flex-1 flex flex-col items-center justify-center p-6 text-center gap-3">
      <Mascot mood="thinking" size="xl" />
      <h1 class="text-2xl font-black mt-4">Lesson not found</h1>
      <p class="text-base font-bold text-text-muted max-w-xs leading-relaxed">
        This lesson doesn't exist or may have moved.
      </p>
    </div>
    <div class="lesson-footer">
      <button onclick={handleExit} class="btn btn-primary w-full">Back to the path</button>
    </div>
  </div>
{/if}
