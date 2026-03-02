import { error, fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { resolve } from '$app/paths';
import prisma from '$lib/server/db';
import { getJwtCookie, setJwtCookie } from '$lib/server/jwt';

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

	const studentCookie = await getJwtCookie<{ studentPw?: string }>(cookies, `studentPw${collabSpaceId}`);
	const collabSpace = await validateStudentCookie(collabSpaceId, studentCookie?.studentPw);
	const adminCookie = await getJwtCookie<{ password?: string }>(cookies, `collabSpacePw${collabSpaceId}`);
	const isAdmin = Boolean(adminCookie?.password && adminCookie.password === collabSpace.password);

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

	const collabSpaceDb = await prisma.collabSpace.findFirst({where: {id: collabSpaceId }, select: {question: true}});

	
	const ownChatIds = cookies
		.getAll()
		.map(({ name }) => /^CollabChatId(\d+)$/.exec(name)?.[1])
		.filter((id): id is string => Boolean(id))
		.map(Number)
		.filter((id) => Number.isInteger(id) && id > 0);

	return { collabSpaceId, question: collabSpaceDb?.question, conversations, isAdmin, ownChatIds };
};

export const actions: Actions = {
	default: async ({ params, cookies }) => {
		const collabSpaceId = Number(params.collabSpaceId);
		if (!Number.isInteger(collabSpaceId) || collabSpaceId <= 0) {
			return fail(400, { success: false, message: 'Invalid CollabSpace ID.' });
		}

		const studentCookie = await getJwtCookie<{ studentPw?: string }>(cookies, `studentPw${collabSpaceId}`);
		await validateStudentCookie(collabSpaceId, studentCookie?.studentPw);

		const createArgs = {
			data: { collabSpaceId },
			select: { id: true }
		} satisfies Parameters<typeof prisma.collabChat.create>[0];
		const created = await prisma.collabChat.create(createArgs);
		await setJwtCookie(cookies, `CollabChatId${created.id}`, { collabChatId: String(created.id) });

		throw redirect(303, resolve(`/chat/${collabSpaceId}/${created.id}`));
	}
};
