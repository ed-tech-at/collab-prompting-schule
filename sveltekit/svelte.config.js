import adapter from '@sveltejs/adapter-node';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';
import 'dotenv/config';

const subfolder = process.env.SUBFOLDER?.trim();
const normalizedSubfolder = subfolder?.replace(/^\/+|\/+$/g, '');
const base = normalizedSubfolder ? `/${normalizedSubfolder}` : '';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	// Consult https://svelte.dev/docs/kit/integrations
	// for more information about preprocessors
	preprocess: vitePreprocess(),
	kit: { 
		adapter: adapter(),
		// Absolute paths: `/en/...` (see src/hooks.ts) shares routes with `/...`, so
		// relative SSR paths like `../admin` would point to the wrong depth.
		paths: { base, relative: false },
		// Second line of defence for {@html} content: only our own scripts run.
		// SvelteKit adds nonces/hashes for its inline hydration script; injected
		// <script> tags, on*-handlers and javascript: URLs are blocked by the browser.
		csp: {
			directives: {
				'script-src': ['self'],
				'object-src': ['none'],
				'base-uri': ['self']
			}
		}
	 }
};

export default config;
