import { error, fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { resolve } from '$app/paths';
import prisma from '$lib/server/db';
import { getJwtCookie, setJwtCookie } from '$lib/server/jwt';
import { getCollabSpaceLoginState, validateStudentCookie } from '$lib/server/collab-space-auth';
import { loginStudentForSpace } from '$lib/server/space-login';
import { localize, msg } from '$lib/i18n';

const escapeHtml = (value: string) =>
	value
		.replace(/&/g, '&amp;')
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;')
		.replace(/"/g, '&quot;')
		.replace(/'/g, '&#39;');

export const load: PageServerLoad = async ({ locals, params, cookies }) => {
	const collabSpaceId = Number(params.collabSpaceId);
	if (!Number.isInteger(collabSpaceId) || collabSpaceId <= 0) {
		throw error(400, msg(locals.lang).invalidSpaceId);
	}

	const studentCookie = await getJwtCookie<{ studentPw?: string, username?: string }>(cookies, `studentPw${collabSpaceId}`);
	const adminCookie = await getJwtCookie<{ password?: string }>(cookies, `collabSpacePw${collabSpaceId}`);
	const { collabSpace, isAdmin, isStudentLoggedIn } = await getCollabSpaceLoginState(
		collabSpaceId,
		studentCookie?.studentPw,
		adminCookie?.password
	);
	if (!isStudentLoggedIn) {
		const spaceLabel = collabSpace.title?.trim()
			? `CollabSpace-ID ${collabSpaceId}: ${collabSpace.title.trim()}`
			: `CollabSpace-ID ${collabSpaceId}`;
		return {
			navItems: [
				{ name: '<i class="fa fa-home"></i>', href: resolve('/') },
				{ name: escapeHtml(spaceLabel), href: resolve(`/space/${collabSpaceId}`) }
			],
			collabSpaceId,
			title: collabSpace.title,
			question: collabSpace.question,
			mathRender: collabSpace.mathRender,
			requiresLogin: true,
			isAdmin: false,
			conversations: [],
			ownChatIds: []
		};
	}

	const ownChatIds = cookies
		.getAll()
		.map(({ name }) => /^CollabChatId(\d+)$/.exec(name)?.[1])
		.filter((id): id is string => Boolean(id))
		.map(Number)
		.filter((id) => Number.isInteger(id) && id > 0);

	const ratingWhere = {
		OR: [{ student_rating: { gt: '0' } }, { teacher_rating: { gt: '0' } }]
	};
	const conversationWhere = isAdmin
		? { collabSpaceId, toDelete: null }
		: {
				collabSpaceId,
				toDelete: null,
				OR: [...(ownChatIds.length > 0 ? [{ id: { in: ownChatIds } }] : []), ratingWhere],
				hidden: false
			};
	const findManyArgs = {
		where: conversationWhere,
		orderBy: { createdAt: 'desc' },
		select: {
			id: true,
			createdAt: true,
			username: true,
			student_rating: true,
			teacher_rating: true,
			student_comment: true,
			teacher_comment: true,
			hidden: true
		}
	} satisfies Parameters<typeof prisma.collabChat.findMany>[0];
	const conversations = await prisma.collabChat.findMany(findManyArgs);
	const spaceLabel = collabSpace.title?.trim()
		? `CollabSpace-ID ${collabSpaceId}: ${collabSpace.title.trim()}`
		: `CollabSpace-ID ${collabSpaceId}`;

	return {
		navItems: [
			{ name: '<i class="fa fa-home"></i>', href: resolve('/') },
			{ name: escapeHtml(spaceLabel), href: resolve(`/space/${collabSpaceId}`) }
		],
		collabSpaceId,
		title: collabSpace.title,
		question: collabSpace.question,
		mathRender: collabSpace.mathRender,
		conversations,
		isAdmin,
		ownChatIds,
		requiresLogin: false
	};
};

export const actions: Actions = {
	login: async ({ locals, request, params, cookies }) => {
		const collabSpaceId = Number(params.collabSpaceId);
		if (!Number.isInteger(collabSpaceId) || collabSpaceId <= 0) {
			return fail(400, { success: false, message: msg(locals.lang).invalidSpaceId });
		}
		const result = await loginStudentForSpace({ lang: locals.lang, request, cookies, forcedCollabSpaceId: collabSpaceId });
		if (!result.ok) return result.failure;
		throw redirect(302, localize(resolve(`/space/${collabSpaceId}`), locals.lang));
	},
	createChat: async ({ locals, params, cookies }) => {
		const collabSpaceId = Number(params.collabSpaceId);
		if (!Number.isInteger(collabSpaceId) || collabSpaceId <= 0) {
			return fail(400, { success: false, message: msg(locals.lang).invalidSpaceId });
		}

		// const studentCookie = await getJwtCookie<{ studentPw?: string }>(cookies, `studentPw${collabSpaceId}`);
		const studentCookie = await getJwtCookie<{ studentPw?: string, username?: string }>(cookies, `studentPw${collabSpaceId}`);
		const adminCookie = await getJwtCookie<{ password?: string }>(cookies, `collabSpacePw${collabSpaceId}`);

		await validateStudentCookie(collabSpaceId, studentCookie?.studentPw, adminCookie?.password);

		const createArgs = {
			data: { collabSpaceId, username: studentCookie?.username },
			select: { id: true }
		} satisfies Parameters<typeof prisma.collabChat.create>[0];
		const created = await prisma.collabChat.create(createArgs);
		await setJwtCookie(cookies, `CollabChatId${created.id}`, { collabChatId: String(created.id) });

		throw redirect(303, localize(resolve(`/space/${collabSpaceId}/chat/${created.id}`), locals.lang));
	}
};
