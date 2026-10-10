<script lang="ts">
  import { onMount, tick } from 'svelte';
  import { gameState, type SessionResult } from '../state/gameState.svelte';
  import { PRELUDE_ID, PRELUDE_PAGES, PRELUDE_TITLE, type StoryPara } from '../data/philosophy';
  import { hasTTS, speak, stopSpeaking, type SpeechLang } from '../utils/speech';
  import InlineText, { plainText } from './InlineText.svelte';
  import CompleteFlow from './CompleteFlow.svelte';
  import Icon from './Icon.svelte';

  // The story before the Gita, played like Instagram stories: one full-screen page at a time, tap the right of the
  // screen for the next page and the left to go back, or skip to the end. The voice-over is optional: when it is on,
  // each page is read aloud and the story moves on by itself when the page ends.
  let { onExit } = $props<{ onExit: () => void }>();

  const pages = PRELUDE_PAGES;
  let index = $state(0);
  const page = $derived(pages[index]);
  const last = $derived(index === pages.length - 1);

  // A dark backdrop per page, shifting as the story moves from the palace to the battlefield
  const BACKDROPS = [
    'linear-gradient(170deg, #1c1433 0%, #0d0a1c 100%)',
    'linear-gradient(170deg, #3a1d14 0%, #160b08 100%)',
    'linear-gradient(170deg, #2b1a3d 0%, #110a19 100%)',
    'linear-gradient(170deg, #3d1424 0%, #17080e 100%)',
    'linear-gradient(170deg, #14283d 0%, #08101a 100%)',
    'linear-gradient(170deg, #3d1a1a 0%, #170909 100%)',
    'linear-gradient(170deg, #1d2e24 0%, #0a120d 100%)',
    'linear-gradient(170deg, #2e2414 0%, #120e07 100%)',
    'linear-gradient(170deg, #4a2610 0%, #1a0d05 100%)'
  ];

  let scroller = $state<HTMLDivElement | null>(null);

  // ─── Voice-over ─────────────────────────────────────────────────────────────
  let voiceSupported = $state(false);
  let voiceOn = $state(false);
  /** The paragraph being read, as "section:paragraph", so it can be lit */
  let reading = $state<string | null>(null);
  // Each page's reading gets a token; a late onEnd from a cancelled line is ignored
  let token = 0;
  let pauseTimer: ReturnType<typeof setTimeout> | undefined;

  interface Chunk {
    text: string;
    lang: SpeechLang;
    key: string | null;
    /** A narrator's pause instead of speech, in ms */
    pause?: number;
  }

  const sentences = (text: string): string[] => text.match(/[^.!?]+[.!?]+["”']?\s*|[^.!?]+$/g)?.map((s) => s.trim()).filter(Boolean) ?? [text];

  /** The page as short lines to read, so no single utterance runs long (some voices stop after ~15 s) */
  function chunksOf(i: number): Chunk[] {
    const p = pages[i];
    const out: Chunk[] = [{ text: p.title, lang: 'en', key: null }];
    p.sections.forEach((section, si) => {
      if (section.heading) out.push({ text: section.heading, lang: 'en', key: null });
      section.paragraphs.forEach((para: StoryPara, pi) => {
        const key = `${si}:${pi}`;
        if (typeof para === 'string') sentences(plainText(para)).forEach((s) => out.push({ text: s, lang: 'en', key }));
        else if ('sanskrit' in para) out.push({ text: para.dev, lang: 'hi', key });
        else out.push({ text: '', lang: 'en', key: null, pause: 900 });
      });
    });
    return out;
  }

  function narrate(i: number) {
    stopNarration();
    const mine = ++token;
    const chunks = chunksOf(i);
    let c = 0;
    const step = () => {
      if (mine !== token) return;
      if (c >= chunks.length) {
        reading = null;
        // The page is done: move on by itself, except on the last page, which waits for the learner
        if (!last) pauseTimer = setTimeout(() => mine === token && goTo(index + 1), 900);
        return;
      }
      const chunk = chunks[c++];
      reading = chunk.key;
      if (chunk.pause) {
        pauseTimer = setTimeout(step, chunk.pause);
        return;
      }
      speak(chunk.text, chunk.lang, { onEnd: step });
    };
    step();
  }

  function stopNarration() {
    token++;
    clearTimeout(pauseTimer);
    stopSpeaking();
    reading = null;
  }

  function toggleVoice() {
    voiceOn = !voiceOn;
    if (voiceOn) narrate(index);
    else stopNarration();
  }

  // ─── Moving between pages ───────────────────────────────────────────────────
  async function goTo(i: number) {
    if (i < 0 || i >= pages.length) return;
    index = i;
    await tick();
    scroller?.scrollTo({ top: 0 });
    if (voiceOn) narrate(i);
    else stopNarration();
  }

  /** Tapping the page: the left third goes back, the rest goes forward, like a story */
  function tapPage(e: MouseEvent) {
    if ((e.target as HTMLElement | null)?.closest?.('button')) return;
    const box = (e.currentTarget as HTMLElement).getBoundingClientRect();
    if (e.clientX - box.left < box.width / 3) goTo(index - 1);
    else if (!last) goTo(index + 1);
  }

  function onKey(e: KeyboardEvent) {
    if (completed) return;
    if (e.key === 'ArrowRight') goTo(index + 1);
    else if (e.key === 'ArrowLeft') goTo(index - 1);
  }

  // ─── Finishing ──────────────────────────────────────────────────────────────
  let completed = $state(false);
  let sessionResult = $state<SessionResult | null>(null);
  const startedAt = Date.now();

  function finish() {
    stopNarration();
    sessionResult = gameState.completePhilosophyVerse(PRELUDE_ID);
    completed = true;
  }

  onMount(() => {
    voiceSupported = hasTTS();
    return stopNarration;
  });
</script>

<svelte:window onkeydown={onKey} />

{#if completed && sessionResult}
  <div class="w-full h-full flex flex-col bg-bg-base text-text-primary">
    <CompleteFlow
      {sessionResult}
      summary={{ accuracy: 100, seconds: Math.round((Date.now() - startedAt) / 1000) }}
      title="Story complete!"
      subtitle="You know the family behind the war. Next, BG 1.1: the blind king's question."
      {onExit}
    />
  </div>
{:else}
  <div class="absolute inset-0 z-30 flex flex-col text-white select-none transition-[background] duration-500" style="background: {BACKDROPS[index % BACKDROPS.length]}">
    <!-- ═══ Top: progress · close · voice · skip ═══ -->
    <div class="shrink-0 px-3 pt-[max(0.75rem,env(safe-area-inset-top))] pb-2">
      <div class="flex gap-1" aria-label="Page {index + 1} of {pages.length}">
        {#each pages as _, i}
          <button type="button" onclick={() => goTo(i)} aria-label="Page {i + 1}" class="flex-1 py-1.5">
            <span class="block h-[3px] rounded-full {i <= index ? 'bg-white' : 'bg-white/30'} {i === index ? 'opacity-100' : i < index ? 'opacity-80' : ''}"></span>
          </button>
        {/each}
      </div>
      <div class="flex items-center gap-2 mt-1">
        <button type="button" onclick={onExit} aria-label="Close" class="w-9 h-9 -ml-1 flex items-center justify-center text-white/80 hover:text-white">
          <Icon name="close" class="w-6 h-6" />
        </button>
        <span class="flex-1 text-xs font-black uppercase tracking-widest text-white/70 truncate">{PRELUDE_TITLE}</span>
        {#if voiceSupported}
          <button
            type="button"
            onclick={toggleVoice}
            aria-pressed={voiceOn}
            class="flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-black uppercase tracking-wide border-2 {voiceOn ? 'bg-white text-[#1c1433] border-white' : 'border-white/40 text-white'}"
          >
            <Icon name="speaker" class="w-4 h-4" /> {voiceOn ? 'Voice on' : 'Listen'}
          </button>
        {/if}
        {#if !last}
          <button type="button" onclick={() => goTo(pages.length - 1)} class="text-xs font-black uppercase tracking-wide text-white/70 hover:text-white px-1">Skip</button>
        {/if}
      </div>
    </div>

    <!-- ═══ The page (tap left / right to move) ═══ -->
    <!-- svelte-ignore a11y_click_events_have_key_events, a11y_no_static_element_interactions -->
    <div bind:this={scroller} onclick={tapPage} class="flex-1 overflow-y-auto scrollbar-none px-6 pt-4 pb-8 cursor-pointer">
      {#key index}
        <div class="animate-[fade-in_0.35s_ease-out]">
          <p class="text-xs font-black uppercase tracking-[0.2em] text-[#e8b931]">{page.kicker}</p>
          <h1 class="text-[28px] font-black leading-tight mt-1">{page.title}</h1>

          {#each page.sections as section, si}
            <section class="mt-6 {section.tone === 'mirror' ? 'rounded-2xl bg-white/[0.07] border-l-4 border-[#e8b931] px-4 py-4' : ''}">
              {#if section.heading}
                <h2 class="text-xs font-black uppercase tracking-[0.18em] mb-3 {section.tone === 'mirror' ? 'text-[#e8b931]' : 'text-white/60'}">{section.heading}</h2>
              {/if}
              <div class="flex flex-col gap-3.5">
                {#each section.paragraphs as para, pi}
                  {@const lit = reading === `${si}:${pi}`}
                  {#if typeof para === 'string'}
                    <p class="text-[17px] leading-relaxed font-semibold transition-colors duration-300 {lit ? 'text-[#f6cf4f]' : 'text-white/90'}"><InlineText text={para} /></p>
                  {:else if 'sanskrit' in para}
                    <div class="rounded-xl bg-black/25 px-4 py-3 flex items-start gap-3">
                      <p class="flex-1 text-[17px] italic font-bold leading-relaxed whitespace-pre-line {lit ? 'text-[#f6cf4f]' : 'text-white'}">{para.sanskrit}</p>
                      {#if voiceSupported}
                        <button type="button" onclick={() => speak(para.dev, 'hi')} aria-label="Hear the Sanskrit" class="shrink-0 w-9 h-9 rounded-full bg-white/15 flex items-center justify-center">
                          <Icon name="speaker" class="w-5 h-5" />
                        </button>
                      {/if}
                    </div>
                  {:else}
                    <p class="text-center text-white/40 tracking-[0.6em]" aria-hidden="true">· · ·</p>
                  {/if}
                {/each}
              </div>
            </section>
          {/each}

          {#if !last}
            <p class="mt-8 text-center text-xs font-bold text-white/40">Tap to continue</p>
          {/if}
        </div>
      {/key}
    </div>

    <!-- ═══ Bottom ═══ -->
    <div class="shrink-0 flex gap-3 px-5 pt-2 pb-[max(1.25rem,env(safe-area-inset-bottom))] bg-linear-to-t from-black/40 to-transparent">
      {#if index > 0}
        <button type="button" onclick={() => goTo(index - 1)} class="flex-1 rounded-full py-3.5 font-black uppercase tracking-wide border-2 border-white/40">Back</button>
      {/if}
      {#if last}
        <button type="button" onclick={finish} class="flex-[2] rounded-full py-3.5 font-black uppercase tracking-wide text-[#1c1003] bg-[#e8b931]" style="box-shadow: 0 4px 0 #a17a12">Begin the Gita</button>
      {:else}
        <button type="button" onclick={() => goTo(index + 1)} class="flex-[2] rounded-full py-3.5 font-black uppercase tracking-wide text-[#1c1433] bg-white">Next</button>
      {/if}
    </div>
  </div>
{/if}
