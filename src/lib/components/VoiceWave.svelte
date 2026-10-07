<script lang="ts">
  // A row of bars that moves while the learner's voice is being picked up, so they can see they are being heard.
  //  idle      – tiny still dots (the mic is off)
  //  listening – the mic is open and waiting: the bars breathe gently
  //  speaking  – voice detected: the bars dance, in green
  let { state = 'idle' } = $props<{ state?: 'idle' | 'listening' | 'speaking' }>();

  const BARS = 25;
  // Taller in the middle, with a little fixed irregularity so it reads as a voice rather than a ruler
  const bars = Array.from({ length: BARS }, (_, i) => {
    const centre = 1 - Math.abs(i - (BARS - 1) / 2) / ((BARS - 1) / 2);
    const jitter = ((i * 37) % 11) / 11;
    return {
      peak: Math.min(1, (0.3 + 0.7 * Math.sin((centre * Math.PI) / 2)) * (0.72 + 0.28 * jitter)),
      duration: 0.42 + ((i * 53) % 7) / 16,
      delay: -jitter * 0.9
    };
  });

  const label = $derived(
    state === 'speaking' ? 'Your voice is being heard' : state === 'listening' ? 'Listening' : 'Microphone off'
  );
</script>

<div class="flex items-center justify-center gap-[3px] h-16 w-full" role="img" aria-label={label}>
  {#each bars as bar}
    <span class="bar" data-state={state} style="--peak: {bar.peak}; --dur: {bar.duration}s; --delay: {bar.delay}s"></span>
  {/each}
</div>

<style>
  .bar {
    width: 4px;
    height: 100%;
    border-radius: 9999px;
    background: var(--color-info);
    transform-origin: center;
    transform: scaleY(0.07);
    opacity: 0.35;
    transition: background-color 0.25s ease, opacity 0.25s ease;
  }
  .bar[data-state='listening'] {
    opacity: 0.6;
    animation: breathe 1.8s ease-in-out infinite;
    animation-delay: var(--delay);
  }
  .bar[data-state='speaking'] {
    opacity: 1;
    background: var(--color-success);
    animation: speak var(--dur) ease-in-out infinite alternate;
    animation-delay: var(--delay);
  }
  @keyframes breathe {
    0%,
    100% {
      transform: scaleY(0.07);
    }
    50% {
      transform: scaleY(0.2);
    }
  }
  @keyframes speak {
    from {
      transform: scaleY(0.14);
    }
    to {
      transform: scaleY(var(--peak));
    }
  }
  /* No motion for readers who ask for none: the state still shows in height and colour */
  @media (prefers-reduced-motion: reduce) {
    .bar[data-state] {
      animation: none;
    }
    .bar[data-state='listening'] {
      transform: scaleY(0.16);
    }
    .bar[data-state='speaking'] {
      transform: scaleY(var(--peak));
    }
  }
</style>
