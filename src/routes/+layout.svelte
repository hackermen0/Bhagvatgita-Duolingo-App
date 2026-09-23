<script lang="ts">
  import '../app.css';
  import { onMount } from 'svelte';
  import { page } from '$app/stores';
  import { gameState } from '$lib/state/gameState.svelte';
  import type { OnboardingProfile } from '$lib/data/onboarding';
  import OnboardingFlow from '$lib/components/OnboardingFlow.svelte';
  import BottomNav from '$lib/components/BottomNav.svelte';

  let { children } = $props();

  // gameState.onboardingComplete defaults to false until localStorage loads (client-only);
  // gating on mount avoids flashing the onboarding flow at returning users before that read completes.
  let mounted = $state(false);
  onMount(() => {
    mounted = true;
  });

  // Tab screens get the bottom bar; lessons, settings and other drill-in screens don't
  const TAB_ROUTES = ['/', '/practice', '/quests', '/profile'];
  const showNav = $derived(TAB_ROUTES.includes($page.url.pathname));

  $effect(() => {
    document.documentElement.classList.toggle('dark', gameState.themeMode === 'dark');
  });

  function handleOnboardingComplete(profile: OnboardingProfile) {
    gameState.completeOnboarding(profile);
  }
</script>

<!-- Desktop backdrop: centers the mobile app -->
<div class="min-h-screen w-full bg-bg-surface-alt flex items-center justify-center sm:p-4 text-text-primary">
  <main class="w-full h-dvh sm:h-[860px] sm:max-w-md sm:rounded-3xl sm:border-2 sm:border-border-warm bg-bg-base shadow-2xl shadow-black/10 dark:shadow-black/40 flex flex-col relative overflow-hidden">
    {#if !mounted}
      <!-- blank until localStorage is read, to avoid a flash -->
    {:else if !gameState.onboardingComplete}
      <OnboardingFlow onComplete={handleOnboardingComplete} />
    {:else}
      <div class="flex-1 min-h-0 flex flex-col relative">
        {@render children()}
      </div>
      {#if showNav}
        <BottomNav />
      {/if}
    {/if}
  </main>
</div>
