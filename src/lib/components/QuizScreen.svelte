<script lang="ts">
  import { onMount } from 'svelte';
  import { gameState, type SessionResult } from '../state/gameState.svelte';
  import type { Lesson, Question } from '../data/gitaData';
  import { lessonWords, lookupMeaning, wordsTestedBy } from '../data/practice';
  import { learningConfig } from '../data/learningConfig';
  import { romanWords, scriptText, wordKey } from '../data/hindi';
  import LessonProgress from './LessonProgress.svelte';
  import FeedbackModal from './FeedbackModal.svelte';
  import PhraseMatcher from './PhraseMatcher.svelte';
  import MultipleChoice from './MultipleChoice.svelte';
  import FillInBlank from './FillInBlank.svelte';
  import ListeningChoice from './ListeningChoice.svelte';
  import TranslateExercise from './TranslateExercise.svelte';
  import ReflectionPrompt from './ReflectionPrompt.svelte';
  import CompleteFlow from './CompleteFlow.svelte';
  import Mascot, { preloadMascots, type MascotMood } from './Mascot.svelte';
  import Icon from './Icon.svelte';

  // The exercise engine for practice reviews and "Jump here?" tests. Verses themselves are taught by
  // JourneyScreen; both of these play one flat queue of exercises.
  let { lesson, onExit, mode, jumpLessonIds = [], targetLessonId } = $props<{
    lesson: Lesson;
    onExit: () => void;
    mode: 'practice' | 'jump';
    /** Lessons marked complete when a jump test is passed */
    jumpLessonIds?: string[];
    /** The real lesson id a jump test targets — `lesson.id` is a synthetic id for jump mode */
    targetLessonId?: string;
  }>();

  const isPractice = $derived(mode === 'practice');
  const isJump = $derived(mode === 'jump');
  const cfg = learningConfig(gameState.profile);

  // A jump test is a placement check: hearts aren't spent, but too many mistakes ends it
  const JUMP_MISTAKES_ALLOWED = 3;
  let jumpMistakes = $state(0);

  const synthesisQuestions = (): Question[] =>
    lesson.finalSynthesisQuestions && lesson.finalSynthesisQuestions.length > 0
      ? lesson.finalSynthesisQuestions
      : lesson.questions;

  // ─── Exercise Queue ────────────────────────────────────────────────────────
  // A missed exercise is re-queued at the end of the set so the learner can
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

  let queue = $state<QueueItem[]>(toQueue(synthesisQuestions()));
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
  let showQuit = $state(false);
  let sessionResult = $state<SessionResult | null>(null);
  let combo = $state(0);
  // A correct translate answer in a different word order from the reference
  let translatedDifferently = $state(false);

  // Session tracking
  let missedWords = new Set<string>();
  let resurfaceCounts: Record<string, number> = {};
  let matchHadMistake = false;
  let correctCount = 0;
  let wrongCount = 0;
  let startedAt = Date.now();
  let summary = $state<{ accuracy: number; seconds: number } | null>(null);

  // ─── Krishna's in-exercise reactions, like Duolingo's characters ──────────
  let matchShock = $state(false);
  let shockTimer: ReturnType<typeof setTimeout> | undefined;

  const exerciseMood = $derived.by((): MascotMood => {
    if (isChecked) {
      if (isCorrect) return combo >= 5 ? 'amazed' : combo >= 3 ? 'excited' : 'cheerful';
      return isJump && jumpMistakes >= JUMP_MISTAKES_ALLOWED ? 'worried' : 'disappointed';
    }
    return matchShock ? 'shocked' : 'default';
  });

  onMount(() => {
    preloadMascots(['default', 'cheerful', 'excited', 'amazed', 'disappointed', 'worried', 'shocked', 'celebrating', 'crying', 'puppy', 'proud']);
    return () => clearTimeout(shockTimer);
  });

  let canCheck = $derived(() => {
    if (!activeQuestion) return false;
    if (activeQuestion.type === 'phrase_matching') return matchComplete;
    if (activeQuestion.type === 'translate') return selectedWords.length > 0;
    return selectedOption !== null;
  });

  // One continuous bar across the whole queue
  let progress = $derived.by(() => {
    if (isLessonCompleted) return 1;
    return queue.length ? (queueIndex + (isChecked && isCorrect ? 1 : 0)) / queue.length : 0;
  });

  function resetSelection() {
    selectedOption = null;
    selectedWords = [];
    matchComplete = false;
    matchHadMistake = false;
    isChecked = false;
    isCorrect = false;
    translatedDifferently = false;
    showFeedback = false;
    encouragement = '';
  }

  // ─── Exercise Handlers ─────────────────────────────────────────────────────
  // Practice is low-stakes, and a jump test counts mistakes instead of spending hearts
  function recordMistake() {
    if (isJump) jumpMistakes += 1;
  }

  function outOfLives(): boolean {
    return isJump && jumpMistakes > JUMP_MISTAKES_ALLOWED;
  }

  function handleMatchIncorrect(confusedTerms: string[]) {
    matchHadMistake = true;
    matchShock = true;
    clearTimeout(shockTimer);
    shockTimer = setTimeout(() => (matchShock = false), 900);
    wrongCount += 1;
    // A single vocabulary word (even one written as two, like "tyag kar") is one memory key; a phrase is several
    confusedTerms.flatMap((t) => (lookupMeaning(wordKey(t)) ? [wordKey(t)] : romanWords(t))).forEach((w) => missedWords.add(w));
    recordMistake();
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

  // Words that carry grammar rather than meaning in a translate answer, so leaving one out is fine
  const GRAMMAR_WORDS = new Set(['a', 'an', 'the', 'is', 'are', 'was', 'be', 'in', 'of', 'to', 'at', 'by', 'for', 'and', 'it', 'do', 'does', 'as']);

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
    'Abhyasa — steady practice — at work!',
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
      case 'translate': {
        // The prompt is Hindi, the answer always English. Graded on meaning, not on one fixed English sentence: English allows many valid orders
        // ("your right is only in action" / "action is your only right"), and small grammar words
        // are the learner's choice. Right = every meaning word of the reference, no decoys; a
        // different phrasing still gets the reference shown.
        // Tiles are phrase chunks, so split them back into words before comparing
        const answerWords = q.answer.split(/\s+/).map(normalize);
        const given = selectedWords.flatMap((t) => t.split(/\s+/)).map(normalize);
        const meaningWords = (ws: string[]) => ws.filter((w) => !GRAMMAR_WORDS.has(w)).sort().join(' ');
        const onlyAnswerWords = given.every((w) => answerWords.includes(w));
        isCorrect = onlyAnswerWords && meaningWords(given) === meaningWords(answerWords);
        translatedDifferently = isCorrect && normalize(selectedWords.join(' ')) !== normalize(q.answer);
        break;
      }
    }

    let willResurface = false;
    if (isCorrect) {
      correctCount += 1;
    } else {
      wrongCount += 1;
      recordMistake();
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
    if (queueIndex < queue.length - 1) queueIndex += 1;
    else finishSession();
  }

  function finishSession() {
    const words = lessonWords(lesson).map((w) => w.word);
    const missed = [...missedWords];
    sessionResult = isPractice
      ? gameState.completePractice(words, missed)
      : gameState.completeJump(jumpLessonIds, words, missed);
    const attempts = correctCount + wrongCount;
    summary = {
      accuracy: attempts ? Math.round((correctCount / attempts) * 100) : 100,
      seconds: Math.round((Date.now() - startedAt) / 1000)
    };
    isLessonCompleted = true;
  }

  function restartLesson() {
    jumpMistakes = 0;
    missedWords = new Set();
    resurfaceCounts = {};
    combo = 0;
    correctCount = 0;
    wrongCount = 0;
    startedAt = Date.now();
    summary = null;
    isGameOver = false;
    isLessonCompleted = false;
    sessionResult = null;
    queue = toQueue(synthesisQuestions());
    queueIndex = 0;
    resetSelection();
  }

  // Enter checks / continues, as on Duolingo's web app. Focused controls handle their own Enter.
  function onKey(e: KeyboardEvent) {
    if (e.key !== 'Enter' || showQuit || isGameOver || isLessonCompleted) return;
    if ((e.target as HTMLElement | null)?.closest?.('button, textarea, input')) return;
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
      case 'translate': return 'Translate this sentence';
      default: return cleanPrompt(q.prompt);
    }
  }

  let correctAnswerText = $derived(() => {
    if (!activeQuestion) return '';
    switch (activeQuestion.type) {
      case 'multiple_choice':
        return activeQuestion.options.find((o) => o.isCorrect)?.text || '';
      case 'fill_in_the_blank':
        return activeQuestion.sentence.replace('____', activeQuestion.answer);
      case 'translate':
        return activeQuestion.answer;
      case 'listening': {
        // The answer word, written in the learner's script
        const q = activeQuestion;
        const heard = q.options.find((o) => o.word === q.answer);
        return heard ? scriptText({ dev: heard.devanagari, roman: heard.word }, gameState.tierScriptMode) : q.answer;
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
      case 'listening':
        return activeQuestion.explanation;
      case 'translate':
        return translatedDifferently
          ? `Another way to say it: "${activeQuestion.answer}"`
          : activeQuestion.explanation ?? '';
      default:
        return '';
    }
  });

  const completion = $derived.by(() =>
    isPractice
      ? {
          title: 'Practice complete!',
          subtitle: `You reviewed ${lesson.wordBreakdown.length} words. Reviewing just as you begin to forget is what makes them stay.`
        }
      : {
          title: 'You jumped ahead!',
          subtitle: `${jumpLessonIds.length} verse${jumpLessonIds.length === 1 ? '' : 's'} skipped — ${lesson.verseRef} is unlocked. Their words will come back in Practice.`
        }
  );
</script>

<svelte:window onkeydown={onKey} />

<div class="w-full h-full flex flex-col bg-bg-base text-text-primary relative select-none overflow-hidden">

  {#if isGameOver}
    <!-- ═══ JUMP TEST NOT PASSED ═══ -->
    <div class="flex-1 flex flex-col items-center justify-center px-6 text-center animate-[fade-in_0.3s_ease-out]">
      <Mascot mood="disappointed" size="xl" />
      <h1 class="text-3xl font-black mt-6">Not quite yet!</h1>
      <p class="text-base font-bold text-text-muted mt-2 max-w-xs leading-relaxed">
        The earlier verses still have something to teach you. Work through them in order, or try the test again.
      </p>
    </div>
    <div class="lesson-footer flex flex-col gap-3">
      <button onclick={onExit} class="btn btn-primary w-full">Back to the path</button>
      <button onclick={restartLesson} class="btn btn-ghost w-full">Try the test again</button>
    </div>

  {:else if isLessonCompleted && sessionResult && summary}
    <CompleteFlow
      {sessionResult}
      {summary}
      title={completion.title}
      subtitle={completion.subtitle}
      storyLessonId={isJump ? targetLessonId : undefined}
      {onExit}
    />

  {:else}
    <LessonProgress {progress} {combo} onCancel={() => (showQuit = true)} showHearts={false} />

    {#if current && activeQuestion}
      <!-- ═══ EXERCISE ═══ -->
      <div class="flex-1 overflow-y-auto scrollbar-none px-5 pt-4 {showFeedback ? 'pb-56' : 'pb-6'}">
        <div class="flex items-end gap-3">
          <div class="flex-1 min-w-0">
            {#if current.isRetry}
              <p class="flex items-center gap-1.5 text-sm font-extrabold uppercase tracking-wider text-primary mb-1">
                <Icon name="retry" class="w-4 h-4" /> Previous mistake
              </p>
            {:else if isJump}
              {@const left = Math.max(0, JUMP_MISTAKES_ALLOWED - jumpMistakes)}
              <p class="text-sm font-extrabold uppercase tracking-wider text-accent mb-1">
                Jump test · {left} mistake{left === 1 ? '' : 's'} left
              </p>
            {:else}
              <p class="text-sm font-extrabold uppercase tracking-wider text-accent mb-1">{lesson.title}</p>
            {/if}

            {#if activeQuestion.type !== 'reflection'}
              <h2 class="text-2xl font-black leading-tight">{titleFor(activeQuestion)}</h2>
              {#if activeQuestion.type === 'phrase_matching'}
                <p class="text-[15px] font-bold text-text-muted mt-1">{cleanPrompt(activeQuestion.prompt)}</p>
              {/if}
            {/if}
          </div>
          <!-- Fill-in-the-blank and translate show Krishna beside their speech bubble instead; reflections have their own -->
          {#if activeQuestion.type !== 'reflection' && activeQuestion.type !== 'fill_in_the_blank' && activeQuestion.type !== 'translate'}
            <Mascot mood={exerciseMood} size="lg" />
          {/if}
        </div>

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
                voice={isPractice}
                onIncorrect={handleMatchIncorrect}
                onAllMatched={() => (matchComplete = true)}
              />
            {:else if activeQuestion.type === 'translate'}
              <TranslateExercise
                hindi={activeQuestion.hindi}
                tiles={activeQuestion.tiles}
                clues={activeQuestion.clues}
                onChange={handleWordChange}
                disabled={isChecked}
                mascotMood={exerciseMood}
                autoPlay={cfg.autoPlayRecitation}
              />
            {:else if activeQuestion.type === 'fill_in_the_blank'}
              <FillInBlank
                hindi={activeQuestion.hindi}
                sentence={activeQuestion.sentence}
                options={activeQuestion.options}
                onSelect={handleSelect}
                disabled={isChecked}
                mascotMood={exerciseMood}
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
      <div class="absolute inset-x-0 bottom-0 z-50 bg-bg-base rounded-t-3xl px-6 pt-6 pb-[max(1.5rem,env(safe-area-inset-bottom))] flex flex-col items-center text-center animate-sheet-up">
        <Mascot mood="puppy" size="lg" />
        <h2 class="text-2xl font-black mt-3">Wait, don't go!</h2>
        <p class="text-base font-bold text-text-muted mt-1">
          {isPractice ? "You're so close to finishing this review." : "You'll lose your progress in this test if you quit now."}
        </p>
        <button onclick={() => (showQuit = false)} class="btn btn-primary w-full mt-6">Keep learning</button>
        <button onclick={onExit} class="btn btn-ghost w-full mt-2 text-error!">End session</button>
      </div>
    {/if}
  {/if}
</div>
