<script lang="ts">
  import {
    ONBOARDING_QUESTIONS,
    PLANS,
    CUSTOM_MINUTES_OPTIONS,
    planById,
    recommendPlan,
    labelFor,
    type OnboardingProfile
  } from '../data/onboarding';
  import { playPopSound } from '../utils/soundEffects';
  import Mascot from './Mascot.svelte';
  import Icon from './Icon.svelte';

  let { onComplete } = $props<{
    onComplete: (profile: OnboardingProfile) => void;
  }>();

  type Stage = 'welcome' | 'question' | 'recommend' | 'choosePlan' | 'customTime';

  let stage = $state<Stage>('welcome');
  let qIndex = $state(0);
  let answers = $state<Partial<OnboardingProfile>>({});
  // Where "Custom" was chosen from, so the back button on the minutes screen returns correctly
  let customFrom = $state<'recommend' | 'choosePlan'>('recommend');
  let pendingPlan = $state<OnboardingProfile['plan'] | null>(null);

  const question = $derived(ONBOARDING_QUESTIONS[qIndex]);
  const currentAnswer = $derived((answers as Record<string, string>)[question.key]);

  // Welcome counts as step 0, then each question, then the plan screen
  const progress = $derived(
    stage === 'welcome' ? 0 : stage === 'question' ? (qIndex + 1) / (ONBOARDING_QUESTIONS.length + 1) : 1
  );

  function selectAnswer(value: string) {
    playPopSound();
    (answers as Record<string, string>)[question.key] = value;
  }

  function continueQuestion() {
    if (!currentAnswer) return;
    if (qIndex < ONBOARDING_QUESTIONS.length - 1) {
      qIndex += 1;
    } else {
      answers.plan = recommendPlan(answers.timeBudget!);
      stage = 'recommend';
    }
  }

  function confirmRecommendedPlan() {
    if (answers.plan === 'custom') {
      customFrom = 'recommend';
      stage = 'customTime';
    } else {
      finish();
    }
  }

  function confirmChosenPlan() {
    if (!pendingPlan) return;
    answers.plan = pendingPlan;
    if (pendingPlan === 'custom') {
      customFrom = 'choosePlan';
      stage = 'customTime';
    } else {
      finish();
    }
  }

  function finish() {
    onComplete(answers as OnboardingProfile);
  }

  function back() {
    if (stage === 'question') {
      if (qIndex === 0) stage = 'welcome';
      else qIndex -= 1;
    } else if (stage === 'recommend') {
      stage = 'question';
      qIndex = ONBOARDING_QUESTIONS.length - 1;
    } else if (stage === 'choosePlan') {
      stage = 'recommend';
    } else if (stage === 'customTime') {
      stage = customFrom;
    }
  }

  function onKey(e: KeyboardEvent) {
    if (e.key !== 'Enter' || (e.target as HTMLElement | null)?.closest?.('button')) return;
    if (stage === 'welcome') stage = 'question';
    else if (stage === 'question') continueQuestion();
    else if (stage === 'recommend') confirmRecommendedPlan();
    else if (stage === 'choosePlan') confirmChosenPlan();
    else if (stage === 'customTime' && answers.customMinutes) finish();
  }
</script>

<svelte:window onkeydown={onKey} />

{#snippet askBubble(text: string, helper?: string)}
  <div class="flex items-center gap-2">
    <div class="shrink-0 -ml-1"><Mascot mood="guide" size="lg" /></div>
    <div class="bubble bubble-left flex-1">
      <p class="text-lg font-black leading-snug">{text}</p>
      {#if helper}<p class="text-sm font-bold text-text-muted mt-1">{helper}</p>{/if}
    </div>
  </div>
{/snippet}

<div class="w-full h-full flex flex-col bg-bg-base text-text-primary select-none">
  {#if stage !== 'welcome'}
    <div class="shrink-0 flex items-center gap-3 px-4 pt-4 pb-2">
      <button type="button" onclick={back} aria-label="Back" class="shrink-0 text-node-locked-edge hover:text-text-muted">
        <Icon name="back" class="w-7 h-7" />
      </button>
      <div class="progress-track flex-1">
        <div class="progress-fill" style="width: {progress * 100}%"></div>
      </div>
    </div>
  {/if}

  <div class="flex-1 overflow-y-auto scrollbar-none px-5 py-4">
    {#if stage === 'welcome'}
      <div class="h-full flex flex-col items-center justify-center text-center gap-6">
        <div class="bubble px-5 py-4 max-w-xs animate-pop-in">
          <p class="text-xl font-black">Namaste! Let's begin your Gītā journey.</p>
          <span class="absolute left-1/2 -bottom-[9px] -translate-x-1/2 w-4 h-4 rotate-45 bg-bg-surface border-r-2 border-b-2 border-border-warm"></span>
        </div>
        <Mascot mood="happy" size="xl" animate={true} />
        <p class="text-base font-bold text-text-muted max-w-xs">
          Answer {ONBOARDING_QUESTIONS.length} quick questions and we'll shape your daily practice around you.
        </p>
      </div>

    {:else if stage === 'question'}
      {@render askBubble(question.question, question.helper)}
      <div class="flex flex-col gap-3 mt-7">
        {#each question.options as option}
          <button
            type="button"
            onclick={() => selectAnswer(option.value)}
            class="tile w-full text-left px-4 py-4 text-base font-bold {currentAnswer === option.value ? 'tile-selected' : ''}"
          >
            {option.label}
          </button>
        {/each}
      </div>

    {:else if stage === 'recommend'}
      {@const plan = planById(answers.plan!)}
      {@render askBubble("Here's the plan I recommend for you!")}
      <div class="card border-primary-edge! mt-7 p-5">
        <p class="text-xs font-black uppercase tracking-wider text-primary">Recommended plan</p>
        <div class="flex items-baseline justify-between mt-1">
          <h2 class="text-3xl font-black">{plan.name}</h2>
          <span class="text-lg font-black text-primary">{plan.timeLabel}</span>
        </div>
        <p class="text-base font-bold text-text-muted">{plan.purpose}</p>
        <ul class="mt-4 pt-4 border-t-2 border-border-warm flex flex-col gap-2.5">
          <li class="flex items-start gap-2.5 text-[15px] font-bold"><Icon name="target" class="w-5 h-5 text-primary shrink-0" /> {labelFor('goal', answers.goal)}</li>
          <li class="flex items-start gap-2.5 text-[15px] font-bold"><Icon name="book" class="w-5 h-5 text-primary shrink-0" /> {labelFor('sanskritFamiliarity', answers.sanskritFamiliarity)} in Sanskrit</li>
          <li class="flex items-start gap-2.5 text-[15px] font-bold"><Icon name="clock" class="w-5 h-5 text-primary shrink-0" /> {labelFor('timeBudget', answers.timeBudget)} a day</li>
        </ul>
      </div>

    {:else if stage === 'choosePlan'}
      {@render askBubble('Which plan fits you best?')}
      <div class="flex flex-col gap-3 mt-7">
        {#each PLANS as plan}
          <button
            type="button"
            onclick={() => { playPopSound(); pendingPlan = plan.id; }}
            class="tile w-full text-left px-4 py-4 {pendingPlan === plan.id ? 'tile-selected' : ''}"
          >
            <span class="flex items-center justify-between">
              <span class="text-lg font-black">{plan.name}</span>
              <span class="text-sm font-black text-primary">{plan.timeLabel}</span>
            </span>
            <span class="block text-sm font-bold text-text-muted mt-0.5">{plan.purpose}</span>
          </button>
        {/each}
      </div>

    {:else if stage === 'customTime'}
      {@render askBubble('How many minutes a day?', 'Custom sessions adapt within your time budget.')}
      <div class="grid grid-cols-4 gap-3 mt-7">
        {#each CUSTOM_MINUTES_OPTIONS as m}
          <button
            type="button"
            onclick={() => { playPopSound(); answers.customMinutes = m; }}
            class="tile flex flex-col items-center py-3 {answers.customMinutes === m ? 'tile-selected' : ''}"
          >
            <span class="text-xl font-black tabular-nums">{m}</span>
            <span class="text-xs font-bold text-text-muted">min</span>
          </button>
        {/each}
      </div>
    {/if}
  </div>

  <div class="lesson-footer flex flex-col gap-3">
    {#if stage === 'welcome'}
      <button type="button" onclick={() => (stage = 'question')} class="btn btn-primary w-full">Get started</button>
    {:else if stage === 'question'}
      <button type="button" onclick={continueQuestion} disabled={!currentAnswer} class="btn w-full {currentAnswer ? 'btn-primary' : 'btn-disabled'}">
        Continue
      </button>
    {:else if stage === 'recommend'}
      <button type="button" onclick={confirmRecommendedPlan} class="btn btn-primary w-full">Start {planById(answers.plan!).name} plan</button>
      <button type="button" onclick={() => { pendingPlan = answers.plan ?? null; stage = 'choosePlan'; }} class="btn btn-ghost w-full">
        Choose another plan
      </button>
    {:else if stage === 'choosePlan'}
      <button type="button" onclick={confirmChosenPlan} disabled={!pendingPlan} class="btn w-full {pendingPlan ? 'btn-primary' : 'btn-disabled'}">
        Continue
      </button>
    {:else if stage === 'customTime'}
      <button type="button" onclick={finish} disabled={!answers.customMinutes} class="btn w-full {answers.customMinutes ? 'btn-primary' : 'btn-disabled'}">
        Continue
      </button>
    {/if}
  </div>
</div>
