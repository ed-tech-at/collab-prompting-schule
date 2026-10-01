import type { LayoutLoad } from './$types';
import { resolve } from '$app/paths';

export const load: LayoutLoad = () => {
	return {
		navItems: [{ name: '<i class="fa fa-home"></i>', href: resolve('/') }]
	};
};
