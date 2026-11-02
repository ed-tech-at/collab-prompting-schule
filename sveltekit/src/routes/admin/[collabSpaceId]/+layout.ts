import type { LayoutLoad } from './$types';
import { resolve } from '$app/paths';
import { langFromUrl, msg } from '$lib/i18n';

export const load: LayoutLoad = ({ params, url }) => {
	const { collabSpaceId } = params;

	return {
		navItems: [
			{ name: '<i class="fa fa-home"></i>', href: resolve('/') },
			// { name: 'CollabSpace', href: resolve('/space') },
			{ name: msg(langFromUrl(url)).admin, href: resolve(`/admin/`) },
			{ name: `ID ${collabSpaceId}`, href: resolve(`/admin/${collabSpaceId}`) },
		]
	};
};
