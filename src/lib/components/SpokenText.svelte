<script lang="ts" module>
  import { hindiTokens } from '../data/hindi';
  import type { HindiText } from '../data/gitaData';

  /** One line of text as words: what is shown, and what is spoken for each (Hindi is always spoken in Devanagari). */
  export interface SpokenLine {
    display: string[];
    spoken: string[];
  }

  /** A Hindi verse or phrase, one entry per line, shown in the tier's script. */
  export function hindiLines(h: HindiText, devanagari: boolean): SpokenLine[] {
    const roman = h.roman.split('\n');
    return h.dev.split('\n').map((dev, i) => {
      const tokens = hindiTokens({ dev, roman: roman[i] ?? dev });
      return { display: tokens.map((t) => (devanagari ? t.dev : t.roman)), spoken: tokens.map((t) => t.dev) };
    });
  }

  /** English text, one entry per line (or paragraph). */
  export function englishLines(text: string): SpokenLine[] {
    return text.split('\n').map((line) => {
      const words = line.split(/\s+/).filter(Boolean);
      return { display: words, spoken: words };
    });
  }
</script>

<script lang="ts">
  import { onDestroy, onMount } from 'svelte';
  import Icon from './Icon.svelte';
  import { hasTTS, speak, speakTokens, type SpeechLang, type TokenPlayback } from '../utils/speech';

  // Text that is read aloud with each word lit up as it is spoken. A "Hear" button plays the whole phrase.
  let { lines, lang, label = '', tappable = false, autoplay = false, textClass = 'text-lg font-black' } = $props<{
    lines: SpokenLine[];
    lang: SpeechLang;
    /** Visible text on the play button, e.g. "Hindi" */
    label?: string;
    /** Tapping a word speaks just that word */
    tappable?: boolean;
    /** Start playing as soon as the text appears (call it after a tap, so the browser allows sound) */
    autoplay?: boolean;
    /** Size, weight and font of the words */
    textClass?: string;
  }>();

  let supported = $state(false);
  let playing = $state(false);
  let active = $state(-1);
  let rate = $state<'normal' | 'slow'>('normal');
  let playback: TokenPlayback | null = null;
  // Starting a new playback cancels the old one, whose "ended" callback arrives afterwards. Each play gets a number,
  // so a late callback from an earlier play can't reset the state of the current one (this is what made a speed
  // change snap the player back to idle).
  let playId = 0;

  // Every word, in order, with the line it sits on
  const words = $derived(lines.flatMap((l: SpokenLine) => l.display.map((display, i) => ({ display, spoken: l.spoken[i] ?? display }))));
  const lineStart = $derived(
    lines.map((_: SpokenLine, i: number) => lines.slice(0, i).reduce((n: number, l: SpokenLine) => n + l.display.length, 0))
  );
  // Punctuation on its own ("/") isn't speakable; the words around it still are
  const speakable = $derived(
    words.map((w: { spoken: string }, index: number) => ({ index, text: w.spoken })).filter((w: { text: string }) => /[\p{L}\p{N}]/u.test(w.text))
  );

  onMount(() => {
    supported = hasTTS();
    const t = autoplay && supported ? setTimeout(play, 350) : undefined;
    return () => clearTimeout(t);
  });
  onDestroy(() => playback?.stop());

  function play() {
    const mine = ++playId;
    playing = true;
    active = -1;
    const list = speakable;
    playback = speakTokens(
      list.map((w: { text: string }) => w.text),
      lang,
      {
        rate: rate === 'slow' ? 0.4 : undefined,
        onWord: (k) => {
          if (mine === playId) active = list[k].index;
        },
        onEnd: () => {
          if (mine !== playId) return;
          playing = false;
          active = -1;
        }
      }
    );
  }

  function toggle() {
    if (playing) playback?.stop();
    else play();
  }

  function setRate(next: 'normal' | 'slow') {
    if (rate === next) return;
    rate = next;
    // Switching speed mid-playback restarts it at the new speed; otherwise it applies to the next play
    if (playing) play();
  }
</script>

<div class="flex flex-col gap-3">
  <div class="w-full min-w-0 flex flex-col gap-2 {textClass}">
    {#each lines as line, li}
      <div class="flex flex-wrap gap-x-2 gap-y-1.5">
        {#each line.display as token, ti}
          {@const lit = lineStart[li] + ti === active}
          {#if tappable}
            <button
              type="button"
              onclick={() => speak(line.spoken[ti] ?? token, lang)}
              aria-label="Hear {token}"
              class="rounded-lg px-1 -mx-0.5 transition-colors duration-150 hover:bg-primary-soft active:bg-primary-soft
                {lit ? 'bg-primary-soft text-primary-dark dark:text-primary' : ''}"
            >{token}</button>
          {:else}
            <span class="rounded-lg px-1 -mx-0.5 transition-colors duration-150 {lit ? 'bg-primary-soft text-primary-dark dark:text-primary' : ''}">{token}</span>
          {/if}
        {/each}
      </div>
    {/each}
  </div>

  {#if supported}
    <!-- Controls sit under the text, so the words get the card's full width -->
    <div class="flex items-center justify-between gap-3">
      <button
        type="button"
        onclick={toggle}
        aria-label={playing ? 'Stop' : `Hear it in ${lang === 'hi' ? 'Hindi' : 'English'}`}
        class="relative inline-flex items-center gap-1.5 rounded-full bg-info text-white font-black uppercase tracking-wide active:translate-y-0.5 transition-transform px-3.5 py-2 text-xs"
        style="box-shadow: 0 3px 0 var(--color-info-dark)"
      >
        {#if playing}<span class="absolute -inset-1 rounded-full animate-pulse-ring pointer-events-none"></span>{/if}
        {#if playing}
          <svg viewBox="0 0 24 24" fill="currentColor" class="w-5 h-5" aria-hidden="true"><path d="M6 6h4v12H6zm8 0h4v12h-4z" /></svg>
        {:else}
          <Icon name="speaker" class="w-5 h-5" />
        {/if}
        <span>{playing ? 'Stop' : label || 'Hear it'}</span>
      </button>

      <!-- Speed: always visible, so the chosen speed is never hidden and can be changed back at any time -->
      <div class="flex items-center rounded-full border-2 border-border-warm bg-bg-surface p-0.5" role="group" aria-label="Speed">
        {#each ['slow', 'normal'] as const as r}
          <button
            type="button"
            onclick={() => setRate(r)}
            aria-pressed={rate === r}
            class="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wide {rate === r ? 'bg-info text-white' : 'text-text-muted hover:text-text-primary'}"
          >{r}</button>
        {/each}
      </div>
    </div>
  {/if}
</div>
