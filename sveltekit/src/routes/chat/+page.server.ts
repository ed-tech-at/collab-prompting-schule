import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { resolve } from '$app/paths';
import prisma from '$lib/server/db';
import { setJwtCookie } from '$lib/server/jwt';

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
		where: { id: { in: loggedInSpaceIds } },
		select: { id: true },
		orderBy: { id: 'asc' }
	} satisfies Parameters<typeof prisma.collabSpace.findMany>[0];
	const collabSpaces = await prisma.collabSpace.findMany(findManyArgs);

	return { loggedInChats: collabSpaces };
};

export const actions: Actions = {
	login: async ({ request, cookies }) => {
		const data = await request.formData();
		const collabSpaceIdRaw = data.get('collabSpaceId');
		const studentPw = data.get('student_pw');

		if (
			typeof collabSpaceIdRaw !== 'string' ||
			typeof studentPw !== 'string' ||
			!collabSpaceIdRaw ||
			!studentPw
		) {
			return fail(400, { success: false, message: 'CollabSpace ID and student password are required.' });
		}

		const collabSpaceId = Number(collabSpaceIdRaw);
		if (!Number.isInteger(collabSpaceId) || collabSpaceId <= 0) {
			return fail(400, { success: false, message: 'CollabSpace ID must be a positive integer.' });
		}

		const findUniqueArgs = {
			where: { id: collabSpaceId },
			select: { id: true, student_pw: true }
		} satisfies Parameters<typeof prisma.collabSpace.findUnique>[0];
		const collabSpace = await prisma.collabSpace.findUnique(findUniqueArgs);

		if (!collabSpace) {
			return fail(404, { success: false, message: 'CollabSpace not found.' });
		}

		if (!collabSpace.student_pw || collabSpace.student_pw !== studentPw) {
			return fail(401, { success: false, message: 'Invalid student password.' });
		}

		await setJwtCookie(cookies, `studentPw${collabSpaceId}`, { studentPw });
		throw redirect(302, resolve(`/chat/${collabSpaceId}`));
	}
};
