<script lang="ts">
  import { gameState, type SessionResult } from '../state/gameState.svelte';
  import type { Lesson, VersePart, Question } from '../data/gitaData';
  import { lessonWords, wordsTestedBy } from '../data/practice';
  import { learningConfig, goalNudge } from '../data/learningConfig';
  import LessonProgress from './LessonProgress.svelte';
  import FeedbackModal from './FeedbackModal.svelte';
  import PhraseMatcher from './PhraseMatcher.svelte';
  import WordTilePicker from './WordTilePicker.svelte';
  import MultipleChoice from './MultipleChoice.svelte';
  import FillInBlank from './FillInBlank.svelte';
  import ListeningChoice from './ListeningChoice.svelte';
  import ReflectionPrompt from './ReflectionPrompt.svelte';
  import Mascot from './Mascot.svelte';
  import VerseHookScreen from './VerseHookScreen.svelte';
  import WordDiscoveryScreen from './WordDiscoveryScreen.svelte';
  import StreakCelebration from './StreakCelebration.svelte';
  import VerseText from './VerseText.svelte';
  import Icon, { type IconName } from './Icon.svelte';

  let { lesson, onExit, mode = 'lesson', jumpLessonIds = [] } = $props<{
    lesson: Lesson;
    onExit: () => void;
    mode?: 'lesson' | 'practice' | 'jump';
    /** Lessons marked complete when a jump test is passed */
    jumpLessonIds?: string[];
  }>();

  const isPractice = $derived(mode === 'practice');
  const isJump = $derived(mode === 'jump');
  const cfg = learningConfig(gameState.profile);

  // A jump test is a placement check: hearts aren't spent, but too many mistakes ends it
  const JUMP_MISTAKES_ALLOWED = 3;
  let jumpMistakes = $state(0);

  // ─── Phase State Machine ───────────────────────────────────────────────────
  type Phase =
    | 'verse_hook'      // Verse intro with recitation
    | 'word_discover'   // Word-by-word card flip discovery
    | 'part_play'       // Exercises for current part
    | 'synthesis_intro' // Full verse assembled
    | 'synthesis_play'; // Final exercises (or the whole practice / jump session)

  // Captured once on purpose: the routes key this component per lesson, so `lesson` never changes under it
  // svelte-ignore state_referenced_locally
  const parts: VersePart[] = lesson.parts && lesson.parts.length > 0 ? lesson.parts : [];
  const hasParts = parts.length > 0;
  const synthesisQuestions = (): Question[] =>
    lesson.finalSynthesisQuestions && lesson.finalSynthesisQuestions.length > 0
      ? lesson.finalSynthesisQuestions
      : lesson.questions;

  let phase = $state<Phase>(hasParts ? 'verse_hook' : 'synthesis_play');
  let partIndex = $state(0);

  let currentPart = $derived<VersePart | null>(hasParts && partIndex < parts.length ? parts[partIndex] : null);

  // ─── Exercise Queue ────────────────────────────────────────────────────────
  // A missed exercise is re-queued at the end of the current set so the learner can
  // answer it correctly before moving on. `key` gives each queue entry a fresh
  // component instance, so a resurfaced question never inherits stale selections.
  interface QueueItem {
    q: Question;
    key: number;
    isRetry: boolean;
  }
  const MAX_RESURFACES = 2;
  let nextKey = 0;
  const toQueue = (qs: Question[]): QueueItem[] => qs.map((q) => ({ q, key: nextKey++, isRetry: false }));

  let queue = $state<QueueItem[]>(hasParts ? [] : toQueue(synthesisQuestions()));
  let queueIndex = $state(0);
  let current = $derived<QueueItem | undefined>(queue[queueIndex]);
  let activeQuestion = $derived<Question | undefined>(current?.q);

  let selectedOption = $state<any>(null);
  let selectedWords = $state<string[]>([]);
  let matchComplete = $state(false);

  let isChecked = $state(false);
  let isCorrect = $state(false);
  let showFeedback = $state(false);
  let encouragement = $state('');
  let isGameOver = $state(false);
  let isLessonCompleted = $state(false);
  let showFloatingXP = $state(false);
  let showStreak = $state(false);
  let showQuit = $state(false);
  let sessionResult = $state<SessionResult | null>(null);
  let combo = $state(0);

  // Session tracking
  let missedWords = new Set<string>();
  let resurfaceCounts: Record<string, number> = {};
  let matchHadMistake = false;
  let correctCount = 0;
  let wrongCount = 0;
  let startedAt = Date.now();
  let summary = $state<{ accuracy: number; seconds: number } | null>(null);

  let canCheck = $derived(() => {
    if (!activeQuestion) return false;
    if (activeQuestion.type === 'phrase_matching') return matchComplete;
    if (activeQuestion.type === 'sentence_rebuilding') return selectedWords.length > 0;
    return selectedOption !== null;
  });

  // One continuous bar across intro → parts → final stage, like a single Duolingo lesson
  const totalSteps = hasParts ? parts.length * 2 + 2 : 1;
  let progress = $derived.by(() => {
    const queueFrac = queue.length ? (queueIndex + (isChecked && isCorrect ? 1 : 0)) / queue.length : 0;
    if (!hasParts) return isLessonCompleted ? 1 : queueFrac;
    let step = 0;
    let frac = 0;
    if (phase === 'word_discover') step = 1 + partIndex * 2;
    else if (phase === 'part_play') { step = 2 + partIndex * 2; frac = queueFrac; }
    else if (phase === 'synthesis_intro') step = 1 + parts.length * 2;
    else if (phase === 'synthesis_play') { step = 1 + parts.length * 2; frac = queueFrac; }
    return (step + frac) / totalSteps;
  });

  // ─── Phase Transitions ─────────────────────────────────────────────────────
  function startExerciseSet(qs: Question[]) {
    queue = toQueue(qs);
    queueIndex = 0;
    resetSelection();
  }

  function resetSelection() {
    selectedOption = null;
    selectedWords = [];
    matchComplete = false;
    matchHadMistake = false;
    isChecked = false;
    isCorrect = false;
    showFeedback = false;
    encouragement = '';
  }

  function handleVerseHookComplete() {
    partIndex = 0;
    phase = 'word_discover';
  }

  function handleWordDiscoveryComplete() {
    startExerciseSet(currentPart ? currentPart.questions : lesson.questions);
    phase = 'part_play';
  }

  function handlePartPlayComplete() {
    if (partIndex + 1 < parts.length) {
      partIndex += 1;
      phase = 'word_discover';
    } else {
      phase = 'synthesis_intro';
    }
  }

  function startSynthesisPlay() {
    startExerciseSet(synthesisQuestions());
    phase = 'synthesis_play';
  }

  // ─── Exercise Handlers ─────────────────────────────────────────────────────
  function loseHeart() {
    if (isPractice) return; // practice is low-stakes
    if (isJump) {
      jumpMistakes += 1;
      return;
    }
    gameState.decrementHeart();
  }

  function outOfLives(): boolean {
    if (isJump) return jumpMistakes > JUMP_MISTAKES_ALLOWED;
    return !isPractice && gameState.hearts <= 0;
  }

  function handleMatchIncorrect(confusedTerms: string[]) {
    matchHadMistake = true;
    wrongCount += 1;
    confusedTerms.flatMap((t) => t.split(/\s+/)).forEach((w) => missedWords.add(w));
    loseHeart();
    if (outOfLives()) isGameOver = true;
  }

  function handleSelect(val: any) {
    if (isChecked) return;
    selectedOption = val;
  }

  function handleWordChange(words: string[]) {
    if (isChecked) return;
    selectedWords = words;
  }

  const normalize = (s: string) =>
    s.trim().toLowerCase().replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, '');

  function resurface(item: QueueItem): boolean {
    const count = resurfaceCounts[item.q.id] ?? 0;
    if (count >= MAX_RESURFACES) return false;
    resurfaceCounts[item.q.id] = count + 1;
    queue.push({ q: item.q, key: nextKey++, isRetry: true });
    return true;
  }

  const EFFORT_PRAISE = [
    'Your steady practice is paying off.',
    'Great focus!',
    'Effort like this builds real understanding.',
    'Abhyāsa — steady practice — at work!',
    "You're getting the hang of this."
  ];

  function pickEncouragement(item: QueueItem, willResurface: boolean): string {
    if (!isCorrect) {
      combo = 0;
      return willResurface ? "Mistakes are how we learn — we'll come back to this one." : '';
    }
    if (item.q.type === 'phrase_matching' && matchHadMistake) {
      combo = 0;
      return 'All matched — nice recovery!';
    }
    combo += 1;
    if (item.isRetry) return 'You got it this time — that is how learning sticks.';
    if (combo === 3 || (combo > 3 && combo % 5 === 0)) return `${combo} in a row!`;
    // Praise at unpredictable moments lands harder than praise after every answer
    if (Math.random() < 0.3) return EFFORT_PRAISE[Math.floor(Math.random() * EFFORT_PRAISE.length)];
    return '';
  }

  function checkAnswer() {
    if (!canCheck() || isChecked || !current) return;
    isChecked = true;
    const q = current.q;

    switch (q.type) {
      case 'phrase_matching':
        isCorrect = true;
        break;
      case 'multiple_choice':
        isCorrect = selectedOption.isCorrect;
        break;
      case 'fill_in_the_blank':
        isCorrect = normalize(selectedOption) === normalize(q.answer);
        break;
      case 'listening':
        isCorrect = selectedOption === q.answer;
        break;
      case 'sentence_rebuilding':
        isCorrect = normalize(selectedWords.join(' ')) === normalize(q.targetSentence);
        break;
    }

    let willResurface = false;
    if (isCorrect) {
      correctCount += 1;
    } else {
      wrongCount += 1;
      loseHeart();
      wordsTestedBy(q).forEach((w) => missedWords.add(w));
      willResurface = !isJump && resurface(current);
    }
    encouragement = pickEncouragement(current, willResurface);
    showFeedback = true;

    if (outOfLives()) {
      setTimeout(() => { if (outOfLives()) isGameOver = true; }, 800);
    }
  }

  function handleContinue() {
    resetSelection();
    if (queueIndex < queue.length - 1) {
      queueIndex += 1;
    } else if (phase === 'part_play') {
      handlePartPlayComplete();
    } else {
      finishSession();
    }
  }

  function finishSession() {
    const words = lessonWords(lesson).map((w) => w.word);
    const missed = [...missedWords];
    sessionResult = isPractice
      ? gameState.completePractice(words, missed)
      : isJump
        ? gameState.completeJump(jumpLessonIds, words, missed)
        : gameState.completeLesson(lesson.id, words, missed);
    const attempts = correctCount + wrongCount;
    summary = {
      accuracy: attempts ? Math.round((correctCount / attempts) * 100) : 100,
      seconds: Math.round((Date.now() - startedAt) / 1000)
    };
    isLessonCompleted = true;
    showFloatingXP = true;
  }

  function handleCompleteContinue() {
    if (sessionResult?.streakExtended) showStreak = true;
    else onExit();
  }

  function restartLesson() {
    if (!isJump) gameState.refillHearts();
    jumpMistakes = 0;
    partIndex = 0;
    missedWords = new Set();
    resurfaceCounts = {};
    combo = 0;
    correctCount = 0;
    wrongCount = 0;
    startedAt = Date.now();
    summary = null;
    isGameOver = false;
    isLessonCompleted = false;
    showFloatingXP = false;
    showStreak = false;
    sessionResult = null;
    if (hasParts) {
      queue = [];
      queueIndex = 0;
      resetSelection();
      phase = 'verse_hook';
    } else {
      startExerciseSet(synthesisQuestions());
      phase = 'synthesis_play';
    }
  }

  // Enter checks / continues, as on Duolingo's web app. Focused controls handle their own Enter.
  function onKey(e: KeyboardEvent) {
    if (e.key !== 'Enter' || showQuit || isGameOver || isLessonCompleted) return;
    if ((e.target as HTMLElement | null)?.closest?.('button, textarea, input')) return;
    if (phase === 'synthesis_intro') return startSynthesisPlay();
    if (phase !== 'part_play' && phase !== 'synthesis_play') return;
    if (showFeedback) handleContinue();
    else checkAnswer();
  }

  // ─── Presentation helpers ──────────────────────────────────────────────────
  const cleanPrompt = (p: string) => p.replace(/^[A-Z][A-Z\s]+:\s*/, '');

  function titleFor(q: Question): string {
    switch (q.type) {
      case 'phrase_matching': return 'Tap the matching pairs';
      case 'fill_in_the_blank': return 'Fill in the blank';
      case 'listening': return 'Tap what you hear';
      default: return cleanPrompt(q.prompt);
    }
  }

  let correctAnswerText = $derived(() => {
    if (!activeQuestion) return '';
    switch (activeQuestion.type) {
      case 'multiple_choice':
        return activeQuestion.options.find((o) => o.isCorrect)?.text || '';
      case 'fill_in_the_blank':
        return activeQuestion.answer;
      case 'sentence_rebuilding':
        return activeQuestion.targetSentence;
      case 'listening': {
        const q = activeQuestion;
        const opt = q.options.find((o) => o.word === q.answer);
        return opt ? `${opt.devanagari} (${opt.word})` : q.answer;
      }
      default:
        return '';
    }
  });

  let explanationText = $derived(() => {
    if (!activeQuestion) return '';
    switch (activeQuestion.type) {
      case 'multiple_choice':
        return selectedOption?.explanation || activeQuestion.options.find((o) => o.isCorrect)?.explanation || '';
      case 'fill_in_the_blank':
      case 'sentence_rebuilding':
      case 'listening':
        return activeQuestion.explanation;
      default:
        return '';
    }
  });

  const completion = $derived.by(() => {
    if (isPractice) return {
      title: 'Practice complete!',
      subtitle: `You reviewed ${lesson.wordBreakdown.length} words. Reviewing just as you begin to forget is what makes them stay.`
    };
    if (isJump) return {
      title: 'You jumped ahead!',
      subtitle: `${jumpLessonIds.length} verse${jumpLessonIds.length === 1 ? '' : 's'} skipped — ${lesson.verseRef} is unlocked. Their words will come back in Practice.`
    };
    return { title: 'Lesson complete!', subtitle: goalNudge(gameState.profile) || `You've learned ${lesson.verseRef}, ${lesson.title}.` };
  });

  const accuracyLabel = (a: number) => (a === 100 ? 'Amazing' : a >= 80 ? 'Great' : a >= 60 ? 'Good' : 'Steady');
  const formatTime = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
</script>

<svelte:window onkeydown={onKey} />

{#snippet statCard(label: string, color: string, icon: IconName, value: string)}
  <div class="rounded-2xl border-2 overflow-hidden animate-pop-in" style="border-color: {color}; background: {color}">
    <p class="text-[11px] font-black uppercase tracking-wider text-white py-1">{label}</p>
    <div class="bg-bg-base rounded-[14px] py-3 flex items-center justify-center gap-1.5" style="color: {color}">
      <Icon name={icon} class="w-5 h-5" />
      <span class="text-lg font-black tabular-nums">{value}</span>
    </div>
  </div>
{/snippet}

<div class="w-full h-full flex flex-col bg-bg-base text-text-primary relative select-none overflow-hidden">

  {#if showStreak}
    <StreakCelebration streak={gameState.streak} activeDays={gameState.activeDays} onContinue={onExit} />

  {:else if isGameOver}
    <!-- ═══ OUT OF HEARTS / JUMP TEST NOT PASSED ═══ -->
    <div class="flex-1 flex flex-col items-center justify-center px-6 text-center animate-[fade-in_0.3s_ease-out]">
      <Mascot mood="sad" size="xl" />
      <h1 class="text-3xl font-black mt-6">{isJump ? 'Not quite yet!' : 'You ran out of hearts!'}</h1>
      <p class="text-base font-bold text-text-muted mt-2 max-w-xs leading-relaxed">
        {isJump
          ? 'The earlier verses still have something to teach you. Work through them in order, or try the test again.'
          : 'Mistakes are part of the path. Refill your hearts and try again.'}
      </p>
    </div>
    <div class="lesson-footer flex flex-col gap-3">
      {#if isJump}
        <button onclick={onExit} class="btn btn-primary w-full">Back to the path</button>
        <button onclick={restartLesson} class="btn btn-ghost w-full">Try the test again</button>
      {:else}
        <button onclick={restartLesson} class="btn btn-primary w-full">
          <Icon name="heart" class="w-5 h-5" /> Refill hearts and retry
        </button>
        <button onclick={onExit} class="btn btn-ghost w-full">No thanks</button>
      {/if}
    </div>

  {:else if isLessonCompleted && sessionResult && summary}
    <!-- ═══ SESSION COMPLETE ═══ -->
    <div class="flex-1 overflow-y-auto scrollbar-none flex flex-col items-center justify-center px-6 py-8 text-center relative animate-[fade-in_0.3s_ease-out]">
      {#if showFloatingXP}
        <div class="absolute top-[18%] z-10 animate-float-xp font-black text-3xl text-gold flex items-center gap-1 pointer-events-none">
          +{sessionResult.xpEarned} XP
        </div>
      {/if}

      <Mascot mood="happy" size="xl" animate={true} />
      <h1 class="text-3xl font-black text-gold mt-6">{completion.title}</h1>
      <p class="text-base font-bold text-text-muted mt-2 max-w-xs leading-relaxed">{completion.subtitle}</p>

      <div class="grid grid-cols-3 gap-3 w-full mt-8">
        {@render statCard('Total XP', 'var(--color-gold)', 'bolt', String(sessionResult.xpEarned))}
        {@render statCard(accuracyLabel(summary.accuracy), 'var(--color-success)', 'target', `${summary.accuracy}%`)}
        {@render statCard(summary.seconds <= 150 ? 'Speedy' : 'Committed', 'var(--color-info)', 'clock', formatTime(summary.seconds))}
      </div>

      {#if sessionResult.goalJustMet}
        <p class="mt-6 flex items-center gap-2 text-success font-black text-base animate-pop-in">
          <Icon name="check" class="w-5 h-5" /> Daily goal reached!
        </p>
      {/if}
    </div>
    <div class="lesson-footer">
      <button onclick={handleCompleteContinue} class="btn btn-primary w-full">Continue</button>
    </div>

  {:else}
    <LessonProgress {progress} {combo} onCancel={() => (showQuit = true)} showHearts={mode === 'lesson'} />

    {#if phase === 'verse_hook'}
      <VerseHookScreen {lesson} onComplete={handleVerseHookComplete} autoPlay={cfg.autoPlayRecitation} />

    {:else if phase === 'word_discover' && currentPart}
      <WordDiscoveryScreen
        part={currentPart}
        partIndex={partIndex + 1}
        totalParts={parts.length}
        onComplete={handleWordDiscoveryComplete}
        canSkip={cfg.skippableDiscovery}
      />

    {:else if phase === 'synthesis_intro'}
      <!-- ═══ FINAL STAGE INTRO ═══ -->
      <div class="flex-1 overflow-y-auto scrollbar-none px-5 pt-4 pb-6 flex flex-col gap-5">
        <div>
          <p class="text-sm font-extrabold uppercase tracking-wider text-gold-dark dark:text-gold flex items-center gap-1.5">
            <Icon name="star" class="w-4 h-4" /> Final stage
          </p>
          <h2 class="text-2xl font-black leading-tight mt-1">Put the whole verse together</h2>
        </div>
        <div class="flex items-center gap-2">
          <div class="shrink-0 -ml-1"><Mascot mood="happy" size="md" /></div>
          <div class="bubble bubble-left flex-1">
            <p class="text-[15px] font-bold">You've learned every part. Now let's master the full verse!</p>
          </div>
        </div>
        <div class="card p-5 flex flex-col gap-3">
          <p class="text-xs font-black uppercase tracking-wider text-primary">{lesson.verseRef}</p>
          <div class="text-center">
            <VerseText
              sanskrit={lesson.verseSanskrit}
              transliteration={lesson.verseTransliteration}
              class="text-lg font-bold text-primary-dark dark:text-primary leading-relaxed"
            />
          </div>
          <p class="text-[15px] font-bold text-text-muted leading-relaxed pt-3 border-t-2 border-border-warm">{lesson.translation}</p>
          {#if cfg.meaningFocus && lesson.commentary}
            <div class="pt-3 border-t-2 border-border-warm flex flex-col gap-1">
              <p class="text-xs font-black uppercase tracking-wider text-accent">Commentary · {lesson.commentary.author}</p>
              <p class="text-[15px] font-semibold leading-relaxed">{lesson.commentary.text}</p>
              <p class="text-xs font-bold text-text-muted">{lesson.commentary.tradition}</p>
            </div>
          {/if}
        </div>
      </div>
      <div class="lesson-footer">
        <button onclick={startSynthesisPlay} class="btn btn-primary w-full">Continue</button>
      </div>

    {:else if current && activeQuestion}
      <!-- ═══ EXERCISE ═══ -->
      <div class="flex-1 overflow-y-auto scrollbar-none px-5 pt-4 {showFeedback ? 'pb-56' : 'pb-6'}">
        {#if current.isRetry}
          <p class="flex items-center gap-1.5 text-sm font-extrabold uppercase tracking-wider text-primary mb-1">
            <Icon name="retry" class="w-4 h-4" /> Previous mistake
          </p>
        {:else if isJump}
          {@const left = Math.max(0, JUMP_MISTAKES_ALLOWED - jumpMistakes)}
          <p class="text-sm font-extrabold uppercase tracking-wider text-accent mb-1">
            Jump test · {left} mistake{left === 1 ? '' : 's'} left
          </p>
        {:else if isPractice}
          <p class="text-sm font-extrabold uppercase tracking-wider text-accent mb-1">{lesson.title}</p>
        {:else if phase === 'synthesis_play'}
          <p class="flex items-center gap-1.5 text-sm font-extrabold uppercase tracking-wider text-gold-dark dark:text-gold mb-1">
            <Icon name="star" class="w-4 h-4" /> Full verse
          </p>
        {:else if currentPart}
          <p class="text-sm font-extrabold uppercase tracking-wider text-text-muted mb-1">Part {partIndex + 1} of {parts.length}</p>
        {/if}

        {#if activeQuestion.type !== 'reflection'}
          <h2 class="text-2xl font-black leading-tight">{titleFor(activeQuestion)}</h2>
          {#if activeQuestion.type === 'phrase_matching'}
            <p class="text-[15px] font-bold text-text-muted mt-1">{cleanPrompt(activeQuestion.prompt)}</p>
          {/if}
        {/if}

        <div class="mt-6">
          {#key current.key}
            {#if activeQuestion.type === 'reflection'}
              <ReflectionPrompt
                promptId={activeQuestion.id}
                prompt={activeQuestion.prompt}
                verseContext={activeQuestion.verseContext || lesson.translation}
                guidance={activeQuestion.guidance}
                onComplete={handleContinue}
              />
            {:else if activeQuestion.type === 'phrase_matching'}
              <PhraseMatcher
                pairs={activeQuestion.pairs}
                onIncorrect={handleMatchIncorrect}
                onAllMatched={() => (matchComplete = true)}
              />
            {:else if activeQuestion.type === 'sentence_rebuilding'}
              <WordTilePicker tiles={activeQuestion.tiles} onChange={handleWordChange} disabled={isChecked} />
            {:else if activeQuestion.type === 'fill_in_the_blank'}
              <FillInBlank
                prompt={activeQuestion.prompt}
                translation={activeQuestion.translation}
                options={activeQuestion.options}
                onSelect={handleSelect}
                showTranslation={cfg.translationHints}
                disabled={isChecked}
              />
            {:else if activeQuestion.type === 'multiple_choice'}
              <MultipleChoice options={activeQuestion.options} onSelect={handleSelect} disabled={isChecked} />
            {:else if activeQuestion.type === 'listening'}
              <ListeningChoice
                audioText={activeQuestion.audioText}
                options={activeQuestion.options}
                onSelect={handleSelect}
                disabled={isChecked}
              />
            {/if}
          {/key}
        </div>
      </div>

      {#if activeQuestion.type !== 'reflection'}
        <div class="lesson-footer">
          <button
            onclick={checkAnswer}
            disabled={!canCheck() || isChecked}
            class="btn w-full {canCheck() && !isChecked ? 'btn-primary' : 'btn-disabled'}"
          >
            Check
          </button>
        </div>
      {/if}

      {#if showFeedback}
        <FeedbackModal
          {isCorrect}
          correctAnswerText={correctAnswerText()}
          explanation={explanationText()}
          {encouragement}
          onContinue={handleContinue}
        />
      {/if}
    {/if}

    <!-- ═══ QUIT CONFIRMATION ═══ -->
    {#if showQuit}
      <button
        type="button"
        aria-label="Keep learning"
        class="absolute inset-0 z-40 bg-black/40 animate-[fade-in_0.15s_ease-out] cursor-default"
        onclick={() => (showQuit = false)}
      ></button>
      <div class="absolute inset-x-0 bottom-0 z-50 bg-bg-base rounded-t-3xl px-6 pt-6 pb-6 flex flex-col items-center text-center animate-sheet-up">
        <Mascot mood="sad" size="lg" />
        <h2 class="text-2xl font-black mt-3">Wait, don't go!</h2>
        <p class="text-base font-bold text-text-muted mt-1">
          {isPractice ? "You're so close to finishing this review." : "You'll lose your progress if you quit now."}
        </p>
        <button onclick={() => (showQuit = false)} class="btn btn-primary w-full mt-6">Keep learning</button>
        <button onclick={onExit} class="btn btn-ghost w-full mt-2 text-error!">End session</button>
      </div>
    {/if}
  {/if}
</div>
