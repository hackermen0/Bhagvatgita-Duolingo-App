<script lang="ts">
  import type { Lesson, VersePart, WordMeaning } from "../data/gitaData";
  import { getSanskritDisplay } from "../data/sanskritHelper";
  import { onMount } from "svelte";

  let { lesson, onComplete } = $props<{
    lesson: Lesson;
    onComplete: () => void;
  }>();

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

    const pairs: { devanagari: string; phonetic: string }[] = [];
    devLines.forEach((tokens: string[], lineIdx: number) => {
      const translitTokens = translitLines[lineIdx] ?? [];
      tokens.forEach((tok: string, i: number) => {
        const cleaned = tok.replace(/[।॥]/g, "").trim();
        if (!cleaned) return;
        const phoneticSource = curated.get(cleaned) ?? translitTokens[i] ?? cleaned;
        pairs.push({
          devanagari: cleaned,
          phonetic: getSanskritDisplay(phoneticSource).englishSyllables
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
    return () => {
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

<!-- Full-screen cinematic container -->
<div class="w-full h-full flex flex-col items-center justify-center bg-bg-base relative overflow-hidden select-none">
  <!-- Ambient glow layers -->
  <div class="absolute inset-0 pointer-events-none">
    <div
      class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 rounded-full bg-primary/8 blur-[80px] animate-pulse"
    ></div>
    <div
      class="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 rounded-full bg-success/10 blur-[60px]"
    ></div>
  </div>

  <!-- Om watermark -->
  <div class="absolute inset-0 flex items-center justify-center pointer-events-none opacity-[0.025]">
    <span class="text-[18rem] text-primary font-cinzel leading-none">ॐ</span>
  </div>

  <!-- Content -->
  <div class="relative z-10 flex flex-col items-center px-6 max-w-sm w-full gap-6 animate-[moment-rise_0.6s_cubic-bezier(0.34,1.56,0.64,1)_both]">
    <!-- Verse reference pill -->
    <div class="flex items-center gap-2">
      <div class="w-5 h-px bg-primary/40"></div>
      <span class="text-[10px] font-black uppercase tracking-[0.25em] text-primary/80">{lesson.verseRef}</span>
      <div class="w-5 h-px bg-primary/40"></div>
    </div>

    <!-- Word-by-word Devanagari with phonetic captions (Duolingo-style pronunciation guide) -->
    <div class="flex flex-wrap items-start justify-center gap-x-1.5 gap-y-3 text-center">
      {#each wordPairs as pair, i}
        {@const isActive = i === activeWordIndex}
        <div
          class="flex flex-col items-center px-1.5 py-1 rounded-xl transition-all duration-150
            {isActive ? 'bg-primary/15 scale-110' : ''}"
        >
          <span
            class="text-2xl font-bold font-cinzel leading-none text-shadow-gold transition-colors duration-150
              {isActive ? 'text-primary' : 'text-primary-dark dark:text-primary'}"
          >
            {pair.devanagari}
          </span>
          <span
            class="text-[10px] tracking-wide mt-1.5 whitespace-nowrap transition-colors duration-150
              {isActive ? 'text-primary font-bold' : 'text-text-muted'}"
          >
            {pair.phonetic}
          </span>
        </div>
      {/each}
    </div>

    <!-- Recitation controls -->
    {#if speechSupported}
      <div class="flex flex-col items-center gap-2.5">
        <button
          onclick={toggleRecitation}
          aria-label={isSpeaking ? "Stop recitation" : "Listen to recitation"}
          class="relative flex items-center gap-2 px-5 py-2.5 rounded-full border transition-all active:scale-95
            {isSpeaking
              ? 'bg-primary/20 border-primary text-primary'
              : 'bg-bg-surface border-border-warm text-text-muted hover:text-primary hover:border-primary/40'}"
        >
          {#if isSpeaking}
            <div class="absolute -inset-1 rounded-full border-2 border-primary/40 animate-pulse-ring pointer-events-none"></div>
          {/if}
          <svg viewBox="0 0 24 24" fill="currentColor" class="w-4 h-4 relative">
            {#if isSpeaking}
              <path d="M6 6h4v12H6zm8 0h4v12h-4z" />
            {:else}
              <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3a4.5 4.5 0 00-2.5-4.03v8.06A4.5 4.5 0 0016.5 12zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z" />
            {/if}
          </svg>
          <span class="text-xs font-bold relative">{isSpeaking ? "Stop" : "Listen to Recitation"}</span>
        </button>

        <!-- Speed toggle — only shown while actively speaking -->
        {#if isSpeaking}
          <div class="flex items-center rounded-full border border-border-warm bg-bg-surface p-0.5 animate-[fade-in_0.2s_ease-out]">
            <button
              onclick={(e) => setRate(e, "slow")}
              class="px-3.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide transition-all
                {rate === 'slow' ? 'bg-primary text-bg-base shadow-sm' : 'text-text-muted hover:text-text-primary'}"
            >
              Slow
            </button>
            <button
              onclick={(e) => setRate(e, "normal")}
              class="px-3.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide transition-all
                {rate === 'normal' ? 'bg-primary text-bg-base shadow-sm' : 'text-text-muted hover:text-text-primary'}"
            >
              Normal
            </button>
          </div>
        {/if}
      </div>
    {/if}

    <!-- Begin button -->
    <button
      onclick={onComplete}
      class="w-full flex items-center justify-center gap-2 py-4 px-8 bg-primary hover:bg-primary-dark text-bg-base font-black text-sm rounded-2xl shadow-xl btn-3d border-b-4 border-accent active:scale-[0.98] transition-all"
    >
      <span>Begin Learning</span>
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="w-5 h-5">
        <path
          fill-rule="evenodd"
          d="M3 10a.75.75 0 01.75-.75h10.638L10.23 5.29a.75.75 0 111.04-1.08l5.5 5.25a.75.75 0 010 1.08l-5.5 5.25a.75.75 0 11-1.04-1.08l4.158-3.96H3.75A.75.75 0 013 10z"
          clip-rule="evenodd"
        />
      </svg>
    </button>
  </div>
</div>

<style>
  .text-shadow-gold {
    text-shadow: 0 0 40px rgba(244, 151, 45, 0.3);
  }
</style>
