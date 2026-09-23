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
  import Mascot from './Mascot.svelte';

  let { onComplete } = $props<{
    onComplete: (profile: OnboardingProfile) => void;
  }>();

  type Stage = 'welcome' | 'question' | 'recommend' | 'choosePlan' | 'customTime';

  let stage = $state<Stage>('welcome');
  let qIndex = $state(0);
  let answers = $state<Partial<OnboardingProfile>>({});
  // Where "Custom" was chosen from, so the back button on the minutes screen returns correctly
  let customFrom = $state<'recommend' | 'choosePlan'>('recommend');

  function selectAnswer(value: string) {
    const q = ONBOARDING_QUESTIONS[qIndex];
    (answers as Record<string, string>)[q.key] = value;

    setTimeout(() => {
      if (qIndex < ONBOARDING_QUESTIONS.length - 1) {
        qIndex += 1;
      } else {
        answers.plan = recommendPlan(answers.timeBudget!);
        stage = 'recommend';
      }
    }, 200);
  }

  function confirmRecommendedPlan() {
    if (answers.plan === 'custom') {
      customFrom = 'recommend';
      stage = 'customTime';
    } else {
      finish();
    }
  }

  function choosePlan(id: OnboardingProfile['plan']) {
    answers.plan = id;
    if (id === 'custom') {
      customFrom = 'choosePlan';
      stage = 'customTime';
    } else {
      finish();
    }
  }

  function selectCustomMinutes(minutes: number) {
    answers.customMinutes = minutes;
    finish();
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
</script>

<div class="w-full h-full flex flex-col bg-bg-base text-text-primary relative select-none overflow-hidden">
  <!-- Ambient Om watermark, consistent with the rest of the app -->
  <div class="absolute inset-0 pointer-events-none opacity-[0.02] flex items-center justify-center">
    <div class="text-[16rem] font-cinzel text-primary">ॐ</div>
  </div>

  <!-- Back button -->
  {#if stage !== 'welcome'}
    <div class="relative z-10 flex items-center px-3 pt-3">
      <button
        type="button"
        onclick={back}
        aria-label="Back"
        class="p-2 -ml-1 rounded-full text-text-muted hover:text-text-primary hover:bg-bg-surface-alt transition-colors"
      >
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor" class="w-4 h-4">
          <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
        </svg>
      </button>
    </div>
  {/if}

  {#if stage === 'question'}
    <div class="relative z-10 flex items-center gap-1.5 justify-center pt-1 pb-2">
      {#each ONBOARDING_QUESTIONS as _, i}
        <div
          class="h-1.5 rounded-full transition-all duration-300
            {i === qIndex ? 'w-6 bg-primary' : i < qIndex ? 'w-1.5 bg-primary/50' : 'w-1.5 bg-border-warm'}"
        ></div>
      {/each}
    </div>
  {/if}

  <div class="relative z-10 flex-1 overflow-y-auto scrollbar-none">
    {#if stage === 'welcome'}
      <div class="h-full flex flex-col items-center justify-center px-6 text-center gap-5">
        <Mascot mood="guide" size="lg" animate={true} />
        <h1 class="text-2xl font-black font-cinzel text-primary tracking-wide">Welcome to Gita Yoga</h1>
        <p class="text-sm text-text-muted max-w-xs leading-relaxed">
          A few quick questions help us tailor your daily practice — your goals, your pace, and how you like to learn.
        </p>
        <button
          type="button"
          onclick={() => (stage = 'question')}
          class="w-full max-w-xs bg-primary hover:bg-primary-dark text-bg-base font-black py-4 rounded-2xl shadow-lg btn-3d border-b-4 border-accent transition-all text-sm"
        >
          Get Started
        </button>
      </div>

    {:else if stage === 'question'}
      {@const q = ONBOARDING_QUESTIONS[qIndex]}
      <div class="flex flex-col px-6 pb-6">
        <span class="text-[10px] font-black uppercase tracking-widest text-primary/70 text-center mt-2">
          Question {qIndex + 1} of {ONBOARDING_QUESTIONS.length}
        </span>
        <h2 class="text-xl font-black font-cinzel text-text-primary text-center mt-1 mb-1 leading-snug">
          {q.question}
        </h2>
        {#if q.helper}
          <p class="text-xs text-text-muted text-center mb-5">{q.helper}</p>
        {:else}
          <div class="mb-5"></div>
        {/if}

        <div class="flex flex-col gap-2.5 w-full max-w-sm mx-auto">
          {#each q.options as option}
            {@const isSelected = (answers as Record<string, string>)[q.key] === option.value}
            <button
              type="button"
              onclick={() => selectAnswer(option.value)}
              class="w-full text-left p-4 rounded-2xl border border-b-4 tile-3d transition-all duration-150 select-none flex items-center justify-between gap-3
                {isSelected
                  ? 'bg-primary/20 border-primary text-text-primary shadow-md'
                  : 'bg-bg-surface hover:bg-bg-surface-alt border-border-warm text-text-primary'}"
            >
              <span class="text-sm font-semibold leading-relaxed">{option.label}</span>
              <div
                class="w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors
                  {isSelected ? 'border-primary bg-primary text-bg-base' : 'border-text-muted/40'}"
              >
                {#if isSelected}
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="3" stroke="currentColor" class="w-3.5 h-3.5">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                  </svg>
                {/if}
              </div>
            </button>
          {/each}
        </div>
      </div>

    {:else if stage === 'recommend'}
      {@const plan = planById(answers.plan!)}
      <div class="h-full flex flex-col items-center justify-center px-6 text-center gap-5">
        <span class="text-[10px] font-black uppercase tracking-[0.25em] text-primary/80">Your Recommended Plan</span>

        <div class="w-full max-w-xs bg-bg-surface border border-primary/30 rounded-3xl p-6 shadow-xl flex flex-col items-center gap-1.5">
          <h2 class="text-2xl font-black font-cinzel text-primary">{plan.name}</h2>
          <p class="text-sm font-bold text-text-primary">{plan.timeLabel}</p>

          <div class="h-px w-full bg-border-warm my-3"></div>

          <div class="w-full text-left flex flex-col gap-1.5">
            <span class="text-[10px] font-black uppercase tracking-wider text-text-muted mb-0.5">Why?</span>
            <p class="text-xs text-text-muted">• Goal: {labelFor('goal', answers.goal)}</p>
            <p class="text-xs text-text-muted">• Level: {labelFor('sanskritFamiliarity', answers.sanskritFamiliarity)}</p>
            <p class="text-xs text-text-muted">• Available time: {labelFor('timeBudget', answers.timeBudget)}</p>
          </div>
        </div>

        <div class="w-full max-w-xs flex flex-col gap-2.5">
          <button
            type="button"
            onclick={confirmRecommendedPlan}
            class="w-full bg-primary hover:bg-primary-dark text-bg-base font-black py-4 rounded-2xl shadow-lg btn-3d border-b-4 border-accent transition-all text-sm"
          >
            Start {plan.name} Plan
          </button>
          <button
            type="button"
            onclick={() => (stage = 'choosePlan')}
            class="w-full py-3.5 bg-bg-surface hover:bg-bg-surface-alt text-text-muted hover:text-text-primary font-bold rounded-2xl border border-border-warm active:scale-[0.98] transition-all text-xs"
          >
            Choose Another Plan
          </button>
        </div>
      </div>

    {:else if stage === 'choosePlan'}
      <div class="flex flex-col px-6 pb-6">
        <h2 class="text-xl font-black font-cinzel text-text-primary text-center mt-2 mb-5">Choose your plan</h2>
        <div class="flex flex-col gap-2.5 w-full max-w-sm mx-auto">
          {#each PLANS as plan}
            <button
              type="button"
              onclick={() => choosePlan(plan.id)}
              class="w-full text-left p-4 rounded-2xl border border-b-4 tile-3d transition-all duration-150
                {answers.plan === plan.id
                  ? 'bg-primary/20 border-primary'
                  : 'bg-bg-surface hover:bg-bg-surface-alt border-border-warm'}"
            >
              <div class="flex items-center justify-between">
                <span class="font-black font-cinzel text-text-primary">{plan.name}</span>
                <span class="text-xs font-bold text-primary shrink-0">{plan.timeLabel}</span>
              </div>
              <p class="text-[11px] text-text-muted mt-1">{plan.purpose}</p>
            </button>
          {/each}
        </div>
      </div>

    {:else if stage === 'customTime'}
      <div class="h-full flex flex-col items-center justify-center px-6 text-center gap-5">
        <h2 class="text-xl font-black font-cinzel text-text-primary">How many minutes?</h2>
        <p class="text-xs text-text-muted max-w-xs leading-relaxed">
          Custom sessions adapt within your chosen time budget.
        </p>
        <div class="grid grid-cols-4 gap-2 w-full max-w-xs">
          {#each CUSTOM_MINUTES_OPTIONS as m}
            <button
              type="button"
              onclick={() => selectCustomMinutes(m)}
              class="flex flex-col items-center justify-center py-3 rounded-2xl border border-b-4 tile-3d bg-bg-surface hover:bg-bg-surface-alt border-border-warm text-text-primary transition-all"
            >
              <span class="text-base font-black tabular-nums">{m}</span>
              <span class="text-[9px] text-text-muted font-bold">min</span>
            </button>
          {/each}
        </div>
      </div>
    {/if}
  </div>
</div>

<style>
  .scrollbar-none::-webkit-scrollbar { display: none; }
  .scrollbar-none { -ms-overflow-style: none; scrollbar-width: none; }
</style>
