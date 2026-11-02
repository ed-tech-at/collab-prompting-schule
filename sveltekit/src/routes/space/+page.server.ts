import { redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { resolve } from '$app/paths';
import prisma from '$lib/server/db';
import { loginStudentForSpace } from '$lib/server/space-login';
import { localize } from '$lib/i18n';

export const load: PageServerLoad = async ({ cookies }) => {
	const loggedInSpaceIds = cookies
		.getAll()
		.map(({ name }) => /^studentPw(\d+)$/.exec(name)?.[1])
		.filter((id): id is string => Boolean(id))
		.map(Number)
		.filter((id) => Number.isInteger(id) && id > 0);

	if (loggedInSpaceIds.length === 0) {
		return { loggedInChats: [] };
	}

	const findManyArgs = {
		where: { id: { in: loggedInSpaceIds }, toDelete: null },
		select: { id: true, title: true },
		orderBy: { id: 'asc' }
	} satisfies Parameters<typeof prisma.collabSpace.findMany>[0];
	const collabSpaces = await prisma.collabSpace.findMany(findManyArgs);

	return { loggedInChats: collabSpaces };
};

export const actions: Actions = {
	login: async ({ locals, request, cookies }) => {
		const result = await loginStudentForSpace({ lang: locals.lang, request, cookies });
		if (!result.ok) return result.failure;
		const { collabSpaceId } = result;
		throw redirect(302, localize(resolve(`/space/${collabSpaceId}`), locals.lang));
	}
};
