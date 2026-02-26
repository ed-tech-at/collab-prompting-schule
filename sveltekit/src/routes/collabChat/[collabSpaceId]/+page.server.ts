import { error, fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { resolve } from '$app/paths';
import { dev } from '$app/environment';
import prisma from '$lib/server/db';

const validateStudentCookie = async (collabSpaceId: number, cookieValue: string | undefined) => {
	const findSpaceArgs = {
		where: { id: collabSpaceId },
		select: { id: true, student_pw: true, password: true }
	} satisfies Parameters<typeof prisma.collabSpace.findUnique>[0];
	const collabSpace = await prisma.collabSpace.findUnique(findSpaceArgs);

	if (!collabSpace) {
		throw error(404, 'CollabSpace not found.');
	}
	if (!cookieValue) {
		throw error(401, 'Missing student cookie.');
	}
	if (!collabSpace.student_pw || collabSpace.student_pw !== cookieValue) {
		throw error(403, 'Invalid student cookie.');
	}

	return collabSpace;
};

export const load: PageServerLoad = async ({ params, cookies }) => {
	const collabSpaceId = Number(params.collabSpaceId);
	if (!Number.isInteger(collabSpaceId) || collabSpaceId <= 0) {
		throw error(400, 'Invalid CollabSpace ID.');
	}

	const collabSpace = await validateStudentCookie(collabSpaceId, cookies.get(`studentPw${collabSpaceId}`));
	const adminCookie = cookies.get(`collabSpacePw${collabSpaceId}`);
	const isAdmin = Boolean(adminCookie && adminCookie === collabSpace.password);

	const findManyArgs = {
		where: { collabSpaceId },
		orderBy: { createdAt: 'desc' },
		select: {
			id: true,
			createdAt: true,
			student_rating: true,
			teacher_rating: true
		}
	} satisfies Parameters<typeof prisma.collabChat.findMany>[0];
	const conversations = await prisma.collabChat.findMany(findManyArgs);

	return { collabSpaceId, conversations, isAdmin };
};

export const actions: Actions = {
	default: async ({ params, cookies }) => {
		const collabSpaceId = Number(params.collabSpaceId);
		if (!Number.isInteger(collabSpaceId) || collabSpaceId <= 0) {
			return fail(400, { success: false, message: 'Invalid CollabSpace ID.' });
		}

		await validateStudentCookie(collabSpaceId, cookies.get(`studentPw${collabSpaceId}`));

		const createArgs = {
			data: { collabSpaceId },
			select: { id: true }
		} satisfies Parameters<typeof prisma.collabChat.create>[0];
		const created = await prisma.collabChat.create(createArgs);
		cookies.set('CollabChatId', String(created.id), {
			path: '/',
			httpOnly: true,
			sameSite: 'lax',
			secure: !dev
		});

		throw redirect(303, resolve(`/collabChat/${collabSpaceId}/${created.id}`));
	}
};
