import { error, fail } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import prisma from '$lib/server/db';
import { getJwtCookie } from '$lib/server/jwt';

const validateStudentCookie = async (collabSpaceId: number, cookieValue: string | undefined) => {
	const findSpaceArgs = {
		where: { id: collabSpaceId },
		select: { id: true, student_pw: true, question: true, password: true }
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

const validateAdminCookie = async (
	collabSpaceId: number,
	cookieValue: string | undefined
): Promise<boolean> => {
	if (!cookieValue) return false;
	const findSpaceArgs = {
		where: { id: collabSpaceId },
		select: { id: true, password: true }
	} satisfies Parameters<typeof prisma.collabSpace.findUnique>[0];
	const collabSpace = await prisma.collabSpace.findUnique(findSpaceArgs);
	return Boolean(collabSpace && cookieValue === collabSpace.password);
};

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
	const collabSpace = await validateStudentCookie(collabSpaceId, studentCookie?.studentPw);
	const adminCookie = await getJwtCookie<{ password?: string }>(cookies, `collabSpacePw${collabSpaceId}`);
	const isAdmin = await validateAdminCookie(collabSpaceId, adminCookie?.password);
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

	return {
		collabSpaceId,
		collabChatId,
		question: collabSpace.question,
		isAdmin,
		canChat,
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
		await validateStudentCookie(collabSpaceId, studentCookie?.studentPw);
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
