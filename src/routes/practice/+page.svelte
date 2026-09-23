<script lang="ts">
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import type { Lesson } from '$lib/data/gitaData';
  import { buildPracticeLesson } from '$lib/data/practice';
  import QuizScreen from '$lib/components/QuizScreen.svelte';
  import Mascot from '$lib/components/Mascot.svelte';

  // Built on the client: it depends on locally-saved progress and uses randomness,
  // neither of which the server render can reproduce.
  let practiceLesson = $state<Lesson | null>(null);
  let ready = $state(false);

  onMount(() => {
    practiceLesson = buildPracticeLesson({ listening: 'speechSynthesis' in window });
    ready = true;
  });

  const exit = () => goto('/');
</script>

{#if practiceLesson}
  <QuizScreen lesson={practiceLesson} mode="practice" onExit={exit} />
{:else if ready}
  <div class="w-full h-full flex flex-col items-center justify-center p-6 text-center gap-4 bg-bg-base">
    <Mascot mood="guide" size="lg" />
    <h1 class="text-xl font-black font-cinzel text-text-primary">Nothing to practice yet</h1>
    <p class="text-sm text-text-muted max-w-xs leading-relaxed">
      Complete your first lesson to unlock practice. Words you learn will come back here right when you're about to forget them.
    </p>
    <button
      onclick={exit}
      class="w-full max-w-xs bg-primary hover:bg-primary-dark text-bg-base font-black py-3.5 rounded-2xl shadow-lg btn-3d border-b-4 border-accent transition-all text-sm"
    >
      Back to Lessons
    </button>
  </div>
{/if}
