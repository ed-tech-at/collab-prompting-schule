import { error, fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import prisma from '$lib/server/db';
import { resolve } from '$app/paths';
import { clearJwtCookie, getJwtCookie, setJwtCookie } from '$lib/server/jwt';

export const load: PageServerLoad = async ({ params, cookies }) => {
	const collabSpaceId = Number(params.collabSpaceId);

	if (!Number.isInteger(collabSpaceId) || collabSpaceId <= 0) {
		throw error(400, 'Invalid CollabSpace ID.');
	}

	const findUniqueArgs = {
		where: { id: collabSpaceId }
	} satisfies Parameters<typeof prisma.collabSpace.findUnique>[0];
	const collabSpace = await prisma.collabSpace.findUnique(findUniqueArgs);

	if (!collabSpace) {
		throw error(404, 'CollabSpace not found.');
	}

	const cookieName = `collabSpacePw${collabSpaceId}`;
	const cookiePayload = await getJwtCookie<{ password?: string }>(cookies, cookieName);
	const cookiePassword = cookiePayload?.password;
	if (!cookiePassword || typeof cookiePassword !== 'string') {
		throw error(401, `Missing admin login.`);
	}

	if (cookiePassword !== collabSpace.password) {
		throw error(403, 'Invalid CollabSpace password cookie.');
	}
	const countArgs = {
		where: { collabSpaceId }
	} satisfies Parameters<typeof prisma.collabChat.count>[0];
	const collabChatsCount = await prisma.collabChat.count(countArgs);
	const conversationsArgs = {
		where: { collabSpaceId },
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

	return {
		collabSpace: {
			...collabSpace,
			api_key: maskedApiKey,
			collabChatsCount
		},
		conversations
	};
};

export const actions: Actions = {
	default: async ({ request, params, cookies }) => {
		const collabSpaceId = Number(params.collabSpaceId);
		if (!Number.isInteger(collabSpaceId) || collabSpaceId <= 0) {
			return fail(400, { success: false, message: 'Invalid CollabSpace ID.' });
		}

		const currentArgs = {
			where: { id: collabSpaceId },
			select: { password: true }
		} satisfies Parameters<typeof prisma.collabSpace.findUnique>[0];
		const current = await prisma.collabSpace.findUnique(currentArgs);

		if (!current) {
			return fail(404, { success: false, message: 'CollabSpace not found.' });
		}

		const cookieName = `collabSpacePw${collabSpaceId}`;
		const cookiePayload = await getJwtCookie<{ password?: string }>(cookies, cookieName);
		const cookiePassword = cookiePayload?.password;
		if (!cookiePassword || cookiePassword !== current.password) {
			return fail(403, { success: false, message: 'Invalid CollabSpace password cookie.' });
		}

		const data = await request.formData();

		const nextId = Number(data.get('id'));
		const baseUrl = data.get('base_url');
		const apiKey = data.get('api_key');
		const overwriteApiKey = data.get('overwrite_api_key') === 'on';
		const model = data.get('model');
		const password = data.get('password');
		const studentPw = data.get('student_pw');
		const question = data.get('question');
		const systemPrompt = data.get('system_prompt');
		const manageEmail = data.get('manageEmail');

		if (!Number.isInteger(nextId) || nextId <= 0) {
			return fail(400, { success: false, message: 'id must be a positive integer.' });
		}
		if (typeof password !== 'string' || !password) {
			return fail(400, { success: false, message: 'password is required.' });
		}

		try {
			const updateArgs = {
				where: { id: collabSpaceId },
				data: {
					id: nextId,
					base_url: typeof baseUrl === 'string' && baseUrl ? baseUrl : null,
					...(overwriteApiKey
						? { api_key: typeof apiKey === 'string' && apiKey ? apiKey : null }
						: {}),
					model: typeof model === 'string' && model ? model : null,
					password,
					student_pw: typeof studentPw === 'string' && studentPw ? studentPw : null,
					question: typeof question === 'string' && question ? question : null,
					manageEmail: typeof manageEmail === 'string' && manageEmail ? manageEmail : null,
					system_prompt: typeof systemPrompt === 'string' && systemPrompt ? systemPrompt : null
				}
			} satisfies Parameters<typeof prisma.collabSpace.update>[0];

			await prisma.collabSpace.update(updateArgs);
		} catch {
			return fail(400, { success: false, message: 'Failed to save CollabSpace.' });
		}

		if (nextId !== collabSpaceId) {
			clearJwtCookie(cookies, cookieName, '/');
		}
		await setJwtCookie(cookies, `collabSpacePw${nextId}`, { password });

		throw redirect(303, resolve(`/admin/${nextId}`));
	}
};
