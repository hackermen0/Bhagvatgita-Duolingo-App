<script lang="ts">
  import { page } from '$app/stores';
  import { gameState } from '../state/gameState.svelte';
  import { practiceStatus } from '../data/practice';
  import { claimableQuestCount } from '../data/quests';
  import Icon, { type IconName } from './Icon.svelte';

  const practice = $derived(practiceStatus());
  const claimable = $derived(claimableQuestCount());

  const tabs: { href: string; label: string; icon: IconName }[] = [
    { href: '/', label: 'Learn', icon: 'home' },
    { href: '/practice', label: 'Practice', icon: 'dumbbell' },
    { href: '/quests', label: 'Quests', icon: 'chest' },
    { href: '/profile', label: 'Profile', icon: 'user' }
  ];

  const badgeFor = (href: string) =>
    href === '/practice' && practice.available && practice.dueCount > 0
      ? practice.dueCount
      : href === '/quests'
        ? claimable
        : 0;
</script>

<nav class="shrink-0 border-t-2 border-border-warm bg-bg-surface px-3 pt-2 pb-[max(0.5rem,env(safe-area-inset-bottom))]" aria-label="Main">
  <ul class="flex items-center justify-around">
    {#each tabs as tab}
      {@const active = $page.url.pathname === tab.href}
      {@const badge = badgeFor(tab.href)}
      <li>
        <a
          href={tab.href}
          aria-label={tab.label}
          aria-current={active ? 'page' : undefined}
          class="relative flex items-center justify-center w-14 h-12 rounded-xl border-2 transition-colors
            {active
              ? 'border-primary-edge bg-primary-soft text-primary'
              : 'border-transparent text-text-muted hover:bg-bg-surface-alt'}"
        >
          <Icon name={tab.icon} class="w-7 h-7" />
          {#if badge > 0}
            <span class="absolute -top-1 right-0.5 min-w-5 h-5 px-1 rounded-full bg-error text-white text-[11px] font-black flex items-center justify-center border-2 border-bg-surface">
              {badge}
            </span>
          {/if}
        </a>
      </li>
    {/each}
  </ul>
</nav>
