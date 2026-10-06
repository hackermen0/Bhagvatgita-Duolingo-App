<script lang="ts">
  import { goto } from '$app/navigation';
  import { page } from '$app/stores';
  import { gitaData } from '$lib/data/gitaData';
  import JourneyScreen from '$lib/components/JourneyScreen.svelte';
  import Mascot from '$lib/components/Mascot.svelte';

  const lesson = $derived(
    gitaData.chapters
      .flatMap((c) => c.sections.flatMap((s) => s.lessons))
      .find((l) => l.id === $page.params.lessonId)
  );

  function handleExit() {
    goto('/');
  }
</script>

{#if lesson}
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
