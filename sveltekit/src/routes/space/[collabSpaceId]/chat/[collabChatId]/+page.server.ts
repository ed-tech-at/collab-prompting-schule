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

const escapeHtml = (value: string) =>
	value
		.replace(/&/g, '&amp;')
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;')
		.replace(/"/g, '&quot;')
		.replace(/'/g, '&#39;');

export const load: PageServerLoad = async ({ params, cookies }) => {
	const collabSpaceId = Number(params.collabSpaceId);
	const collabChatId = Number(params.collabChatId);

	if (!Number.isInteger(collabSpaceId) || collabSpaceId <= 0) {
		throw error(400, 'CollabSpace-ID ist ungültig.');
	}
	if (!Number.isInteger(collabChatId) || collabChatId <= 0) {
		throw error(400, 'CollabChat-ID ist ungültig.');
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
		throw error(404, 'CollabChat nicht gefunden.');
	}
	if (collabChat.hidden && !isAdmin) {
		throw error(404, 'CollabChat nicht gefunden.');
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
	toggleHidden: async ({ request, params, cookies }) => {
		const collabSpaceId = Number(params.collabSpaceId);
		const collabChatId = Number(params.collabChatId);
		if (!Number.isInteger(collabSpaceId) || collabSpaceId <= 0) {
			return fail(400, { success: false, message: 'CollabSpace-ID ist ungültig.', actionType: 'hidden' });
		}
		if (!Number.isInteger(collabChatId) || collabChatId <= 0) {
			return fail(400, { success: false, message: 'CollabChat-ID ist ungültig.', actionType: 'hidden' });
		}

		const adminCookie = await getJwtCookie<{ password?: string }>(cookies, `collabSpacePw${collabSpaceId}`);
		const isAdmin = await validateAdminCookie(collabSpaceId, adminCookie?.password);
		if (!isAdmin) {
			return fail(403, { success: false, message: 'Keine gültige Verwaltungssitzung gefunden.', actionType: 'hidden' });
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
			return fail(404, { success: false, message: 'CollabChat nicht gefunden.', actionType: 'hidden' });
		}

		return {
			success: true,
			message: hidden ? 'Chat ist nun für Teilnehmende verborgen.' : 'Chat ist wieder für Teilnehmende sichtbar.',
			actionType: 'hidden'
		};
	},
	deleteChat: async ({ params, cookies }) => {
		const collabSpaceId = Number(params.collabSpaceId);
		const collabChatId = Number(params.collabChatId);
		if (!Number.isInteger(collabSpaceId) || collabSpaceId <= 0) {
			return fail(400, { success: false, message: 'CollabSpace-ID ist ungültig.', actionType: 'deleteChat' });
		}
		if (!Number.isInteger(collabChatId) || collabChatId <= 0) {
			return fail(400, { success: false, message: 'CollabChat-ID ist ungültig.', actionType: 'deleteChat' });
		}

		const adminCookie = await getJwtCookie<{ password?: string }>(cookies, `collabSpacePw${collabSpaceId}`);
		const isAdmin = await validateAdminCookie(collabSpaceId, adminCookie?.password);
		if (!isAdmin) {
			return fail(403, { success: false, message: 'Keine gültige Verwaltungssitzung gefunden.', actionType: 'deleteChat' });
		}

		const result = await prisma.collabChat.updateMany({
			where: { id: collabChatId, collabSpaceId, toDelete: null },
			data: { toDelete: new Date() }
		});
		if (result.count === 0) {
			return fail(404, { success: false, message: 'CollabChat nicht gefunden.', actionType: 'deleteChat' });
		}

		throw redirect(303, resolve(`/admin/${collabSpaceId}`));
	},
	rate: async ({ request, params, cookies }) => {
		const collabSpaceId = Number(params.collabSpaceId);
		const collabChatId = Number(params.collabChatId);
		if (!Number.isInteger(collabSpaceId) || collabSpaceId <= 0) {
			return fail(400, { success: false, message: 'CollabSpace-ID ist ungültig.', ratingType: 'student' });
		}
		if (!Number.isInteger(collabChatId) || collabChatId <= 0) {
			return fail(400, { success: false, message: 'CollabChat-ID ist ungültig.', ratingType: 'student' });
		}

		const studentCookie = await getJwtCookie<{ studentPw?: string }>(cookies, `studentPw${collabSpaceId}`);
		const adminCookie = await getJwtCookie<{ password?: string }>(cookies, `collabSpacePw${collabSpaceId}`);
		await validateStudentCookie(collabSpaceId, studentCookie?.studentPw, adminCookie?.password);
		const chatCookie = await getJwtCookie<{ collabChatId?: string }>(cookies, `CollabChatId${collabChatId}`);
		if (chatCookie?.collabChatId !== String(collabChatId)) {
			return fail(403, { success: false, message: 'Keine gültige Chat-Sitzung gefunden.', ratingType: 'student' });
		}

		const data = await request.formData();
		const ratingRaw = data.get('rating');
		const rating = typeof ratingRaw === 'string' ? Number(ratingRaw) : NaN;
		const commentRaw = data.get('studentComment');
		const comment = typeof commentRaw === 'string' ? commentRaw.trim() : '';
		if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
			return fail(400, {
				success: false,
				message: 'Bewertung muss zwischen 1 und 5 liegen.',
				ratingType: 'student'
			});
		}

		const updateArgs = {
			where: { id: collabChatId, collabSpaceId, toDelete: null },
			data: { student_rating: String(rating), student_comment: comment.length > 0 ? comment : null }
		} satisfies Parameters<typeof prisma.collabChat.updateMany>[0];
		const result = await prisma.collabChat.updateMany(updateArgs);
		if (result.count === 0) {
			return fail(404, { success: false, message: 'CollabChat nicht gefunden.', ratingType: 'student' });
		}

		return { success: true, message: 'Bewertung gespeichert.', rating, ratingType: 'student' };
	},
	rateTeacher: async ({ request, params, cookies }) => {
		const collabSpaceId = Number(params.collabSpaceId);
		const collabChatId = Number(params.collabChatId);
		if (!Number.isInteger(collabSpaceId) || collabSpaceId <= 0) {
			return fail(400, { success: false, message: 'CollabSpace-ID ist ungültig.', ratingType: 'teacher' });
		}
		if (!Number.isInteger(collabChatId) || collabChatId <= 0) {
			return fail(400, { success: false, message: 'CollabChat-ID ist ungültig.', ratingType: 'teacher' });
		}

		const adminCookie = await getJwtCookie<{ password?: string }>(cookies, `collabSpacePw${collabSpaceId}`);
		const isAdmin = await validateAdminCookie(collabSpaceId, adminCookie?.password);
		if (!isAdmin) {
			return fail(403, { success: false, message: 'Keine gültige Verwaltungssitzung gefunden.', ratingType: 'teacher' });
		}

		const data = await request.formData();
		const ratingRaw = data.get('teacherRating');
		const rating = typeof ratingRaw === 'string' ? Number(ratingRaw) : NaN;
		const commentRaw = data.get('teacherComment');
		const comment = typeof commentRaw === 'string' ? commentRaw.trim() : '';
		if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
			return fail(400, {
				success: false,
				message: 'Lehrenden-Bewertung muss zwischen 1 und 5 liegen.',
				ratingType: 'teacher'
			});
		}

		const updateArgs = {
			where: { id: collabChatId, collabSpaceId, toDelete: null },
			data: { teacher_rating: String(rating), teacher_comment: comment.length > 0 ? comment : null }
		} satisfies Parameters<typeof prisma.collabChat.updateMany>[0];
		const result = await prisma.collabChat.updateMany(updateArgs);
		if (result.count === 0) {
			return fail(404, { success: false, message: 'CollabChat nicht gefunden.', ratingType: 'teacher' });
		}

		return { success: true, message: 'Lehrenden-Bewertung gespeichert.', teacherRating: rating, ratingType: 'teacher' };
	}
};
