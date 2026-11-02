import type { Handle } from '@sveltejs/kit';
import { langFromUrl } from '$lib/i18n';

export const handle: Handle = async ({ event, resolve }) => {
	const lang = langFromUrl(event.url);
	event.locals.lang = lang;
	return resolve(event, {
		transformPageChunk: ({ html }) => html.replace('%lang%', lang)
	});
};
