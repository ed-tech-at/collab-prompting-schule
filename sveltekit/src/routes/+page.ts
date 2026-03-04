import type { PageLoad } from './$types';
import { resolve } from '$app/paths';

export const load: PageLoad = () => {
	return {
		navItems: [{ name: '<i class="fa fa-home"></i>', href: resolve('/') }]
	};
};
