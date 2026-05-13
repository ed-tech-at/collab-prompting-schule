import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { resolve } from '$app/paths';
import prisma from '$lib/server/db';
import { setJwtCookie } from '$lib/server/jwt';

export const load: PageServerLoad = async ({ cookies }) => {
	const loggedInSpaceIds = cookies
		.getAll()
		.map(({ name }) => /^collabSpacePw(\d+)$/.exec(name)?.[1])
		.filter((id): id is string => Boolean(id))
		.map(Number)
		.filter((id) => Number.isInteger(id) && id > 0);

	if (loggedInSpaceIds.length === 0) {
		return { loggedInAdminSpaces: [] };
	}

	const findManyArgs = {
		where: { id: { in: loggedInSpaceIds }, toDelete: null },
		select: { id: true, title: true },
		orderBy: { id: 'asc' }
	} satisfies Parameters<typeof prisma.collabSpace.findMany>[0];
	const collabSpaces = await prisma.collabSpace.findMany(findManyArgs);

	return { loggedInAdminSpaces: collabSpaces };
};

export const actions: Actions = {
	login: async ({ request, cookies }) => {
		const data = await request.formData();
		const collabSpaceIdRaw = data.get('collabSpaceId');
		const password = data.get('password');

		if (
			typeof collabSpaceIdRaw !== 'string' ||
			typeof password !== 'string' ||
			!collabSpaceIdRaw ||
			!password
		) {
			return fail(400, { success: false, message: 'CollabSpace-ID und Verwaltungspasswort sind erforderlich.' });
		}

		const collabSpaceId = Number(collabSpaceIdRaw);
		if (!Number.isInteger(collabSpaceId) || collabSpaceId <= 0) {
			return fail(400, { success: false, message: 'CollabSpace-ID muss eine positive Zahl sein.' });
		}

		const findUniqueArgs = {
			where: { id: collabSpaceId, toDelete: null },
			select: { id: true, password: true }
		} satisfies Parameters<typeof prisma.collabSpace.findFirst>[0];

		const collabSpace = await prisma.collabSpace.findFirst(findUniqueArgs);

		if (!collabSpace) {
			return fail(404, { success: false, message: 'CollabSpace nicht gefunden.' });
		}

		if (collabSpace.password !== password) {
			return fail(401, { success: false, message: 'Verwaltungspasswort falsch.' });
		}

		await setJwtCookie(cookies, `collabSpacePw${collabSpaceId}`, { password });

		throw redirect(302, resolve(`/admin/${collabSpaceId}`));
	}
};
