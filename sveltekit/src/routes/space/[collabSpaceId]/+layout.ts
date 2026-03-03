import type { LayoutLoad } from './$types';
import { resolve } from '$app/paths';

export const load: LayoutLoad = ({ params }) => {
	const { collabSpaceId } = params;

	return {
		navItems: [
			{ name: '<i class="fa fa-home"></i>', href: resolve('/') },

			// { name: 'CollabSpace', href: resolve('/space') },
			{ name: `CollabSpace ID ${collabSpaceId}`, href: resolve(`/space/${collabSpaceId}`) }
		]
	};
};
