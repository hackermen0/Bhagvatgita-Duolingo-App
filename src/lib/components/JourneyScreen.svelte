<script lang="ts">
  import { onMount, untrack } from 'svelte';
  import { gameState, type SessionResult } from '../state/gameState.svelte';
  import type { HindiText, Lesson, MCQOption, PhrasePair } from '../data/gitaData';
  import {
    JOURNEY_PAGES,
    JOURNEY_PAGE_COUNT,
    clueFor,
    containsPhrase,
    getJourneyContent,
    inVerseOrder,
    journeyPool,
    journeyVariantFor,
    keysFromAnswer,
    keysFromRoman,
    languageName,
    newSeed,
    pickWordBatch,
    reexamWords,
    blankInScript,
    type BlankSet,
    type RecitalClue,
    type JourneyWord
  } from '../data/journey';
  import { scriptText } from '../data/hindi';
  import { shuffle, wrongMeanings } from '../data/practice';
  import { goalNudge } from '../data/learningConfig';
  import { stopSpeaking } from '../utils/speech';
  import LessonProgress from './LessonProgress.svelte';
  import FeedbackModal from './FeedbackModal.svelte';
  import PhraseMatcher from './PhraseMatcher.svelte';
  import MultipleChoice from './MultipleChoice.svelte';
  import ReflectionPrompt from './ReflectionPrompt.svelte';
  import JourneyIntro from './JourneyIntro.svelte';
  import ReciteScreen from './ReciteScreen.svelte';
  import BlankFill from './BlankFill.svelte';
  import SpeakButton from './SpeakButton.svelte';
  import SpokenText, { englishLines, hindiLines } from './SpokenText.svelte';
  import WordFlashcard from './WordFlashcard.svelte';
  import HindiWord from './HindiWord.svelte';
  import CompleteFlow from './CompleteFlow.svelte';
  import Mascot, { preloadMascots, type MascotMood } from './Mascot.svelte';
  import Icon from './Icon.svelte';

  // One verse, one node: a fixed run of pages (see JOURNEY_PAGES). Every finished page is saved as a
  // checkpoint, so leaving part-way resumes at that page instead of the start.
  let { lesson, onExit } = $props<{
    lesson: Lesson;
    onExit: () => void;
  }>();

  // ─── Setup: fresh start, or rebuilt from the saved checkpoint ───────────────
  // The route keys this component per lesson, so `lesson` never changes under it, and the checkpoint is
  // read once: saving progress must not swap the pages underneath the learner.
  // svelte-ignore state_referenced_locally
  const lessonId: string = lesson.id;
  const saved = untrack(() => {
    const c = gameState.checkpointFor(lessonId);
    return c ? $state.snapshot(c) : undefined;
  });
  const seed = saved?.seed ?? newSeed();
  // The tier is fixed for the session (changing it means leaving for Settings), and picks which version of the verse plays
  const tier = untrack(() => gameState.difficultyTier);
  // svelte-ignore state_referenced_locally
  const content = getJourneyContent(lesson, seed, tier);
  const pool = journeyPool(content);
  /** The verse's own language: Medium plays BG 2.48 in Sanskrit */
  const langName = languageName(content);
  /** Whether this tier reads Devanagari (Hard) rather than Roman letters */
  const isDeva = $derived(gameState.tierScriptMode === 'devanagari');

  // Which words each half's flashcards and word-matching page show, fixed for this run (see pickWordBatch).
  // The verse is in two halves and each half's pages only use words said in that half's own Hindi; a word that
  // appears in both (tatha, mein) belongs to both.
  const wordsOfHalf = (h: number): JourneyWord[] => {
    const half = content.halves[h];
    const own = half.words.filter((w) => containsPhrase(half.hindi.roman, w.hindi.roman));
    return own.length ? own : half.words;
  };
  const batches: JourneyWord[][] = [0, 1].map((h) => {
    const own = wordsOfHalf(h);
    const restored = (saved?.batches[h] ?? []).map((k) => own.find((w) => w.key === k)).filter((w): w is JourneyWord => !!w);
    return restored.length ? restored : pickWordBatch(own, untrack(() => gameState.wordMemory), seed + 100 + h);
  });

  const missed = new Set<string>(saved?.missedWords ?? []);
  const seen = new Set<string>(saved?.seenWords ?? []);
  let correct = saved?.correct ?? 0;
  let wrong = saved?.wrong ?? 0;
  const baseMs = saved?.elapsedMs ?? 0;
  const sessionStart = Date.now();
  const elapsedMs = () => baseMs + (Date.now() - sessionStart);

  let page = $state(Math.min(saved?.page ?? 0, JOURNEY_PAGE_COUNT - 1));
  // Bumped to remount the current page from scratch (after running out of hearts)
  let nonce = $state(0);
  const spec = $derived(JOURNEY_PAGES[page]);

  let isGameOver = $state(false);
  let showQuit = $state(false);
  let completed = $state(false);
  let sessionResult = $state<SessionResult | null>(null);
  let summary = $state<{ accuracy: number; seconds: number } | null>(null);

  // Per-page state, cleared whenever a page changes
  let matchComplete = $state(false);
  // Flashcards: which word's screen is showing
  let cardIndex = $state(0);
  let filled = $state<(string | null)[]>([]);
  let isChecked = $state(false);
  let isCorrect = $state(false);
  let showFeedback = $state(false);
  let matchShock = $state(false);
  let shockTimer: ReturnType<typeof setTimeout> | undefined;

  function resetPageState() {
    matchComplete = false;
    cardIndex = 0;
    filled = [];
    isChecked = false;
    isCorrect = false;
    showFeedback = false;
    selectedOption = null;
    showClue = false;
    stopSpeaking();
  }

  onMount(() => {
    preloadMascots(['default', 'cheerful', 'excited', 'amazed', 'disappointed', 'worried', 'shocked', 'celebrating', 'crying', 'puppy', 'proud', 'thinking']);
    return () => {
      clearTimeout(shockTimer);
      stopSpeaking();
    };
  });

  const mood = $derived.by((): MascotMood => {
    if (showFeedback) return isCorrect ? 'cheerful' : 'disappointed';
    return matchShock ? 'shocked' : 'default';
  });

  // ─── Page → page ────────────────────────────────────────────────────────────
  function persist() {
    gameState.saveCheckpoint(lessonId, {
      page,
      pages: JOURNEY_PAGE_COUNT,
      variant: journeyVariantFor(lessonId, tier),
      seed,
      batches: batches.map((b) => b.map((w) => w.key)),
      missedWords: [...missed],
      seenWords: [...seen],
      correct,
      wrong,
      elapsedMs: elapsedMs()
    });
  }

  function advance() {
    resetPageState();
    let next = page + 1;
    if (next < JOURNEY_PAGE_COUNT && JOURNEY_PAGES[next].kind === 'reexam') {
      buildReexam();
      // A verse too small to have anything to review skips the page rather than showing an empty one
      if (!reexam.length) next += 1;
    }
    if (next >= JOURNEY_PAGE_COUNT) return finishJourney();
    page = next;
    persist();
  }

  function finishJourney() {
    sessionResult = gameState.completeVerse(lessonId, [...seen], [...missed]);
    const attempts = correct + wrong;
    summary = {
      accuracy: attempts ? Math.round((correct / attempts) * 100) : 100,
      seconds: Math.round(elapsedMs() / 1000)
    };
    completed = true;
  }

  // ─── Hearts ─────────────────────────────────────────────────────────────────
  function loseHeart() {
    gameState.decrementHeart();
    if (gameState.hearts <= 0) setTimeout(() => (isGameOver = true), 800);
  }

  // Out of hearts: refill and replay this page — everything before it is already saved
  function restartPage() {
    gameState.refillHearts();
    isGameOver = false;
    resetPageState();
    nonce += 1;
  }

  // ─── Flashcards: one word per screen — the words the next word-matching page will ask about ──
  const cardWords = $derived(
    spec.kind === 'flashcards' ? inVerseOrder(batches[spec.half ?? 0], content.halves[spec.half ?? 0].hindi.roman) : []
  );
  const lastCard = $derived(cardIndex >= cardWords.length - 1);

  function nextCard() {
    if (!lastCard) {
      stopSpeaking();
      cardIndex += 1;
      return;
    }
    cardWords.forEach((w) => seen.add(w.key));
    advance();
  }

  function previousCard() {
    if (cardIndex === 0) return;
    stopSpeaking();
    cardIndex -= 1;
  }

  // ─── Matching pages (words, then phrases) ───────────────────────────────────
  const pairs = $derived.by((): PhrasePair[] => {
    if (spec.kind === 'word_match') return batches[spec.half ?? 0].map((w) => ({ hindi: w.hindi, english: w.english }));
    if (spec.kind === 'phrase_match') return content.halves[spec.half ?? 0].phrases;
    return [];
  });

  function handleMatchIncorrect(confusedTerms: string[]) {
    wrong += 1;
    confusedTerms.flatMap((t) => keysFromRoman(content, t)).forEach((k) => missed.add(k));
    matchShock = true;
    clearTimeout(shockTimer);
    shockTimer = setTimeout(() => (matchShock = false), 900);
    loseHeart();
  }

  function finishMatching() {
    if (!matchComplete) return;
    correct += pairs.length;
    // Only the words a word page actually showed count as met; the rest stay due for review
    if (spec.kind === 'word_match') batches[spec.half ?? 0].forEach((w) => seen.add(w.key));
    advance();
  }

  // ─── Fill-in-the-blank pages ────────────────────────────────────────────────
  const blankBase = $derived.by((): BlankSet | null => {
    if (spec.kind !== 'blanks') return null;
    const h = spec.half ?? 0;
    switch (spec.blank) {
      case 'word': return content.wordBlanks[h];
      case 'chunk': return content.chunkBlanks[h];
      case 'single': return content.singleBlanks[h];
      default: return content.fullBlanks;
    }
  });
  // Blanks written in the verse's own language show in the tier's script (Medium: Roman, Hard: Devanagari)
  const blankSet = $derived(blankBase ? blankInScript(blankBase, isDeva) : null);
  // A Roman option is spoken in its Devanagari form, which is what the voice reads
  const blankSpoken = $derived.by((): Record<string, string> | undefined => {
    const dev = blankBase?.dev;
    if (!blankBase || !dev || isDeva) return undefined;
    return Object.fromEntries(blankBase.options.map((o, i) => [o, dev.options[i]]));
  });

  const norm = (s: string | null) => (s ?? '').trim().toLowerCase();
  const canCheckBlanks = $derived(
    !!blankSet && filled.length === blankSet.answers.length && filled.every((f) => f !== null)
  );

  function checkBlanks() {
    if (!blankSet || !canCheckBlanks || isChecked) return;
    isChecked = true;
    const results = blankSet.answers.map((a, i) => norm(filled[i]) === norm(a));
    isCorrect = results.every(Boolean);
    results.forEach((ok, i) => {
      if (ok) correct += 1;
      else {
        wrong += 1;
        (blankSet!.answerKeys?.[i] ?? keysFromAnswer(content, blankSet!.answers[i])).forEach((k) => missed.add(k));
      }
    });
    if (!isCorrect) loseHeart();
    showFeedback = true;
  }

  const completedSentence = $derived.by(() => {
    if (!blankSet) return '';
    return blankSet.template.split('___').reduce((acc, seg, i) => acc + seg + (blankSet!.answers[i] ?? ''), '');
  });

  // ─── Recital pages ──────────────────────────────────────────────────────────
  /** How this recital page gives its clue: the whole verse is audio-only unless the content says otherwise */
  const recitalClue = $derived<RecitalClue>(content.recitalClues?.[spec.half ?? 2] ?? (spec.half === undefined ? 'audio' : 'text'));
  function handleRecitalDone(result: { passed: boolean; missedKeys: string[] } | null) {
    if (result) {
      if (result.passed) correct += 1;
      else {
        wrong += 1;
        result.missedKeys.forEach((k) => missed.add(k));
      }
    }
    advance();
  }

  // ─── Re-exam: correct what went wrong, with clues ───────────────────────────
  interface ReexamItem {
    word: JourneyWord;
    options: MCQOption[];
    retries: number;
  }
  const MAX_RETRIES = 2;

  let reexam = $state<ReexamItem[]>([]);
  let rIndex = $state(0);
  let isSpotCheck = $state(false);
  let showClue = $state(false);
  let selectedOption = $state<MCQOption | null>(null);

  const current = $derived<ReexamItem | undefined>(reexam[rIndex]);
  const clue = $derived(current ? clueFor(content, current.word) : null);

  function makeItem(word: JourneyWord, retries = 0): ReexamItem {
    const mode = gameState.tierScriptMode;
    const label = scriptText(word.hindi, mode);
    const wrongs = wrongMeanings(
      word.english,
      2,
      pool.filter((w) => w.key !== word.key).map((w) => w.english)
    );
    return {
      word,
      retries,
      options: shuffle<MCQOption>([
        { text: word.english, isCorrect: true, explanation: `${label} means “${word.english}”.` },
        ...wrongs.map((text) => ({ text, isCorrect: false, explanation: `${label} means “${word.english}”.` }))
      ])
    };
  }

  function buildReexam() {
    const picked = reexamWords(pool, [...missed], [...seen], untrack(() => gameState.wordMemory), seed + 200);
    isSpotCheck = picked.isSpotCheck;
    reexam = picked.words.map((w) => makeItem(w));
    rIndex = 0;
    // A word being asked about again has been met, whether or not the word pages showed it
    picked.words.forEach((w) => seen.add(w.key));
  }

  function checkReexam() {
    if (!selectedOption || isChecked || !current) return;
    isChecked = true;
    isCorrect = selectedOption.isCorrect;
    showFeedback = true;
  }

  function nextReexam() {
    const item = current;
    const retry = !!item && !isCorrect && item.retries < MAX_RETRIES;
    isChecked = false;
    isCorrect = false;
    showFeedback = false;
    selectedOption = null;
    if (retry && item) reexam.push(makeItem(item.word, item.retries + 1));
    if (rIndex + 1 >= reexam.length) return advance();
    rIndex += 1;
    // A retry opens with its clue, since the first attempt just failed
    showClue = reexam[rIndex].retries > 0;
  }

  // Resuming on the re-exam: rebuild its queue from the saved mistakes
  untrack(() => {
    if (JOURNEY_PAGES[page].kind === 'reexam') {
      buildReexam();
      if (!reexam.length) page += 1;
    }
  });

  // ─── Keyboard: Enter checks / continues, as in the other exercise screens ──
  function onFeedbackContinue() {
    if (spec.kind === 'reexam') return nextReexam();
    showFeedback = false;
    advance();
  }

  function onKey(e: KeyboardEvent) {
    if (e.key !== 'Enter' || showQuit || isGameOver || completed) return;
    if ((e.target as HTMLElement | null)?.closest?.('button, textarea, input')) return;
    if (showFeedback) return onFeedbackContinue();
    if (spec.kind === 'flashcards') nextCard();
    else if (spec.kind === 'word_match' || spec.kind === 'phrase_match') finishMatching();
    else if (spec.kind === 'blanks') checkBlanks();
    else if (spec.kind === 'reexam') checkReexam();
  }

  const scriptOf = (h: HindiText) => scriptText(h, gameState.tierScriptMode);
</script>

<svelte:window onkeydown={onKey} />

{#snippet header(title: string, sub: string)}
  <div class="flex items-end gap-3">
    <div class="flex-1 min-w-0">
      <p class="text-sm font-extrabold uppercase tracking-wider text-text-muted mb-1">Page {page + 1} of {JOURNEY_PAGE_COUNT}</p>
      <h2 class="text-2xl font-black leading-tight">{title}</h2>
      <p class="text-[15px] font-bold text-text-muted mt-1">{sub}</p>
    </div>
    <Mascot {mood} size="lg" />
  </div>
{/snippet}

<!-- The Hindi (or Sanskrit) being worked on, in the tier's script, with a voice -->
{#snippet hindiCard(h: HindiText)}
  <div class="card px-4 py-3">
    <SpokenText lines={hindiLines(h, isDeva)} lang="hi" label={langName} textClass="text-lg leading-snug {isDeva ? 'font-deva font-bold' : 'font-black'}" />
  </div>
{/snippet}

<!-- The English meaning, as the clue above blanks written in the verse's own language -->
{#snippet englishCard(text: string)}
  <div class="card px-4 py-3">
    <SpokenText lines={englishLines(text)} lang="en" label="English" textClass="text-lg leading-snug font-black" />
  </div>
{/snippet}

<div class="w-full h-full flex flex-col bg-bg-base text-text-primary relative select-none overflow-hidden">
  {#if completed && sessionResult && summary}
    <CompleteFlow
      {sessionResult}
      {summary}
      title="Verse complete!"
      subtitle={goalNudge(gameState.profile) || `You've learned ${lesson.verseRef}, ${lesson.title}.`}
      storyLessonId={lessonId}
      {onExit}
    />

  {:else if isGameOver}
    <!-- ═══ OUT OF HEARTS ═══ -->
    <div class="flex-1 flex flex-col items-center justify-center px-6 text-center animate-[fade-in_0.3s_ease-out]">
      <Mascot mood="crying" size="xl" />
      <h1 class="text-3xl font-black mt-6">You ran out of hearts!</h1>
      <p class="text-base font-bold text-text-muted mt-2 max-w-xs leading-relaxed">
        Mistakes are part of the path. Refill your hearts and try this page again — your earlier pages are saved.
      </p>
    </div>
    <div class="lesson-footer flex flex-col gap-3">
      <button onclick={restartPage} class="btn btn-primary w-full">
        <Icon name="heart" class="w-5 h-5" /> Refill hearts and retry
      </button>
      <button onclick={onExit} class="btn btn-ghost w-full">Save and exit</button>
    </div>

  {:else}
    <LessonProgress progress={page / JOURNEY_PAGE_COUNT} onCancel={() => (showQuit = true)} />

    {#key `${page}:${nonce}`}
      {#if spec.kind === 'intro'}
        <JourneyIntro {lesson} {content} onComplete={advance} />

      {:else if spec.kind === 'flashcards'}
        <div class="flex-1 overflow-y-auto scrollbar-none px-5 pt-4 pb-6 flex flex-col gap-4">
          {@render header(spec.title, `Word ${cardIndex + 1} of ${cardWords.length} · picture it, then say it`)}
          <div class="flex items-center justify-center gap-2" aria-label="Word {cardIndex + 1} of {cardWords.length}">
            {#each cardWords as _, i}
              <span class="h-2 rounded-full transition-all duration-300 {i === cardIndex ? 'w-6 bg-primary' : i < cardIndex ? 'w-2 bg-primary' : 'w-2 bg-border-warm'}"></span>
            {/each}
          </div>
          <!-- Re-keyed per word so each one pops in on its own screen -->
          {#key cardWords[cardIndex]?.key}
            {#if cardWords[cardIndex]}
              <WordFlashcard word={cardWords[cardIndex]} {langName} />
            {/if}
          {/key}
        </div>
        <div class="lesson-footer flex gap-3">
          {#if cardIndex > 0}
            <button type="button" onclick={previousCard} class="btn btn-secondary flex-1">Back</button>
          {/if}
          <button type="button" onclick={nextCard} class="btn btn-primary {cardIndex > 0 ? 'flex-[2]' : 'w-full'}">
            {lastCard ? "Let's practice" : 'Next word'}
          </button>
        </div>

      {:else if spec.kind === 'word_match' || spec.kind === 'phrase_match'}
        {@const half = content.halves[spec.half ?? 0]}
        <div class="flex-1 overflow-y-auto scrollbar-none px-5 pt-4 pb-6 flex flex-col gap-4">
          {@render header(
            spec.title,
            spec.kind === 'word_match'
              ? `Tap a ${langName} word, then its English meaning. Tap any card to hear it.`
              : `Now match each ${langName} phrase to its English meaning.`
          )}
          {@render hindiCard(half.hindi)}
          <PhraseMatcher {pairs} voice onIncorrect={handleMatchIncorrect} onAllMatched={() => (matchComplete = true)} />
        </div>
        <div class="lesson-footer">
          <button
            onclick={finishMatching}
            disabled={!matchComplete}
            class="btn w-full {matchComplete ? 'btn-primary' : 'btn-disabled'}"
          >Continue</button>
        </div>

      {:else if spec.kind === 'blanks' && blankSet}
        <div class="flex-1 overflow-y-auto scrollbar-none px-5 pt-4 {showFeedback ? 'pb-56' : 'pb-6'} flex flex-col gap-4">
          {@render header(
            spec.title,
            spec.blank === 'word'
              ? 'Tap the words that fill the gaps.'
              : spec.blank === 'full'
                ? 'The whole verse: fill every gap.'
                : 'Tap the phrase that fits.'
          )}
          {#if content.blankClue === 'english'}
            {@render englishCard(spec.blank === 'full' ? content.verseEnglish : content.halves[spec.half ?? 0].english)}
          {:else}
            {@render hindiCard(spec.blank === 'full' ? content.verseHindi : content.halves[spec.half ?? 0].hindi)}
          {/if}
          <BlankFill
            template={blankSet.template}
            options={blankSet.options}
            answers={blankSet.answers}
            spoken={blankSpoken}
            checked={isChecked}
            disabled={isChecked}
            onChange={(f) => (filled = f)}
          />
        </div>
        <div class="lesson-footer">
          <button
            onclick={checkBlanks}
            disabled={!canCheckBlanks || isChecked}
            class="btn w-full {canCheckBlanks && !isChecked ? 'btn-primary' : 'btn-disabled'}"
          >Check</button>
        </div>
        {#if showFeedback}
          <FeedbackModal
            {isCorrect}
            correctAnswerText={completedSentence}
            explanation=""
            encouragement=""
            onContinue={onFeedbackContinue}
          />
        {/if}

      {:else if spec.kind === 'recital'}
        <ReciteScreen
          hindi={spec.half === undefined ? content.verseHindi : content.halves[spec.half].hindi}
          english={spec.half === undefined ? content.verseEnglish : content.halves[spec.half].english}
          {pool}
          clue={recitalClue}
          {langName}
          title={spec.title}
          onDone={handleRecitalDone}
        />

      {:else if spec.kind === 'reexam' && current && clue}
        <div class="flex-1 overflow-y-auto scrollbar-none px-5 pt-4 {showFeedback ? 'pb-56' : 'pb-6'} flex flex-col gap-4">
          {@render header(
            isSpotCheck ? 'Quick spot-check' : spec.title,
            isSpotCheck
              ? 'No mistakes — nice! A few words to keep sharp.'
              : "Let's fix the ones that tripped you up. Use the clue if you need it."
          )}
          <p class="text-xs font-black uppercase tracking-wider text-primary">Word {rIndex + 1} of {reexam.length}</p>

          <div class="card px-4 py-4 flex items-center gap-3">
            <div class="flex-1 min-w-0">
              <p class="text-sm font-bold text-text-muted">What does this mean?</p>
              <HindiWord hindi={current.word.hindi} size="lg" />
            </div>
            <SpeakButton text={current.word.hindi.dev} lang="hi" label="Hear it" />
          </div>

          {#if showClue}
            <div class="rounded-2xl border-2 border-info/40 bg-info/10 px-4 py-3 flex flex-col gap-1 animate-pop-in">
              <p class="text-xs font-black uppercase tracking-wider text-info">Clue · where it came from</p>
              <div class="flex items-center gap-2">
                <p class="flex-1 text-base leading-snug {isDeva ? 'font-deva font-bold' : 'font-black'}">{scriptOf(clue.hindi)}</p>
                <SpeakButton text={clue.hindi.dev} lang="hi" size="sm" />
              </div>
              <div class="flex items-center gap-2">
                <p class="flex-1 text-[15px] font-bold text-text-muted leading-snug">{clue.english}</p>
                <SpeakButton text={clue.english} lang="en" size="sm" />
              </div>
            </div>
          {:else}
            <button type="button" onclick={() => (showClue = true)} class="btn btn-secondary self-start px-4 py-2 text-sm">Show clue</button>
          {/if}

          {#key `${rIndex}:${current.retries}:${current.word.key}`}
            <MultipleChoice options={current.options} onSelect={(o: MCQOption) => (selectedOption = o)} disabled={isChecked} />
          {/key}
        </div>
        <div class="lesson-footer">
          <button
            onclick={checkReexam}
            disabled={!selectedOption || isChecked}
            class="btn w-full {selectedOption && !isChecked ? 'btn-primary' : 'btn-disabled'}"
          >Check</button>
        </div>
        {#if showFeedback}
          <FeedbackModal
            {isCorrect}
            correctAnswerText={current.word.english}
            explanation={selectedOption?.explanation ?? ''}
            encouragement={isCorrect ? 'Corrected — that is how it sticks.' : current.retries < MAX_RETRIES ? "We'll ask again, with the clue open." : ''}
            onContinue={onFeedbackContinue}
          />
        {/if}

      {:else if spec.kind === 'reflection'}
        <div class="flex-1 overflow-y-auto scrollbar-none px-5 pt-4 pb-6">
          <p class="text-sm font-extrabold uppercase tracking-wider text-text-muted mb-3">Page {page + 1} of {JOURNEY_PAGE_COUNT}</p>
          <ReflectionPrompt
            promptId="{lessonId}_reflection"
            prompt={content.reflectionPrompt}
            verseContext={content.verseEnglish}
            onComplete={advance}
          />
        </div>
      {/if}
    {/key}

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
        <h2 class="text-2xl font-black mt-3">Leaving so soon?</h2>
        <p class="text-base font-bold text-text-muted mt-1">
          {page > 0
            ? `Your progress is saved. You'll pick up at page ${page + 1} of ${JOURNEY_PAGE_COUNT}.`
            : "You haven't finished a page yet, so you'll start from the beginning next time."}
        </p>
        <button onclick={() => (showQuit = false)} class="btn btn-primary w-full mt-6">Keep learning</button>
        <button onclick={onExit} class="btn btn-ghost w-full mt-2">Save and exit</button>
      </div>
    {/if}
  {/if}
</div>
