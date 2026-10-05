import adapter from '@sveltejs/adapter-vercel';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	// Consult https://svelte.dev/docs/kit/integrations
	// for more information about preprocessors
	preprocess: vitePreprocess(),

	kit: {
		// See https://svelte.dev/docs/kit/adapters for more information about adapters.
		// Using adapter-vercel directly instead of adapter-auto for better control.
		// Explicitly specify the runtime to support Node 24 build environments.
		adapter: adapter({
			runtime: 'nodejs22.x'
		})
	}
};

export default config;
