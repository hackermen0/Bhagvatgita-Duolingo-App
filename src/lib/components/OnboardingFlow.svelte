<script lang="ts">
  import {
    ONBOARDING_QUESTIONS,
    PLANS,
    CUSTOM_MINUTES_OPTIONS,
    DIFFICULTY_TIERS,
    LEARNING_MODES,
    learningModeInfo,
    planById,
    recommendPlan,
    labelFor,
    type OnboardingProfile,
    type DifficultyTier,
    type LearningMode
  } from '../data/onboarding';
  import { gameState } from '../state/gameState.svelte';
  import { playPopSound } from '../utils/soundEffects';
  import Mascot from './Mascot.svelte';
  import Icon from './Icon.svelte';

  let { onComplete } = $props<{
    onComplete: (profile: OnboardingProfile) => void;
  }>();

  type Stage = 'welcome' | 'chooseMode' | 'chooseDifficulty' | 'question' | 'recommend' | 'choosePlan' | 'customTime';

  // Colors for each tier's badge; the copy lives in DIFFICULTY_TIERS so Settings shows the same wording
  const BADGE_COLORS: Record<DifficultyTier, string> = {
    beginner: 'bg-success/15 text-success border-success/30',
    medium: 'bg-gold/15 text-gold-dark dark:text-gold border-gold/30',
    hard: 'bg-accent/15 text-accent border-accent/30'
  };

  let stage = $state<Stage>('welcome');
  let selectedMode = $state<LearningMode>(gameState.learningMode ?? 'normal');
  let selectedTier = $state<DifficultyTier>(gameState.difficultyTier ?? 'beginner');
  let qIndex = $state(0);
  let answers = $state<Partial<OnboardingProfile>>({});
  // Where "Custom" was chosen from, so the back button on the minutes screen returns correctly
  let customFrom = $state<'recommend' | 'choosePlan'>('recommend');
  let pendingPlan = $state<OnboardingProfile['plan'] | null>(null);

  const question = $derived(ONBOARDING_QUESTIONS[qIndex]);
  const currentAnswer = $derived((answers as Record<string, string>)[question?.key]);

  // Welcome counts as step 0, mode as step 1, difficulty as step 2, questions, then plan
  const totalSteps = ONBOARDING_QUESTIONS.length + 3;
  const progress = $derived(
    stage === 'welcome'
      ? 0
      : stage === 'chooseMode'
        ? 1 / totalSteps
        : stage === 'chooseDifficulty'
          ? 2 / totalSteps
          : stage === 'question'
            ? (qIndex + 3) / totalSteps
            : 1
  );

  function selectMode(mode: LearningMode) {
    playPopSound();
    selectedMode = mode;
  }

  function continueMode() {
    answers.learningMode = selectedMode;
    stage = 'chooseDifficulty';
  }

  function selectTier(tier: DifficultyTier) {
    playPopSound();
    selectedTier = tier;
    answers.difficultyTier = tier;
    gameState.setDifficultyTier(tier);
  }

  function continueDifficulty() {
    answers.difficultyTier = selectedTier;
    gameState.setDifficultyTier(selectedTier);
    stage = 'question';
    qIndex = 0;
  }

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
    answers.learningMode = selectedMode;
    onComplete(answers as OnboardingProfile);
  }

  function back() {
    if (stage === 'chooseMode') {
      stage = 'welcome';
    } else if (stage === 'chooseDifficulty') {
      stage = 'chooseMode';
    } else if (stage === 'question') {
      if (qIndex === 0) stage = 'chooseDifficulty';
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
    if (stage === 'welcome') stage = 'chooseMode';
    else if (stage === 'chooseMode') continueMode();
    else if (stage === 'chooseDifficulty') continueDifficulty();
    else if (stage === 'question') continueQuestion();
    else if (stage === 'recommend') confirmRecommendedPlan();
    else if (stage === 'choosePlan') confirmChosenPlan();
    else if (stage === 'customTime' && answers.customMinutes) finish();
  }
</script>

<svelte:window onkeydown={onKey} />

{#snippet askBubble(text: string, helper?: string)}
  <div class="flex items-center gap-2">
    <div class="shrink-0 -ml-1"><Mascot size="lg" /></div>
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
          <p class="text-xl font-black">Namaste! Let's begin your Gita journey.</p>
          <span class="absolute left-1/2 -bottom-[9px] -translate-x-1/2 w-4 h-4 rotate-45 bg-bg-surface border-r-2 border-b-2 border-border-warm"></span>
        </div>
        <Mascot mood="affectionate" size="xl" animate={true} />
        <p class="text-base font-bold text-text-muted max-w-xs">
          Answer {ONBOARDING_QUESTIONS.length + 2} quick questions and we'll shape your daily practice around you.
        </p>
      </div>

    {:else if stage === 'chooseMode'}
      {@render askBubble('How would you like to learn?', 'You can switch any time in Settings.')}
      <div class="flex flex-col gap-3.5 mt-6">
        {#each LEARNING_MODES as option}
          {@const isSelected = selectedMode === option.mode}
          <button
            type="button"
            onclick={() => selectMode(option.mode)}
            class="tile w-full text-left p-4 flex flex-col gap-2.5 transition-all relative {isSelected ? 'tile-selected border-primary! shadow-md ring-2 ring-primary/20' : ''}"
          >
            <div class="flex items-center justify-between">
              <span class="text-lg font-black">{option.title}</span>
              <div class="w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors {isSelected ? 'border-primary bg-primary text-white' : 'border-border-warm bg-bg-surface'}">
                {#if isSelected}
                  <Icon name="check" class="w-3.5 h-3.5" />
                {/if}
              </div>
            </div>
            <p class="text-xs font-black uppercase tracking-wider text-primary">{option.subtitle}</p>
            <div class="flex flex-wrap items-center gap-1.5">
              {#each option.steps as step, i}
                {#if i > 0}<Icon name="chevron-right" class="w-3.5 h-3.5 text-text-muted" />{/if}
                <span class="text-xs font-extrabold px-2 py-1 rounded-lg bg-bg-base/70 border border-border-warm">{step}</span>
              {/each}
            </div>
            <p class="text-xs font-bold text-text-muted leading-relaxed">{option.description}</p>
          </button>
        {/each}
      </div>

    {:else if stage === 'chooseDifficulty'}
      {@render askBubble('Choose your difficulty level', 'You always answer in English. Beginner reads Hindi; Medium and Hard read the original Sanskrit, in Roman letters or Devanagari.')}
      <div class="flex flex-col gap-3.5 mt-6">
        {#each DIFFICULTY_TIERS as option}
          {@const isSelected = selectedTier === option.tier}
          <button
            type="button"
            onclick={() => selectTier(option.tier)}
            class="tile w-full text-left p-4 flex flex-col gap-2 transition-all relative {isSelected ? 'tile-selected border-primary! shadow-md ring-2 ring-primary/20' : ''}"
          >
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-2">
                <span class="text-lg font-black">{option.title}</span>
                <span class="text-[11px] font-extrabold uppercase px-2 py-0.5 rounded-full border {BADGE_COLORS[option.tier]}">{option.badge}</span>
              </div>
              <div class="w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors {isSelected ? 'border-primary bg-primary text-white' : 'border-border-warm bg-bg-surface'}">
                {#if isSelected}
                  <Icon name="check" class="w-3.5 h-3.5" />
                {/if}
              </div>
            </div>
            <p class="text-xs font-black uppercase tracking-wider text-primary">{option.subtitle}</p>
            <div class="bg-bg-base/70 rounded-xl px-3 py-2 border border-border-warm text-sm font-semibold text-text-primary">
              <span class="text-[11px] font-bold text-text-muted block mb-0.5">Sample text:</span>
              <span class="{option.tier === 'hard' ? 'font-deva text-base font-bold' : 'font-bold'}">{option.sample}</span>
            </div>
            <p class="text-xs font-bold text-text-muted leading-relaxed">{option.description}</p>
          </button>
        {/each}
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
          <li class="flex items-start gap-2.5 text-[15px] font-bold"><Icon name="star" class="w-5 h-5 text-primary shrink-0" /> {learningModeInfo(selectedMode).title} mode · {learningModeInfo(selectedMode).subtitle}</li>
          <li class="flex items-start gap-2.5 text-[15px] font-bold"><Icon name="target" class="w-5 h-5 text-primary shrink-0" /> {labelFor('goal', answers.goal)}</li>
          <li class="flex items-start gap-2.5 text-[15px] font-bold"><Icon name="book" class="w-5 h-5 text-primary shrink-0" /> {DIFFICULTY_TIERS.find((t) => t.tier === selectedTier)?.title} tier · {DIFFICULTY_TIERS.find((t) => t.tier === selectedTier)?.subtitle}</li>
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
      <button type="button" onclick={() => (stage = 'chooseMode')} class="btn btn-primary w-full">Get started</button>
    {:else if stage === 'chooseMode'}
      <button type="button" onclick={continueMode} class="btn btn-primary w-full">
        Continue with {learningModeInfo(selectedMode).title}
      </button>
    {:else if stage === 'chooseDifficulty'}
      <button type="button" onclick={continueDifficulty} class="btn btn-primary w-full">
        Continue with {DIFFICULTY_TIERS.find((o) => o.tier === selectedTier)?.title ?? 'Selected'} Tier
      </button>
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
