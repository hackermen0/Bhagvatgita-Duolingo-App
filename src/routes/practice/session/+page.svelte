<script lang="ts">
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import { page } from '$app/stores';
  import type { Lesson } from '$lib/data/gitaData';
  import { buildPracticeLesson, type PracticeKind } from '$lib/data/practice';
  import QuizScreen from '$lib/components/QuizScreen.svelte';
  import Mascot from '$lib/components/Mascot.svelte';

  // Built on the client: it depends on locally-saved progress and uses randomness,
  // neither of which the server render can reproduce.
  let practiceLesson = $state<Lesson | null>(null);
  let ready = $state(false);

  onMount(() => {
    const requested = $page.url.searchParams.get('kind');
    const kind: PracticeKind = requested === 'listening' || requested === 'mistakes' ? requested : 'review';
    practiceLesson = buildPracticeLesson({ listening: 'speechSynthesis' in window, kind });
    ready = true;
  });

  const exit = () => goto('/practice');
</script>

{#if practiceLesson}
  <QuizScreen lesson={practiceLesson} mode="practice" onExit={exit} />
{:else if ready}
  <div class="w-full h-full flex flex-col bg-bg-base">
    <div class="flex-1 flex flex-col items-center justify-center p-6 text-center gap-4">
      <Mascot mood="guide" size="lg" />
      <h1 class="text-2xl font-black">Nothing to practice yet</h1>
      <p class="text-base text-text-muted max-w-xs leading-relaxed">
        Complete your first lesson to unlock practice. Words you learn come back here right when you're about to forget them.
      </p>
    </div>
    <div class="lesson-footer">
      <button onclick={exit} class="btn btn-primary w-full">Continue</button>
    </div>
  </div>
{/if}
