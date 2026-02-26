import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { resolve } from '$app/paths';
import { dev } from '$app/environment';
import prisma from '$lib/server/db';

export const load: PageServerLoad = async () => {
	return {};
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
			return fail(400, { success: false, message: 'CollabSpace ID and password are required.' });
		}

		const collabSpaceId = Number(collabSpaceIdRaw);
		if (!Number.isInteger(collabSpaceId) || collabSpaceId <= 0) {
			return fail(400, { success: false, message: 'CollabSpace ID must be a positive integer.' });
		}

		const findUniqueArgs = {
			where: { id: collabSpaceId },
			select: { id: true, password: true }
		} satisfies Parameters<typeof prisma.collabSpace.findUnique>[0];

		const collabSpace = await prisma.collabSpace.findUnique(findUniqueArgs);

		if (!collabSpace) {
			return fail(404, { success: false, message: 'CollabSpace not found.' });
		}

		if (collabSpace.password !== password) {
			return fail(401, { success: false, message: 'Invalid password.' });
		}

		cookies.set(`collabSpacePw${collabSpaceId}`, password, {
			path: '/',
			httpOnly: true,
			sameSite: 'lax',
			secure: !dev
		});

		throw redirect(302, resolve(`/collabSpace/${collabSpaceId}`));
	}
};
