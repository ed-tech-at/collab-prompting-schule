import { redirect } from '@sveltejs/kit';
import { resolve } from '$app/paths';
import { localize } from '$lib/i18n';
import type { LayoutServerLoad } from './$types';

// On the English domain (e.g. collab.prompting.school) the start page opens in English.
const isEnglishDomain = (hostname: string) =>
	hostname === 'prompting.school' || hostname.endsWith('.prompting.school');

export const load: LayoutServerLoad = ({ url }) => {
	const home = resolve('/');
	if (isEnglishDomain(url.hostname) && (url.pathname === home || url.pathname === `${home}/`)) {
		throw redirect(301, localize(home, 'en') + url.search);
	}
};
