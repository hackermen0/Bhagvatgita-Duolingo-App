<script lang="ts">
  import { onMount } from 'svelte';
  import { gameState, type SessionResult } from '../state/gameState.svelte';
  import type { Lesson, MCQOption } from '../data/gitaData';
  import { QUESTION_KIND_LABEL, type PhilosophyContent, type PhilosophyQuestion } from '../data/philosophy';
  import { hindiOf } from '../data/hindi';
  import { shuffle } from '../data/practice';
  import { goalNudge } from '../data/learningConfig';
  import { stopSpeaking } from '../utils/speech';
  import LessonProgress from './LessonProgress.svelte';
  import FeedbackModal from './FeedbackModal.svelte';
  import MultipleChoice from './MultipleChoice.svelte';
  import BackstoryPlayer from './BackstoryPlayer.svelte';
  import SpokenText, { englishLines, hindiLines } from './SpokenText.svelte';
  import CompleteFlow from './CompleteFlow.svelte';
  import Mascot, { preloadMascots, type MascotMood } from './Mascot.svelte';
  import Icon from './Icon.svelte';

  // Philosophy mode: one verse is three pages — the backstory video, the verse with its meaning, then
  // multiple-choice questions on the meaning and how it applies. Short enough that it isn't checkpointed.
  let { lesson, content, onExit } = $props<{
    lesson: Lesson;
    content: PhilosophyContent;
    onExit: () => void;
  }>();

  type Page = 'video' | 'verse' | 'questions';
  const PAGES: Page[] = ['video', 'verse', 'questions'];

  let page = $state<Page>('video');
  const pageIndex = $derived(PAGES.indexOf(page));

  let isGameOver = $state(false);
  let showQuit = $state(false);
  let completed = $state(false);
  let sessionResult = $state<SessionResult | null>(null);
  let summary = $state<{ accuracy: number; seconds: number } | null>(null);
  const sessionStart = Date.now();

  onMount(() => {
    preloadMascots(['default', 'cheerful', 'disappointed', 'thinking', 'celebrating', 'crying', 'puppy']);
    return () => stopSpeaking();
  });

  function goTo(next: Page) {
    stopSpeaking();
    page = next;
  }

  // ─── Questions ──────────────────────────────────────────────────────────────
  // A question answered wrong comes back once at the end, so every session finishes on right answers
  interface QueueItem {
    question: PhilosophyQuestion;
    options: MCQOption[];
    retry: boolean;
  }

  const makeItem = (question: PhilosophyQuestion, retry = false): QueueItem => ({
    question,
    retry,
    options: shuffle<MCQOption>([
      { text: question.answer, isCorrect: true, explanation: question.explanation },
      ...question.wrong.map((text) => ({ text, isCorrect: false, explanation: question.explanation }))
    ])
  });

  // svelte-ignore state_referenced_locally
  let queue = $state<QueueItem[]>(content.questions.map((q: PhilosophyQuestion) => makeItem(q)));
  let qIndex = $state(0);
  // Bumped to remount the current question from scratch (after running out of hearts)
  let nonce = $state(0);
  let selectedOption = $state<MCQOption | null>(null);
  let isChecked = $state(false);
  let isCorrect = $state(false);
  let showFeedback = $state(false);
  let firstTryCorrect = 0;

  const current = $derived<QueueItem | undefined>(queue[qIndex]);
  const questionCount = $derived(content.questions.length);

  const progress = $derived(
    page === 'questions' ? (2 + qIndex / queue.length) / PAGES.length : pageIndex / PAGES.length
  );

  const mood = $derived.by((): MascotMood => {
    if (showFeedback) return isCorrect ? 'cheerful' : 'disappointed';
    return page === 'questions' ? 'thinking' : 'default';
  });

  function check() {
    if (!selectedOption || isChecked || !current) return;
    isChecked = true;
    isCorrect = selectedOption.isCorrect;
    if (isCorrect && !current.retry) firstTryCorrect += 1;
    if (!isCorrect) {
      gameState.decrementHeart();
      if (gameState.hearts <= 0) setTimeout(() => (isGameOver = true), 800);
    }
    showFeedback = true;
  }

  function nextQuestion() {
    const item = current;
    if (item && !isCorrect && !item.retry) queue.push(makeItem(item.question, true));
    selectedOption = null;
    isChecked = false;
    isCorrect = false;
    showFeedback = false;
    if (qIndex + 1 >= queue.length) return finish();
    qIndex += 1;
  }

  // Out of hearts: refill and ask the current question again
  function retryQuestion() {
    gameState.refillHearts();
    isGameOver = false;
    selectedOption = null;
    isChecked = false;
    isCorrect = false;
    showFeedback = false;
    if (current) queue[qIndex] = makeItem(current.question, current.retry);
    nonce += 1;
  }

  function finish() {
    sessionResult = gameState.completePhilosophyVerse(lesson.id);
    summary = {
      accuracy: questionCount ? Math.round((firstTryCorrect / questionCount) * 100) : 100,
      seconds: Math.round((Date.now() - sessionStart) / 1000)
    };
    completed = true;
  }

  // ─── Keyboard: Enter continues / checks ────────────────────────────────────
  function onKey(e: KeyboardEvent) {
    if (e.key !== 'Enter' || showQuit || isGameOver || completed) return;
    if ((e.target as HTMLElement | null)?.closest?.('button, textarea, input, video, iframe')) return;
    if (page === 'video') goTo('verse');
    else if (page === 'verse') goTo('questions');
    else if (showFeedback) nextQuestion();
    else check();
  }

  const isDeva = $derived(gameState.tierScriptMode === 'devanagari');
  // svelte-ignore state_referenced_locally
  const verseHindi = hindiOf(lesson);
</script>

<svelte:window onkeydown={onKey} />

{#snippet header(eyebrow: string, title: string, sub: string)}
  <div class="flex items-end gap-3">
    <div class="flex-1 min-w-0">
      <p class="text-sm font-extrabold uppercase tracking-wider text-accent mb-1">{eyebrow}</p>
      <h2 class="text-2xl font-black leading-tight">{title}</h2>
      {#if sub}<p class="text-[15px] font-bold text-text-muted mt-1">{sub}</p>{/if}
    </div>
    <Mascot {mood} size="lg" />
  </div>
{/snippet}

<div class="w-full h-full flex flex-col bg-bg-base text-text-primary relative select-none overflow-hidden">
  {#if completed && sessionResult && summary}
    <CompleteFlow
      {sessionResult}
      {summary}
      title="Verse understood!"
      subtitle={goalNudge(gameState.profile) || `You've explored ${lesson.verseRef}, ${lesson.title}.`}
      storyLessonId={lesson.id}
      {onExit}
    />

  {:else if isGameOver}
    <!-- ═══ OUT OF HEARTS ═══ -->
    <div class="flex-1 flex flex-col items-center justify-center px-6 text-center animate-[fade-in_0.3s_ease-out]">
      <Mascot mood="crying" size="xl" />
      <h1 class="text-3xl font-black mt-6">You ran out of hearts!</h1>
      <p class="text-base font-bold text-text-muted mt-2 max-w-xs leading-relaxed">
        Every question is a chance to think again. Refill your hearts and try this one once more.
      </p>
    </div>
    <div class="lesson-footer flex flex-col gap-3">
      <button onclick={retryQuestion} class="btn btn-primary w-full">
        <Icon name="heart" class="w-5 h-5" /> Refill hearts and retry
      </button>
      <button onclick={onExit} class="btn btn-ghost w-full">Exit</button>
    </div>

  {:else}
    {#if page !== 'video'}
      <LessonProgress {progress} onCancel={() => (showQuit = true)} showHearts={page === 'questions'} />
    {/if}

    {#if page === 'video'}
      <!-- Full screen, like a reel: it covers the progress bar and has its own close button -->
      <BackstoryPlayer {content} verseRef={lesson.verseRef} onContinue={() => goTo('verse')} onClose={() => (showQuit = true)} />

    {:else if page === 'verse'}
      <div class="flex-1 overflow-y-auto scrollbar-none px-5 pt-4 pb-6 flex flex-col gap-4">
        {@render header(`${lesson.verseRef} · ${lesson.title}`, 'The verse and its meaning', '')}

        {#if lesson.essence}
          <div class="card bg-bg-surface-alt! px-4 py-3">
            <p class="text-lg font-black leading-snug">{lesson.essence}</p>
          </div>
        {/if}

        <div class="card p-4 flex flex-col gap-3">
          <p class="text-xs font-black uppercase tracking-wider text-primary">The verse in Hindi</p>
          <SpokenText lines={hindiLines(verseHindi, isDeva)} lang="hi" label="Hear Hindi" tappable textClass="text-xl leading-tight {isDeva ? 'font-deva' : 'font-black'}" />
        </div>

        <div class="card p-4 flex flex-col gap-3">
          <p class="text-xs font-black uppercase tracking-wider text-primary">In English</p>
          <SpokenText lines={englishLines(lesson.translation)} lang="en" label="Hear English" textClass="text-[17px] font-bold leading-relaxed" />
        </div>

        <div class="card p-4 flex flex-col gap-3">
          <p class="text-xs font-black uppercase tracking-wider text-accent">What it means</p>
          <SpokenText lines={englishLines(lesson.purport)} lang="en" label="Listen" textClass="text-[15px] font-semibold leading-relaxed" />
        </div>

        {#if lesson.commentary}
          <div class="card p-4 flex flex-col gap-2">
            <p class="text-xs font-black uppercase tracking-wider text-accent">A teacher's view</p>
            <p class="text-[15px] font-semibold leading-relaxed">“{lesson.commentary.text}”</p>
            <p class="text-sm font-extrabold text-text-muted">{lesson.commentary.author} · {lesson.commentary.tradition}</p>
          </div>
        {/if}
      </div>
      <div class="lesson-footer">
        <button onclick={() => goTo('questions')} class="btn btn-primary w-full">Test your understanding</button>
      </div>

    {:else if current}
      <div class="flex-1 overflow-y-auto scrollbar-none px-5 pt-4 {showFeedback ? 'pb-56' : 'pb-6'} flex flex-col gap-4">
        {@render header(
          current.retry ? 'One more try' : `Question ${qIndex + 1} of ${questionCount} · ${QUESTION_KIND_LABEL[current.question.kind]}`,
          current.question.prompt,
          ''
        )}
        {#key `${qIndex}:${nonce}`}
          <MultipleChoice options={current.options} onSelect={(o: MCQOption) => (selectedOption = o)} disabled={isChecked} />
        {/key}
      </div>
      <div class="lesson-footer">
        <button
          onclick={check}
          disabled={!selectedOption || isChecked}
          class="btn w-full {selectedOption && !isChecked ? 'btn-primary' : 'btn-disabled'}"
        >Check</button>
      </div>
      {#if showFeedback}
        <FeedbackModal
          {isCorrect}
          correctAnswerText={current.question.answer}
          explanation={current.question.explanation}
          encouragement={!isCorrect && !current.retry ? "We'll come back to this one." : ''}
          onContinue={nextQuestion}
        />
      {/if}
    {/if}

    <!-- ═══ QUIT CONFIRMATION ═══ -->
    {#if showQuit}
      <button
        type="button"
        aria-label="Keep going"
        class="absolute inset-0 z-40 bg-black/40 animate-[fade-in_0.15s_ease-out] cursor-default"
        onclick={() => (showQuit = false)}
      ></button>
      <div class="absolute inset-x-0 bottom-0 z-50 bg-bg-base rounded-t-3xl px-6 pt-6 pb-[max(1.5rem,env(safe-area-inset-bottom))] flex flex-col items-center text-center animate-sheet-up">
        <Mascot mood="puppy" size="lg" />
        <h2 class="text-2xl font-black mt-3">Leaving so soon?</h2>
        <p class="text-base font-bold text-text-muted mt-1">This verse takes just a few minutes. You'll start it from the backstory next time.</p>
        <button onclick={() => (showQuit = false)} class="btn btn-primary w-full mt-6">Keep going</button>
        <button onclick={onExit} class="btn btn-ghost w-full mt-2">Exit</button>
      </div>
    {/if}
  {/if}
</div>
