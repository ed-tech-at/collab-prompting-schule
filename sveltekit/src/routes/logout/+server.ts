import { redirect, type Cookies } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { localize } from '$lib/i18n';

import { resolve } from '$app/paths';

const clearAllCookies = (cookies: Cookies) => {
	const path = resolve('/');
	for (const { name } of cookies.getAll()) {
		cookies.delete(name, { path });
	}
};

export const GET: RequestHandler = async ({ locals, cookies }) => {
	clearAllCookies(cookies);
	throw redirect(302, `${localize(resolve('/'), locals.lang)}?loggedOut=1`);
};

export const POST: RequestHandler = async ({ locals, cookies }) => {
	clearAllCookies(cookies);
	throw redirect(302, `${localize(resolve('/'), locals.lang)}?loggedOut=1`);
};
