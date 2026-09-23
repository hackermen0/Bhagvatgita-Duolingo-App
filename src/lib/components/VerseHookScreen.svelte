<script lang="ts">
  import type { Lesson, VersePart, WordMeaning } from "../data/gitaData";
  import { getSanskritDisplay } from "../data/sanskritHelper";
  import { gameState } from "../state/gameState.svelte";
  import { onMount } from "svelte";

  let { lesson, onComplete, autoPlay = false } = $props<{
    lesson: Lesson;
    onComplete: () => void;
    autoPlay?: boolean;
  }>();

  const scriptDisplay = $derived(gameState.scriptDisplay);

  // Word-by-word phonetic pairing. Neither `lesson.wordBreakdown` (a short "key vocab"
  // highlight list on most lessons) nor any single part's wordBreakdown is guaranteed to
  // cover every token of the verse — so the actual verse text (line by line) is always the
  // source of truth for which words are shown, matching what the lesson preview displays.
  // Each token's phonetic caption is looked up from curated word data where an exact
  // Devanagari match exists (most accurate), then the same-position transliteration token
  // in that line (handles sandhi-fused compounds reasonably), then the raw token itself.
  let wordPairs = $derived.by(() => {
    const devLines = lesson.verseSanskrit.split("\n").map((l: string) => l.trim().split(/\s+/).filter(Boolean));
    const translitLines = lesson.verseTransliteration.split("\n").map((l: string) => l.trim().split(/\s+/).filter(Boolean));

    const curated = new Map<string, string>();
    const addEntries = (entries?: WordMeaning[]) => {
      entries?.forEach((w) => {
        if (!curated.has(w.devanagari)) curated.set(w.devanagari, w.word);
      });
    };
    addEntries(lesson.wordBreakdown);
    lesson.parts?.forEach((p: VersePart) => addEntries(p.wordBreakdown));

    const pairs: { devanagari: string; phonetic: string; roman: string }[] = [];
    devLines.forEach((tokens: string[], lineIdx: number) => {
      const translitTokens = translitLines[lineIdx] ?? [];
      tokens.forEach((tok: string, i: number) => {
        const cleaned = tok.replace(/[।॥]/g, "").trim();
        if (!cleaned) return;
        const phoneticSource = curated.get(cleaned) ?? translitTokens[i] ?? cleaned;
        pairs.push({
          devanagari: cleaned,
          phonetic: getSanskritDisplay(phoneticSource).englishSyllables,
          roman: phoneticSource
        });
      });
    });

    return pairs;
  });

  let isSpeaking = $state(false);
  let rate = $state<"normal" | "slow">("normal");
  let speechSupported = $state(false);
  let activeWordIndex = $state(-1);

  // Spoken text is built by joining the SAME word tokens shown on screen (space-separated),
  // so a boundary event's charIndex maps back to a display word unambiguously — the original
  // sandhi-joined verse text can't be aligned this way since word counts don't match.
  let spokenWords = $derived(wordPairs.map((w: { devanagari: string }) => w.devanagari));
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

  // Cancelling an utterance to start a replacement fires the OLD utterance's
  // onend/onerror asynchronously, after the new one has already started — this
  // reference lets those stale callbacks recognize they're outdated and no-op.
  let currentUtterance: SpeechSynthesisUtterance | null = null;

  onMount(() => {
    speechSupported = typeof window !== "undefined" && "speechSynthesis" in window;
    const t = autoPlay && speechSupported ? setTimeout(startSpeaking, 700) : undefined;
    return () => {
      clearTimeout(t);
      currentUtterance = null;
      if (speechSupported) window.speechSynthesis.cancel();
    };
  });

  function startSpeaking() {
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(spokenWords.join(" "));
    utterance.lang = "hi-IN";
    utterance.rate = rate === "slow" ? 0.4 : 0.75;
    utterance.onboundary = (event) => {
      if (currentUtterance !== utterance) return;
      if (event.name === "word" || event.name === undefined) {
        activeWordIndex = findWordIndexForCharIndex(event.charIndex);
      }
    };
    utterance.onend = () => {
      if (currentUtterance !== utterance) return;
      isSpeaking = false;
      activeWordIndex = -1;
    };
    utterance.onerror = () => {
      if (currentUtterance !== utterance) return;
      isSpeaking = false;
      activeWordIndex = -1;
    };

    currentUtterance = utterance;
    isSpeaking = true;
    window.speechSynthesis.speak(utterance);
  }

  function toggleRecitation(e: MouseEvent) {
    e.stopPropagation();
    if (!speechSupported) return;

    if (isSpeaking) {
      currentUtterance = null;
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

<div class="flex-1 overflow-y-auto scrollbar-none px-5 pt-4 pb-6 flex flex-col gap-6 select-none">
  <div>
    <p class="text-sm font-extrabold uppercase tracking-wider text-accent">New verse · {lesson.verseRef}</p>
    <h2 class="text-2xl font-black leading-tight mt-1">Listen to the verse</h2>
  </div>

  <!-- Word-by-word verse; the word being recited is highlighted -->
  <div class="card px-3 py-5 flex flex-wrap items-start justify-center gap-x-1 gap-y-3 text-center animate-[moment-rise_0.5s_cubic-bezier(0.34,1.56,0.64,1)_both]">
    {#each wordPairs as pair, i}
      {@const isActive = i === activeWordIndex}
      <div class="flex flex-col items-center px-1.5 py-1 rounded-xl transition-all duration-150 {isActive ? 'bg-primary-soft scale-110' : ''}">
        {#if scriptDisplay === 'roman'}
          <span class="text-xl font-black leading-tight {isActive ? 'text-primary' : 'text-text-primary'}">{pair.roman}</span>
          <span class="text-sm font-deva mt-0.5 leading-none {isActive ? 'text-primary' : 'text-text-muted'}">{pair.devanagari}</span>
        {:else}
          <span class="text-2xl font-deva leading-tight {isActive ? 'text-primary' : 'text-text-primary'}">{pair.devanagari}</span>
          {#if scriptDisplay === 'both'}
            <span class="text-[11px] font-bold tracking-wide mt-1 whitespace-nowrap {isActive ? 'text-primary' : 'text-text-muted'}">{pair.phonetic}</span>
          {/if}
        {/if}
      </div>
    {/each}
  </div>

  {#if speechSupported}
    <div class="flex flex-col items-center gap-3">
      <button
        onclick={toggleRecitation}
        aria-label={isSpeaking ? 'Stop recitation' : 'Listen to recitation'}
        class="relative flex items-center gap-3 pl-4 pr-6 h-16 rounded-2xl bg-info text-white active:translate-y-1 transition-transform"
        style="box-shadow: 0 5px 0 var(--color-info-dark)"
      >
        {#if isSpeaking}
          <span class="absolute -inset-1.5 rounded-[1.4rem] border-4 border-info/30 animate-pulse-ring pointer-events-none"></span>
        {/if}
        <svg viewBox="0 0 24 24" fill="currentColor" class="w-8 h-8">
          {#if isSpeaking}
            <path d="M6 6h4v12H6zm8 0h4v12h-4z" />
          {:else}
            <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3a4.5 4.5 0 00-2.5-4.03v8.06A4.5 4.5 0 0016.5 12zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z" />
          {/if}
        </svg>
        <span class="text-base font-black uppercase tracking-wide">{isSpeaking ? 'Stop' : 'Listen'}</span>
      </button>

      <!-- Speed toggle — only shown while actively speaking -->
      {#if isSpeaking}
        <div class="flex items-center rounded-full border-2 border-border-warm bg-bg-surface p-0.5 animate-[fade-in_0.2s_ease-out]">
          <button
            onclick={(e) => setRate(e, 'slow')}
            class="px-4 py-1 rounded-full text-xs font-black uppercase tracking-wide {rate === 'slow' ? 'bg-info text-white' : 'text-text-muted hover:text-text-primary'}"
          >
            Slow
          </button>
          <button
            onclick={(e) => setRate(e, 'normal')}
            class="px-4 py-1 rounded-full text-xs font-black uppercase tracking-wide {rate === 'normal' ? 'bg-info text-white' : 'text-text-muted hover:text-text-primary'}"
          >
            Normal
          </button>
        </div>
      {/if}
    </div>
  {/if}
</div>

<div class="lesson-footer">
  <button onclick={onComplete} class="btn btn-primary w-full">Continue</button>
</div>
