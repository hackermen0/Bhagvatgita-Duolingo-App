<script lang="ts">
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import { page } from '$app/stores';
  import { gameState } from '$lib/state/gameState.svelte';
  import { buildJumpTest, type JumpTest } from '$lib/data/personalization';
  import QuizScreen from '$lib/components/QuizScreen.svelte';

  let test = $state<JumpTest | null>(null);

  // Built once on mount: passing the test marks lessons complete, which would otherwise
  // rebuild (and empty) the test while its completion screen is still showing.
  onMount(() => {
    test = buildJumpTest($page.params.lessonId ?? '', gameState.completedLessons);
    if (!test) goto('/');
  });

  const exit = () => goto('/');
</script>

{#if test}
  <QuizScreen lesson={test.lesson} mode="jump" jumpLessonIds={test.skippedLessonIds} onExit={exit} />
{/if}
