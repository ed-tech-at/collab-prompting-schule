import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { resolve } from '$app/paths';
import prisma from '$lib/server/db';
import { setJwtCookie } from '$lib/server/jwt';

export const load: PageServerLoad = async () => {
	return {};
};

export const actions: Actions = {
	default: async ({ request, cookies }) => {
		const data = await request.formData();

		const baseUrl = data.get('base_url');
		const apiKey = data.get('api_key');
		const model = data.get('model');
		const question = data.get('question');
		const systemPrompt = data.get('system_prompt');
		const password = data.get('password');
		const studentPw = data.get('student_pw');
		const manageEmail = data.get('manageEmail');

		if (typeof password !== 'string' || !password) {
			return fail(400, { success: false, message: 'Password is required.' });
		}

		const createArgs = {
			data: {
				base_url: typeof baseUrl === 'string' && baseUrl ? baseUrl : null,
				api_key: typeof apiKey === 'string' && apiKey ? apiKey : null,
				model: typeof model === 'string' && model ? model : null,
				password,
				student_pw: typeof studentPw === 'string' && studentPw ? studentPw : null,
				cryptVersion: 0,
				question: typeof question === 'string' && question ? question : null,
				system_prompt: typeof systemPrompt === 'string' && systemPrompt ? systemPrompt : null,
				manageEmail: typeof manageEmail === 'string' && manageEmail ? manageEmail : null
			},
			select: { id: true }
		} satisfies Parameters<typeof prisma.collabSpace.create>[0];

		const inserted = await prisma.collabSpace.create(createArgs);

		await setJwtCookie(cookies, `collabSpacePw${inserted.id}`, { password });

		throw redirect(302, resolve(`/admin/${inserted.id}`));
	}
};
