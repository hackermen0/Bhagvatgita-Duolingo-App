<script lang="ts">
  import { onMount } from "svelte";
  import type { WordMeaning } from "../data/gitaData";
  import { getSanskritDisplay, toPhonetic } from "../data/sanskritHelper";
  import { gameState } from "../state/gameState.svelte";
  import Icon from "./Icon.svelte";

  let { word, flipped = false, onFlip, delay = 0 } = $props<{
    word: WordMeaning;
    flipped?: boolean;
    onFlip: () => void;
    /** Stagger for the entrance animation when several cards appear together */
    delay?: number;
  }>();

  let entered = $state(false);
  let isSpeaking = $state(false);
  let rate = $state<"normal" | "slow">("normal");
  let speechSupported = $state(false);

  onMount(() => {
    const t = setTimeout(() => (entered = true), 30 + delay);
    speechSupported = typeof window !== "undefined" && "speechSynthesis" in window;
    return () => {
      clearTimeout(t);
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

  // Grid cards are narrow, so long compounds step down a size rather than wrap mid-word
  const devSize = $derived(
    word.devanagari.length > 13 ? "text-lg" : word.devanagari.length > 9 ? "text-2xl" : "text-3xl"
  );
  const romanSize = $derived(toPhonetic(word.word).length > 13 ? "text-xl" : "text-2xl");
  const meaningSize = $derived(word.meaning.length > 18 ? "text-base" : "text-xl");
</script>

<div
  class="card-scene w-full select-none cursor-pointer"
  style="height: 200px;"
  onclick={onFlip}
  role="button"
  tabindex="0"
  onkeydown={(e) => e.key === " " && (e.preventDefault(), onFlip())}
  aria-label="Vocabulary card for {toPhonetic(word.word)}. Tap to flip."
  aria-pressed={flipped}
>
  <div class="card-inner w-full h-full {flipped ? 'card-flipped' : ''} {entered ? 'card-entered' : 'card-pending'}">
    <!-- FRONT -->
    <div class="card-face card border-b-[5px]! flex flex-col items-center justify-center gap-2 p-3">
      {#if gameState.scriptDisplay === 'roman'}
        <p class="{romanSize} font-black text-primary leading-tight text-center">{toPhonetic(word.word)}</p>
        <p class="text-base text-text-muted font-deva text-center">{word.devanagari}</p>
      {:else}
        <p class="{devSize} font-bold text-primary font-deva leading-tight text-center">{word.devanagari}</p>
        <p class="text-sm text-text-muted font-bold italic text-center">{toPhonetic(word.word)}</p>
      {/if}

      {#if speechSupported}
        <div class="flex flex-col items-center gap-1.5 mt-1">
          <button
            onclick={toggleSpeakWord}
            aria-label={isSpeaking ? "Stop" : "Listen to pronunciation"}
            class="relative w-10 h-10 rounded-xl bg-info text-white flex items-center justify-center active:translate-y-0.5"
            style="box-shadow: 0 3px 0 var(--color-info-dark)"
          >
            {#if isSpeaking}
              <span class="absolute -inset-1 rounded-[1rem] border-4 border-info/30 animate-pulse-ring pointer-events-none"></span>
            {/if}
            <Icon name="speaker" class="w-5 h-5" />
          </button>

          <!-- Speed toggle — only shown while actively speaking -->
          {#if isSpeaking}
            <div class="flex items-center rounded-full border-2 border-border-warm bg-bg-surface p-0.5 animate-[fade-in_0.2s_ease-out]">
              {#each ["slow", "normal"] as const as r}
                <button
                  onclick={(e) => setRate(e, r)}
                  class="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wide
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
    <div class="card-face card-back card border-b-[5px]! border-primary-edge! bg-primary-soft! flex flex-col items-center justify-center gap-1.5 p-3">
      <p class="text-[10px] font-black uppercase tracking-wider text-primary-dark dark:text-primary">Meaning</p>
      <p class="{meaningSize} font-black text-center leading-tight">{word.meaning}</p>
      <span class="text-[10px] font-black uppercase tracking-wide px-2.5 py-0.5 rounded-full bg-bg-surface border-2 border-border-warm text-text-muted text-center">
        {word.partOfSpeech}
      </span>
      <p class="text-base text-primary-dark dark:text-primary font-deva">{word.devanagari}</p>
      <p class="text-[11px] font-bold text-text-muted text-center leading-tight">{getSanskritDisplay(word.word).englishSyllables}</p>
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
