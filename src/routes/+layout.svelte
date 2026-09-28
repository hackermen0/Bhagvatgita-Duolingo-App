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
    const dark = gameState.themeMode === 'dark';
    document.documentElement.classList.toggle('dark', dark);
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', dark ? '#1F1310' : '#FFFCF7');
  });

  function handleOnboardingComplete(profile: OnboardingProfile) {
    gameState.completeOnboarding(profile);
  }
</script>

<!-- Pinned to the visible viewport so the top and bottom bars never scroll away; on desktop it centers the phone-sized app -->
<div class="fixed inset-0 bg-bg-base sm:bg-bg-surface-alt flex items-center justify-center sm:p-4 text-text-primary">
  <main class="w-full h-full sm:h-[860px] sm:max-h-full sm:max-w-md sm:rounded-3xl sm:border-2 sm:border-border-warm bg-bg-base shadow-2xl shadow-black/10 dark:shadow-black/40 flex flex-col relative overflow-hidden pt-[env(safe-area-inset-top)] px-[env(safe-area-inset-left)]">
    {#if !mounted}
      <!-- blank until localStorage is read, to avoid a flash -->
    {:else if !gameState.onboardingComplete}
      <OnboardingFlow onComplete={handleOnboardingComplete} />
    {:else}
      <!-- Not positioned on purpose: full-screen overlays anchor to <main> so they also cover the bottom nav -->
      <div class="flex-1 min-h-0 flex flex-col">
        {@render children()}
      </div>
      {#if showNav}
        <BottomNav />
      {/if}
    {/if}
  </main>
</div>
