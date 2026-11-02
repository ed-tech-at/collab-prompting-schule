import { error, fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import prisma from '$lib/server/db';
import { resolve } from '$app/paths';
import { clearJwtCookie, getJwtCookie, setJwtCookie } from '$lib/server/jwt';
import { localize, msg, tr } from '$lib/i18n';

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

	const findUniqueArgs = {
		where: { id: collabSpaceId, toDelete: null }
	} satisfies Parameters<typeof prisma.collabSpace.findFirst>[0];
	const collabSpace = await prisma.collabSpace.findFirst(findUniqueArgs);

	if (!collabSpace) {
		throw error(404, msg(locals.lang).spaceNotFound);
	}

	const cookieName = `collabSpacePw${collabSpaceId}`;
	const cookiePayload = await getJwtCookie<{ password?: string }>(cookies, cookieName);
	const cookiePassword = cookiePayload?.password;
	if (!cookiePassword || typeof cookiePassword !== 'string') {
		throw error(401, msg(locals.lang).noAdminSession);
	}

	if (cookiePassword !== collabSpace.password) {
		throw error(403, msg(locals.lang).invalidAdminSession);
	}
	const countArgs = {
		where: { collabSpaceId, toDelete: null }
	} satisfies Parameters<typeof prisma.collabChat.count>[0];
	const collabChatsCount = await prisma.collabChat.count(countArgs);
	const conversationsArgs = {
		where: { collabSpaceId, toDelete: null },
		orderBy: { createdAt: 'desc' },
		select: {
			id: true,
			username: true,
			createdAt: true,
			student_rating: true,
			teacher_rating: true,
			student_comment: true,
			teacher_comment: true,
			hidden: true
		}
	} satisfies Parameters<typeof prisma.collabChat.findMany>[0];
	const conversations = await prisma.collabChat.findMany(conversationsArgs);
	const maskedApiKey =
		typeof collabSpace.api_key === 'string' && collabSpace.api_key && collabSpace.api_key.length > 15
			? `${collabSpace.api_key.slice(0, 5)}****${collabSpace.api_key.slice(-5)}`
			: "****";

	const spaceLabel = collabSpace.title?.trim()
		? `CollabSpace-ID ${collabSpace.id}: ${collabSpace.title.trim()}`
		: `CollabSpace-ID ${collabSpace.id}`;

	return {
		navItems: [
			{ name: '<i class="fa fa-home"></i>', href: resolve('/') },
			{ name: msg(locals.lang).admin, href: resolve('/admin/') },
			{ name: escapeHtml(spaceLabel), href: resolve(`/admin/${collabSpace.id}`) }
		],
		collabSpace: {
			...collabSpace,
			api_key: maskedApiKey,
			collabChatsCount
		},
		conversations
	};
};

export const actions: Actions = {
	saveSettings: async ({ locals, request, params, cookies }) => {
		const collabSpaceId = Number(params.collabSpaceId);
		if (!Number.isInteger(collabSpaceId) || collabSpaceId <= 0) {
			return fail(400, { success: false, message: msg(locals.lang).invalidSpaceId });
		}

		const currentArgs = {
			where: { id: collabSpaceId, toDelete: null },
			select: { password: true }
		} satisfies Parameters<typeof prisma.collabSpace.findFirst>[0];
		const current = await prisma.collabSpace.findFirst(currentArgs);

		if (!current) {
			return fail(404, { success: false, message: msg(locals.lang).spaceNotFound });
		}

		const cookieName = `collabSpacePw${collabSpaceId}`;
		const cookiePayload = await getJwtCookie<{ password?: string }>(cookies, cookieName);
		const cookiePassword = cookiePayload?.password;
		if (!cookiePassword || cookiePassword !== current.password) {
			return fail(403, { success: false, message: msg(locals.lang).invalidAdminSession });
		}

		const data = await request.formData();

		const nextId = Number(data.get('id'));
		const title = data.get('title');
		const baseUrl = data.get('base_url');
		const apiKey = data.get('api_key');
		const overwriteApiKey = data.get('overwrite_api_key') === 'on';
		const model = data.get('model');
		const password = data.get('password');
		const studentPw = data.get('student_pw');
		const question = data.get('question');
		const systemPrompt = data.get('system_prompt');
		const manageEmail = data.get('manageEmail');
		const mathRender = data.get('mathRender') === 'on';
		const imageUpload = data.get('imageUpload') === 'on';

		if (!Number.isInteger(nextId) || nextId <= 0) {
			return fail(400, { success: false, message: msg(locals.lang).spaceIdPositive });
		}
		if (typeof password !== 'string' || !password) {
			return fail(400, { success: false, message: msg(locals.lang).adminPwRequired });
		}

		try {
			const updateArgs = {
				where: { id: collabSpaceId },
				data: {
					id: nextId,
					title: typeof title === 'string' && title.trim() ? title.trim() : null,
					base_url: typeof baseUrl === 'string' && baseUrl ? baseUrl : null,
					...(overwriteApiKey
						? { api_key: typeof apiKey === 'string' && apiKey ? apiKey : null }
						: {}),
					model: typeof model === 'string' && model ? model : null,
					password,
					student_pw: typeof studentPw === 'string' && studentPw ? studentPw : null,
					mathRender,
					imageUpload,
					question: typeof question === 'string' && question ? question : null,
					manageEmail: typeof manageEmail === 'string' && manageEmail ? manageEmail : null,
					system_prompt: typeof systemPrompt === 'string' && systemPrompt ? systemPrompt : null
				}
			} satisfies Parameters<typeof prisma.collabSpace.update>[0];

			await prisma.collabSpace.update(updateArgs);
		} catch {
			return fail(400, { success: false, message: tr(locals.lang)(tr(locals.lang)('CollabSpace konnte nicht gespeichert werden.', 'CollabSpace could not be saved.'), 'CollabSpace could not be saved.') });
		}

		if (nextId !== collabSpaceId) {
			clearJwtCookie(cookies, cookieName, '/');
		}
		await setJwtCookie(cookies, `collabSpacePw${nextId}`, { password });

		throw redirect(303, localize(resolve(`/admin/${nextId}`), locals.lang));
	},
	deleteSpace: async ({ locals, params, cookies }) => {
		const collabSpaceId = Number(params.collabSpaceId);
		if (!Number.isInteger(collabSpaceId) || collabSpaceId <= 0) {
			return fail(400, { success: false, message: msg(locals.lang).invalidSpaceId, actionType: 'deleteSpace' });
		}

		const currentArgs = {
			where: { id: collabSpaceId, toDelete: null },
			select: { password: true }
		} satisfies Parameters<typeof prisma.collabSpace.findFirst>[0];
		const current = await prisma.collabSpace.findFirst(currentArgs);
		if (!current) {
			return fail(404, { success: false, message: msg(locals.lang).spaceNotFound, actionType: 'deleteSpace' });
		}

		const cookieName = `collabSpacePw${collabSpaceId}`;
		const cookiePayload = await getJwtCookie<{ password?: string }>(cookies, cookieName);
		if (!cookiePayload?.password || cookiePayload.password !== current.password) {
			return fail(403, { success: false, message: msg(locals.lang).invalidAdminSession, actionType: 'deleteSpace' });
		}

		await prisma.collabSpace.update({
			where: { id: collabSpaceId },
			data: { toDelete: new Date() }
		});
		clearJwtCookie(cookies, cookieName, '/');

		throw redirect(303, localize(resolve('/admin'), locals.lang));
	},
	deleteChat: async ({ locals, request, params, cookies }) => {
		const collabSpaceId = Number(params.collabSpaceId);
		if (!Number.isInteger(collabSpaceId) || collabSpaceId <= 0) {
			return fail(400, { success: false, message: msg(locals.lang).invalidSpaceId, actionType: 'deleteChat' });
		}

		const currentArgs = {
			where: { id: collabSpaceId, toDelete: null },
			select: { password: true }
		} satisfies Parameters<typeof prisma.collabSpace.findFirst>[0];
		const current = await prisma.collabSpace.findFirst(currentArgs);
		if (!current) {
			return fail(404, { success: false, message: msg(locals.lang).spaceNotFound, actionType: 'deleteChat' });
		}

		const cookiePayload = await getJwtCookie<{ password?: string }>(cookies, `collabSpacePw${collabSpaceId}`);
		if (!cookiePayload?.password || cookiePayload.password !== current.password) {
			return fail(403, { success: false, message: msg(locals.lang).invalidAdminSession, actionType: 'deleteChat' });
		}

		const data = await request.formData();
		const collabChatId = Number(data.get('collabChatId'));
		if (!Number.isInteger(collabChatId) || collabChatId <= 0) {
			return fail(400, { success: false, message: msg(locals.lang).invalidChatId, actionType: 'deleteChat' });
		}

		const result = await prisma.collabChat.updateMany({
			where: { id: collabChatId, collabSpaceId, toDelete: null },
			data: { toDelete: new Date() }
		});
		if (result.count === 0) {
			return fail(404, { success: false, message: msg(locals.lang).chatNotFound, actionType: 'deleteChat' });
		}

		return { success: true, message: tr(locals.lang)('CollabChat wurde zur Löschung vorgemerkt.', 'CollabChat has been marked for deletion.'), actionType: 'deleteChat' };
	}
};
