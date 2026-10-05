<script lang="ts">
  import { untrack } from 'svelte';
  import { goto } from '$app/navigation';
  import { page } from '$app/stores';
  import { gitaData } from '$lib/data/gitaData';
  import { gameState, LESSON_LEVELS } from '$lib/state/gameState.svelte';
  import { learningConfig } from '$lib/data/learningConfig';
  import { personalizeLesson } from '$lib/data/personalization';
  import QuizScreen from '$lib/components/QuizScreen.svelte';
  import Mascot from '$lib/components/Mascot.svelte';

  // Personalized once per lesson visit (untracked): it picks random exercise targets, and
  // progress saved mid-lesson must not regenerate the lesson underneath the learner.
  // The level is likewise fixed at entry: finishing a level updates saved progress, which must not
  // swap the level under the learner. Levels play in order, so ?level= can't skip ahead.
  let activeLesson = $derived.by(() => {
    const lessonId = $page.params.lessonId;
    const base = gitaData.chapters
      .flatMap(c => c.sections.flatMap(s => s.lessons))
      .find(l => l.id === lessonId);
    if (!base) return undefined;
    return untrack(() =>
      personalizeLesson(base, learningConfig(gameState.profile, gameState.difficultyTier), {
        speech: typeof window !== 'undefined' && 'speechSynthesis' in window
      })
    );
  });

  const activeLevel = $derived.by(() => {
    const id = $page.params.lessonId ?? '';
    const requested = Number($page.url.searchParams.get('level'));
    return untrack(() => {
      const done = gameState.levelsDone(id);
      const furthest = Math.min(done + 1, LESSON_LEVELS);
      return requested >= 1 && requested <= furthest ? requested : furthest;
    });
  });

  function handleExit() {
    goto('/');
  }
</script>

{#if activeLesson}
  {#key `${activeLesson.id}:${activeLevel}`}
    <QuizScreen lesson={activeLesson} level={activeLevel} onExit={handleExit} />
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
