<script lang="ts">
  import '../app.css';
  import { gameState } from '$lib/state/gameState.svelte';

  // Svelte 5 children snippet destructuring
  let { children } = $props();

  $effect(() => {
    document.documentElement.classList.toggle('dark', gameState.themeMode === 'dark');
  });
</script>

<!-- Desktop backdrop: centers the mobile app with a warm ambient gradient -->
<div class="min-h-screen w-full bg-[radial-gradient(circle_at_50%_0%,var(--color-bg-surface-alt),var(--color-bg-base))] flex items-center justify-center sm:p-4 text-text-primary">
  <!-- Mobile App Frame -->
  <main class="w-full h-screen sm:h-[840px] sm:max-w-md sm:rounded-3xl sm:border sm:border-border-warm bg-bg-base shadow-2xl shadow-black/10 dark:shadow-black/40 flex flex-col relative overflow-hidden">
    {@render children()}
  </main>
</div>
