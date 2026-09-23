<script lang="ts">
  import '../app.css';
  import { onMount } from 'svelte';
  import { gameState } from '$lib/state/gameState.svelte';
  import type { OnboardingProfile } from '$lib/data/onboarding';
  import OnboardingFlow from '$lib/components/OnboardingFlow.svelte';

  // Svelte 5 children snippet destructuring
  let { children } = $props();

  // gameState.onboardingComplete defaults to false until localStorage loads (client-only);
  // gating on mount avoids flashing the onboarding flow at returning users before that read completes.
  let mounted = $state(false);
  onMount(() => {
    mounted = true;
  });

  $effect(() => {
    document.documentElement.classList.toggle('dark', gameState.themeMode === 'dark');
  });

  function handleOnboardingComplete(profile: OnboardingProfile) {
    gameState.completeOnboarding(profile);
  }
</script>

<!-- Desktop backdrop: centers the mobile app with a warm ambient gradient -->
<div class="min-h-screen w-full bg-[radial-gradient(circle_at_50%_0%,var(--color-bg-surface-alt),var(--color-bg-base))] flex items-center justify-center sm:p-4 text-text-primary">
  <!-- Mobile App Frame -->
  <main class="w-full h-screen sm:h-[840px] sm:max-w-md sm:rounded-3xl sm:border sm:border-border-warm bg-bg-base shadow-2xl shadow-black/10 dark:shadow-black/40 flex flex-col relative overflow-hidden">
    {#if !mounted}
      <!-- blank until localStorage is read, to avoid a flash -->
    {:else if !gameState.onboardingComplete}
      <OnboardingFlow onComplete={handleOnboardingComplete} />
    {:else}
      {@render children()}
    {/if}
  </main>
</div>
