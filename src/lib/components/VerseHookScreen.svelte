<script lang="ts">
  import type { Lesson } from "../data/gitaData";
  import { gameState } from "../state/gameState.svelte";
  import { hindiOf, hindiTokens, type HindiToken } from "../data/hindi";
  import { CHUNK_COLORS } from "../data/chunkColors";
  import { onMount } from "svelte";

  let { lesson, onComplete, autoPlay = false } = $props<{
    lesson: Lesson;
    onComplete: () => void;
    autoPlay?: boolean;
  }>();

  const isDeva = $derived(gameState.tierScriptMode === 'devanagari');

  // The verse's Hindi is its parts read in order, so the parts are the chunks: each one is a numbered
  // piece with its own English clause, so a newcomer sees a few labelled pieces instead of one wall of
  // text. A lesson with no parts shows its whole Hindi translation as a single unlabelled chunk.
  type Chunk = { start: number; end: number; number: number | null; translation: string };
  const parts = $derived(lesson.parts ?? []);
  const wordPairs = $derived<HindiToken[]>(
    parts.length
      ? parts.flatMap((p: { hindiTranslationDevanagari: string; hindiTranslationRoman: string }) => hindiTokens(hindiOf(p)))
      : hindiTokens(hindiOf(lesson))
  );
  const chunks = $derived.by<Chunk[]>(() => {
    if (!parts.length) return [{ start: 0, end: wordPairs.length, number: null, translation: lesson.translation }];
    let start = 0;
    return parts.map((p: { hindiTranslationDevanagari: string; translation: string }, i: number) => {
      const count = p.hindiTranslationDevanagari.split(/\s+/).filter(Boolean).length;
      const chunk = { start, end: start + count, number: i + 1, translation: p.translation };
      start += count;
      return chunk;
    });
  });
  const isChunked = $derived(chunks.length > 1 || chunks[0]?.number !== null);
  const activeChunk = $derived(
    chunks.findIndex((c) => activeWordIndex >= c.start && activeWordIndex < c.end)
  );

  let isSpeaking = $state(false);
  let rate = $state<"normal" | "slow">("normal");
  let speechSupported = $state(false);
  let activeWordIndex = $state(-1);
  // Once the recitation has played through, the footer button becomes the main call to action
  let hasListened = $state(false);

  // Spoken text is built by joining the SAME word tokens shown on screen (space-separated),
  // so a boundary event's charIndex maps back to a display word unambiguously. Speech is always
  // the Devanagari, whichever script the tier displays.
  let spokenWords = $derived(wordPairs.map((w: HindiToken) => w.dev));
  let wordOffsets = $derived.by(() => {
    let offset = 0;
    return spokenWords.map((w: string) => {
      const start = offset;
      offset += w.length + 1; // +1 for the joining space
      return start;
    });
  });

  function findWordIndexForCharIndex(charIndex: number): number {
    let found = 0;
    for (let i = 0; i < wordOffsets.length; i++) {
      if (wordOffsets[i] <= charIndex) found = i;
      else break;
    }
    return found;
  }

  // Each playback gets a fresh token. Cancelling speech fires the OLD utterances'
  // onend/onerror asynchronously, after the new playback has started — comparing
  // against the token lets those stale callbacks recognize they're outdated and no-op.
  let session: object | null = null;

  // Word highlighting needs to know when each word starts. Desktop voices report that via
  // `onboundary`, so the verse plays as one smooth utterance. Many mobile voices (Android
  // Chrome's Hindi voice especially) never fire `onboundary`; there the verse is queued as
  // one utterance per word instead, and each word's `onstart` — reliable everywhere — drives
  // the highlight in exact sync. Phones start in word-by-word mode; elsewhere a full
  // recitation that finishes without a single boundary switches that device over.
  // (No mid-playback timeout: network voices can start reporting boundaries well after
  // `onstart`, which once misclassified desktops — hence the versioned key.)
  const BOUNDARY_KEY = "gita_tts_word_boundaries_v2";
  const isMobileDevice = () =>
    !!(navigator as Navigator & { userAgentData?: { mobile: boolean } }).userAgentData?.mobile ||
    /Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent);
  function readBoundarySupport(): boolean | null {
    try {
      const v = localStorage.getItem(BOUNDARY_KEY);
      return v === null ? null : v === "1";
    } catch {
      return null;
    }
  }
  function saveBoundarySupport(supported: boolean) {
    try {
      localStorage.setItem(BOUNDARY_KEY, supported ? "1" : "0");
    } catch {}
  }

  onMount(() => {
    speechSupported = typeof window !== "undefined" && "speechSynthesis" in window;
    const t = autoPlay && speechSupported ? setTimeout(startSpeaking, 700) : undefined;
    return () => {
      clearTimeout(t);
      session = null;
      if (speechSupported) window.speechSynthesis.cancel();
    };
  });

  const speechRate = () => (rate === "slow" ? 0.4 : 0.75);

  function finish(token: object) {
    if (session !== token) return;
    session = null;
    isSpeaking = false;
    activeWordIndex = -1;
    hasListened = true;
  }

  function startSpeaking() {
    window.speechSynthesis.cancel();
    isSpeaking = true;
    activeWordIndex = -1;
    const supported = readBoundarySupport();
    if (supported === false || (supported === null && isMobileDevice())) speakWordByWord();
    else speakWhole();
  }

  function speakWhole() {
    const token = {};
    session = token;
    const utterance = new SpeechSynthesisUtterance(spokenWords.join(" "));
    utterance.lang = "hi-IN";
    utterance.rate = speechRate();
    let boundaryFired = false;
    utterance.onboundary = (event) => {
      if (session !== token) return;
      if (event.name === "word" || event.name === undefined) {
        if (!boundaryFired) saveBoundarySupport(true);
        boundaryFired = true;
        activeWordIndex = findWordIndexForCharIndex(event.charIndex);
      }
    };
    utterance.onend = () => {
      // Only a recitation that played to the end counts; stop/restart null the session first
      if (session === token && !boundaryFired) saveBoundarySupport(false);
      finish(token);
    };
    utterance.onerror = () => finish(token);
    window.speechSynthesis.speak(utterance);
  }

  function speakWordByWord() {
    const token = {};
    session = token;
    spokenWords.forEach((word: string, i: number) => {
      const utterance = new SpeechSynthesisUtterance(word);
      utterance.lang = "hi-IN";
      utterance.rate = speechRate();
      utterance.onstart = () => {
        if (session === token) activeWordIndex = i;
      };
      utterance.onerror = () => finish(token);
      if (i === spokenWords.length - 1) utterance.onend = () => finish(token);
      window.speechSynthesis.speak(utterance);
    });
  }

  function toggleRecitation(e: MouseEvent) {
    e.stopPropagation();
    if (!speechSupported) return;

    if (isSpeaking) {
      session = null;
      window.speechSynthesis.cancel();
      isSpeaking = false;
      activeWordIndex = -1;
      return;
    }

    startSpeaking();
  }

  function setRate(e: MouseEvent, newRate: "normal" | "slow") {
    e.stopPropagation();
    if (rate === newRate) return;
    rate = newRate;
    // Switching speed mid-playback restarts the recitation at the new rate
    if (isSpeaking) startSpeaking();
  }
</script>

<svelte:window onkeydown={(e) => e.key === 'Enter' && onComplete()} />

<div class="flex-1 overflow-y-auto scrollbar-none px-5 pt-4 pb-6 flex flex-col gap-4 select-none">
  <div>
    <p class="text-sm font-extrabold uppercase tracking-wider text-accent">New verse · {lesson.verseRef}</p>
    <h2 class="text-2xl font-black leading-tight mt-1">What you'll learn to say</h2>
  </div>

  <!-- The meaning comes first, so the Hindi below has something to attach to -->
  <div class="card bg-bg-surface-alt! px-4 py-3">
    <p class="text-lg font-black leading-snug">{lesson.essence ?? lesson.translation}</p>
    {#if isChunked}
      <p class="text-sm font-bold text-text-muted mt-1">You'll learn it in 3 short levels: the words, the phrases, then the whole verse.</p>
    {/if}
  </div>

  {#if speechSupported}
    <div class="flex items-center gap-3">
      <button
        onclick={toggleRecitation}
        aria-label={isSpeaking ? 'Stop recitation' : 'Listen to recitation'}
        class="relative flex-1 flex items-center justify-center gap-3 h-14 rounded-2xl bg-info text-white active:translate-y-1 transition-transform"
        style="box-shadow: 0 5px 0 var(--color-info-dark)"
      >
        {#if isSpeaking}
          <span class="absolute -inset-1.5 rounded-[1.4rem] animate-pulse-ring pointer-events-none"></span>
        {/if}
        <svg viewBox="0 0 24 24" fill="currentColor" class="w-7 h-7">
          {#if isSpeaking}
            <path d="M6 6h4v12H6zm8 0h4v12h-4z" />
          {:else}
            <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3a4.5 4.5 0 00-2.5-4.03v8.06A4.5 4.5 0 0016.5 12zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z" />
          {/if}
        </svg>
        <span class="text-base font-black uppercase tracking-wide">{isSpeaking ? 'Stop' : 'Listen to the verse'}</span>
      </button>

      <!-- Speed toggle — only shown while actively speaking -->
      {#if isSpeaking}
        <div class="flex items-center rounded-full border-2 border-border-warm bg-bg-surface p-0.5 shrink-0 animate-[fade-in_0.2s_ease-out]">
          <button
            onclick={(e) => setRate(e, 'slow')}
            class="px-3 py-1 rounded-full text-xs font-black uppercase tracking-wide {rate === 'slow' ? 'bg-info text-white' : 'text-text-muted hover:text-text-primary'}"
          >
            Slow
          </button>
          <button
            onclick={(e) => setRate(e, 'normal')}
            class="px-3 py-1 rounded-full text-xs font-black uppercase tracking-wide {rate === 'normal' ? 'bg-info text-white' : 'text-text-muted hover:text-text-primary'}"
          >
            Normal
          </button>
        </div>
      {/if}
    </div>
  {/if}

  <!-- The verse in chunks; the word being recited is highlighted and its chunk lights up -->
  <div class="flex flex-col gap-2.5">
    {#each chunks as chunk, ci}
      {@const isActiveChunk = ci === activeChunk}
      <div
        class="flex items-start gap-3 rounded-2xl border-2 px-3 py-2.5 transition-colors duration-200 animate-[moment-rise_0.5s_cubic-bezier(0.34,1.56,0.64,1)_both]
          {isActiveChunk ? '' : 'border-border-warm bg-bg-surface'}"
        style="--c: var({CHUNK_COLORS[ci % CHUNK_COLORS.length]}); animation-delay: {ci * 80}ms;
          {isActiveChunk ? 'border-color: var(--c); background: color-mix(in srgb, var(--c) 12%, transparent);' : ''}"
      >
        {#if chunk.number !== null}
          <span
            class="shrink-0 w-7 h-7 mt-0.5 rounded-full flex items-center justify-center text-sm font-black text-white"
            style="background: var(--c)"
            aria-hidden="true"
          >{chunk.number}</span>
        {/if}
        <div class="min-w-0 flex-1">
          <div class="flex flex-wrap items-baseline gap-x-2 gap-y-1">
            {#each wordPairs.slice(chunk.start, chunk.end) as pair, wi}
              {@const isActive = chunk.start + wi === activeWordIndex}
              <span class="flex flex-col rounded-lg px-1 -mx-1 transition-colors duration-150 {isActive ? 'bg-primary-soft' : ''}">
                <span class="text-xl leading-tight break-words {isDeva ? 'font-deva' : 'font-black'} {isActive ? 'text-primary-dark dark:text-primary' : 'text-text-primary'}">{isDeva ? pair.dev : pair.roman}</span>
              </span>
            {/each}
          </div>
          <p class="text-sm mt-1.5 leading-snug transition-colors duration-200 {isActiveChunk ? 'font-bold text-text-primary' : 'text-text-muted'}">{chunk.translation}</p>
        </div>
      </div>
    {/each}
  </div>
</div>

<div class="lesson-footer">
  <button
    onclick={onComplete}
    class="btn w-full {hasListened || !speechSupported ? 'btn-primary' : 'btn-secondary'}"
  >
    Let's learn it
  </button>
</div>
