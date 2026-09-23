<script lang="ts">
  import { onMount } from 'svelte';
  import { playSuccessSound, playErrorSound } from '../utils/soundEffects';
  import Icon from './Icon.svelte';

  let { isCorrect, correctAnswerText, explanation, encouragement, onContinue } = $props<{
    isCorrect: boolean;
    correctAnswerText?: string;
    explanation?: string;
    encouragement?: string;
    onContinue: () => void;
  }>();

  const CORRECT_HEADERS = ['Nice!', 'Great job!', 'Excellent!', 'Amazing!', 'Correct!', 'Well done!'];
  const pick = Math.floor(Math.random() * CORRECT_HEADERS.length);
  const header = $derived(isCorrect ? CORRECT_HEADERS[pick] : 'Not quite');

  onMount(() => {
    if (isCorrect) playSuccessSound();
    else playErrorSound();
  });
</script>

<!-- Duolingo-style result sheet: slides over the CHECK footer -->
<div
  class="absolute inset-x-0 bottom-0 z-30 px-5 pt-5 pb-5 animate-sheet-up select-none
    {isCorrect ? 'bg-success-soft' : 'bg-error-soft'}"
  role="status"
>
  <div class="flex items-center gap-3">
    <span class="w-10 h-10 rounded-full bg-bg-surface flex items-center justify-center {isCorrect ? 'text-success' : 'text-error'}">
      <Icon name={isCorrect ? 'check' : 'close'} class="w-6 h-6" />
    </span>
    <h2 class="text-2xl font-black {isCorrect ? 'text-success-dark dark:text-success' : 'text-error-dark dark:text-error'}">
      {header}
    </h2>
  </div>

  <div class="mt-2 flex flex-col gap-1 {isCorrect ? 'text-success-dark dark:text-success' : 'text-error-dark dark:text-error'}">
    {#if !isCorrect && correctAnswerText}
      <p class="text-lg font-black">Correct answer:</p>
      <p class="text-base font-bold leading-snug">{correctAnswerText}</p>
    {/if}
    {#if encouragement}
      <p class="text-base font-extrabold">{encouragement}</p>
    {/if}
    {#if explanation}
      <p class="text-sm font-bold opacity-80 leading-snug max-h-24 overflow-y-auto scrollbar-none">{explanation}</p>
    {/if}
  </div>

  <button onclick={onContinue} class="btn w-full mt-4 {isCorrect ? 'btn-success' : 'btn-danger'}" type="button">
    {isCorrect ? 'Continue' : 'Got it'}
  </button>
</div>
