import { gameState } from '../state/gameState.svelte';
import type { IconName } from '../components/Icon.svelte';

export const QUEST_REWARD_XP = 5;

export interface Quest {
  id: string;
  title: string;
  icon: IconName;
  progress: number;
  target: number;
  done: boolean;
  claimed: boolean;
}

export function dailyQuests(): Quest[] {
  const t = gameState.today;
  const defs: Omit<Quest, 'done' | 'claimed'>[] = [
    { id: 'xp', title: `Earn ${gameState.dailyGoal} XP`, icon: 'bolt', progress: t.xp, target: gameState.dailyGoal },
    { id: 'lesson', title: 'Complete a lesson', icon: 'book', progress: t.lessons, target: 1 },
    { id: 'practice', title: 'Finish a practice session', icon: 'dumbbell', progress: t.practices, target: 1 },
    { id: 'reflection', title: 'Write a reflection', icon: 'pencil', progress: t.reflections, target: 1 }
  ];
  return defs.map((q) => {
    const done = q.progress >= q.target;
    return { ...q, progress: Math.min(q.progress, q.target), done, claimed: gameState.isQuestClaimed(q.id) };
  });
}

export function claimableQuestCount(): number {
  return dailyQuests().filter((q) => q.done && !q.claimed).length;
}

export function hoursLeftToday(): number {
  const now = new Date();
  const midnight = new Date(now);
  midnight.setHours(24, 0, 0, 0);
  return Math.max(1, Math.ceil((midnight.getTime() - now.getTime()) / 3_600_000));
}
