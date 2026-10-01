import type { LayoutLoad } from './$types';
import { resolve } from '$app/paths';

export const load: LayoutLoad = ({ params }) => {
	const { collabSpaceId, collabChatId } = params;

	return {
		navItems: [
			{ name: '<i class="fa fa-home"></i>', href: resolve('/') },
			// { name: 'CollabSpace', href: resolve('/space') },
			{ name: `CollabSpace-ID ${collabSpaceId}`, href: resolve(`/space/${collabSpaceId}`) },
			{ name: `CollabChat #${collabChatId}`, href: resolve(`/space/${collabSpaceId}/chat/${collabChatId}`) }
		]
	};
};
