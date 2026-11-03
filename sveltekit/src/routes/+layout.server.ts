import { redirect } from '@sveltejs/kit';
import { resolve } from '$app/paths';
import { isEnglishDomain, localize } from '$lib/i18n';
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = ({ url }) => {
	// On the English domain (e.g. collab.prompting.school) the start page opens in English.
	const home = resolve('/');
	if (isEnglishDomain(url.hostname) && (url.pathname === home || url.pathname === `${home}/`)) {
		throw redirect(301, localize(home, 'en') + url.search);
	}
};
