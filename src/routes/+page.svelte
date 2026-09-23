<script lang="ts">
  import { onMount, tick } from 'svelte';
  import { goto } from '$app/navigation';
  import { gameState } from '$lib/state/gameState.svelte';
  import { gitaData, type Lesson, type Section } from '$lib/data/gitaData';
  import { practiceStatus } from '$lib/data/practice';
  import { planById } from '$lib/data/onboarding';
  import { learningConfig, newContentAdvice, goalGreeting } from '$lib/data/learningConfig';
  import Mascot from '$lib/components/Mascot.svelte';
  import Icon from '$lib/components/Icon.svelte';
  import TopStatsBar from '$lib/components/TopStatsBar.svelte';

  const cfg = $derived(learningConfig(gameState.profile));
  const allLessons = gitaData.chapters.flatMap((c) => c.sections.flatMap((s) => s.lessons));
  const practice = $derived(practiceStatus());

  function isLessonUnlocked(lessonId: string): boolean {
    if (cfg.pathAccess === 'open') return true;
    const i = allLessons.findIndex((l) => l.id === lessonId);
    return i <= 0 || gameState.completedLessons.includes(allLessons[i - 1].id);
  }

  const isDone = (id: string) => gameState.completedLessons.includes(id);

  const nextLesson = $derived(allLessons.find((l) => !isDone(l.id) && isLessonUnlocked(l.id)) ?? null);
  const firstLockedId = $derived(allLessons.find((l) => !isDone(l.id) && !isLessonUnlocked(l.id))?.id ?? null);

  // The plan's new-content rule, surfaced as a suggestion on the current lesson's popover
  const advice = $derived(
    nextLesson && practice.available ? newContentAdvice(cfg, practice.dueCount, gameState.today.newLessons) : null
  );
  const planName = $derived(gameState.profile ? planById(gameState.profile.plan).name : '');

  // ─── Path geometry: Duolingo's gentle zigzag ──────────────────────────────
  const OFFSETS = [0, 44, 70, 44, 0, -44, -70, -44];
  const offsetAt = (i: number) => OFFSETS[i % OFFSETS.length];

  const UNIT_COLORS = [
    { unit: 'var(--color-primary)', dark: 'var(--color-primary-dark)' },
    { unit: 'var(--color-accent)', dark: 'var(--color-accent-dark)' },
    { unit: 'var(--color-success)', dark: 'var(--color-success-dark)' }
  ];

  // Unit numbering runs across chapters, so each unit keeps its own color
  const units = gitaData.chapters.flatMap((chapter) =>
    chapter.sections.map((section, sIdx) => ({ chapter, section, unitNumber: sIdx + 1 }))
  );

  let selected = $state<string | null>(null);

  function toggleNode(id: string) {
    selected = selected === id ? null : id;
  }

  const unitComplete = (section: Section) => section.lessons.every((l) => isDone(l.id));

  const lessonsSkippedBy = (target: Lesson) =>
    allLessons.slice(0, allLessons.findIndex((l) => l.id === target.id)).filter((l) => !isDone(l.id)).length;

  // Keep the popover on screen when it opens near the bottom
  function reveal(node: HTMLElement) {
    tick().then(() => node.scrollIntoView({ block: 'nearest', behavior: 'smooth' }));
  }

  onMount(() => {
    // Open the path at the learner's current lesson, like Duolingo does
    if (nextLesson) document.getElementById(`node-${nextLesson.id}`)?.scrollIntoView({ block: 'center' });
  });
</script>

<TopStatsBar />

<div class="flex-1 overflow-y-auto scrollbar-none relative">
  {#if selected}
    <button type="button" aria-label="Close" class="fixed inset-0 z-20 cursor-default" onclick={() => (selected = null)}></button>
  {/if}

  {#each units as { chapter, section, unitNumber }, uIdx}
    {@const color = UNIT_COLORS[uIdx % UNIT_COLORS.length]}
    {@const trophyId = `trophy-${section.id}`}
    {@const trophyOpen = selected === trophyId}
    {@const trophyReady = unitComplete(section) && practice.available}
    {@const trophyOffset = offsetAt(section.lessons.length)}
    <section style="--unit: {color.unit}; --unit-dark: {color.dark}">
      <!-- ─── Unit banner (sticks while its unit scrolls by) ─── -->
      <div class="sticky top-0 z-10 px-4 pt-4 pb-2 bg-bg-base">
        <div class="rounded-2xl text-white px-4 py-3.5 flex items-center justify-between gap-3" style="background: var(--unit); box-shadow: 0 4px 0 var(--unit-dark)">
          <div class="min-w-0">
            <p class="text-[13px] font-extrabold uppercase tracking-wide opacity-80">Chapter {chapter.number}, Unit {unitNumber}</p>
            <h2 class="text-xl font-black leading-tight">{section.title}</h2>
          </div>
          <a
            href="/guidebook/{section.id}"
            aria-label="Guidebook"
            class="shrink-0 w-12 h-12 flex items-center justify-center rounded-xl border-2 border-white/40 hover:bg-white/10"
            style="box-shadow: 0 3px 0 rgba(0,0,0,0.15)"
          >
            <Icon name="notebook" class="w-6 h-6" />
          </a>
        </div>
      </div>

      <!-- ─── Path ─── -->
      <div class="relative flex flex-col items-center pt-10 pb-6">
        {#if section.lessons.length >= 3}
          <div class="absolute left-[8%] pointer-events-none" style="top: {2 * 124 + 40}px">
            <Mascot mood="guide" size="lg" animate={true} />
          </div>
        {/if}

        {#each section.lessons as lesson, idx}
          {@const offset = offsetAt(idx)}
          {@const done = isDone(lesson.id)}
          {@const unlocked = isLessonUnlocked(lesson.id)}
          {@const current = lesson.id === nextLesson?.id}
          {@const canJump = !unlocked && cfg.pathAccess === 'jump'}
          {@const isOpen = selected === lesson.id}
          {@const lessonNumber = idx + 1}

          <div class="relative w-full flex justify-center items-start h-[124px] {isOpen ? 'z-30' : ''}">
            <div class="relative" style="transform: translateX({offset}px)" id="node-{lesson.id}">
              <!-- Floating label above the node -->
              {#if current && !isOpen}
                <div class="absolute left-1/2 -top-12 z-10 animate-start-bob pointer-events-none">
                  <div class="relative bg-bg-surface border-2 border-border-warm rounded-xl px-3 py-2 text-[15px] font-black uppercase tracking-wide whitespace-nowrap" style="color: var(--unit)">
                    Start
                    <span class="absolute left-1/2 -bottom-[9px] -translate-x-1/2 w-3.5 h-3.5 rotate-45 bg-bg-surface border-r-2 border-b-2 border-border-warm"></span>
                  </div>
                </div>
              {:else if canJump && lesson.id === firstLockedId && !selected}
                <div class="absolute left-1/2 -top-12 z-10 animate-start-bob pointer-events-none">
                  <div class="relative bg-bg-surface border-2 border-border-warm rounded-xl px-3 py-2 text-[13px] font-black uppercase tracking-wide whitespace-nowrap text-accent">
                    Jump here?
                    <span class="absolute left-1/2 -bottom-[9px] -translate-x-1/2 w-3.5 h-3.5 rotate-45 bg-bg-surface border-r-2 border-b-2 border-border-warm"></span>
                  </div>
                </div>
              {/if}

              <!-- Ring around the current node -->
              {#if current}
                <div class="absolute -inset-[11px] rounded-full border-[7px] border-border-warm pointer-events-none"></div>
              {/if}

              <button
                type="button"
                onclick={() => toggleNode(lesson.id)}
                aria-label="{lesson.verseRef}: {lesson.title}"
                class="path-node relative {unlocked || done ? '' : 'path-node-locked'}"
              >
                {#if done}
                  <Icon name="check" class="w-8 h-8" />
                {:else}
                  <Icon name="star" class="w-8 h-8" />
                {/if}
              </button>
            </div>

            <!-- Popover card -->
            {#if isOpen}
              {@const locked = !unlocked && !done}
              <div
                use:reveal
                class="absolute top-[86px] left-1/2 -translate-x-1/2 w-[calc(100%-32px)] max-w-[330px] z-30 animate-pop-in"
              >
                <span
                  class="absolute -top-2 w-4 h-4 rotate-45 {locked ? 'bg-bg-surface border-l-2 border-t-2 border-border-warm' : ''}"
                  style="left: calc(50% + {offset}px - 8px); {locked ? '' : 'background: var(--unit)'}"
                ></span>
                <div
                  class="relative rounded-2xl p-4 flex flex-col gap-3
                    {locked ? 'bg-bg-surface border-2 border-border-warm' : 'text-white'}"
                  style={locked ? '' : 'background: var(--unit)'}
                >
                  <div>
                    <p class="text-lg font-black leading-tight {locked ? 'text-text-muted' : ''}">{lesson.title}</p>
                    <p class="text-sm font-bold {locked ? 'text-text-muted' : 'opacity-85'}">
                      {#if locked && canJump}
                        Know the earlier verses? Pass a test on the {lessonsSkippedBy(lesson)} before this to jump ahead.
                      {:else if locked}
                        Complete all levels above to unlock this!
                      {:else}
                        Lesson {lessonNumber} of {section.lessons.length} · {lesson.verseRef}
                      {/if}
                    </p>
                    {#if current && !advice}
                      <p class="text-sm font-extrabold mt-1">{goalGreeting(gameState.profile, lesson.verseRef)}</p>
                    {/if}
                  </div>

                  {#if current && advice}
                    <p class="text-[13px] font-bold bg-white/15 rounded-xl px-3 py-2 leading-snug">
                      {advice === 'review-due'
                        ? `${practice.dueCount} word${practice.dueCount === 1 ? ' is' : 's are'} due. Your ${planName} plan suggests reviewing first.`
                        : `You've learned today's new verse. Your ${planName} plan suggests a review now.`}
                    </p>
                  {/if}

                  {#if locked && canJump}
                    <button type="button" class="btn btn-accent w-full" onclick={() => goto(`/jump/${lesson.id}`)}>
                      Jump here
                    </button>
                  {:else if locked}
                    <button type="button" class="btn btn-disabled w-full" disabled>Locked</button>
                  {:else}
                    {#if current && advice}
                      <button type="button" class="btn btn-on-color w-full" onclick={() => goto('/practice/session?kind=review')}>
                        Review first +15 XP
                      </button>
                    {/if}
                    <button type="button" class="btn btn-on-color w-full" onclick={() => goto(`/lesson/${lesson.id}`)}>
                      {done ? 'Practice +15 XP' : 'Start +50 XP'}
                    </button>
                  {/if}
                </div>
              </div>
            {/if}
          </div>
        {/each}

        <!-- ─── Unit review trophy ─── -->
        <div class="relative w-full flex justify-center items-start h-[124px] {trophyOpen ? 'z-30' : ''}">
          <div style="transform: translateX({trophyOffset}px)">
            <button
              type="button"
              onclick={() => toggleNode(trophyId)}
              aria-label="Unit review"
              class="path-node {trophyReady ? 'path-node-gold' : 'path-node-locked'}"
            >
              <Icon name="trophy" class="w-8 h-8" />
            </button>
          </div>
          {#if trophyOpen}
            <div use:reveal class="absolute top-[86px] left-1/2 -translate-x-1/2 w-[calc(100%-32px)] max-w-[330px] z-30 animate-pop-in">
              <span
                class="absolute -top-2 w-4 h-4 rotate-45 {trophyReady ? 'bg-gold' : 'bg-bg-surface border-l-2 border-t-2 border-border-warm'}"
                style="left: calc(50% + {trophyOffset}px - 8px)"
              ></span>
              <div class="relative rounded-2xl p-4 flex flex-col gap-3 {trophyReady ? 'bg-gold text-white' : 'bg-bg-surface border-2 border-border-warm'}">
                <div>
                  <p class="text-lg font-black {trophyReady ? '' : 'text-text-muted'}">Unit Review</p>
                  <p class="text-sm font-bold {trophyReady ? 'opacity-90' : 'text-text-muted'}">
                    {trophyReady ? 'Review the words from this unit to keep them strong.' : 'Complete every lesson in this unit to unlock its review.'}
                  </p>
                </div>
                {#if trophyReady}
                  <button type="button" class="btn btn-on-color w-full" style="--unit: var(--color-gold-dark)" onclick={() => goto('/practice/session?kind=review')}>
                    Start +15 XP
                  </button>
                {:else}
                  <button type="button" class="btn btn-disabled w-full" disabled>Locked</button>
                {/if}
              </div>
            </div>
          {/if}
        </div>
      </div>
    </section>
  {/each}

  <!-- End of available content -->
  <div class="flex items-center gap-3 px-6 pb-10 pt-2">
    <div class="flex-1 h-0.5 bg-border-warm"></div>
    <span class="text-sm font-extrabold uppercase tracking-wide text-text-muted flex items-center gap-2">
      <Icon name="lock" class="w-4 h-4" /> More chapters coming soon
    </span>
    <div class="flex-1 h-0.5 bg-border-warm"></div>
  </div>
</div>
