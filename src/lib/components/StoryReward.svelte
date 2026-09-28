<script lang="ts">
  import { onMount } from 'svelte';
  import type { UnitStory } from '../data/stories';
  import StoryIllustration from './StoryIllustration.svelte';
  import Icon from './Icon.svelte';

  let { story, onComplete } = $props<{
    story: UnitStory;
    onComplete: () => void;
  }>();

  type Phase = 'title' | 'scene' | 'end';
  let phase = $state<Phase>('title');
  let index = $state(0);
  let speechSupported = $state(false);

  // Same stale-callback guard used for recitation elsewhere: cancelling an utterance to
  // start a new one fires the OLD one's onend/onerror late, after the new scene has begun.
  let currentUtterance: SpeechSynthesisUtterance | null = null;
  let sceneTimer: ReturnType<typeof setTimeout> | null = null;
  // Guards against the safety-net timer AND speech's onend both calling goNext() for one scene.
  let settled = false;

  onMount(() => {
    speechSupported = typeof window !== 'undefined' && 'speechSynthesis' in window;
    return () => {
      if (sceneTimer) clearTimeout(sceneTimer);
      currentUtterance = null;
      if (speechSupported) window.speechSynthesis.cancel();
    };
  });

  const durationFor = (caption: string) => Math.max(3200, Math.min(9000, caption.length * 55));

  function cleanupSpeech() {
    currentUtterance = null;
    if (speechSupported) window.speechSynthesis.cancel();
  }

  function playScene(i: number) {
    if (sceneTimer) clearTimeout(sceneTimer);
    cleanupSpeech();
    settled = false;
    const caption = story.scenes[i].caption;
    const duration = durationFor(caption);
    const finish = () => {
      if (settled) return;
      settled = true;
      goNext();
    };
    if (speechSupported) {
      const utterance = new SpeechSynthesisUtterance(caption);
      utterance.rate = 0.92;
      utterance.onend = utterance.onerror = () => {
        if (currentUtterance === utterance) finish();
      };
      currentUtterance = utterance;
      window.speechSynthesis.speak(utterance);
      sceneTimer = setTimeout(finish, duration + 2000); // safety net only
    } else {
      sceneTimer = setTimeout(finish, duration);
    }
  }

  function goNext() {
    if (sceneTimer) clearTimeout(sceneTimer);
    if (index < story.scenes.length - 1) {
      index += 1;
      playScene(index);
    } else {
      cleanupSpeech();
      phase = 'end';
    }
  }

  function goBack() {
    if (index === 0) return;
    index -= 1;
    playScene(index);
  }

  /** Tapping skips whatever narration/timer is left on the current scene. */
  function tapNext() {
    settled = true;
    goNext();
  }

  function beginScenes() {
    phase = 'scene';
    index = 0;
    playScene(0);
  }

  function finish() {
    if (sceneTimer) clearTimeout(sceneTimer);
    cleanupSpeech();
    onComplete();
  }
</script>

<div class="absolute inset-0 z-50 bg-black flex flex-col select-none animate-[fade-in_0.3s_ease-out]">
  <!-- Illustration, full bleed -->
  {#if phase === 'scene'}
    <div class="absolute inset-0">
      {#key index}
        <div class="w-full h-full animate-story-pan">
          <StoryIllustration illustration={story.scenes[index].illustration} />
        </div>
      {/key}
    </div>
    <!-- Tap zones: left third rewinds, right two-thirds advances -->
    <button type="button" aria-label="Previous scene" class="absolute inset-y-0 left-0 w-[35%] z-10" onclick={goBack}></button>
    <button type="button" aria-label="Next scene" class="absolute inset-y-0 right-0 w-[65%] z-10" onclick={tapNext}></button>
  {:else if phase === 'title'}
    <div class="absolute inset-0">
      <StoryIllustration illustration={story.scenes[0]?.illustration ?? 'battlefield'} />
    </div>
    <div class="absolute inset-0 bg-black/40"></div>
  {:else}
    <div class="absolute inset-0">
      <StoryIllustration illustration="peace" />
    </div>
    <div class="absolute inset-0 bg-black/50"></div>
  {/if}

  <!-- Top bar: progress + close -->
  <div class="relative z-20 bg-gradient-to-b from-black/70 to-transparent pt-[max(0.75rem,env(safe-area-inset-top))] px-4 pb-8 pointer-events-none">
    {#if phase === 'scene'}
      <div class="flex gap-1.5 pointer-events-auto">
        {#each story.scenes as _scene, i}
          <div class="flex-1 h-1 rounded-full bg-white/30 overflow-hidden">
            {#if i < index}
              <div class="h-full w-full bg-white"></div>
            {:else if i === index}
              {#key index}
                <div class="h-full bg-white animate-story-fill" style="animation-duration: {durationFor(story.scenes[index].caption)}ms"></div>
              {/key}
            {/if}
          </div>
        {/each}
      </div>
    {/if}
    <div class="flex items-center justify-between mt-3 pointer-events-auto">
      <span class="text-white/90 text-xs font-black uppercase tracking-wider truncate pr-3">{story.title}</span>
      <button type="button" onclick={finish} aria-label="Close story" class="shrink-0 text-white/90 hover:text-white">
        <Icon name="close" class="w-6 h-6" />
      </button>
    </div>
  </div>

  <!-- Bottom content -->
  <div class="relative z-20 flex-1 flex flex-col justify-end pointer-events-none">
    {#if phase === 'title'}
      <div class="flex-1 flex flex-col items-center justify-center text-center px-8 pointer-events-none">
        <Icon name="book" class="w-14 h-14 text-white/90" />
        <h1 class="text-3xl font-black text-white mt-4 leading-tight">{story.title}</h1>
        <p class="text-white/80 font-bold mt-2">A retelling of what you just learned</p>
      </div>
    {:else if phase === 'scene'}
      <div class="px-5 pb-8 pt-24 bg-gradient-to-t from-black/85 via-black/40 to-transparent">
        <p class="text-[11px] font-black uppercase tracking-wider text-white/70">{story.scenes[index].verseRef}</p>
        <p class="text-xl font-black text-white leading-snug mt-1">{story.scenes[index].caption}</p>
      </div>
    {:else}
      <div class="flex-1 flex flex-col items-center justify-center text-center px-8 pointer-events-none">
        <Icon name="trophy" class="w-16 h-16 text-gold" />
        <h1 class="text-3xl font-black text-white mt-4">The End</h1>
        <p class="text-white/80 font-bold mt-2">{story.title}</p>
      </div>
    {/if}
  </div>

  <!-- Footer button: title and end phases only, scene phase advances by tap -->
  {#if phase !== 'scene'}
    <div class="relative z-20 px-5 pb-[max(1.25rem,env(safe-area-inset-bottom))]">
      <button type="button" onclick={phase === 'title' ? beginScenes : finish} class="btn btn-primary w-full">
        {phase === 'title' ? 'Begin' : 'Continue'}
      </button>
    </div>
  {/if}
</div>
