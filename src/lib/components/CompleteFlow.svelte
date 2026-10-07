<script lang="ts">
  import { untrack } from 'svelte';
  import { gameState, type SessionResult } from '../state/gameState.svelte';
  import { gitaData, sectionForLesson } from '../data/gitaData';
  import { storyForSection, type UnitStory } from '../data/stories';
  import Mascot from './Mascot.svelte';
  import Icon, { type IconName } from './Icon.svelte';
  import StoryReward from './StoryReward.svelte';
  import StreakCelebration from './StreakCelebration.svelte';

  // What follows a finished session: the stats screen, then the unit story if this finished a unit,
  // then the streak celebration if today extended the streak, then back to the path.
  let { sessionResult, summary, title, subtitle, storyLessonId, onExit } = $props<{
    sessionResult: SessionResult;
    summary: { accuracy: number; seconds: number };
    title: string;
    subtitle: string;
    /** The real lesson this session finished, if finishing it could complete a unit (practice passes none) */
    storyLessonId?: string;
    onExit: () => void;
  }>();

  /** The unit-completion story, only when that lesson's whole section is now complete and its story hasn't played. */
  function unitStory(lessonId: string | undefined): UnitStory | null {
    if (!lessonId) return null;
    const found = sectionForLesson(gitaData, lessonId);
    if (!found) return null;
    const { section } = found;
    if (gameState.hasSeenStory(section.id)) return null;
    if (!section.lessons.every((l) => gameState.isVerseDone(l.id))) return null;
    return storyForSection(section);
  }

  // Worked out once, when the session ends — the session has already been recorded by then
  let pendingStory = $state<UnitStory | null>(untrack(() => unitStory(storyLessonId)));
  let showStory = $state(false);
  let showStreak = $state(false);

  function handleContinue() {
    if (pendingStory) {
      showStory = true;
      return;
    }
    afterCelebrations();
  }

  function handleStoryComplete() {
    if (pendingStory) gameState.markStorySeen(pendingStory.sectionId);
    showStory = false;
    pendingStory = null;
    afterCelebrations();
  }

  function afterCelebrations() {
    if (sessionResult.streakExtended) showStreak = true;
    else onExit();
  }

  const accuracyLabel = (a: number) => (a === 100 ? 'Amazing' : a >= 80 ? 'Great' : a >= 60 ? 'Good' : 'Steady');
  const formatTime = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
</script>

{#snippet statCard(label: string, color: string, icon: IconName, value: string)}
  <div class="rounded-2xl border-2 overflow-hidden animate-pop-in" style="border-color: {color}; background: {color}">
    <p class="text-[11px] font-black uppercase tracking-wider text-white py-1">{label}</p>
    <div class="bg-bg-base rounded-[14px] py-3 flex items-center justify-center gap-1.5" style="color: {color}">
      <Icon name={icon} class="w-5 h-5" />
      <span class="text-lg font-black tabular-nums">{value}</span>
    </div>
  </div>
{/snippet}

{#if showStory && pendingStory}
  <StoryReward story={pendingStory} onComplete={handleStoryComplete} />
{:else if showStreak}
  <StreakCelebration streak={gameState.streak} activeDays={gameState.activeDays} onContinue={onExit} />
{:else}
  <div class="flex-1 overflow-y-auto scrollbar-none flex flex-col items-center justify-center px-6 py-8 text-center relative animate-[fade-in_0.3s_ease-out]">
    <div class="absolute top-[18%] z-10 animate-float-xp font-black text-3xl text-gold flex items-center gap-1 pointer-events-none">
      +{sessionResult.xpEarned} XP
    </div>

    <Mascot mood="celebrating" size="xl" animate={true} />
    <h1 class="text-3xl font-black text-gold mt-6">{title}</h1>
    <p class="text-base font-bold text-text-muted mt-2 max-w-xs leading-relaxed">{subtitle}</p>

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
    <button onclick={handleContinue} class="btn btn-primary w-full">Continue</button>
  </div>
{/if}
