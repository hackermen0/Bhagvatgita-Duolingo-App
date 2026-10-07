<script lang="ts">
  import { onMount } from 'svelte';
  import type { PhilosophyContent } from '../data/philosophy';
  import { hasTTS, speak, stopSpeaking } from '../utils/speech';
  import StoryIllustration from './StoryIllustration.svelte';
  import Icon from './Icon.svelte';

  // The backstory "video", full screen like a reel: the picture fills the screen, tapping pauses, the caption
  // and a Continue button sit over the bottom. A verse with a recorded video plays it; until one is added, its
  // scenes play as a narrated slideshow: each illustration is shown while its line is read aloud.
  let { content, verseRef, onContinue, onClose } = $props<{
    content: PhilosophyContent;
    verseRef: string;
    /** Leaves the video for the verse page (Continue, or Skip before it ends) */
    onContinue: () => void;
    /** The close button: the caller confirms before leaving the lesson */
    onClose: () => void;
  }>();

  const scenes = $derived(content.scenes);
  const narrated = $derived(!content.video);

  let index = $state(0);
  let playing = $state(false);
  let finished = $state(false);
  let muted = $state(false);
  let showTranscript = $state(false);
  // Flashes the play/pause glyph in the middle when the learner taps, as reels do
  let tapFlash = $state<'play' | 'pause' | null>(null);
  let flashTimer: ReturnType<typeof setTimeout> | undefined;

  // ─── Narrated scenes ────────────────────────────────────────────────────────
  // Cancelling speech fires the old utterance's onEnd late, so each scene gets a token and stale callbacks are ignored
  let token = 0;
  let timer: ReturnType<typeof setTimeout> | undefined;

  /** Roughly how long a line takes to read aloud, for the progress bar and the muted timer */
  const estimateMs = (text: string) => Math.max(3000, text.length * 65);

  function playScene(i: number) {
    clearTimeout(timer);
    const mine = ++token;
    index = i;
    playing = true;
    finished = false;
    const text = scenes[i].text;
    const startedAt = Date.now();
    const done = () => {
      if (mine !== token) return;
      // A browser that blocks speech until the page is tapped ends the line at once: wait for a tap instead
      if (!muted && Date.now() - startedAt < 400) return pause();
      nextScene();
    };
    if (hasTTS() && !muted) {
      speak(text, 'en', { onEnd: done });
      // Safety net for voices that never fire onend
      timer = setTimeout(done, text.length * 100 + 3000);
    } else {
      timer = setTimeout(done, estimateMs(text));
    }
  }

  function nextScene() {
    clearTimeout(timer);
    token++;
    if (index < scenes.length - 1) return playScene(index + 1);
    stopSpeaking();
    playing = false;
    finished = true;
  }

  function pause() {
    clearTimeout(timer);
    token++;
    stopSpeaking();
    playing = false;
  }

  // ─── Recorded video ─────────────────────────────────────────────────────────
  let videoEl = $state<HTMLVideoElement | null>(null);
  let videoProgress = $state(0);

  // ─── Controls ───────────────────────────────────────────────────────────────
  function flash(kind: 'play' | 'pause') {
    tapFlash = kind;
    clearTimeout(flashTimer);
    flashTimer = setTimeout(() => (tapFlash = null), 600);
  }

  function togglePlay() {
    if (videoEl) {
      if (videoEl.paused) videoEl.play().catch(() => {});
      else videoEl.pause();
      flash(videoEl.paused ? 'pause' : 'play');
      return;
    }
    if (playing) {
      pause();
      flash('pause');
    } else {
      playScene(finished ? 0 : index);
      flash('play');
    }
  }

  function replay() {
    if (videoEl) {
      videoEl.currentTime = 0;
      videoEl.play().catch(() => {});
      return;
    }
    playScene(0);
  }

  function toggleMute() {
    muted = !muted;
    if (videoEl) return void (videoEl.muted = muted);
    // Restart the line so it switches between the voice and the silent timer
    if (playing) playScene(index);
  }

  function openTranscript() {
    if (videoEl) videoEl.pause();
    else if (playing) pause();
    showTranscript = true;
  }

  function onKey(e: KeyboardEvent) {
    if (e.key !== ' ' || showTranscript) return;
    e.preventDefault();
    togglePlay();
  }

  onMount(() => {
    // Reels start on their own. The learner tapped Start a moment ago, so the browser lets speech play.
    if (narrated) playScene(0);
    return () => {
      clearTimeout(timer);
      clearTimeout(flashTimer);
      token++;
      stopSpeaking();
    };
  });
</script>

<svelte:window onkeydown={onKey} />

<div class="absolute inset-0 z-30 bg-black text-white overflow-hidden select-none animate-[fade-in_0.25s_ease-out]">
  <!-- ═══ The picture, full bleed ═══ -->
  {#if content.video?.kind === 'file'}
    <video
      bind:this={videoEl}
      src={content.video.src}
      poster={content.video.poster}
      autoplay
      playsinline
      preload="auto"
      onplay={() => (playing = true)}
      onpause={() => (playing = false)}
      onended={() => { playing = false; finished = true; }}
      ontimeupdate={() => videoEl && videoEl.duration && (videoProgress = videoEl.currentTime / videoEl.duration)}
      class="absolute inset-0 w-full h-full object-cover"
    ><track kind="captions" /></video>
  {:else if content.video?.kind === 'youtube'}
    <iframe
      src="https://www.youtube-nocookie.com/embed/{content.video.id}?autoplay=1&rel=0&playsinline=1&modestbranding=1"
      title={content.backstoryTitle}
      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
      allowfullscreen
      class="absolute inset-0 w-full h-full"
    ></iframe>
  {:else}
    {#key index}
      <div class="absolute inset-0 {playing ? 'animate-story-pan' : ''}">
        <StoryIllustration illustration={scenes[index].illustration} />
      </div>
    {/key}
  {/if}

  <!-- Tap anywhere on the picture to pause / play (a YouTube embed has its own controls) -->
  {#if content.video?.kind !== 'youtube'}
    <button type="button" onclick={togglePlay} aria-label={playing ? 'Pause' : 'Play'} class="absolute inset-0 z-10 cursor-pointer"></button>
  {/if}

  <!-- Centre glyph: stays while paused, flashes on a tap -->
  {#if content.video?.kind !== 'youtube' && (!playing || tapFlash)}
    <div class="absolute inset-0 z-10 flex items-center justify-center pointer-events-none">
      <span class="w-20 h-20 rounded-full bg-black/45 backdrop-blur-sm flex items-center justify-center animate-pop-in">
        {#if finished && !playing}
          <Icon name="retry" class="w-9 h-9" />
        {:else if playing && tapFlash === 'play'}
          <svg viewBox="0 0 24 24" fill="currentColor" class="w-10 h-10 ml-1" aria-hidden="true"><path d="M8 5.14v13.72a1 1 0 001.5.86l11-6.86a1 1 0 000-1.72l-11-6.86A1 1 0 008 5.14z" /></svg>
        {:else if !playing}
          <svg viewBox="0 0 24 24" fill="currentColor" class="w-10 h-10 ml-1" aria-hidden="true"><path d="M8 5.14v13.72a1 1 0 001.5.86l11-6.86a1 1 0 000-1.72l-11-6.86A1 1 0 008 5.14z" /></svg>
        {:else}
          <svg viewBox="0 0 24 24" fill="currentColor" class="w-10 h-10" aria-hidden="true"><path d="M7 5h3.5v14H7zM13.5 5H17v14h-3.5z" /></svg>
        {/if}
      </span>
    </div>
  {/if}

  <!-- ═══ Top: progress + close ═══ -->
  <div class="absolute z-20 inset-x-0 top-0 px-3 pt-[max(0.75rem,env(safe-area-inset-top))] pb-10 bg-linear-to-b from-black/70 to-transparent pointer-events-none">
    <div class="flex gap-1 pointer-events-auto">
      {#if narrated}
        {#each scenes as scene, i}
          <button type="button" onclick={() => playScene(i)} aria-label="Scene {i + 1}" class="flex-1 py-1.5">
            <span class="block h-[3px] rounded-full bg-white/35 overflow-hidden">
              {#if i < index || (finished && i === index)}
                <span class="block h-full w-full bg-white"></span>
              {:else if i === index}
                {#key `${index}:${playing}`}
                  <span class="block h-full bg-white {playing ? 'animate-story-fill' : 'w-0'}" style="animation-duration: {estimateMs(scene.text)}ms"></span>
                {/key}
              {/if}
            </span>
          </button>
        {/each}
      {:else if content.video?.kind === 'file'}
        <span class="flex-1 my-1.5 block h-[3px] rounded-full bg-white/35 overflow-hidden">
          <span class="block h-full bg-white" style="width: {videoProgress * 100}%"></span>
        </span>
      {/if}
    </div>
    <div class="flex items-center justify-between mt-1.5 pointer-events-auto">
      <span class="text-sm font-black tracking-wide drop-shadow">Backstory · {verseRef}</span>
      <button type="button" onclick={onClose} aria-label="Quit" class="w-9 h-9 -mr-1 flex items-center justify-center text-white/90 hover:text-white">
        <Icon name="close" class="w-6 h-6" />
      </button>
    </div>
  </div>

  <!-- ═══ Right rail ═══ -->
  <div class="absolute z-20 right-2.5 bottom-44 flex flex-col items-center gap-5">
    {#snippet railButton(label: string, onclick: () => void)}
      <button type="button" {onclick} aria-label={label} class="flex flex-col items-center gap-1 drop-shadow">
        <span class="w-11 h-11 rounded-full bg-black/35 backdrop-blur-sm flex items-center justify-center">
          {@render railIcon(label)}
        </span>
        <span class="text-[11px] font-extrabold">{label}</span>
      </button>
    {/snippet}
    {#snippet railIcon(label: string)}
      {#if label === 'Sound' || label === 'Muted'}
        <svg viewBox="0 0 24 24" fill="currentColor" class="w-6 h-6" aria-hidden="true">
          <path d="M3 9v6h4l5 5V4L7 9H3z" />
          {#if muted}
            <path d="M16 9l5 6M21 9l-5 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" fill="none" />
          {:else}
            <path d="M16.5 12a4.5 4.5 0 00-2.5-4.03v8.06A4.5 4.5 0 0016.5 12z" />
          {/if}
        </svg>
      {:else if label === 'Story'}
        <Icon name="book" class="w-6 h-6" />
      {:else}
        <Icon name="retry" class="w-6 h-6" />
      {/if}
    {/snippet}
    {@render railButton(muted ? 'Muted' : 'Sound', toggleMute)}
    {@render railButton('Story', openTranscript)}
    {@render railButton('Replay', replay)}
  </div>

  <!-- ═══ Bottom: who, title, caption, continue ═══ -->
  <div class="absolute z-20 inset-x-0 bottom-0 pt-24 bg-linear-to-t from-black/90 via-black/55 to-transparent pointer-events-none">
    <div class="px-4 pr-16">
      <div class="flex items-center gap-2">
        <img src="/mascot/cheerful.webp" alt="" class="w-8 h-8 rounded-full bg-primary-soft border-2 border-white object-cover object-top" />
        <span class="text-sm font-black">Krishna's stories</span>
        <span class="text-[11px] font-extrabold px-2 py-0.5 rounded-md border border-white/60">{verseRef}</span>
      </div>
      <h2 class="text-lg font-black leading-tight mt-2">{content.backstoryTitle}</h2>
      {#if narrated}
        {#key index}
          <p class="text-[15px] font-bold leading-snug mt-1 text-white/95 animate-[fade-in_0.3s_ease-out]">{scenes[index].text}</p>
        {/key}
      {/if}
    </div>
    <div class="px-4 pt-4 pb-[max(1rem,env(safe-area-inset-bottom))] pointer-events-auto">
      <button
        type="button"
        onclick={onContinue}
        class="btn w-full {finished ? 'btn-primary' : 'bg-white/15! text-white! border-2 border-white/40 backdrop-blur-sm shadow-none!'}"
      >
        {finished ? 'Continue to the verse' : 'Skip to the verse'}
      </button>
    </div>
  </div>

  <!-- ═══ Transcript sheet ═══ -->
  {#if showTranscript}
    <button type="button" aria-label="Close story" onclick={() => (showTranscript = false)} class="absolute inset-0 z-30 bg-black/50 cursor-default animate-[fade-in_0.15s_ease-out]"></button>
    <div class="absolute z-40 inset-x-0 bottom-0 max-h-[70%] flex flex-col rounded-t-3xl bg-bg-base text-text-primary animate-sheet-up">
      <div class="shrink-0 flex items-center justify-between px-5 pt-4 pb-2">
        <h3 class="text-lg font-black">{content.backstoryTitle}</h3>
        <button type="button" onclick={() => (showTranscript = false)} aria-label="Close" class="text-text-muted">
          <Icon name="close" class="w-6 h-6" />
        </button>
      </div>
      <div class="overflow-y-auto scrollbar-none px-5 pb-[max(1.5rem,env(safe-area-inset-bottom))] flex flex-col gap-3">
        {#each scenes as scene}
          <p class="text-[15px] font-semibold leading-relaxed">{scene.text}</p>
        {/each}
      </div>
    </div>
  {/if}
</div>
