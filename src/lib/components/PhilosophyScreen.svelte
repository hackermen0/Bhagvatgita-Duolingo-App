<script lang="ts">
  import { onMount } from 'svelte';
  import { gameState, type SessionResult } from '../state/gameState.svelte';
  import type { MCQOption } from '../data/gitaData';
  import { correctAnswer, questionOptions, type PhilosophyQuestion, type PhilosophySession } from '../data/philosophy';
  import { goalNudge } from '../data/learningConfig';
  import { stopSpeaking } from '../utils/speech';
  import LessonProgress from './LessonProgress.svelte';
  import FeedbackModal from './FeedbackModal.svelte';
  import MultipleChoice from './MultipleChoice.svelte';
  import BackstoryPlayer from './BackstoryPlayer.svelte';
  import SpeakButton from './SpeakButton.svelte';
  import SpokenText, { englishLines, hindiLines } from './SpokenText.svelte';
  import InlineText, { plainText } from './InlineText.svelte';
  import CompleteFlow from './CompleteFlow.svelte';
  import Mascot, { preloadMascots, type MascotMood } from './Mascot.svelte';
  import Icon from './Icon.svelte';

  // Philosophy mode: one verse is a short session — its backstory (a full-screen reel) when it has one, the verse
  // with its meaning on one page, then multiple-choice questions. Short enough that it isn't checkpointed.
  let { session, onExit } = $props<{
    session: PhilosophySession;
    onExit: () => void;
  }>();

  type Page = 'video' | 'verse' | 'questions';
  // svelte-ignore state_referenced_locally
  const PAGES: Page[] = session.backstory ? ['video', 'verse', 'questions'] : ['verse', 'questions'];

  let page = $state<Page>(PAGES[0]);

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

  const makeItem = (question: PhilosophyQuestion, retry = false): QueueItem => ({ question, retry, options: questionOptions(question) });

  // svelte-ignore state_referenced_locally
  let queue = $state<QueueItem[]>(session.questions.map((q: PhilosophyQuestion) => makeItem(q)));
  let qIndex = $state(0);
  // Bumped to remount the current question from scratch (after running out of hearts)
  let nonce = $state(0);
  let selectedOption = $state<MCQOption | null>(null);
  let isChecked = $state(false);
  let isCorrect = $state(false);
  let showFeedback = $state(false);
  let firstTryCorrect = 0;

  const current = $derived<QueueItem | undefined>(queue[qIndex]);
  // svelte-ignore state_referenced_locally
  const questionCount = session.questions.length;

  const progress = $derived(
    page === 'questions'
      ? (PAGES.length - 1 + qIndex / queue.length) / PAGES.length
      : PAGES.indexOf(page) / PAGES.length
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
    sessionResult = gameState.completePhilosophyVerse(session.id);
    summary = {
      accuracy: questionCount ? Math.round((firstTryCorrect / questionCount) * 100) : 100,
      seconds: Math.round((Date.now() - sessionStart) / 1000)
    };
    completed = true;
  }

  // ─── Keyboard: Enter continues / checks ────────────────────────────────────
  function onKey(e: KeyboardEvent) {
    if (e.key !== 'Enter' || showQuit || isGameOver || completed || page === 'video') return;
    if ((e.target as HTMLElement | null)?.closest?.('button, textarea, input')) return;
    if (page === 'verse') goTo('questions');
    else if (showFeedback) nextQuestion();
    else check();
  }

  const isDeva = $derived(gameState.tierScriptMode === 'devanagari');
  /** Chapter 1 shows the Sanskrit in the tier's script (IAST, or Devanagari on Hard); the voice reads the Devanagari */
  const sanskritLines = $derived((isDeva ? session.verse.text.dev : session.verse.text.roman).split('\n'));
  const paragraphs = (text: string) => text.split('\n').filter(Boolean);
</script>

<svelte:window onkeydown={onKey} />

<div class="w-full h-full flex flex-col bg-bg-base text-text-primary relative select-none overflow-hidden">
  {#if completed && sessionResult && summary}
    <CompleteFlow
      {sessionResult}
      {summary}
      title="Verse understood!"
      subtitle={goalNudge(gameState.profile) || `You've explored ${session.verseRef}, ${session.title}.`}
      storyLessonId={session.id}
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

    {#if page === 'video' && session.backstory}
      <!-- Full screen, like a reel: it covers the progress bar and has its own close button -->
      <BackstoryPlayer content={session.backstory} verseRef={session.verseRef} onContinue={() => goTo('verse')} onClose={() => (showQuit = true)} />

    {:else if page === 'verse'}
      <div class="flex-1 overflow-y-auto scrollbar-none px-5 pt-4 pb-6 flex flex-col gap-4">
        <div class="flex items-end gap-3">
          <div class="flex-1 min-w-0">
            <p class="text-sm font-extrabold uppercase tracking-wider text-accent mb-1">{session.verseRef} · {session.title}</p>
            <h2 class="text-2xl font-black leading-tight">The verse and its meaning</h2>
          </div>
          <Mascot {mood} size="lg" />
        </div>

        {#if session.essence}
          <div class="card bg-bg-surface-alt! px-4 py-3">
            <p class="text-lg font-black leading-snug">{session.essence}</p>
          </div>
        {/if}

        <div class="card p-4 flex flex-col gap-3">
          {#if session.verse.language === 'sanskrit'}
            <div class="flex items-center justify-between gap-2">
              <p class="text-xs font-black uppercase tracking-wider text-primary">The verse in Sanskrit</p>
              <SpeakButton text={session.verse.text.dev} lang="hi" label="Hear it" />
            </div>
            <div class="flex flex-col gap-1">
              {#each sanskritLines as line}
                <p class="text-xl leading-snug {isDeva ? 'font-deva font-bold' : 'font-black italic'}">{line}</p>
              {/each}
            </div>
          {:else}
            <p class="text-xs font-black uppercase tracking-wider text-primary">The verse in Hindi</p>
            <SpokenText lines={hindiLines(session.verse.text, isDeva)} lang="hi" label="Hear Hindi" tappable textClass="text-xl leading-tight {isDeva ? 'font-deva' : 'font-black'}" />
          {/if}
        </div>

        <div class="card p-4 flex flex-col gap-3">
          <p class="text-xs font-black uppercase tracking-wider text-primary">In English</p>
          <SpokenText lines={englishLines(session.english)} lang="en" label="Hear English" textClass="text-[17px] font-bold leading-relaxed" />
        </div>

        <p class="text-xs font-black uppercase tracking-wider text-accent -mb-1 mt-1">{session.sectionsTitle}</p>
        {#each session.sections as section}
          <div class="card p-4 flex flex-col gap-2.5">
            <div class="flex items-start justify-between gap-3">
              {#if section.heading}
                <h3 class="text-[17px] font-black leading-snug"><InlineText text={section.heading} /></h3>
              {:else}
                <span></span>
              {/if}
              <SpeakButton text={plainText(`${section.heading} ${section.text}`)} lang="en" size="sm" />
            </div>
            {#each paragraphs(section.text) as para}
              <p class="text-[15px] font-semibold leading-relaxed text-text-primary/90"><InlineText text={para} /></p>
            {/each}
          </div>
        {/each}

        {#if session.commentary}
          <div class="card p-4 flex flex-col gap-2">
            <p class="text-xs font-black uppercase tracking-wider text-accent">A teacher's view</p>
            <p class="text-[15px] font-semibold leading-relaxed">“{session.commentary.text}”</p>
            <p class="text-sm font-extrabold text-text-muted">{session.commentary.author} · {session.commentary.tradition}</p>
          </div>
        {/if}
      </div>
      <div class="lesson-footer">
        <button onclick={() => goTo('questions')} class="btn btn-primary w-full">Test your understanding</button>
      </div>

    {:else if current}
      <div class="flex-1 overflow-y-auto scrollbar-none px-5 pt-4 {showFeedback ? 'pb-56' : 'pb-6'} flex flex-col gap-4">
        <div class="flex items-end gap-3">
          <div class="flex-1 min-w-0">
            <p class="text-sm font-extrabold uppercase tracking-wider text-accent mb-1">
              {current.retry ? 'One more try' : `Question ${qIndex + 1} of ${questionCount}`}
            </p>
            <h2 class="text-2xl font-black leading-tight">{current.question.prompt}</h2>
          </div>
          <Mascot {mood} size="lg" />
        </div>
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
          correctAnswerText={correctAnswer(current.question)}
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
        <p class="text-base font-bold text-text-muted mt-1">
          This verse takes just a few minutes. You'll start it from the beginning next time.
        </p>
        <button onclick={() => (showQuit = false)} class="btn btn-primary w-full mt-6">Keep going</button>
        <button onclick={onExit} class="btn btn-ghost w-full mt-2">Exit</button>
      </div>
    {/if}
  {/if}
</div>
