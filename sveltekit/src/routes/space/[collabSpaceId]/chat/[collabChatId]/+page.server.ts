import { error, fail } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import prisma from '$lib/server/db';
import { getJwtCookie } from '$lib/server/jwt';
import {
	getCollabSpaceLoginState,
	validateAdminCookie,
	validateStudentCookie
} from '$lib/server/collab-space-auth';

export const load: PageServerLoad = async ({ params, cookies }) => {
	const collabSpaceId = Number(params.collabSpaceId);
	const collabChatId = Number(params.collabChatId);

	if (!Number.isInteger(collabSpaceId) || collabSpaceId <= 0) {
		throw error(400, 'Invalid CollabSpace ID.');
	}
	if (!Number.isInteger(collabChatId) || collabChatId <= 0) {
		throw error(400, 'Invalid CollabChat ID.');
	}

	const studentCookie = await getJwtCookie<{ studentPw?: string }>(cookies, `studentPw${collabSpaceId}`);
	const adminCookie = await getJwtCookie<{ password?: string }>(cookies, `collabSpacePw${collabSpaceId}`);
	const { collabSpace, isAdmin, isStudentLoggedIn } = await getCollabSpaceLoginState(
		collabSpaceId,
		studentCookie?.studentPw,
		adminCookie?.password
	);
	if (!isStudentLoggedIn) {
		await validateStudentCookie(collabSpaceId, studentCookie?.studentPw, adminCookie?.password);
	}
	const chatCookie = await getJwtCookie<{ collabChatId?: string }>(cookies, `CollabChatId${collabChatId}`);
	const canChat = chatCookie?.collabChatId === String(collabChatId);

	const findChatArgs = {
		where: { id: collabChatId, collabSpaceId },
		include: {
			ChatEntries: {
				orderBy: { createdAt: 'asc' }
			}
		}
	} satisfies Parameters<typeof prisma.collabChat.findFirst>[0];
	const collabChat = await prisma.collabChat.findFirst(findChatArgs);

	if (!collabChat) {
		throw error(404, 'CollabChat not found.');
	}
	if (collabChat.hidden && !isAdmin) {
		throw error(404, 'CollabChat not found.');
	}

	return {
		collabSpaceId,
		collabChatId,
		question: collabSpace.question,
		isAdmin,
		canChat,
		hidden: collabChat.hidden,
		studentRating: collabChat.student_rating,
		teacherRating: collabChat.teacher_rating,
		studentComment: collabChat.student_comment,
		teacherComment: collabChat.teacher_comment,
		messages: collabChat.ChatEntries
			.filter((entry) => entry.role === 'user' || entry.role === 'assistant')
			.map((entry) => ({
				role: entry.role as 'user' | 'assistant',
				content: entry.message ?? ''
			}))
	};
};

export const actions: Actions = {
	toggleHidden: async ({ request, params, cookies }) => {
		const collabSpaceId = Number(params.collabSpaceId);
		const collabChatId = Number(params.collabChatId);
		if (!Number.isInteger(collabSpaceId) || collabSpaceId <= 0) {
			return fail(400, { success: false, message: 'Invalid CollabSpace ID.', actionType: 'hidden' });
		}
		if (!Number.isInteger(collabChatId) || collabChatId <= 0) {
			return fail(400, { success: false, message: 'Invalid CollabChat ID.', actionType: 'hidden' });
		}

		const adminCookie = await getJwtCookie<{ password?: string }>(cookies, `collabSpacePw${collabSpaceId}`);
		const isAdmin = await validateAdminCookie(collabSpaceId, adminCookie?.password);
		if (!isAdmin) {
			return fail(403, { success: false, message: 'Admin cookie required.', actionType: 'hidden' });
		}

		const data = await request.formData();
		const hiddenAction = data.get('hiddenAction');
		if (hiddenAction !== 'hide' && hiddenAction !== 'unhide') {
			return fail(400, { success: false, message: 'Invalid hidden action.', actionType: 'hidden' });
		}
		const hidden = hiddenAction === 'hide';

		const updateArgs = {
			where: { id: collabChatId, collabSpaceId },
			data: { hidden }
		} satisfies Parameters<typeof prisma.collabChat.updateMany>[0];
		const result = await prisma.collabChat.updateMany(updateArgs);
		if (result.count === 0) {
			return fail(404, { success: false, message: 'CollabChat not found.', actionType: 'hidden' });
		}

		return {
			success: true,
			message: hidden ? 'Chat ist nun für Teilnehmende verborgen.' : 'Chat ist wieder sichtbar.',
			actionType: 'hidden'
		};
	},
	rate: async ({ request, params, cookies }) => {
		const collabSpaceId = Number(params.collabSpaceId);
		const collabChatId = Number(params.collabChatId);
		if (!Number.isInteger(collabSpaceId) || collabSpaceId <= 0) {
			return fail(400, { success: false, message: 'Invalid CollabSpace ID.', ratingType: 'student' });
		}
		if (!Number.isInteger(collabChatId) || collabChatId <= 0) {
			return fail(400, { success: false, message: 'Invalid CollabChat ID.', ratingType: 'student' });
		}

		const studentCookie = await getJwtCookie<{ studentPw?: string }>(cookies, `studentPw${collabSpaceId}`);
		const adminCookie = await getJwtCookie<{ password?: string }>(cookies, `collabSpacePw${collabSpaceId}`);
		await validateStudentCookie(collabSpaceId, studentCookie?.studentPw, adminCookie?.password);
		const chatCookie = await getJwtCookie<{ collabChatId?: string }>(cookies, `CollabChatId${collabChatId}`);
		if (chatCookie?.collabChatId !== String(collabChatId)) {
			return fail(403, { success: false, message: 'CollabChat cookie required.', ratingType: 'student' });
		}

		const data = await request.formData();
		const ratingRaw = data.get('rating');
		const rating = typeof ratingRaw === 'string' ? Number(ratingRaw) : NaN;
		const commentRaw = data.get('studentComment');
		const comment = typeof commentRaw === 'string' ? commentRaw.trim() : '';
		if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
			return fail(400, {
				success: false,
				message: 'Rating must be between 1 and 5.',
				ratingType: 'student'
			});
		}

		const updateArgs = {
			where: { id: collabChatId, collabSpaceId },
			data: { student_rating: String(rating), student_comment: comment.length > 0 ? comment : null }
		} satisfies Parameters<typeof prisma.collabChat.updateMany>[0];
		const result = await prisma.collabChat.updateMany(updateArgs);
		if (result.count === 0) {
			return fail(404, { success: false, message: 'CollabChat not found.', ratingType: 'student' });
		}

		return { success: true, message: 'Bewertung gespeichert.', rating, ratingType: 'student' };
	},
	rateTeacher: async ({ request, params, cookies }) => {
		const collabSpaceId = Number(params.collabSpaceId);
		const collabChatId = Number(params.collabChatId);
		if (!Number.isInteger(collabSpaceId) || collabSpaceId <= 0) {
			return fail(400, { success: false, message: 'Invalid CollabSpace ID.', ratingType: 'teacher' });
		}
		if (!Number.isInteger(collabChatId) || collabChatId <= 0) {
			return fail(400, { success: false, message: 'Invalid CollabChat ID.', ratingType: 'teacher' });
		}

		const adminCookie = await getJwtCookie<{ password?: string }>(cookies, `collabSpacePw${collabSpaceId}`);
		const isAdmin = await validateAdminCookie(collabSpaceId, adminCookie?.password);
		if (!isAdmin) {
			return fail(403, { success: false, message: 'Admin cookie required.', ratingType: 'teacher' });
		}

		const data = await request.formData();
		const ratingRaw = data.get('teacherRating');
		const rating = typeof ratingRaw === 'string' ? Number(ratingRaw) : NaN;
		const commentRaw = data.get('teacherComment');
		const comment = typeof commentRaw === 'string' ? commentRaw.trim() : '';
		if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
			return fail(400, {
				success: false,
				message: 'Teacher rating must be between 1 and 5.',
				ratingType: 'teacher'
			});
		}

		const updateArgs = {
			where: { id: collabChatId, collabSpaceId },
			data: { teacher_rating: String(rating), teacher_comment: comment.length > 0 ? comment : null }
		} satisfies Parameters<typeof prisma.collabChat.updateMany>[0];
		const result = await prisma.collabChat.updateMany(updateArgs);
		if (result.count === 0) {
			return fail(404, { success: false, message: 'CollabChat not found.', ratingType: 'teacher' });
		}

		return { success: true, message: 'Lehrenden-Bewertung gespeichert.', teacherRating: rating, ratingType: 'teacher' };
	}
};
