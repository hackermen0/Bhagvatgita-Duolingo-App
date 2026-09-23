<script lang="ts">
  import { untrack } from 'svelte';
  import { goto } from '$app/navigation';
  import { page } from '$app/stores';
  import { gitaData } from '$lib/data/gitaData';
  import { gameState } from '$lib/state/gameState.svelte';
  import { learningConfig } from '$lib/data/learningConfig';
  import { personalizeLesson } from '$lib/data/personalization';
  import QuizScreen from '$lib/components/QuizScreen.svelte';

  // Personalized once per lesson visit (untracked): it picks random exercise targets, and
  // progress saved mid-lesson must not regenerate the lesson underneath the learner.
  let activeLesson = $derived.by(() => {
    const lessonId = $page.params.lessonId;
    const base = gitaData.chapters
      .flatMap(c => c.sections.flatMap(s => s.lessons))
      .find(l => l.id === lessonId);
    if (!base) return undefined;
    return untrack(() =>
      personalizeLesson(base, learningConfig(gameState.profile), {
        speech: typeof window !== 'undefined' && 'speechSynthesis' in window
      })
    );
  });

  function handleExit() {
    goto('/');
  }
</script>

{#if activeLesson}
  {#key activeLesson.id}
    <QuizScreen lesson={activeLesson} onExit={handleExit} />
  {/key}
{:else}
  <div class="min-h-screen bg-bg-base flex flex-col items-center justify-center p-6 text-center select-none">
    <div class="w-16 h-16 bg-error/10 border border-error/30 rounded-full flex items-center justify-center mb-6 text-error">
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor" class="w-6 h-6">
        <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
      </svg>
    </div>

    <h1 class="text-2xl font-bold font-cinzel text-text-primary mb-2">Lesson Not Found</h1>
    <p class="text-sm text-text-muted max-w-xs leading-relaxed mb-6">
      The lesson you are trying to access does not exist or may have been moved.
    </p>

    <button
      onclick={handleExit}
      class="py-3 px-6 bg-bg-surface-alt hover:bg-border-warm text-text-primary border border-border-warm font-bold rounded-xl active:scale-95 transition-all text-sm"
    >
      Return to Dashboard
    </button>
  </div>
{/if}
