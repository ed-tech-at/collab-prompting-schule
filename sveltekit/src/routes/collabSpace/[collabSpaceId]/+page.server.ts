import { error, fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { dev } from '$app/environment';
import prisma from '$lib/server/db';
import { resolve } from '$app/paths';

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
	const cookiePassword = cookies.get(cookieName);
	if (!cookiePassword) {
		throw error(401, `Missing cookie "${cookieName}".`);
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
		select: { id: true, createdAt: true, student_rating: true, teacher_rating: true }
	} satisfies Parameters<typeof prisma.collabChat.findMany>[0];
	const conversations = await prisma.collabChat.findMany(conversationsArgs);

	return {
		collabSpace: {
			...collabSpace,
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
		const cookiePassword = cookies.get(cookieName);
		if (!cookiePassword || cookiePassword !== current.password) {
			return fail(403, { success: false, message: 'Invalid CollabSpace password cookie.' });
		}

		const data = await request.formData();

		const nextId = Number(data.get('id'));
		const baseUrl = data.get('base_url');
		const apiKey = data.get('api_key');
		const model = data.get('model');
		const password = data.get('password');
		const studentPw = data.get('student_pw');
		const question = data.get('question');
		const systemPrompt = data.get('system_prompt');

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
					api_key: typeof apiKey === 'string' && apiKey ? apiKey : null,
					model: typeof model === 'string' && model ? model : null,
					password,
					student_pw: typeof studentPw === 'string' && studentPw ? studentPw : null,
					question: typeof question === 'string' && question ? question : null,
					system_prompt: typeof systemPrompt === 'string' && systemPrompt ? systemPrompt : null
				}
			} satisfies Parameters<typeof prisma.collabSpace.update>[0];

			await prisma.collabSpace.update(updateArgs);
		} catch {
			return fail(400, { success: false, message: 'Failed to save CollabSpace.' });
		}

		if (nextId !== collabSpaceId) {
			cookies.delete(cookieName, { path: '/' });
		}
		cookies.set(`collabSpacePw${nextId}`, password, {
			path: '/',
			httpOnly: true,
			sameSite: 'lax',
			secure: !dev
		});

		throw redirect(303, resolve(`/collabSpace/${nextId}`));
	}
};
