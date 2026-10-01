import type { PageServerLoad } from './$types';
import { resolve } from '$app/paths';

const localSessionPattern = /^(studentPw|collabSpacePw|CollabChatId)\d+$/;

export const load: PageServerLoad = async ({ cookies, url }) => {
	const hasLocalSessions = cookies.getAll().some(({ name }) => localSessionPattern.test(name));

	return {
		navItems: [{ name: '<i class="fa fa-home"></i>', href: resolve('/') }],
		hasLocalSessions,
		loggedOut: url.searchParams.get('loggedOut') === '1'
	};
};
