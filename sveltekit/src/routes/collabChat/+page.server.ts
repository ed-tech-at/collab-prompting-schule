import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { dev } from '$app/environment';
import { resolve } from '$app/paths';
import prisma from '$lib/server/db';

export const load: PageServerLoad = async () => {
	return {};
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

		cookies.set(`studentPw${collabSpaceId}`, studentPw, {
			path: resolve('/'),
			httpOnly: true,
			sameSite: 'lax',
			secure: !dev
		});

		throw redirect(302, resolve(`/collabChat/${collabSpaceId}`));
	}
};
