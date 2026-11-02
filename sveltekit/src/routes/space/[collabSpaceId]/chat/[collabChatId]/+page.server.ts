import { error, fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import prisma from '$lib/server/db';
import { getJwtCookie } from '$lib/server/jwt';
import { resolve } from '$app/paths';
import {
	getCollabSpaceLoginState,
	validateAdminCookie,
	validateStudentCookie
} from '$lib/server/collab-space-auth';
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
	const collabChatId = Number(params.collabChatId);

	if (!Number.isInteger(collabSpaceId) || collabSpaceId <= 0) {
		throw error(400, msg(locals.lang).invalidSpaceId);
	}
	if (!Number.isInteger(collabChatId) || collabChatId <= 0) {
		throw error(400, msg(locals.lang).invalidChatId);
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
		where: { id: collabChatId, collabSpaceId, toDelete: null },
		include: {
			ChatEntries: {
				orderBy: { createdAt: 'asc' },
				include: {
					images: {
						orderBy: { id: 'asc' }
					}
				}
			}
		}
	} satisfies Parameters<typeof prisma.collabChat.findFirst>[0];
	const collabChat = await prisma.collabChat.findFirst(findChatArgs);

	if (!collabChat) {
		throw error(404, msg(locals.lang).chatNotFound);
	}
	if (collabChat.hidden && !isAdmin) {
		throw error(404, msg(locals.lang).chatNotFound);
	}
	// Same visibility rule as the chat list on the space page: participants see
	// their own chats (verified chat cookie) and chats that have been rated.
	const isRated = [collabChat.student_rating, collabChat.teacher_rating].some(
		(rating) => rating != null && rating > '0'
	);
	if (!isAdmin && !canChat && !isRated) {
		throw error(404, msg(locals.lang).chatNotFound);
	}
	const spaceLabel = collabSpace.title?.trim()
		? `CollabSpace-ID ${collabSpaceId}: ${collabSpace.title.trim()}`
		: `CollabSpace-ID ${collabSpaceId}`;

	return {
		navItems: [
			{ name: '<i class="fa fa-home"></i>', href: resolve('/') },
			{ name: escapeHtml(spaceLabel), href: resolve(`/space/${collabSpaceId}`) },
			{ name: `CollabChat #${collabChatId}`, href: resolve(`/space/${collabSpaceId}/chat/${collabChatId}`) }
		],
		collabSpaceId,
		collabChatId,
		title: collabSpace.title,
		question: collabSpace.question,
		mathRender: collabSpace.mathRender,
		imageUpload: collabSpace.imageUpload,
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
				content: entry.message ?? '',
				images: entry.images.map((image) => image.dataUrl)
			}))
	};
};

export const actions: Actions = {
	toggleHidden: async ({ locals, request, params, cookies }) => {
		const collabSpaceId = Number(params.collabSpaceId);
		const collabChatId = Number(params.collabChatId);
		if (!Number.isInteger(collabSpaceId) || collabSpaceId <= 0) {
			return fail(400, { success: false, message: msg(locals.lang).invalidSpaceId, actionType: 'hidden' });
		}
		if (!Number.isInteger(collabChatId) || collabChatId <= 0) {
			return fail(400, { success: false, message: msg(locals.lang).invalidChatId, actionType: 'hidden' });
		}

		const adminCookie = await getJwtCookie<{ password?: string }>(cookies, `collabSpacePw${collabSpaceId}`);
		const isAdmin = await validateAdminCookie(collabSpaceId, adminCookie?.password);
		if (!isAdmin) {
			return fail(403, { success: false, message: msg(locals.lang).invalidAdminSession, actionType: 'hidden' });
		}

		const data = await request.formData();
		const hiddenAction = data.get('hiddenAction');
		if (hiddenAction !== 'hide' && hiddenAction !== 'unhide') {
			return fail(400, { success: false, message: 'Invalid hidden action.', actionType: 'hidden' });
		}
		const hidden = hiddenAction === 'hide';

		const updateArgs = {
			where: { id: collabChatId, collabSpaceId, toDelete: null },
			data: { hidden }
		} satisfies Parameters<typeof prisma.collabChat.updateMany>[0];
		const result = await prisma.collabChat.updateMany(updateArgs);
		if (result.count === 0) {
			return fail(404, { success: false, message: msg(locals.lang).chatNotFound, actionType: 'hidden' });
		}

		return {
			success: true,
			message: hidden ? tr(locals.lang)('Chat ist nun für Teilnehmende verborgen.', 'Chat is now hidden from participants.') : tr(locals.lang)('Chat ist wieder für Teilnehmende sichtbar.', 'Chat is visible to participants again.'),
			actionType: 'hidden'
		};
	},
	deleteChat: async ({ locals, params, cookies }) => {
		const collabSpaceId = Number(params.collabSpaceId);
		const collabChatId = Number(params.collabChatId);
		if (!Number.isInteger(collabSpaceId) || collabSpaceId <= 0) {
			return fail(400, { success: false, message: msg(locals.lang).invalidSpaceId, actionType: 'deleteChat' });
		}
		if (!Number.isInteger(collabChatId) || collabChatId <= 0) {
			return fail(400, { success: false, message: msg(locals.lang).invalidChatId, actionType: 'deleteChat' });
		}

		const adminCookie = await getJwtCookie<{ password?: string }>(cookies, `collabSpacePw${collabSpaceId}`);
		const isAdmin = await validateAdminCookie(collabSpaceId, adminCookie?.password);
		if (!isAdmin) {
			return fail(403, { success: false, message: msg(locals.lang).invalidAdminSession, actionType: 'deleteChat' });
		}

		const result = await prisma.collabChat.updateMany({
			where: { id: collabChatId, collabSpaceId, toDelete: null },
			data: { toDelete: new Date() }
		});
		if (result.count === 0) {
			return fail(404, { success: false, message: msg(locals.lang).chatNotFound, actionType: 'deleteChat' });
		}

		throw redirect(303, localize(resolve(`/admin/${collabSpaceId}`), locals.lang));
	},
	rate: async ({ locals, request, params, cookies }) => {
		const collabSpaceId = Number(params.collabSpaceId);
		const collabChatId = Number(params.collabChatId);
		if (!Number.isInteger(collabSpaceId) || collabSpaceId <= 0) {
			return fail(400, { success: false, message: msg(locals.lang).invalidSpaceId, ratingType: 'student' });
		}
		if (!Number.isInteger(collabChatId) || collabChatId <= 0) {
			return fail(400, { success: false, message: msg(locals.lang).invalidChatId, ratingType: 'student' });
		}

		const studentCookie = await getJwtCookie<{ studentPw?: string }>(cookies, `studentPw${collabSpaceId}`);
		const adminCookie = await getJwtCookie<{ password?: string }>(cookies, `collabSpacePw${collabSpaceId}`);
		await validateStudentCookie(collabSpaceId, studentCookie?.studentPw, adminCookie?.password);
		const chatCookie = await getJwtCookie<{ collabChatId?: string }>(cookies, `CollabChatId${collabChatId}`);
		if (chatCookie?.collabChatId !== String(collabChatId)) {
			return fail(403, { success: false, message: msg(locals.lang).invalidChatSession, ratingType: 'student' });
		}

		const data = await request.formData();
		const ratingRaw = data.get('rating');
		const rating = typeof ratingRaw === 'string' ? Number(ratingRaw) : NaN;
		const commentRaw = data.get('studentComment');
		const comment = typeof commentRaw === 'string' ? commentRaw.trim() : '';
		if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
			return fail(400, {
				success: false,
				message: tr(locals.lang)('Bewertung muss zwischen 1 und 5 liegen.', 'Rating must be between 1 and 5.'),
				ratingType: 'student'
			});
		}

		const updateArgs = {
			where: { id: collabChatId, collabSpaceId, toDelete: null },
			data: { student_rating: String(rating), student_comment: comment.length > 0 ? comment : null }
		} satisfies Parameters<typeof prisma.collabChat.updateMany>[0];
		const result = await prisma.collabChat.updateMany(updateArgs);
		if (result.count === 0) {
			return fail(404, { success: false, message: msg(locals.lang).chatNotFound, ratingType: 'student' });
		}

		return { success: true, message: tr(locals.lang)('Bewertung gespeichert.', 'Rating saved.'), rating, ratingType: 'student' };
	},
	rateTeacher: async ({ locals, request, params, cookies }) => {
		const collabSpaceId = Number(params.collabSpaceId);
		const collabChatId = Number(params.collabChatId);
		if (!Number.isInteger(collabSpaceId) || collabSpaceId <= 0) {
			return fail(400, { success: false, message: msg(locals.lang).invalidSpaceId, ratingType: 'teacher' });
		}
		if (!Number.isInteger(collabChatId) || collabChatId <= 0) {
			return fail(400, { success: false, message: msg(locals.lang).invalidChatId, ratingType: 'teacher' });
		}

		const adminCookie = await getJwtCookie<{ password?: string }>(cookies, `collabSpacePw${collabSpaceId}`);
		const isAdmin = await validateAdminCookie(collabSpaceId, adminCookie?.password);
		if (!isAdmin) {
			return fail(403, { success: false, message: msg(locals.lang).invalidAdminSession, ratingType: 'teacher' });
		}

		const data = await request.formData();
		const ratingRaw = data.get('teacherRating');
		const rating = typeof ratingRaw === 'string' ? Number(ratingRaw) : NaN;
		const commentRaw = data.get('teacherComment');
		const comment = typeof commentRaw === 'string' ? commentRaw.trim() : '';
		if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
			return fail(400, {
				success: false,
				message: tr(locals.lang)(tr(locals.lang)('Lehrenden-Bewertung muss zwischen 1 und 5 liegen.', 'Teacher rating must be between 1 and 5.'), 'Teacher rating must be between 1 and 5.'),
				ratingType: 'teacher'
			});
		}

		const updateArgs = {
			where: { id: collabChatId, collabSpaceId, toDelete: null },
			data: { teacher_rating: String(rating), teacher_comment: comment.length > 0 ? comment : null }
		} satisfies Parameters<typeof prisma.collabChat.updateMany>[0];
		const result = await prisma.collabChat.updateMany(updateArgs);
		if (result.count === 0) {
			return fail(404, { success: false, message: msg(locals.lang).chatNotFound, ratingType: 'teacher' });
		}

		return { success: true, message: tr(locals.lang)('Lehrenden-Bewertung gespeichert.', 'Teacher rating saved.'), teacherRating: rating, ratingType: 'teacher' };
	}
};
