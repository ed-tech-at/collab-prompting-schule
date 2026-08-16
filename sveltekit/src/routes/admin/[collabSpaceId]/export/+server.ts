import { error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import prisma from '$lib/server/db';
import { getJwtCookie } from '$lib/server/jwt';

const exportDate = (date: Date) => date.toISOString().slice(0, 10);

export const GET: RequestHandler = async ({ params, cookies }) => {
	const collabSpaceId = Number(params.collabSpaceId);
	if (!Number.isInteger(collabSpaceId) || collabSpaceId <= 0) {
		throw error(400, 'CollabSpace-ID ist ungültig.');
	}

	const cookiePayload = await getJwtCookie<{ password?: string }>(
		cookies,
		`collabSpacePw${collabSpaceId}`
	);
	if (!cookiePayload?.password) {
		throw error(403, 'Keine gültige Verwaltungssitzung gefunden.');
	}

	const collabSpace = await prisma.collabSpace.findFirst({
		where: { id: collabSpaceId, password: cookiePayload.password, toDelete: null },
		select: {
			id: true,
			title: true,
			manageEmail: true,
			base_url: true,
			model: true,
			cryptVersion: true,
			mathRender: true,
			question: true,
			system_prompt: true,
			createdAt: true,
			toDelete: true,
			collabChats: {
				orderBy: { createdAt: 'asc' },
				select: {
					id: true,
					collabSpaceId: true,
					username: true,
					teacher_rating: true,
					student_rating: true,
					teacher_comment: true,
					student_comment: true,
					hidden: true,
					createdAt: true,
					toDelete: true,
					ChatEntries: {
						orderBy: { createdAt: 'asc' },
						select: {
							id: true,
							collabChatId: true,
							role: true,
							message: true,
							createdAt: true
						}
					}
				}
			}
		}
	});
	if (!collabSpace) {
		throw error(403, 'Keine gültige Verwaltungssitzung gefunden.');
	}

	const { collabChats, ...spaceSettings } = collabSpace;
	const body = JSON.stringify(
		{
			formatVersion: 1,
			exportedAt: new Date().toISOString(),
			collabSpace: {
				...spaceSettings,
				collabChats: collabChats.map(({ ChatEntries, ...chat }) => ({
					...chat,
					chatEntries: ChatEntries
				}))
			}
		},
		null,
		2
	);

	return new Response(body, {
		headers: {
			'content-type': 'application/json; charset=utf-8',
			'content-disposition': `attachment; filename="collabspace-${collabSpaceId}-export-${exportDate(new Date())}.json"`,
			'cache-control': 'no-store'
		}
	});
};
