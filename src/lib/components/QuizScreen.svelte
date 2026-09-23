<script lang="ts">
  import { gameState, type SessionResult } from '../state/gameState.svelte';
  import type { Lesson, VersePart, Question } from '../data/gitaData';
  import { lessonWords, wordsTestedBy } from '../data/practice';
  import { learningConfig, goalNudge } from '../data/learningConfig';
  import VerseText from './VerseText.svelte';
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
    | 'verse_hook'      // Cinematic verse intro
    | 'word_discover'   // Word-by-word card flip discovery
    | 'part_play'       // Exercises for current part
    | 'synthesis_intro' // Full verse assembled
    | 'synthesis_play'; // Final synthesis exercises (or the whole practice session)

  // Captured once on purpose: the routes key this component per lesson, so `lesson` never changes under it
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
  let sessionResult = $state<SessionResult | null>(null);

  // Session tracking (not rendered)
  let missedWords = new Set<string>();
  let resurfaceCounts: Record<string, number> = {};
  let combo = 0;
  let matchHadMistake = false;

  let canCheck = $derived(() => {
    if (!activeQuestion) return false;
    if (activeQuestion.type === 'phrase_matching') return matchComplete;
    if (activeQuestion.type === 'sentence_rebuilding') return selectedWords.length > 0;
    return selectedOption !== null;
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
      return willResurface
        ? "Mistakes are how we learn — we'll come back to this one."
        : 'Look over the answer below and keep going.';
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
    if (!isCorrect) {
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

  // ─── Feedback derived ──────────────────────────────────────────────────────
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
    if (!activeQuestion) return lesson.purport;
    switch (activeQuestion.type) {
      case 'multiple_choice':
        return selectedOption?.explanation || activeQuestion.options.find((o) => o.isCorrect)?.explanation || '';
      case 'fill_in_the_blank':
      case 'sentence_rebuilding':
      case 'listening':
        return activeQuestion.explanation;
      default:
        return lesson.purport;
    }
  });

  let goalProgress = $derived(Math.min(100, Math.round((gameState.today.xp / gameState.dailyGoal) * 100)));
</script>

<div class="w-full h-full flex flex-col bg-bg-base text-text-primary relative select-none">

  {#if showStreak}
    <StreakCelebration streak={gameState.streak} activeDays={gameState.activeDays} onContinue={onExit} />

  {:else if isGameOver && isJump}
    <!-- ═══ JUMP TEST NOT PASSED ═════════════════════════════════════════════ -->
    <div class="absolute inset-0 bg-bg-base/95 flex flex-col items-center justify-center p-6 text-center z-50 animate-[fade-in_0.3s_ease-out]">
      <Mascot mood="sad" size="lg" speechBubble="Not quite yet!" />
      <h1 class="text-2xl font-black text-text-primary font-cinzel tracking-wide mt-4 mb-1">Keep Building</h1>
      <p class="text-text-muted text-xs max-w-xs leading-relaxed mb-6">
        The earlier verses still have something to teach you. Work through them in order — or try the test again.
      </p>
      <div class="flex flex-col gap-3 w-full max-w-xs">
        <button onclick={onExit} class="w-full bg-primary hover:bg-primary-dark text-bg-base font-black py-3.5 rounded-2xl shadow-lg btn-3d border-b-4 border-accent transition-all">
          Back to the Path
        </button>
        <button onclick={restartLesson} class="w-full bg-bg-surface hover:bg-bg-surface-alt text-text-muted font-bold py-3.5 rounded-2xl border border-border-warm active:scale-[0.98] transition-all text-xs">
          Retry the Test
        </button>
      </div>
    </div>

  {:else if isGameOver}
    <!-- ═══ GAME OVER ════════════════════════════════════════════════════════ -->
    <div class="absolute inset-0 bg-bg-base/95 flex flex-col items-center justify-center p-6 text-center z-50 animate-[fade-in_0.3s_ease-out]">
      <Mascot mood="sad" size="lg" speechBubble="Do not lose heart! Try again." />
      <h1 class="text-2xl font-black text-error font-cinzel tracking-wide mt-4 mb-1">Out of Hearts</h1>
      <p class="text-text-muted text-xs max-w-xs leading-relaxed mb-6">
        "Focus on the action without fear of failure. Refill your hearts and try again."
      </p>
      <div class="flex flex-col gap-3 w-full max-w-xs">
        <button onclick={restartLesson} class="w-full bg-primary hover:bg-primary-dark text-bg-base font-black py-3.5 rounded-2xl shadow-lg btn-3d border-b-4 border-accent transition-all">
          Refill Hearts &amp; Retry
        </button>
        <button onclick={onExit} class="w-full bg-bg-surface hover:bg-bg-surface-alt text-text-muted font-bold py-3.5 rounded-2xl border border-border-warm active:scale-[0.98] transition-all text-xs">
          Return to Dashboard
        </button>
      </div>
    </div>

  {:else if isLessonCompleted && sessionResult}
    <!-- ═══ SESSION COMPLETE ═════════════════════════════════════════════════ -->
    <div class="absolute inset-0 bg-bg-base/95 flex flex-col items-center justify-center p-6 text-center z-50 animate-[fade-in_0.3s_ease-out]">

      {#if showFloatingXP}
        <div class="absolute top-1/4 z-50 animate-float-xp font-black text-3xl text-primary drop-shadow-lg flex items-center gap-1">
          <span>+{sessionResult.xpEarned} XP</span>
          <svg viewBox="0 0 24 24" fill="currentColor" class="w-7 h-7 text-primary"><path d="M13 2L3 14h7v8l10-12h-7V2z"/></svg>
        </div>
      {/if}

      {#if isPractice}
        <Mascot mood="happy" size="lg" speechBubble="Memory strengthened!" speechIconType="lightning" />
        <h1 class="text-2xl font-black text-success font-cinzel tracking-wide mt-4 mb-1">Practice Complete!</h1>
        <p class="text-text-muted text-xs max-w-xs mt-2 mb-6 leading-relaxed">
          You reviewed {lesson.wordBreakdown.length} words. Reviewing just as you begin to forget is what makes them stay.
        </p>
      {:else if isJump}
        <Mascot mood="happy" size="lg" speechBubble="You jumped ahead!" speechIconType="trophy" />
        <h1 class="text-2xl font-black text-success font-cinzel tracking-wide mt-4 mb-1">Jumped Ahead!</h1>
        <p class="text-text-muted text-xs max-w-xs mt-2 mb-6 leading-relaxed">
          You skipped {jumpLessonIds.length} verse{jumpLessonIds.length === 1 ? '' : 's'} and unlocked
          <strong class="text-text-primary">{lesson.verseRef}</strong>. Their words will show up in Practice to keep them fresh.
        </p>
      {:else}
        <Mascot mood="happy" size="lg" speechBubble="Verse Mastered!" speechIconType="trophy" />
        <h1 class="text-2xl font-black text-success font-cinzel tracking-wide mt-4 mb-1">Full Verse Mastered!</h1>
        <span class="text-text-muted text-xs font-bold uppercase tracking-widest">{lesson.verseRef} Complete</span>
        <p class="text-text-muted text-xs max-w-xs mt-3 {goalNudge(gameState.profile) ? 'mb-2' : 'mb-6'} leading-relaxed">
          You've mastered every word and assembled the complete verse for <strong class="text-text-primary">{lesson.title}</strong>!
        </p>
        {#if goalNudge(gameState.profile)}
          <p class="text-[11px] text-primary-dark dark:text-primary font-semibold max-w-xs mb-6 leading-relaxed">
            {goalNudge(gameState.profile)}
          </p>
        {/if}
      {/if}

      <div class="bg-bg-surface border border-border-warm rounded-2xl p-4 w-full max-w-xs flex justify-around mb-4 shadow-xl">
        <div class="flex flex-col items-center">
          <div class="flex items-center gap-1 text-primary font-black text-2xl">
            <svg viewBox="0 0 24 24" fill="currentColor" class="w-5 h-5"><path d="M13 2L3 14h7v8l10-12h-7V2z"/></svg>
            <span>{sessionResult.xpEarned}</span>
          </div>
          <span class="text-text-muted text-[9px] uppercase font-bold tracking-wider mt-1">XP Earned</span>
        </div>
        <div class="w-px bg-border-warm"></div>
        {#if isPractice}
          <div class="flex flex-col items-center">
            <div class="flex items-center gap-1 text-success font-black text-2xl">
              <span>{lesson.wordBreakdown.length}</span>
            </div>
            <span class="text-text-muted text-[9px] uppercase font-bold tracking-wider mt-1">Words Reviewed</span>
          </div>
        {:else if isJump}
          <div class="flex flex-col items-center">
            <div class="flex items-center gap-1 text-success font-black text-2xl">
              <span>{jumpLessonIds.length}</span>
            </div>
            <span class="text-text-muted text-[9px] uppercase font-bold tracking-wider mt-1">Verses Skipped</span>
          </div>
        {:else}
          <div class="flex flex-col items-center">
            <div class="flex items-center gap-1 text-error font-black text-2xl">
              <svg viewBox="0 0 24 24" fill="currentColor" class="w-5 h-5 text-error"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>
              <span>{gameState.hearts}</span>
            </div>
            <span class="text-text-muted text-[9px] uppercase font-bold tracking-wider mt-1">Hearts Left</span>
          </div>
        {/if}
      </div>

      <!-- Daily goal progress -->
      <div class="w-full max-w-xs mb-6 text-left">
        <div class="flex items-center justify-between mb-1.5">
          <span class="text-[10px] font-black uppercase tracking-wider {sessionResult.goalJustMet ? 'text-success' : 'text-text-muted'}">
            {sessionResult.goalJustMet ? 'Daily goal reached!' : 'Daily goal'}
          </span>
          <span class="text-[10px] font-bold text-text-muted tabular-nums">{gameState.today.xp}/{gameState.dailyGoal} XP</span>
        </div>
        <div class="h-2.5 bg-border-warm rounded-full overflow-hidden">
          <div
            class="h-full rounded-full transition-all duration-700 {goalProgress >= 100 ? 'bg-success' : 'bg-gradient-to-r from-primary to-primary-dark'}"
            style="width: {goalProgress}%"
          ></div>
        </div>
      </div>

      <button onclick={handleCompleteContinue} class="w-full max-w-xs bg-primary hover:bg-primary-dark text-bg-base font-black py-4 rounded-2xl shadow-lg btn-3d border-b-4 border-accent transition-all text-sm">
        Continue
      </button>
    </div>

  {:else if phase === 'verse_hook'}
    <!-- ═══ VERSE HOOK ═══════════════════════════════════════════════════════ -->
    <VerseHookScreen {lesson} onComplete={handleVerseHookComplete} autoPlay={cfg.autoPlayRecitation} />

  {:else if phase === 'word_discover' && currentPart}
    <!-- ═══ WORD DISCOVERY ═══════════════════════════════════════════════════ -->
    <WordDiscoveryScreen
      part={currentPart}
      partIndex={partIndex + 1}
      totalParts={parts.length}
      onComplete={handleWordDiscoveryComplete}
      canSkip={cfg.skippableDiscovery}
    />

  {:else if phase === 'synthesis_intro'}
    <!-- ═══ SYNTHESIS INTRO ══════════════════════════════════════════════════ -->
    <div class="absolute inset-0 bg-bg-base/95 flex flex-col items-center justify-center p-6 text-center z-40 overflow-y-auto scrollbar-none animate-[fade-in_0.3s_ease-out]">
      <Mascot mood="happy" size="md" speechBubble="Let's assemble the full verse!" />

      <span class="text-[9px] font-black uppercase tracking-[0.25em] px-3 py-1 rounded-full bg-primary/20 text-primary border border-primary/30 mt-4 mb-2">
        FULL VERSE MASTER STAGE
      </span>
      <h2 class="text-2xl font-black text-text-primary font-cinzel tracking-wide mb-2 max-w-xs">
        Merging All Parts Together
      </h2>

      <p class="text-xs text-text-muted max-w-xs leading-relaxed mb-5">
        You've discovered every word. Now let's test your complete mastery of the entire verse.
      </p>

      <div class="bg-bg-surface border border-border-warm p-5 rounded-3xl w-full max-w-xs flex flex-col gap-2.5 mb-6 shadow-2xl text-left">
        <span class="text-[9px] font-black text-primary uppercase tracking-widest block border-b border-border-warm pb-2">
          {lesson.verseRef} · Full Verse:
        </span>
        <VerseText
          sanskrit={lesson.verseSanskrit}
          transliteration={lesson.verseTransliteration}
          class="text-base font-bold text-primary-dark dark:text-primary leading-snug"
        />
        <p class="text-xs text-text-muted italic leading-relaxed pt-2 border-t border-border-warm">
          "{lesson.translation}"
        </p>
        {#if cfg.meaningFocus && lesson.commentary}
          <div class="pt-2 border-t border-border-warm flex flex-col gap-1">
            <span class="text-[9px] font-black text-accent uppercase tracking-widest">
              Commentary · {lesson.commentary.author}
            </span>
            <p class="text-xs text-text-primary leading-relaxed">{lesson.commentary.text}</p>
            <span class="text-[9px] text-text-muted">{lesson.commentary.tradition}</span>
          </div>
        {/if}
      </div>

      <button
        onclick={startSynthesisPlay}
        class="w-full max-w-xs py-4 bg-primary text-bg-base font-black text-sm rounded-2xl shadow-xl btn-3d border-b-4 border-accent hover:brightness-110 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
      >
        <span>SOLVE FULL VERSE</span>
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="w-5 h-5">
          <path fill-rule="evenodd" d="M3 10a.75.75 0 01.75-.75h10.638L10.23 5.29a.75.75 0 111.04-1.08l5.5 5.25a.75.75 0 010 1.08l-5.5 5.25a.75.75 0 11-1.04-1.08l4.158-3.96H3.75A.75.75 0 013 10z" clip-rule="evenodd" />
        </svg>
      </button>
    </div>

  {:else if current && activeQuestion}
    <!-- ═══ EXERCISE PHASE (part_play or synthesis_play) ═════════════════════ -->
    <LessonProgress
      current={queueIndex}
      total={queue.length}
      onCancel={onExit}
      showHearts={mode === 'lesson'}
    />

    <div class="flex-1 flex flex-col items-center overflow-y-auto px-4 py-4 scrollbar-none w-full max-w-md mx-auto">
      <!-- Question header -->
      <div class="text-center w-full mb-4 flex flex-col items-center gap-2">
        {#if current.isRetry}
          <span class="bg-error/15 text-error border border-error/30 text-[9px] px-3 py-0.5 rounded-full font-black uppercase tracking-wider flex items-center gap-1.5">
            <svg viewBox="0 0 20 20" fill="currentColor" class="w-3.5 h-3.5"><path fill-rule="evenodd" d="M15.312 11.424a5.5 5.5 0 01-9.201 2.466l-.312-.311h2.433a.75.75 0 000-1.5H3.989a.75.75 0 00-.75.75v4.242a.75.75 0 001.5 0v-2.43l.31.31a7 7 0 0011.712-3.138.75.75 0 00-1.449-.39zm1.23-3.723a.75.75 0 00.219-.53V2.929a.75.75 0 00-1.5 0V5.36l-.31-.31A7 7 0 003.239 8.188a.75.75 0 101.448.389A5.5 5.5 0 0113.89 6.11l.311.31h-2.432a.75.75 0 000 1.5h4.243a.75.75 0 00.53-.219z" clip-rule="evenodd" /></svg>
            PREVIOUS MISTAKE
          </span>
        {:else if isPractice}
          <span class="bg-accent/15 text-accent border border-accent/30 text-[9px] px-3 py-0.5 rounded-full font-black uppercase tracking-wider">
            PRACTICE
          </span>
        {:else if isJump}
          {@const left = Math.max(0, JUMP_MISTAKES_ALLOWED - jumpMistakes)}
          <span class="bg-accent/15 text-accent border border-accent/30 text-[9px] px-3 py-0.5 rounded-full font-black uppercase tracking-wider">
            JUMP TEST · {left} mistake{left === 1 ? '' : 's'} left
          </span>
        {:else if phase === 'synthesis_play'}
          <span class="bg-primary/20 text-primary border border-primary/40 text-[9px] px-3 py-0.5 rounded-full font-black uppercase tracking-wider flex items-center gap-1.5">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="w-3.5 h-3.5">
              <path fill-rule="evenodd" d="M10.868 2.884c-.321-.772-1.415-.772-1.736 0l-1.83 4.401-4.753.381c-.833.067-1.171 1.107-.536 1.651l3.62 3.102-1.106 4.637c-.194.813.691 1.456 1.405 1.02L10 15.591l4.069 2.485c.713.436 1.598-.207 1.404-1.02l-1.106-4.637 3.62-3.102c.635-.544.297-1.584-.536-1.65l-4.752-.382-1.831-4.401z" clip-rule="evenodd" />
            </svg>
            FULL VERSE MASTER STAGE
          </span>
        {:else if currentPart}
          <div class="flex flex-col items-center gap-1">
            <span class="bg-success/20 text-success border border-success/40 text-[9px] px-3 py-0.5 rounded-full font-black uppercase tracking-wider">
              STEP {partIndex + 1}/{parts.length}
            </span>
            <span class="text-xs font-bold text-text-muted">
              {currentPart.title}
            </span>
          </div>
        {/if}

        <h2 class="text-sm font-bold text-text-primary leading-snug max-w-sm">
          {activeQuestion.prompt}
        </h2>
      </div>

      <!-- Question component — keyed per queue entry so each one mounts fresh -->
      <div class="w-full flex-1 flex flex-col justify-start">
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
            <WordTilePicker tiles={activeQuestion.tiles} onChange={handleWordChange} />
          {:else if activeQuestion.type === 'fill_in_the_blank'}
            <FillInBlank
              prompt={activeQuestion.prompt}
              translation={activeQuestion.translation}
              options={activeQuestion.options}
              onSelect={handleSelect}
              showTranslation={cfg.translationHints}
            />
          {:else if activeQuestion.type === 'multiple_choice'}
            <MultipleChoice options={activeQuestion.options} onSelect={handleSelect} />
          {:else if activeQuestion.type === 'listening'}
            <ListeningChoice
              audioText={activeQuestion.audioText}
              options={activeQuestion.options}
              onSelect={handleSelect}
            />
          {/if}
        {/key}
      </div>
    </div>

    <!-- Check button (hidden for reflection) -->
    {#if activeQuestion.type !== 'reflection'}
      <div class="p-4 bg-bg-surface border-t border-border-warm sticky bottom-0 z-20">
        <button
          onclick={checkAnswer}
          disabled={!canCheck() || isChecked}
          class="w-full py-4 rounded-2xl font-black text-sm select-none transition-all active:scale-[0.98] btn-3d
            {canCheck() && !isChecked
              ? 'bg-primary text-bg-base hover:bg-primary-dark border-b-4 border-accent shadow-lg shadow-primary/10'
              : 'bg-bg-surface-alt text-text-muted/50 border border-border-warm cursor-not-allowed border-b-4 border-b-border-warm'}"
        >
          Check Answer
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
</div>

<style>
  @keyframes fade-in { 0% { opacity: 0; } 100% { opacity: 1; } }
  .scrollbar-none::-webkit-scrollbar { display: none; }
  .scrollbar-none { -ms-overflow-style: none; scrollbar-width: none; }
</style>
