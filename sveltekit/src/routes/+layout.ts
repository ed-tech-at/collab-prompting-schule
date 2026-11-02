import type { LayoutLoad } from './$types';
import { resolve } from '$app/paths';
import { langFromUrl } from '$lib/i18n';

export const load: LayoutLoad = ({ url }) => {
	return {
		lang: langFromUrl(url),
		navItems: [{ name: '<i class="fa fa-home"></i>', href: resolve('/') }]
	};
};
