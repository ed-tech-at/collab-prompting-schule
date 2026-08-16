import { error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import prisma from '$lib/server/db';
import { getJwtCookie } from '$lib/server/jwt';
import { buildZip, type ZipEntry } from '$lib/server/zip';

const exportDate = (date: Date) => date.toISOString().slice(0, 10);

const DATA_URL_PATTERN = /^data:(image\/[a-z0-9+.-]+);base64,(.*)$/;
const FILE_EXTENSIONS: Record<string, string> = {
	'image/jpeg': 'jpg',
	'image/png': 'png',
	'image/webp': 'webp',
	'image/gif': 'gif'
};

/** Schutz davor, dass ein sehr grosser Export den Node-Prozess aufbraucht. */
const MAX_EXPORT_IMAGE_BYTES = 512 * 1024 * 1024;

export const GET: RequestHandler = async ({ params, cookies, url }) => {
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
			imageUpload: true,
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
							createdAt: true,
							images: {
								orderBy: { id: 'asc' },
								select: {
									id: true,
									chatEntryId: true,
									dataUrl: true,
									createdAt: true
								}
							}
						}
					}
				}
			}
		}
	});
	if (!collabSpace) {
		throw error(403, 'Keine gültige Verwaltungssitzung gefunden.');
	}

	const withImageFiles = url.searchParams.get('images') === 'zip';
	const imageFiles: ZipEntry[] = [];
	let imageBytesTotal = 0;

	type StoredImage = { id: number; chatEntryId: number; dataUrl: string; createdAt: Date };

	// Bilder liegen als Base64-Data-URL in der DB. Im Export stehen nur Metadaten,
	// die Bytes wandern (falls angefordert) als eigene Datei ins ZIP.
	const describeImage = (image: StoredImage, collabChatId: number) => {
		const match = DATA_URL_PATTERN.exec(image.dataUrl);
		const mimeType = match?.[1] ?? null;
		const extension = mimeType ? FILE_EXTENSIONS[mimeType] : undefined;

		if (!match || !extension) {
			// Unbekanntes oder beschaedigtes Format: Metadaten melden, aber nicht daran scheitern.
			return {
				id: image.id,
				chatEntryId: image.chatEntryId,
				createdAt: image.createdAt,
				mimeType,
				byteSize: null,
				file: null
			};
		}

		const data = Buffer.from(match[2], 'base64');
		imageBytesTotal += data.length;

		const file = `images/chat-${collabChatId}/entry-${image.chatEntryId}-image-${image.id}.${extension}`;
		if (withImageFiles) {
			imageFiles.push({ name: file, data });
		}

		return {
			id: image.id,
			chatEntryId: image.chatEntryId,
			createdAt: image.createdAt,
			mimeType,
			byteSize: data.length,
			file
		};
	};

	const { collabChats, ...spaceSettings } = collabSpace;
	const exportedAt = new Date();
	const body = JSON.stringify(
		{
			formatVersion: 2,
			exportedAt: exportedAt.toISOString(),
			collabSpace: {
				...spaceSettings,
				collabChats: collabChats.map(({ ChatEntries, ...chat }) => ({
					...chat,
					chatEntries: ChatEntries.map(({ images, ...entry }) => ({
						...entry,
						images: images.map((image) => describeImage(image, chat.id))
					}))
				}))
			}
		},
		null,
		2
	);

	const filename = `collabspace-${collabSpaceId}-export-${exportDate(exportedAt)}`;

	if (!withImageFiles) {
		return new Response(body, {
			headers: {
				'content-type': 'application/json; charset=utf-8',
				'content-disposition': `attachment; filename="${filename}.json"`,
				'cache-control': 'no-store'
			}
		});
	}

	if (imageBytesTotal > MAX_EXPORT_IMAGE_BYTES) {
		throw error(
			413,
			'Die Bilder dieses CollabSpace sind zu gross für einen ZIP-Export. Bitte den JSON-Export ohne Bilddateien verwenden.'
		);
	}

	const archive = buildZip(
		[...imageFiles, { name: 'export.json', data: Buffer.from(body, 'utf8') }],
		exportedAt
	);

	return new Response(archive, {
		headers: {
			'content-type': 'application/zip',
			'content-disposition': `attachment; filename="${filename}.zip"`,
			'cache-control': 'no-store'
		}
	});
};
