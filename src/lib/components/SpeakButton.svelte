<script lang="ts">
  import { onMount } from 'svelte';
  import Icon from './Icon.svelte';
  import { speak, hasTTS, type SpeechLang } from '../utils/speech';

  // A tap-to-hear button. Hindi is read from its Devanagari, English from the English text.
  let { text, lang, label = '', size = 'md', rate } = $props<{
    text: string;
    lang: SpeechLang;
    /** Visible text beside the icon, e.g. "Hindi" or "English" */
    label?: string;
    size?: 'sm' | 'md';
    rate?: number;
  }>();

  let supported = $state(false);
  let playing = $state(false);

  onMount(() => {
    supported = hasTTS();
  });

  function play(e: MouseEvent) {
    e.stopPropagation();
    playing = true;
    speak(text, lang, { rate, onEnd: () => (playing = false) });
  }
</script>

{#if supported}
  <button
    type="button"
    onclick={play}
    aria-label="Hear it in {lang === 'hi' ? 'Hindi' : 'English'}"
    class="shrink-0 inline-flex items-center gap-1.5 rounded-full bg-info text-white font-black uppercase tracking-wide active:translate-y-0.5 transition-transform
      {size === 'sm' ? 'px-2.5 py-1.5 text-[11px]' : 'px-3.5 py-2 text-xs'}
      {playing ? 'animate-pulse' : ''}"
    style="box-shadow: 0 3px 0 var(--color-info-dark)"
  >
    <Icon name="speaker" class={size === 'sm' ? 'w-4 h-4' : 'w-5 h-5'} />
    {#if label}<span>{label}</span>{/if}
  </button>
{/if}
