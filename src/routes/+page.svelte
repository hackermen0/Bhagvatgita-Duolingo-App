<script lang="ts">
  import { goto } from '$app/navigation';
  import { gameState, DAILY_GOAL_OPTIONS } from '$lib/state/gameState.svelte';
  import { gitaData, type Lesson } from '$lib/data/gitaData';
  import { practiceStatus } from '$lib/data/practice';
  import { planById, type PracticePreference } from '$lib/data/onboarding';
  import { learningConfig, newContentAdvice, goalGreeting } from '$lib/data/learningConfig';
  import Mascot from '$lib/components/Mascot.svelte';
  import VerseText from '$lib/components/VerseText.svelte';
  import ScriptToggle from '$lib/components/ScriptToggle.svelte';

  let activeLessonModal = $state<Lesson | null>(null);
  let jumpTarget = $state<Lesson | null>(null);
  let showSettingsModal = $state(false);

  const cfg = $derived(learningConfig(gameState.profile));

  const PRACTICE_STYLES: { value: PracticePreference; label: string }[] = [
    { value: 'listening', label: 'Listening' },
    { value: 'balanced', label: 'Balanced' },
    { value: 'reading', label: 'Reading' }
  ];

  // ─── Derived: All lessons flattened ───────────────────────────────────────
  const allLessons = $derived(
    gitaData.chapters.flatMap((c) => c.sections.flatMap((s) => s.lessons))
  );

  // ─── Derived: Next lesson to do (first unlocked & not completed) ──────────
  const nextLesson = $derived(
    allLessons.find(
      (lesson) => !gameState.completedLessons.includes(lesson.id) && isLessonUnlocked(lesson.id)
    ) ?? null
  );

  // Where the "Jump here?" invitation sits: the first lesson past the learner's next one
  const firstLockedId = $derived(
    allLessons.find((l) => !gameState.completedLessons.includes(l.id) && !isLessonUnlocked(l.id))?.id ?? null
  );

  // ─── Derived: Chapter progress stats ─────────────────────────────────────
  const chapterStats = $derived(
    gitaData.chapters.map((chapter) => {
      const chapterLessons = chapter.sections.flatMap((s) => s.lessons);
      const completed = chapterLessons.filter((l) =>
        gameState.completedLessons.includes(l.id)
      ).length;
      return {
        chapter,
        completed,
        total: chapterLessons.length,
        pct: Math.round((completed / chapterLessons.length) * 100)
      };
    })
  );

  // ─── Derived: Mascot context message ─────────────────────────────────────
  const mascotMessage = $derived((): { msg: string; iconType: 'flame' | 'lightning' | 'trophy' | 'om' } => {
    if (gameState.streak >= 7)
      return { msg: `${gameState.streak} day streak! Incredible!`, iconType: 'flame' };
    if (gameState.streak >= 3)
      return { msg: `${gameState.streak} days strong!`, iconType: 'lightning' };
    if (!nextLesson)
      return { msg: 'All lessons complete!', iconType: 'trophy' };
    if (advice)
      return { msg: 'Review first — it makes new verses stick!', iconType: 'lightning' };
    return { msg: goalGreeting(gameState.profile, nextLesson.verseRef), iconType: 'om' };
  });

  // ─── Derived: Daily Sadhana (today's real activity + self-set goal) ─────
  const sadhanaTask1Done = $derived(gameState.today.lessons > 0);
  const sadhanaTask2Done = $derived(gameState.today.practices > 0);
  const sadhanaTask3Done = $derived(gameState.today.reflections > 0);
  const goalPct = $derived(Math.min(100, Math.round((gameState.today.xp / gameState.dailyGoal) * 100)));

  // ─── Derived: Spaced-repetition practice ─────────────────────────────────
  const practice = $derived(practiceStatus());

  // The plan's new-content rule, applied as a recommendation rather than a lock
  const advice = $derived(
    nextLesson && practice.available
      ? newContentAdvice(cfg, practice.dueCount, gameState.today.newLessons)
      : null
  );
  const planName = $derived(gameState.profile ? planById(gameState.profile.plan).name : '');

  // ─── Roadmap geometry ────────────────────────────────────────────────────
  const S_CURVE_OFFSETS = [0, -80, 80, -80, 80, -80];
  const ROW_HEIGHT = 90;

  function getNodeOffset(index: number): number {
    return S_CURVE_OFFSETS[index % S_CURVE_OFFSETS.length];
  }

  // 6-type node system mapped to lesson content
  function getNodeType(
    lesson: Lesson,
    idx: number,
    totalInSection: number
  ): 'verse' | 'memorize' | 'reflect' | 'chest' | 'challenge' | 'complete' {
    if (idx > 0 && idx === totalInSection - 1 && totalInSection >= 3) return 'complete';
    const hasReflection = lesson.questions?.some((q) => q.type === 'reflection');
    if (hasReflection) return 'reflect';
    const cycle = idx % 6;
    if (cycle === 1) return 'chest';
    if (cycle === 2) return 'memorize';
    if (cycle === 3) return 'challenge';
    if (cycle === 4) return 'reflect';
    return 'verse';
  }

  // Generate SVG path string for S-curve
  function generatePathD(lessonsCount: number): string {
    if (lessonsCount <= 1) return '';
    const centerX = 160;
    const startY = 40;
    let d = '';
    for (let i = 0; i < lessonsCount; i++) {
      const x = centerX + getNodeOffset(i);
      const y = startY + i * ROW_HEIGHT;
      if (i === 0) {
        d += `M ${x} ${y}`;
      } else {
        const prevX = centerX + getNodeOffset(i - 1);
        const prevY = startY + (i - 1) * ROW_HEIGHT;
        const cy1 = prevY + ROW_HEIGHT / 2;
        const cy2 = y - ROW_HEIGHT / 2;
        d += ` C ${prevX} ${cy1}, ${x} ${cy2}, ${x} ${y}`;
      }
    }
    return d;
  }

  // Generate path from node i-1 to node i (individual segment)
  function generateSegmentD(idx: number): string {
    if (idx === 0) return '';
    const centerX = 160;
    const startY = 40;
    const x = centerX + getNodeOffset(idx);
    const y = startY + idx * ROW_HEIGHT;
    const prevX = centerX + getNodeOffset(idx - 1);
    const prevY = startY + (idx - 1) * ROW_HEIGHT;
    const cy1 = prevY + ROW_HEIGHT / 2;
    const cy2 = y - ROW_HEIGHT / 2;
    return `M ${prevX} ${prevY} C ${prevX} ${cy1}, ${x} ${cy2}, ${x} ${y}`;
  }

  function isLessonUnlocked(lessonId: string): boolean {
    if (cfg.pathAccess === 'open') return true;
    const i = allLessons.findIndex((l) => l.id === lessonId);
    return i <= 0 || gameState.completedLessons.includes(allLessons[i - 1].id);
  }

  function handleNodeClick(lesson: Lesson, unlocked: boolean) {
    if (unlocked) activeLessonModal = lesson;
    else if (cfg.pathAccess === 'jump') jumpTarget = lesson;
  }

  function startJump(lessonId: string) {
    jumpTarget = null;
    goto(`/jump/${lessonId}`);
  }

  const lessonsSkippedBy = (target: Lesson) =>
    allLessons
      .slice(0, allLessons.findIndex((l) => l.id === target.id))
      .filter((l) => !gameState.completedLessons.includes(l.id)).length;

  function startLesson(lessonId: string) {
    activeLessonModal = null;
    goto(`/lesson/${lessonId}`);
  }

  function resetGame() {
    if (confirm('Reset all lesson progress, streak, and XP?')) {
      gameState.resetState();
      showSettingsModal = false;
    }
  }

  function redoOnboarding() {
    if (confirm('Retake the onboarding questions? Your lesson progress will not be affected.')) {
      gameState.resetOnboarding();
      showSettingsModal = false;
    }
  }
</script>

<div class="w-full h-full flex flex-col bg-bg-base text-text-primary relative overflow-hidden select-none">

  <!-- ═══════════════════════════════════════════════════════
       TOP BAR — Compact, high-density with clean Vector Icons
  ═══════════════════════════════════════════════════════ -->
  <header class="flex items-center justify-between px-3 py-2 bg-bg-surface/95 backdrop-blur-md border-b border-border-warm sticky top-0 z-40 shadow-sm">

    <!-- Brand mark -->
    <div class="flex items-center gap-2">
      <div class="w-7 h-7 rounded-xl bg-gradient-to-br from-primary/30 to-success/20 border border-primary/40 flex items-center justify-center text-primary font-cinzel font-bold text-xs shadow-sm">
        ॐ
      </div>
      <h1 class="text-xs font-black font-cinzel tracking-widest bg-gradient-to-r from-primary via-accent to-primary-dark bg-clip-text text-transparent leading-none">
        GITA YOGA
      </h1>
    </div>

    <!-- Stats row — compact pills -->
    <div class="flex items-center gap-1.5">

      <!-- Streak -->
      <div class="flex items-center gap-1 px-2 py-1 rounded-lg bg-bg-surface-alt border border-border-warm shadow-inner" title="Daily Streak">
        <svg viewBox="0 0 24 24" fill="currentColor" class="w-3.5 h-3.5 text-primary animate-pulse">
          <path d="M12 23c-4.97 0-9-4.03-9-9 0-4.13 2.84-7.58 6.72-8.62.44-.12.88.2.88.66v.83c0 2.21 1.79 4 4 4s4-1.79 4-4v-.83c0-.46.44-.78.88-.66C20.16 6.42 23 9.87 23 14c0 4.97-4.03 9-9 9z"/>
        </svg>
        <span class="font-extrabold text-primary text-[11px] tabular-nums">{gameState.streak}</span>
      </div>

      <!-- XP -->
      <div class="flex items-center gap-1 px-2 py-1 rounded-lg bg-bg-surface-alt border border-border-warm shadow-inner" title="Total XP">
        <svg viewBox="0 0 24 24" fill="currentColor" class="w-3.5 h-3.5 text-primary">
          <path d="M13 2L3 14h7v8l10-12h-7V2z"/>
        </svg>
        <span class="font-extrabold text-primary text-[11px] tabular-nums">{gameState.xp}</span>
      </div>

      <!-- Hearts -->
      <div class="flex items-center gap-1 px-2 py-1 rounded-lg bg-bg-surface-alt border border-border-warm shadow-inner" title="Hearts">
        <svg viewBox="0 0 24 24" fill="currentColor" class="w-3.5 h-3.5 text-error">
          <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
        </svg>
        <span class="font-extrabold text-error text-[11px] tabular-nums">{gameState.hearts}</span>
        {#if gameState.hearts < 5}
          <button
            onclick={() => gameState.refillHearts()}
            class="text-[8px] bg-error/20 hover:bg-error/30 text-error font-bold px-1 py-0.5 rounded border border-error/30 transition-colors leading-none"
            type="button"
          >+</button>
        {/if}
      </div>

      <!-- Theme toggle -->
      <button
        onclick={() => gameState.toggleTheme()}
        class="p-1.5 rounded-lg bg-bg-surface-alt hover:bg-border-warm text-text-muted hover:text-text-primary border border-border-warm transition-all active:scale-95"
        title="Toggle theme"
        aria-label="Toggle light/dark theme"
        type="button"
      >
        {#if gameState.themeMode === 'dark'}
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-3.5 h-3.5">
            <path stroke-linecap="round" stroke-linejoin="round" d="M12 3v2.25m6.364.386-1.591 1.591M21 12h-2.25m-.386 6.364-1.591-1.591M12 18.75V21m-4.773-4.227-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0Z" />
          </svg>
        {:else}
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-3.5 h-3.5">
            <path stroke-linecap="round" stroke-linejoin="round" d="M21.752 15.002A9.72 9.72 0 0 1 18 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 0 0 3 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 0 0 9.002-5.998Z" />
          </svg>
        {/if}
      </button>

      <!-- Settings -->
      <button
        onclick={() => showSettingsModal = true}
        class="p-1.5 rounded-lg bg-bg-surface-alt hover:bg-border-warm text-text-muted hover:text-text-primary border border-border-warm transition-all active:scale-95"
        title="Settings"
        aria-label="Settings"
        type="button"
      >
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-3.5 h-3.5">
          <path stroke-linecap="round" stroke-linejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.325.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.241-.438.613-.43.992a7.723 7.723 0 010 .255c-.008.378.137.75.43.991l1.004.827c.424.35.534.955.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.47 6.47 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.281c-.09.543-.56.94-1.11.94h-2.594c-.55 0-1.019-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.991a6.932 6.932 0 010-.255c.007-.38-.138-.751-.43-.992l-1.004-.827a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.086.22-.128.332-.183.582-.495.644-.869l.214-1.28Z" />
          <path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      </button>

    </div>
  </header>

  <!-- ═══════════════════════════════════════════════════════
       SCROLL CANVAS
  ═══════════════════════════════════════════════════════ -->
  <div class="flex-1 overflow-y-auto scrollbar-none relative">

    <!-- Ambient Om watermark -->
    <div class="fixed inset-0 pointer-events-none z-0 overflow-hidden opacity-[0.025] flex items-center justify-center select-none">
      <div class="text-[18rem] font-cinzel text-primary blur-[0.5px]">ॐ</div>
    </div>

    <div class="flex flex-col items-center gap-4 px-4 py-4 z-10 relative">

      <!-- ─────────────────────────────────────────────────
           CONTINUE LEARNING HERO CARD
      ───────────────────────────────────────────────── -->
      {#if nextLesson}
        <div class="w-full max-w-sm animate-fade-up" style="animation-delay: 0ms;">
          <!-- Mascot as guide above the card -->
          <div class="flex items-center gap-3 mb-3 pl-1">
            <Mascot
              mood="guide"
              size="sm"
              animate={true}
              speechBubble={mascotMessage().msg}
              speechIconType={mascotMessage().iconType}
              bubblePosition="right"
            />
          </div>

          {#if advice}
          <!-- Review-first card (plan's new-content rule) -->
          <button
            onclick={() => goto('/practice')}
            class="w-full bg-gradient-to-br from-accent/15 via-bg-surface to-bg-surface-alt border border-accent/40 rounded-2xl p-4 shadow-lg text-left relative overflow-hidden group transition-all duration-200 hover:border-accent/70 active:scale-[0.98] cursor-pointer"
            type="button"
          >
            <div class="flex items-center gap-3 relative z-10">
              <div class="w-12 h-12 rounded-full bg-accent text-bg-base flex items-center justify-center shadow-lg flex-shrink-0">
                <svg viewBox="0 0 24 24" fill="currentColor" class="w-5 h-5">
                  <path d="M20.57 14.86L22 13.43 20.57 12 17 15.57 8.43 7 12 3.43 10.57 2 9.14 3.43 7.71 2 5.57 4.14 4.14 2.71 2.71 4.14l1.43 1.43L2 7.71l1.43 1.43L2 10.57 3.43 12 7 8.43 15.57 17 12 20.57 13.43 22l1.43-1.43L16.29 22l2.14-2.14 1.43 1.43 1.43-1.43-1.43-1.43L22 16.29z"/>
                </svg>
              </div>
              <div class="flex-1 min-w-0">
                <div class="text-[10px] uppercase font-black tracking-widest text-accent mb-0.5">Review First</div>
                <div class="text-sm font-black text-text-primary font-cinzel">
                  {advice === 'review-due'
                    ? `${practice.dueCount} word${practice.dueCount === 1 ? '' : 's'} ready for review`
                    : "Today's new verse is done"}
                </div>
                <div class="text-[11px] text-text-muted leading-snug mt-0.5">
                  {advice === 'review-due'
                    ? `Your ${planName} plan clears reviews before adding new verses.`
                    : `Your ${planName} plan adds ${cfg.newContent?.maxNewPerDay ?? 1} new verse${(cfg.newContent?.maxNewPerDay ?? 1) === 1 ? '' : 's'} a day — a review locks it in.`}
                </div>
              </div>
              <div class="flex-shrink-0 text-accent/60 group-hover:text-accent transition-colors">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" class="w-4 h-4">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </div>
          </button>
          <button
            type="button"
            onclick={() => handleNodeClick(nextLesson, true)}
            class="w-full mt-2 text-[11px] font-bold text-text-muted hover:text-primary transition-colors"
          >
            Or start {nextLesson.verseRef} anyway →
          </button>
          {:else}
          <!-- Hero Continue Card -->
          <button
            onclick={() => handleNodeClick(nextLesson, true)}
            class="w-full bg-gradient-to-br from-primary/15 via-bg-surface to-bg-surface-alt border border-primary/50 rounded-2xl p-4 shadow-lg shadow-primary/5 text-left relative overflow-hidden group transition-all duration-200 hover:border-primary/80 hover:shadow-primary/20 active:scale-[0.98] cursor-pointer"
            id="continue-learning-btn"
            aria-label="Continue Learning"
            type="button"
          >
            <!-- Ambient glow -->
            <div class="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent pointer-events-none rounded-2xl group-hover:from-primary/10 transition-all duration-300"></div>

            <div class="flex items-center gap-3 relative z-10">
              <!-- Play icon circle -->
              <div class="w-12 h-12 rounded-full bg-gradient-to-b from-primary to-primary-dark border-b-[3px] border-accent flex items-center justify-center shadow-lg flex-shrink-0 animate-node-glow">
                <svg viewBox="0 0 24 24" fill="currentColor" class="w-5 h-5 text-bg-base ml-0.5">
                  <path d="M8 5v14l11-7z" />
                </svg>
              </div>

              <!-- Lesson details -->
              <div class="flex-1 min-w-0">
                <div class="text-[10px] uppercase font-black tracking-widest text-primary/80 mb-0.5 flex items-center gap-1">
                  <svg viewBox="0 0 24 24" fill="currentColor" class="w-3 h-3 text-primary"><path d="M8 5v14l11-7z"/></svg>
                  <span>Continue Learning</span>
                </div>
                <div class="text-sm font-black text-text-primary font-cinzel truncate">{nextLesson.title}</div>
                <div class="text-[11px] text-text-muted font-medium">{nextLesson.verseRef}</div>
                <!-- Progress bar -->
                {#each chapterStats as stat}
                  {#if stat.chapter.sections.flatMap(s => s.lessons).some(l => l.id === nextLesson.id)}
                    <div class="mt-2 flex items-center gap-2">
                      <div class="flex-1 h-1.5 bg-border-warm rounded-full overflow-hidden">
                        <div
                          class="h-full bg-gradient-to-r from-primary to-primary-dark rounded-full transition-all duration-700"
                          style="width: {stat.pct}%"
                        ></div>
                      </div>
                      <span class="text-[10px] text-text-muted font-bold tabular-nums">{stat.completed}/{stat.total}</span>
                    </div>
                  {/if}
                {/each}
              </div>

              <!-- Arrow -->
              <div class="flex-shrink-0 text-primary/60 group-hover:text-primary group-hover:translate-x-0.5 transition-all duration-150">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" class="w-4 h-4">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </div>
          </button>
          {/if}
        </div>
      {:else}
        <!-- All complete state -->
        <div class="w-full max-w-sm animate-fade-up bg-gradient-to-br from-success/15 via-bg-surface to-bg-surface border border-success/40 rounded-2xl p-4 text-center shadow-lg">
          <div class="w-10 h-10 mx-auto rounded-full bg-primary/20 border border-primary/40 flex items-center justify-center mb-1 text-primary">
            <svg viewBox="0 0 24 24" fill="currentColor" class="w-5 h-5"><path d="M19 5h-2V3H7v2H5c-1.1 0-2 .9-2 2v1c0 2.55 1.92 4.63 4.39 4.94A5.01 5.01 0 0011 15.9V18H8v2h8v-2h-3v-2.1c2.12-.39 3.75-2.07 4.39-4.24C19.7 11.23 21 9.27 21 7V5c0-1.1-.9-2-2-2zM5 8V7h2v3.82C5.84 10.4 5 9.3 5 8zm14 0c0 1.3-.84 2.4-2 2.82V7h2v1z"/></svg>
          </div>
          <div class="text-sm font-black font-cinzel text-text-primary">All Lessons Complete!</div>
          <div class="text-xs text-text-muted mt-0.5">More chapters coming soon</div>
        </div>
      {/if}

      <!-- ─────────────────────────────────────────────────
           TODAY'S SADHANA — Daily Goal Card
      ───────────────────────────────────────────────── -->
      <div class="w-full max-w-sm animate-fade-up" style="animation-delay: 60ms;">
        <div class="bg-bg-surface border border-border-warm rounded-2xl p-3.5 shadow-sm">
          <div class="flex items-center justify-between mb-3">
            <div class="flex items-center gap-2">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-4 h-4 text-primary">
                <path d="M12 2v6M4.93 10.93l4.24 4.24M2 18h20M20 18a8 8 0 0 0-16 0"/><path d="M19.07 10.93l-4.24 4.24"/>
              </svg>
              <span class="text-xs font-black uppercase tracking-wider text-text-primary font-cinzel">Today's Sadhana</span>
            </div>
            <button
              type="button"
              onclick={() => (showSettingsModal = true)}
              class="flex items-center gap-1 px-2 py-0.5 rounded-full border transition-colors
                {goalPct >= 100 ? 'bg-success/15 border-success/30' : 'bg-primary/15 border-primary/30 hover:bg-primary/25'}"
              title="Change daily goal"
            >
              <span class="text-[10px] font-black tabular-nums {goalPct >= 100 ? 'text-success' : 'text-primary'}">
                {gameState.today.xp}/{gameState.dailyGoal} XP
              </span>
            </button>
          </div>
          <div class="flex flex-col gap-2">
            <!-- Task 1 -->
            <div class="flex items-center gap-2.5">
              <div class="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 {sadhanaTask1Done ? 'bg-success text-white animate-check-pop' : 'border-2 border-border-warm'}">
                {#if sadhanaTask1Done}<svg viewBox="0 0 24 24" fill="currentColor" class="w-3 h-3"><path fill-rule="evenodd" d="M19.916 4.626a.75.75 0 01.208 1.04l-9 13.5a.75.75 0 01-1.154.114l-6-6a.75.75 0 011.06-1.06l5.353 5.353 8.493-12.739a.75.75 0 011.04-.208z" clip-rule="evenodd" /></svg>{/if}
              </div>
              <span class="text-xs {sadhanaTask1Done ? 'text-text-muted line-through' : 'text-text-primary'}">Complete a lesson</span>
            </div>
            <!-- Task 2 -->
            <div class="flex items-center gap-2.5">
              <div class="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 {sadhanaTask2Done ? 'bg-success text-white animate-check-pop' : 'border-2 border-border-warm'}">
                {#if sadhanaTask2Done}<svg viewBox="0 0 24 24" fill="currentColor" class="w-3 h-3"><path fill-rule="evenodd" d="M19.916 4.626a.75.75 0 01.208 1.04l-9 13.5a.75.75 0 01-1.154.114l-6-6a.75.75 0 011.06-1.06l5.353 5.353 8.493-12.739a.75.75 0 011.04-.208z" clip-rule="evenodd" /></svg>{/if}
              </div>
              <span class="text-xs {sadhanaTask2Done ? 'text-text-muted line-through' : 'text-text-primary'}">Do a practice session</span>
            </div>
            <!-- Task 3 -->
            <div class="flex items-center gap-2.5">
              <div class="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 {sadhanaTask3Done ? 'bg-success text-white animate-check-pop' : 'border-2 border-border-warm'}">
                {#if sadhanaTask3Done}<svg viewBox="0 0 24 24" fill="currentColor" class="w-3 h-3"><path fill-rule="evenodd" d="M19.916 4.626a.75.75 0 01.208 1.04l-9 13.5a.75.75 0 01-1.154.114l-6-6a.75.75 0 011.06-1.06l5.353 5.353 8.493-12.739a.75.75 0 011.04-.208z" clip-rule="evenodd" /></svg>{/if}
              </div>
              <span class="text-xs {sadhanaTask3Done ? 'text-text-muted line-through' : 'text-text-primary'}">Write a reflection</span>
            </div>
          </div>
          <!-- Daily XP goal progress -->
          <div class="mt-3 h-1.5 bg-border-warm rounded-full overflow-hidden">
            <div
              class="h-full rounded-full transition-all duration-700 {goalPct >= 100 ? 'bg-success' : 'bg-gradient-to-r from-success to-primary'}"
              style="width: {goalPct}%"
            ></div>
          </div>
          <p class="mt-1.5 text-[10px] text-text-muted flex justify-between gap-2">
            <span>{goalPct >= 100 ? 'Daily goal reached — wonderful consistency!' : 'Daily goal'}</span>
            {#if gameState.profile}
              <span class="font-bold text-primary/80 shrink-0">{planName} · {planById(gameState.profile.plan).timeLabel}</span>
            {/if}
          </p>
        </div>
      </div>

      <!-- ─────────────────────────────────────────────────
           PRACTICE — spaced review of learned words
      ───────────────────────────────────────────────── -->
      <div class="w-full max-w-sm animate-fade-up" style="animation-delay: 90ms;">
        <button
          type="button"
          onclick={() => goto('/practice')}
          disabled={!practice.available}
          class="w-full flex items-center gap-3 p-3.5 rounded-2xl border text-left transition-all
            {practice.available
              ? 'bg-bg-surface border-accent/30 hover:border-accent/60 shadow-sm active:scale-[0.98] cursor-pointer'
              : 'bg-bg-surface-alt border-border-warm opacity-70 cursor-not-allowed'}"
        >
          <div class="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 {practice.available ? 'bg-accent/15 text-accent' : 'bg-border-warm text-text-muted'}">
            <svg viewBox="0 0 24 24" fill="currentColor" class="w-5 h-5">
              <path d="M20.57 14.86L22 13.43 20.57 12 17 15.57 8.43 7 12 3.43 10.57 2 9.14 3.43 7.71 2 5.57 4.14 4.14 2.71 2.71 4.14l1.43 1.43L2 7.71l1.43 1.43L2 10.57 3.43 12 7 8.43 15.57 17 12 20.57 13.43 22l1.43-1.43L16.29 22l2.14-2.14 1.43 1.43 1.43-1.43-1.43-1.43L22 16.29z"/>
            </svg>
          </div>
          <div class="flex-1 min-w-0">
            <div class="text-xs font-black uppercase tracking-wider text-text-primary font-cinzel">Practice</div>
            <div class="text-[11px] text-text-muted leading-snug">
              {#if !practice.available}
                Complete a lesson to unlock review
              {:else if practice.dueCount > 0}
                {practice.dueCount} word{practice.dueCount === 1 ? '' : 's'} ready for review
              {:else}
                All caught up — a quick review keeps words fresh
              {/if}
            </div>
          </div>
          {#if practice.available && practice.dueCount > 0}
            <span class="shrink-0 min-w-6 h-6 px-1.5 rounded-full bg-accent text-bg-base text-[11px] font-black flex items-center justify-center tabular-nums">
              {practice.dueCount}
            </span>
          {/if}
        </button>
      </div>

      <!-- ═══════════════════════════════════════════════════════
           NODE ICON SNIPPET — Declare before use
      ═══════════════════════════════════════════════════════ -->
      {#snippet NodeIcon(type: 'verse' | 'memorize' | 'reflect' | 'chest' | 'challenge' | 'complete')}
        {#if type === 'chest'}
          <svg viewBox="0 0 24 24" fill="currentColor" class="w-6 h-6 text-bg-base">
            <path d="M4 6a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v2H4V6zm16 4H4v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8zm-9 3a1.5 1.5 0 1 1 2 0v1.5a.5.5 0 0 1-.5.5h-1a.5.5 0 0 1-.5-.5V13z" />
          </svg>
        {:else if type === 'memorize'}
          <svg viewBox="0 0 24 24" fill="currentColor" class="w-6 h-6 text-bg-base">
            <path fill-rule="evenodd" d="M5.625 1.5c-1.036 0-1.875.84-1.875 1.875v17.25c0 1.035.84 1.875 1.875 1.875h12.75c1.035 0 1.875-.84 1.875-1.875V12.75A3.75 3.75 0 0016.5 9h-1.875a1.875 1.875 0 01-1.875-1.875V5.25A3.75 3.75 0 009 1.5H5.625zM7.5 15a.75.75 0 01.75-.75h7.5a.75.75 0 010 1.5h-7.5A.75.75 0 017.5 15zm.75 2.25a.75.75 0 000 1.5H12a.75.75 0 000-1.5H8.25z" clip-rule="evenodd" />
            <path d="M12.971 1.816A5.23 5.23 0 0114.25 5.25v1.875c0 .207.168.375.375.375H16.5a5.23 5.23 0 013.434 1.279 9.768 9.768 0 00-6.963-6.963z" />
          </svg>
        {:else if type === 'reflect'}
          <svg viewBox="0 0 24 24" fill="currentColor" class="w-6 h-6 text-bg-base">
            <path d="M12 22C6.477 22 2 17.523 2 12S6.477 2 12 2s10 4.477 10 10-4.477 10-10 10zm0-2a8 8 0 1 0 0-16 8 8 0 0 0 0 16zm-1-5h2v2h-2v-2zm0-8h2v6h-2V7z" />
          </svg>
        {:else if type === 'challenge'}
          <svg viewBox="0 0 24 24" fill="currentColor" class="w-6 h-6 text-bg-base">
            <path fill-rule="evenodd" d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25zm-2.625 6c-.54 0-.828.419-.936.634a1.96 1.96 0 00-.189.866c0 .298.059.605.189.866.108.215.395.634.936.634.54 0 .828-.419.936-.634.13-.26.189-.568.189-.866 0-.298-.059-.605-.189-.866-.108-.215-.395-.634-.936-.634zm4.314.634c.108-.215.395-.634.936-.634.54 0 .828.419.936.634.13.26.189.568.189.866 0 .298-.059.605-.189.866-.108.215-.395.634-.936.634-.54 0-.828-.419-.936-.634a1.96 1.96 0 01-.189-.866c0-.298.059-.605.189-.866zm2.023 6.828a.75.75 0 10-1.06-1.06 3.75 3.75 0 01-5.304 0 .75.75 0 00-1.06 1.06 5.25 5.25 0 007.424 0z" clip-rule="evenodd" />
          </svg>
        {:else if type === 'complete'}
          <svg viewBox="0 0 24 24" fill="currentColor" class="w-6 h-6 text-bg-base">
            <path fill-rule="evenodd" d="M5.166 2.621v.858c-1.035.148-2.059.33-3.071.543a.75.75 0 00-.584.859 6.753 6.753 0 006.138 5.6 6.73 6.73 0 002.743 1.346A6.707 6.707 0 019.279 15H8.54c-1.036 0-1.875.84-1.875 1.875V19.5h-.75a2.25 2.25 0 000 4.5h9.75a2.25 2.25 0 000-4.5h-.75v-2.625c0-1.036-.84-1.875-1.875-1.875h-.739a6.706 6.706 0 01-1.112-3.173 6.73 6.73 0 002.743-1.347 6.753 6.753 0 006.139-5.6.75.75 0 00-.585-.858 47.077 47.077 0 00-3.07-.543V2.62a.75.75 0 00-.658-.744 49.798 49.798 0 00-6.093-.377.75.75 0 00-.657.744zm0 2.629c0 1.196.312 2.32.857 3.294A5.266 5.266 0 013.16 5.337a45.6 45.6 0 012.006-.343v.256zm13.5 0v-.256c.674.1 1.343.214 2.006.343a5.265 5.265 0 01-2.863 3.207 6.72 6.72 0 00.857-3.294z" clip-rule="evenodd" />
          </svg>
        {:else}
          <svg viewBox="0 0 24 24" fill="currentColor" class="w-6 h-6 text-bg-base">
            <path fill-rule="evenodd" d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.007 5.404.433c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.433 2.082-5.006z" clip-rule="evenodd" />
          </svg>
        {/if}
      {/snippet}

      <!-- ═══════════════════════════════════════════════════════
           CHAPTERS LOOP — Each chapter with compact banner + roadmap
      ═══════════════════════════════════════════════════════ -->
      {#each chapterStats as { chapter, completed, total, pct }, chIdx}
        <div class="w-full flex flex-col items-center gap-3 z-10 animate-fade-up" style="animation-delay: {80 + chIdx * 30}ms;">

          <!-- ─── Compact Chapter Summary Card (shrunk ~40%) ─── -->
          <div class="w-full max-w-sm bg-gradient-to-r from-success/10 via-bg-surface to-bg-surface-alt border border-primary/25 rounded-xl px-4 py-3 shadow-sm relative overflow-hidden">
            <div class="absolute -right-3 -bottom-3 text-5xl font-cinzel text-text-primary/5 pointer-events-none select-none">श्री</div>
            <div class="flex items-center gap-3 relative z-10">
              <!-- Chapter badge -->
              <div class="w-9 h-9 rounded-xl bg-primary/15 border border-primary/30 flex items-center justify-center flex-shrink-0">
                <span class="text-[10px] font-black text-primary font-cinzel leading-none text-center">CH<br/>{chapter.number}</span>
              </div>
              <!-- Chapter info -->
              <div class="flex-1 min-w-0">
                <div class="text-xs font-black text-text-primary font-cinzel tracking-wide truncate">{chapter.title}</div>
                <div class="text-[10px] text-text-muted leading-tight mt-0.5 truncate">{chapter.summary.slice(0, 55)}…</div>
                <!-- Progress -->
                <div class="flex items-center gap-2 mt-1.5">
                  <div class="flex-1 h-1 bg-border-warm rounded-full overflow-hidden">
                    <div
                      class="h-full bg-gradient-to-r from-primary to-primary-dark rounded-full transition-all duration-700"
                      style="width: {pct}%"
                    ></div>
                  </div>
                  <span class="text-[10px] text-text-muted font-bold tabular-nums flex-shrink-0">{completed}/{total}</span>
                </div>
              </div>
              <!-- % badge -->
              <div class="flex-shrink-0 text-right">
                <span class="text-sm font-black text-primary tabular-nums">{pct}%</span>
              </div>
            </div>
          </div>

          <!-- ─── Sections within chapter ─── -->
          {#each chapter.sections as section, sIdx}
            <div class="w-full flex flex-col items-center gap-0">

              <!-- Section Milestone Header -->
              <div class="flex items-center gap-3 w-full max-w-sm my-2 select-none">
                <div class="flex-1 h-px bg-gradient-to-r from-transparent to-border-warm"></div>
                <div class="flex items-center gap-1.5 px-3 py-1 rounded-full bg-bg-surface border border-border-warm shadow-sm">
                  <svg viewBox="0 0 24 24" fill="currentColor" class="w-3.5 h-3.5 text-success">
                    <path d="M12 3c-1.5 2.5-3 5.5-3 8 0 2.5 1.5 4.5 3 4.5s3-2 3-4.5c0-2.5-1.5-5.5-3-8zm-5 4c-1.5 2-3 5-3 7 0 2.5 2 4.5 4.5 4.5 2 0 3.5-1.5 3.5-3.5-2 0-3.5-1.5-4-3.5-.5-1.5-.5-3 0-4.5zm10 0c.5 1.5.5 3 0 4.5-.5 2-2 3.5-4 3.5 0 2 1.5 3.5 3.5 3.5 2.5 0 4.5-2 4.5-4.5 0-2-1.5-5-3-7z"/>
                  </svg>
                  <span class="text-[10px] font-black text-text-muted tracking-widest uppercase">{section.title}</span>
                </div>
                <div class="flex-1 h-px bg-gradient-to-l from-transparent to-border-warm"></div>
              </div>

              <!-- ─── Roadmap Canvas ─── -->
              <div
                class="w-full max-w-sm relative flex flex-col items-center"
                style="height: {section.lessons.length * ROW_HEIGHT + 80}px"
              >

                <!-- Background track SVG (full path) -->
                <svg class="absolute inset-0 w-full h-full pointer-events-none z-0 overflow-visible">
                  <!-- Base road -->
                  <path
                    d={generatePathD(section.lessons.length)}
                    fill="none"
                    stroke="var(--color-track-base)"
                    stroke-width="18"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  />

                  <!-- Per-segment coloring: gold=completed, animated=current, muted=locked -->
                  {#each section.lessons as lesson, idx}
                    {#if idx > 0}
                      {@const prevLesson = section.lessons[idx - 1]}
                      {@const prevCompleted = gameState.completedLessons.includes(prevLesson.id)}
                      {@const currCompleted = gameState.completedLessons.includes(lesson.id)}
                      {@const isCurrentSeg = prevCompleted && !currCompleted}

                      {#if prevCompleted && currCompleted}
                        <!-- Completed segment: solid gold -->
                        <path
                          d={generateSegmentD(idx)}
                          fill="none"
                          stroke="var(--color-primary)"
                          stroke-width="5"
                          stroke-linecap="round"
                          opacity="0.9"
                        />
                        <path
                          d={generateSegmentD(idx)}
                          fill="none"
                          stroke="var(--color-primary-dark)"
                          stroke-width="2"
                          stroke-linecap="round"
                          stroke-dasharray="4 10"
                          opacity="0.6"
                        />
                      {:else if isCurrentSeg}
                        <!-- Current segment: animated glow -->
                        <path
                          d={generateSegmentD(idx)}
                          fill="none"
                          stroke="var(--color-primary)"
                          stroke-width="4"
                          stroke-linecap="round"
                          stroke-dasharray="8 8"
                          opacity="0.7"
                          class="animate-[path-shimmer_1.8s_ease-in-out_infinite]"
                        />
                      {:else}
                        <!-- Locked segment: muted dashed -->
                        <path
                          d={generateSegmentD(idx)}
                          fill="none"
                          stroke="var(--color-track-locked)"
                          stroke-width="4"
                          stroke-linecap="round"
                          stroke-dasharray="5 7"
                          opacity="0.7"
                        />
                      {/if}
                    {/if}
                  {/each}
                </svg>

                <!-- ─── Nodes ─── -->
                {#each section.lessons as lesson, idx}
                  {@const unlocked = isLessonUnlocked(lesson.id)}
                  {@const canJump = !unlocked && cfg.pathAccess === 'jump'}
                  {@const completed = gameState.completedLessons.includes(lesson.id)}
                  {@const offsetPx = getNodeOffset(idx)}
                  {@const isCurrentActive = lesson.id === nextLesson?.id}
                  {@const nodeType = getNodeType(lesson, idx, section.lessons.length)}

                  <div
                    class="absolute top-0 left-1/2 flex flex-col items-center z-10"
                    style="transform: translate(calc(-50% + {offsetPx}px), {idx * ROW_HEIGHT + 40}px)"
                  >
                    <button
                      onclick={() => handleNodeClick(lesson, unlocked)}
                      disabled={!unlocked && !canJump}
                      class="relative group flex flex-col items-center select-none transition-all duration-150
                        {unlocked || canJump ? 'cursor-pointer active:scale-95' : 'cursor-not-allowed'}"
                      aria-label="{lesson.verseRef} - {lesson.title}"
                      id="lesson-node-{lesson.id}"
                      type="button"
                    >

                      {#if isCurrentActive}
                        <!-- ── ACTIVE NODE ── Glowing, pulsing, large ring -->
                        <div class="relative">
                          <!-- Outer pulse ring -->
                          <div class="absolute -inset-3 rounded-full border-2 border-primary/40 bg-primary/5 animate-pulse-ring pointer-events-none"></div>
                          <!-- Inner border ring -->
                          <div class="absolute -inset-1.5 rounded-full border-2 border-primary/80 pointer-events-none"></div>

                          <!-- Node body -->
                          <div class="w-[64px] h-[64px] rounded-full bg-gradient-to-b from-primary to-primary-dark border-b-[5px] border-accent text-bg-base flex items-center justify-center shadow-lg animate-node-glow group-hover:brightness-110 relative z-10">
                            {@render NodeIcon(nodeType)}
                          </div>
                        </div>

                        <!-- "CONTINUE" label above -->
                        <div class="absolute -top-8 z-30 flex flex-col items-center pointer-events-none">
                          <div class="bg-primary text-bg-base font-black text-[9px] uppercase tracking-wider px-2.5 py-0.5 rounded-lg shadow-lg flex items-center gap-1">
                            <span class="w-1.5 h-1.5 rounded-full bg-bg-base/60 animate-ping absolute"></span>
                            <span class="relative">CONTINUE</span>
                          </div>
                          <div class="w-0 h-0 border-l-[4px] border-l-transparent border-r-[4px] border-r-transparent border-t-[5px] border-t-primary -mt-[1px]"></div>
                        </div>

                      {:else if completed}
                        <!-- ── COMPLETED NODE ── Gold with checkmark -->
                        <div class="w-[58px] h-[58px] rounded-full bg-gradient-to-b from-primary to-primary-dark border-b-4 border-accent text-bg-base flex items-center justify-center shadow-md relative z-10 transition-all duration-150 group-hover:brightness-110">
                          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-6 h-6 text-bg-base">
                            <path fill-rule="evenodd" d="M19.916 4.626a.75.75 0 01.208 1.04l-9 13.5a.75.75 0 01-1.154.114l-6-6a.75.75 0 011.06-1.06l5.353 5.353 8.493-12.739a.75.75 0 011.04-.208z" clip-rule="evenodd" />
                          </svg>
                        </div>

                      {:else if unlocked}
                        <!-- ── OPEN NODE ── Available but not the suggested next step -->
                        <div class="w-[58px] h-[58px] rounded-full bg-bg-surface border-2 border-primary/60 border-b-4 text-primary flex items-center justify-center shadow-md relative z-10 transition-all duration-150 group-hover:bg-primary/10">
                          <div class="[&_svg]:text-primary">{@render NodeIcon(nodeType)}</div>
                        </div>

                      {:else}
                        {#if canJump && lesson.id === firstLockedId}
                          <div class="absolute -top-7 z-30 pointer-events-none">
                            <div class="bg-accent text-bg-base font-black text-[9px] uppercase tracking-wider px-2 py-0.5 rounded-lg shadow whitespace-nowrap">
                              Jump here?
                            </div>
                          </div>
                        {/if}
                        <!-- ── LOCKED NODE ── Muted -->
                        <div class="w-[54px] h-[54px] rounded-full bg-node-locked border border-border-warm border-b-4 flex items-center justify-center shadow-sm opacity-70 relative z-10">
                          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-4.5 h-4.5 text-text-muted">
                            <path fill-rule="evenodd" d="M12 1.5a5.25 5.25 0 00-5.25 5.25v3a3 3 0 00-3 3v6.75a3 3 0 003 3h10.5a3 3 0 003-3v-6.75a3 3 0 00-3-3v-3c0-2.9-2.35-5.25-5.25-5.25zm3.75 8.25v-3a3.75 3.75 0 10-7.5 0v3h7.5z" clip-rule="evenodd" />
                          </svg>
                        </div>
                      {/if}

                      <!-- Verse ref label below node -->
                      <span class="text-[10px] font-extrabold tracking-wide mt-2 max-w-[96px] text-center truncate
                        {isCurrentActive ? 'text-primary font-black' : completed ? 'text-primary-dark' : 'text-text-muted/60'}">
                        {lesson.verseRef}
                      </span>

                      <!-- Node type chip for active/unlocked (not completed/locked) -->
                      {#if isCurrentActive || (!completed && unlocked)}
                        <span class="text-[8px] text-text-muted/60 uppercase tracking-wider font-bold -mt-0.5">
                          {nodeType === 'verse' ? 'Verse' :
                           nodeType === 'memorize' ? 'Memory' :
                           nodeType === 'reflect' ? 'Reflect' :
                           nodeType === 'chest' ? 'Chest' :
                           nodeType === 'challenge' ? 'Challenge' :
                           'Complete'}
                        </span>
                      {/if}
                    </button>
                  </div>
                {/each}

              </div>
            </div>
          {/each}

        </div>
      {/each}

      <!-- ─────────────────────────────────────────────────
           BOTTOM ENGAGEMENT — Daily Wisdom + Achievements
      ───────────────────────────────────────────────── -->
      <div class="w-full max-w-sm flex flex-col gap-3 mt-2 mb-8 z-10">

        <!-- Daily Wisdom Quote -->
        <div class="bg-bg-surface border border-border-warm rounded-2xl p-4 shadow-sm relative overflow-hidden">
          <div class="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent pointer-events-none rounded-2xl"></div>
          <div class="flex items-start gap-3 relative z-10">
            <div class="w-9 h-9 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary flex-shrink-0 mt-0.5">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-5 h-5">
                <path d="M9 18h6m-4 3h2M12 2a7 7 0 0 0-7 7c0 2.38 1.19 4.47 3 5.74V17a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1v-2.26C17.81 13.47 19 11.38 19 9a7 7 0 0 0-7-7z"/>
              </svg>
            </div>
            <div>
              <div class="text-[9px] uppercase font-black tracking-widest text-primary/70 mb-1">Daily Wisdom</div>
              <p class="text-xs text-text-primary font-cinzel leading-relaxed italic">
                "You have a right to perform your prescribed duties, but you are not entitled to the fruits of your actions."
              </p>
              <p class="text-[10px] text-text-muted mt-1.5">— Bhagavad Gita 2.47</p>
            </div>
          </div>
        </div>

        <!-- Recent Achievement / Progress Summary -->
        <div class="bg-bg-surface border border-border-warm rounded-2xl p-4 shadow-sm">
          <div class="text-[9px] uppercase font-black tracking-widest text-text-muted mb-3">Your Journey</div>
          <div class="grid grid-cols-3 gap-3">
            <div class="flex flex-col items-center gap-1 p-2 bg-bg-surface-alt rounded-xl border border-border-warm">
              <svg viewBox="0 0 24 24" fill="currentColor" class="w-5 h-5 text-primary">
                <path d="M12 23c-4.97 0-9-4.03-9-9 0-4.13 2.84-7.58 6.72-8.62.44-.12.88.2.88.66v.83c0 2.21 1.79 4 4 4s4-1.79 4-4v-.83c0-.46.44-.78.88-.66C20.16 6.42 23 9.87 23 14c0 4.97-4.03 9-9 9z"/>
              </svg>
              <span class="text-sm font-black text-primary tabular-nums">{gameState.streak}</span>
              <span class="text-[9px] text-text-muted text-center leading-tight">Day Streak</span>
            </div>
            <div class="flex flex-col items-center gap-1 p-2 bg-bg-surface-alt rounded-xl border border-border-warm">
              <svg viewBox="0 0 24 24" fill="currentColor" class="w-5 h-5 text-primary">
                <path d="M13 2L3 14h7v8l10-12h-7V2z"/>
              </svg>
              <span class="text-sm font-black text-primary tabular-nums">{gameState.xp}</span>
              <span class="text-[9px] text-text-muted text-center leading-tight">Total XP</span>
            </div>
            <div class="flex flex-col items-center gap-1 p-2 bg-bg-surface-alt rounded-xl border border-border-warm">
              <svg viewBox="0 0 24 24" fill="currentColor" class="w-5 h-5 text-success">
                <path d="M21 5c-1.11-.35-2.33-.5-3.5-.5-1.95 0-4.05.4-5.5 1.5-1.45-1.1-3.55-1.5-5.5-1.5S2.45 4.9 1 6v14.65c0 .25.25.5.5.5.1 0 .15-.05.25-.05C3.1 20.45 5.05 20 6.5 20c1.95 0 4.05.4 5.5 1.5 1.35-.85 3.8-1.5 5.5-1.5 1.65 0 3.35.3 4.75 1.05.1.05.15.05.25.05.25 0 .5-.25.5-.5V6c-.6-.45-1.35-.75-2-1zm0 13.5c-1.1-.35-2.3-.5-3.5-.5-1.7 0-4.15.65-5.5 1.5V8c1.35-.85 3.8-1.5 5.5-1.5 1.2 0 2.4.15 3.5.5v11.5z"/>
              </svg>
              <span class="text-sm font-black text-primary tabular-nums">{gameState.completedLessons.length}</span>
              <span class="text-[9px] text-text-muted text-center leading-tight">Verses Learned</span>
            </div>
          </div>

          <!-- Achievement unlock teaser -->
          {#if gameState.completedLessons.length >= 3}
            <div class="mt-3 flex items-center gap-2.5 p-2.5 bg-primary/10 border border-primary/20 rounded-xl">
              <div class="w-7 h-7 rounded-lg bg-primary/20 flex items-center justify-center text-primary">
                <svg viewBox="0 0 24 24" fill="currentColor" class="w-4 h-4"><path d="M12 2a5 5 0 0 0-5 5c0 2.11 1.31 3.92 3.17 4.67L8.1 19.46a1 1 0 0 0 .42 1.22l2.9 1.74a1 1 0 0 0 1.16 0l2.9-1.74a1 1 0 0 0 .42-1.22l-2.07-7.79A5.002 5.002 0 0 0 17 7a5 5 0 0 0-5-5zm0 2a3 3 0 1 1 0 6 3 3 0 0 1 0-6z"/></svg>
              </div>
              <div>
                <div class="text-[10px] font-black text-primary">Karma Seeker</div>
                <div class="text-[9px] text-text-muted">Completed 3+ lessons</div>
              </div>
              <div class="ml-auto">
                <svg viewBox="0 0 24 24" fill="currentColor" class="w-3.5 h-3.5 text-primary/70">
                  <path fill-rule="evenodd" d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.007 5.404.433c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.433 2.082-5.006z" clip-rule="evenodd" />
                </svg>
              </div>
            </div>
          {:else}
            <div class="mt-3 flex items-center gap-2.5 p-2.5 bg-bg-surface-alt border border-border-warm rounded-xl opacity-70">
              <div class="w-7 h-7 rounded-lg bg-border-warm flex items-center justify-center text-text-muted">
                <svg viewBox="0 0 24 24" fill="currentColor" class="w-4 h-4"><path d="M12 2a5 5 0 0 0-5 5c0 2.11 1.31 3.92 3.17 4.67L8.1 19.46a1 1 0 0 0 .42 1.22l2.9 1.74a1 1 0 0 0 1.16 0l2.9-1.74a1 1 0 0 0 .42-1.22l-2.07-7.79A5.002 5.002 0 0 0 17 7a5 5 0 0 0-5-5zm0 2a3 3 0 1 1 0 6 3 3 0 0 1 0-6z"/></svg>
              </div>
              <div>
                <div class="text-[10px] font-bold text-text-muted">Karma Seeker</div>
                <div class="text-[9px] text-text-muted">Complete {3 - gameState.completedLessons.length} more lesson{3 - gameState.completedLessons.length !== 1 ? 's' : ''} to unlock</div>
              </div>
              <div class="ml-auto text-[9px] text-text-muted font-bold px-1.5 py-0.5 bg-border-warm rounded">
                {gameState.completedLessons.length}/3
              </div>
            </div>
          {/if}
        </div>

      </div>

    </div>
  </div>

  <!-- ═══════════════════════════════════════════════════════
       LESSON DETAIL MODAL
  ═══════════════════════════════════════════════════════ -->
  {#if activeLessonModal}
    <div
      class="fixed inset-0 bg-bg-base/85 backdrop-blur-md z-50 flex items-end sm:items-center justify-center p-4 animate-[fade-in_0.2s_ease-out]"
      role="dialog"
      aria-modal="true"
      aria-label="Lesson Preview"
    >
      <div class="w-full max-w-sm bg-bg-surface border border-border-warm rounded-3xl p-6 flex flex-col gap-4 shadow-2xl">

        <div class="flex justify-between items-start">
          <div class="flex flex-col">
            <span class="text-[10px] uppercase font-extrabold tracking-widest text-primary">
              {activeLessonModal.verseRef} · Lesson Preview
            </span>
            <h3 class="text-2xl font-black text-text-primary font-cinzel mt-0.5">
              {activeLessonModal.title}
            </h3>
          </div>
          <button
            onclick={() => activeLessonModal = null}
            class="text-text-muted hover:text-text-primary bg-bg-surface-alt p-2 rounded-full cursor-pointer"
            aria-label="Close"
            type="button"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor" class="w-4 h-4">
              <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div class="h-px bg-border-warm"></div>

        <div class="bg-bg-surface-alt border border-border-warm p-4 rounded-2xl flex flex-col gap-3 text-center">
          <div>
            <VerseText
              sanskrit={activeLessonModal.verseSanskrit}
              transliteration={activeLessonModal.verseTransliteration}
              class="text-base text-primary-dark dark:text-primary leading-relaxed"
            />
          </div>
          <div class="flex items-center justify-center gap-1.5 text-text-muted/70">
            <svg viewBox="0 0 24 24" fill="currentColor" class="w-3.5 h-3.5"><path fill-rule="evenodd" d="M12 1.5a5.25 5.25 0 00-5.25 5.25v3a3 3 0 00-3 3v6.75a3 3 0 003 3h10.5a3 3 0 003-3v-6.75a3 3 0 00-3-3v-3c0-2.9-2.35-5.25-5.25-5.25zm3.75 8.25v-3a3.75 3.75 0 10-7.5 0v3h7.5z" clip-rule="evenodd" /></svg>
            <span class="text-[10px] font-bold uppercase tracking-wider">Meaning revealed as you learn</span>
          </div>
        </div>

        <!-- What's inside teaser -->
        <div class="grid grid-cols-3 gap-2 text-center">
          <div class="flex flex-col items-center gap-1.5">
            <div class="w-8 h-8 rounded-full bg-primary/15 border border-primary/30 flex items-center justify-center text-primary">
              <svg viewBox="0 0 24 24" fill="currentColor" class="w-4 h-4"><path d="M12 2a5 5 0 0 0-5 5c0 2.11 1.31 3.92 3.17 4.67L8.1 19.46a1 1 0 0 0 .42 1.22l2.9 1.74a1 1 0 0 0 1.16 0l2.9-1.74a1 1 0 0 0 .42-1.22l-2.07-7.79A5.002 5.002 0 0 0 17 7a5 5 0 0 0-5-5zm0 2a3 3 0 1 1 0 6 3 3 0 0 1 0-6z"/></svg>
            </div>
            <span class="text-[9px] text-text-muted font-bold leading-tight">{activeLessonModal.parts?.length || 1} part{(activeLessonModal.parts?.length || 1) !== 1 ? 's' : ''} to discover</span>
          </div>
          <div class="flex flex-col items-center gap-1.5">
            <div class="w-8 h-8 rounded-full bg-success/15 border border-success/30 flex items-center justify-center text-success">
              <svg viewBox="0 0 24 24" fill="currentColor" class="w-4 h-4"><path fill-rule="evenodd" d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.007 5.404.433c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.433 2.082-5.006z" clip-rule="evenodd" /></svg>
            </div>
            <span class="text-[9px] text-text-muted font-bold leading-tight">Practice exercises</span>
          </div>
          <div class="flex flex-col items-center gap-1.5">
            <div class="w-8 h-8 rounded-full bg-accent/15 border border-accent/30 flex items-center justify-center text-accent">
              <svg viewBox="0 0 24 24" fill="currentColor" class="w-4 h-4"><path d="M13 2L3 14h7v8l10-12h-7V2z"/></svg>
            </div>
            <span class="text-[9px] text-text-muted font-bold leading-tight">+50 XP</span>
          </div>
        </div>

        <button
          onclick={() => startLesson(activeLessonModal!.id)}
          class="w-full py-4 bg-primary hover:bg-primary-dark text-bg-base font-black text-sm rounded-2xl shadow-lg btn-3d border-b-4 border-accent active:scale-95 transition-all cursor-pointer flex items-center justify-center gap-2"
          id="start-lesson-btn"
          type="button"
        >
          <svg viewBox="0 0 24 24" fill="currentColor" class="w-4 h-4"><path d="M8 5v14l11-7z"/></svg>
          <span>START LESSON</span>
        </button>
      </div>
    </div>
  {/if}

  <!-- ═══════════════════════════════════════════════════════
       JUMP HERE? MODAL
  ═══════════════════════════════════════════════════════ -->
  {#if jumpTarget}
    {@const skipCount = lessonsSkippedBy(jumpTarget)}
    <div
      class="fixed inset-0 bg-bg-base/85 backdrop-blur-md z-50 flex items-end sm:items-center justify-center p-4 animate-[fade-in_0.2s_ease-out]"
      role="dialog"
      aria-modal="true"
      aria-label="Jump ahead"
    >
      <div class="w-full max-w-sm bg-bg-surface border border-border-warm rounded-3xl p-6 flex flex-col items-center gap-4 shadow-2xl text-center">
        <Mascot mood="guide" size="md" />
        <div>
          <span class="text-[10px] uppercase font-extrabold tracking-widest text-accent">Jump here?</span>
          <h3 class="text-xl font-black text-text-primary font-cinzel mt-0.5">Skip to {jumpTarget.verseRef}</h3>
        </div>
        <p class="text-xs text-text-muted leading-relaxed max-w-xs">
          Already know the earlier verses? Pass a short test covering the {skipCount} verse{skipCount === 1 ? '' : 's'}
          before it to skip ahead. You can make up to 3 mistakes, and your hearts are safe.
        </p>
        <div class="w-full flex flex-col gap-2.5">
          <button
            onclick={() => startJump(jumpTarget!.id)}
            class="w-full py-4 bg-accent hover:brightness-110 text-bg-base font-black text-sm rounded-2xl shadow-lg btn-3d border-b-4 border-accent/60 active:scale-95 transition-all"
            type="button"
          >
            START JUMP TEST
          </button>
          <button
            onclick={() => (jumpTarget = null)}
            class="w-full py-3 bg-bg-surface-alt hover:bg-border-warm text-text-muted font-bold text-xs rounded-2xl border border-border-warm transition-all"
            type="button"
          >
            Not now
          </button>
        </div>
      </div>
    </div>
  {/if}

  <!-- ═══════════════════════════════════════════════════════
       SETTINGS MODAL
  ═══════════════════════════════════════════════════════ -->
  {#if showSettingsModal}
    <div
      class="fixed inset-0 bg-bg-base/85 backdrop-blur-md z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-label="Settings"
    >
      <div class="w-full max-w-sm max-h-[90vh] overflow-y-auto scrollbar-none bg-bg-surface border border-border-warm rounded-3xl p-6 flex flex-col gap-4 shadow-2xl">
        <div class="flex justify-between items-center">
          <h3 class="text-lg font-black font-cinzel text-text-primary">App Settings</h3>
          <button
            onclick={() => showSettingsModal = false}
            class="text-text-muted hover:text-text-primary bg-bg-surface-alt p-2 rounded-full cursor-pointer"
            aria-label="Close"
            type="button"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor" class="w-4 h-4">
              <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div class="h-px bg-border-warm"></div>

        <div class="flex flex-col gap-3">
          {#if gameState.profile}
            <div class="w-full py-3 bg-bg-surface-alt border border-border-warm text-text-primary font-bold text-xs rounded-xl flex items-center justify-between px-4">
              <span>Your Plan</span>
              <span class="text-primary font-extrabold">{planById(gameState.profile.plan).name}</span>
            </div>
          {/if}

          <div class="flex flex-col gap-2">
            <span class="text-[10px] font-black uppercase tracking-wider text-text-muted">Daily goal</span>
            <div class="grid grid-cols-4 gap-1.5">
              {#each DAILY_GOAL_OPTIONS as option}
                <button
                  type="button"
                  onclick={() => gameState.setDailyGoal(option.xp)}
                  class="flex flex-col items-center py-2 rounded-xl border transition-colors
                    {gameState.dailyGoal === option.xp
                      ? 'bg-primary/15 border-primary text-primary'
                      : 'bg-bg-surface-alt border-border-warm text-text-muted hover:text-text-primary'}"
                >
                  <span class="text-[11px] font-black">{option.label}</span>
                  <span class="text-[9px] font-bold tabular-nums">{option.xp} XP</span>
                </button>
              {/each}
            </div>
          </div>

          <div class="flex flex-col gap-2">
            <span class="text-[10px] font-black uppercase tracking-wider text-text-muted">Sanskrit script</span>
            <ScriptToggle />
          </div>

          {#if gameState.profile}
            <div class="flex flex-col gap-2">
              <span class="text-[10px] font-black uppercase tracking-wider text-text-muted">Exercise style</span>
              <div class="grid grid-cols-3 gap-1.5">
                {#each PRACTICE_STYLES as style}
                  <button
                    type="button"
                    onclick={() => gameState.setPracticePreference(style.value)}
                    class="py-2 rounded-xl border text-[11px] font-black transition-colors
                      {gameState.profile.practicePreference === style.value
                        ? 'bg-primary/15 border-primary text-primary'
                        : 'bg-bg-surface-alt border-border-warm text-text-muted hover:text-text-primary'}"
                  >
                    {style.label}
                  </button>
                {/each}
              </div>
            </div>
          {/if}

          <button
            onclick={() => gameState.setThemeMode(gameState.themeMode === 'light' ? 'dark' : 'light')}
            class="w-full py-3 bg-bg-surface-alt hover:bg-border-warm border border-border-warm text-text-primary font-bold text-xs rounded-xl flex items-center justify-between px-4 transition-colors cursor-pointer"
            type="button"
          >
            <span>Appearance</span>
            <span class="text-primary font-extrabold">{gameState.themeMode === 'light' ? 'Light' : 'Dark'}</span>
          </button>

          <button
            onclick={() => gameState.refillHearts()}
            class="w-full py-3 bg-bg-surface-alt hover:bg-border-warm border border-border-warm text-text-primary font-bold text-xs rounded-xl flex items-center justify-between px-4 transition-colors cursor-pointer"
            type="button"
          >
            <span>Refill Hearts</span>
            <span class="text-error font-extrabold flex items-center gap-1">
              <svg viewBox="0 0 24 24" fill="currentColor" class="w-3.5 h-3.5 text-error"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>
              5
            </span>
          </button>

          <button
            onclick={redoOnboarding}
            class="w-full py-3 bg-bg-surface-alt hover:bg-border-warm border border-border-warm text-text-primary font-bold text-xs rounded-xl flex items-center justify-between px-4 transition-colors cursor-pointer"
            type="button"
          >
            <span>Redo Onboarding</span>
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-4 h-4 text-text-muted">
              <path stroke-linecap="round" stroke-linejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
            </svg>
          </button>

          <button
            onclick={resetGame}
            class="w-full py-3 bg-error/10 hover:bg-error/20 border border-error/30 text-error font-bold text-xs rounded-xl flex items-center justify-between px-4 transition-colors cursor-pointer"
            type="button"
          >
            <span>Reset Progress Data</span>
            <svg viewBox="0 0 24 24" fill="currentColor" class="w-4 h-4 text-error"><path d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z"/></svg>
          </button>
        </div>
      </div>
    </div>
  {/if}

</div>
