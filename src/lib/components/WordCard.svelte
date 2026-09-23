<script lang="ts">
  import { onMount } from "svelte";
  import type { WordMeaning } from "../data/gitaData";
  import { getSanskritDisplay } from "../data/sanskritHelper";
  import { gameState } from "../state/gameState.svelte";
  import Icon from "./Icon.svelte";

  let { word, flipped = $bindable(false) } = $props<{
    word: WordMeaning;
    flipped?: boolean;
  }>();

  let entered = $state(false);
  let isSpeaking = $state(false);
  let rate = $state<"normal" | "slow">("normal");
  let speechSupported = $state(false);

  onMount(() => {
    requestAnimationFrame(() => (entered = true));
    speechSupported = typeof window !== "undefined" && "speechSynthesis" in window;
    return () => {
      currentUtterance = null;
      if (speechSupported) window.speechSynthesis.cancel();
    };
  });

  // Cancelling an utterance to start a replacement fires the OLD utterance's
  // onend/onerror asynchronously, after the new one has already started — this
  // reference lets those stale callbacks recognize they're outdated and no-op.
  let currentUtterance: SpeechSynthesisUtterance | null = null;

  function startSpeaking() {
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(word.devanagari);
    utterance.lang = "hi-IN";
    utterance.rate = rate === "slow" ? 0.4 : 0.75;
    utterance.onend = utterance.onerror = () => {
      if (currentUtterance === utterance) isSpeaking = false;
    };
    currentUtterance = utterance;
    isSpeaking = true;
    window.speechSynthesis.speak(utterance);
  }

  function toggleSpeakWord(e: MouseEvent) {
    e.stopPropagation();
    if (!speechSupported) return;
    if (isSpeaking) {
      currentUtterance = null;
      window.speechSynthesis.cancel();
      isSpeaking = false;
      return;
    }
    startSpeaking();
  }

  function setRate(e: MouseEvent, newRate: "normal" | "slow") {
    e.stopPropagation();
    if (rate === newRate) return;
    rate = newRate;
    if (isSpeaking) startSpeaking();
  }
</script>

<div
  class="card-scene w-full max-w-xs mx-auto select-none cursor-pointer"
  style="height: 260px;"
  onclick={() => (flipped = true)}
  role="button"
  tabindex="0"
  onkeydown={(e) => e.key === " " && (flipped = true)}
  aria-label="Vocabulary card. Tap to reveal meaning."
>
  <div class="card-inner w-full h-full {flipped ? 'card-flipped' : ''} {entered ? 'card-entered' : 'card-pending'}">
    <!-- FRONT -->
    <div class="card-face card border-b-[6px]! flex flex-col items-center justify-center gap-4 p-6">
      {#if gameState.scriptDisplay === 'roman'}
        <p class="text-4xl font-black text-primary leading-none">{word.word}</p>
        <p class="text-xl text-text-muted font-deva">{word.devanagari}</p>
      {:else}
        <p class="text-5xl font-bold text-primary font-deva leading-tight">{word.devanagari}</p>
        <p class="text-lg text-text-muted font-bold italic">{word.word}</p>
      {/if}

      {#if speechSupported}
        <div class="flex flex-col items-center gap-2">
          <button
            onclick={toggleSpeakWord}
            aria-label={isSpeaking ? "Stop" : "Listen to pronunciation"}
            class="relative w-12 h-12 rounded-2xl bg-info text-white flex items-center justify-center active:translate-y-0.5"
            style="box-shadow: 0 4px 0 var(--color-info-dark)"
          >
            {#if isSpeaking}
              <span class="absolute -inset-1.5 rounded-[1.2rem] border-4 border-info/30 animate-pulse-ring pointer-events-none"></span>
            {/if}
            <Icon name="speaker" class="w-6 h-6" />
          </button>

          <!-- Speed toggle — only shown while actively speaking -->
          {#if isSpeaking}
            <div class="flex items-center rounded-full border-2 border-border-warm bg-bg-surface p-0.5 animate-[fade-in_0.2s_ease-out]">
              {#each ["slow", "normal"] as const as r}
                <button
                  onclick={(e) => setRate(e, r)}
                  class="px-3 py-0.5 rounded-full text-[11px] font-black uppercase tracking-wide
                    {rate === r ? 'bg-info text-white' : 'text-text-muted hover:text-text-primary'}"
                >
                  {r}
                </button>
              {/each}
            </div>
          {/if}
        </div>
      {/if}
    </div>

    <!-- BACK -->
    <div class="card-face card-back card border-b-[6px]! border-primary-edge! bg-primary-soft! flex flex-col items-center justify-center gap-3 p-6">
      <p class="text-xs font-black uppercase tracking-wider text-primary-dark dark:text-primary">Meaning</p>
      <p class="text-3xl font-black text-center leading-tight">{word.meaning}</p>
      <span class="text-xs font-black uppercase tracking-wide px-3 py-1 rounded-full bg-bg-surface border-2 border-border-warm text-text-muted">
        {word.partOfSpeech}
      </span>
      <p class="text-lg text-primary-dark dark:text-primary font-deva">{word.devanagari}</p>
      <p class="text-sm font-bold text-text-muted">{getSanskritDisplay(word.word).englishSyllables}</p>
    </div>
  </div>
</div>

<style>
  .card-scene { perspective: 1000px; }
  .card-inner {
    position: relative;
    transform-style: preserve-3d;
    transition: transform 0.55s cubic-bezier(0.4, 0.2, 0.2, 1);
  }
  .card-pending { transform: scale(0.88); opacity: 0; }
  .card-entered {
    transform: scale(1);
    opacity: 1;
    transition: transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1), opacity 0.3s ease;
  }
  .card-flipped.card-entered {
    transform: scale(1) rotateY(180deg);
    transition: transform 0.55s cubic-bezier(0.4, 0.2, 0.2, 1);
  }
  .card-face {
    position: absolute;
    inset: 0;
    backface-visibility: hidden;
    -webkit-backface-visibility: hidden;
  }
  .card-back { transform: rotateY(180deg); }
</style>
