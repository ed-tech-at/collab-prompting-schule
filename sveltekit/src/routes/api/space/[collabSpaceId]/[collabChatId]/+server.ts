import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import OpenAI from 'openai';
import type { ChatCompletionMessageParam } from 'openai/resources/chat/completions';
import prisma from '$lib/server/db';
import { getJwtCookie } from '$lib/server/jwt';
import { validateStudentCookie } from '$lib/server/collab-space-auth';
import { LATEX_DELIMITER_SYSTEM_PROMPT } from '$lib/markdown';

const MAX_IMAGES_PER_MESSAGE = 3;
const MAX_IMAGE_DATA_URL_LENGTH = 2 * 1024 * 1024;
const IMAGE_DATA_URL_PATTERN = /^data:image\/(jpeg|png|webp|gif);base64,[A-Za-z0-9+/]+=*$/;

const toMessageContent = (message: string, imageDataUrls: string[]) => {
	if (imageDataUrls.length === 0) return message;
	const parts: Array<
		{ type: 'text'; text: string } | { type: 'image_url'; image_url: { url: string } }
	> = [];
	if (message.length > 0) {
		parts.push({ type: 'text', text: message });
	}
	for (const url of imageDataUrls) {
		parts.push({ type: 'image_url', image_url: { url } });
	}
	return parts;
};

export const POST: RequestHandler = async ({ request, params, cookies }) => {
	const collabSpaceId = Number(params.collabSpaceId);
	const collabChatId = Number(params.collabChatId);

	if (!Number.isInteger(collabSpaceId) || collabSpaceId <= 0) {
		return json({ success: false, message: 'CollabSpace-ID ist ungültig.' }, { status: 400 });
	}
	if (!Number.isInteger(collabChatId) || collabChatId <= 0) {
		return json({ success: false, message: 'CollabChat-ID ist ungültig.' }, { status: 400 });
	}
	const chatCookie = await getJwtCookie<{ collabChatId?: string }>(cookies, `CollabChatId${collabChatId}`);
	if (chatCookie?.collabChatId !== String(collabChatId)) {
		return json({ success: false, message: 'Keine gültige Chat-Sitzung gefunden.' }, { status: 403 });
	}

	let body: unknown;
	try {
		body = await request.json();
	} catch {
		return json({ success: false, message: 'Ungültige Anfrage.' }, { status: 400 });
	}

	const prompt =
		body && typeof body === 'object' && 'prompt' in body && typeof (body as { prompt?: unknown }).prompt === 'string'
			? (body as { prompt: string }).prompt.trim()
			: '';

	const imagesRaw =
		body && typeof body === 'object' && 'images' in body ? (body as { images?: unknown }).images : undefined;
	const images = Array.isArray(imagesRaw) ? imagesRaw : [];

	if (!prompt && images.length === 0) {
		return json({ success: false, message: 'Nachricht fehlt.' }, { status: 400 });
	}
	if (images.length > MAX_IMAGES_PER_MESSAGE) {
		return json(
			{ success: false, message: `Maximal ${MAX_IMAGES_PER_MESSAGE} Bilder pro Nachricht erlaubt.` },
			{ status: 400 }
		);
	}
	const imageDataUrls: string[] = [];
	for (const image of images) {
		if (typeof image !== 'string' || image.length > MAX_IMAGE_DATA_URL_LENGTH || !IMAGE_DATA_URL_PATTERN.test(image)) {
			return json({ success: false, message: 'Ungültiges Bildformat.' }, { status: 400 });
		}
		imageDataUrls.push(image);
	}

	const studentCookie = await getJwtCookie<{ studentPw?: string }>(cookies, `studentPw${collabSpaceId}`);
	const adminCookie = await getJwtCookie<{ password?: string }>(cookies, `collabSpacePw${collabSpaceId}`);
	const collabSpace = await validateStudentCookie(
		collabSpaceId,
		studentCookie?.studentPw,
		adminCookie?.password
	);

	if (images.length > 0 && !collabSpace.imageUpload) {
		return json(
			{ success: false, message: 'Bild-Upload ist in diesem CollabSpace nicht aktiviert.' },
			{ status: 400 }
		);
	}

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
		return json({ success: false, message: 'CollabChat nicht gefunden.' }, { status: 404 });
	}

	if (!collabSpace.api_key) {
		return json({ success: false, message: 'Missing api_key in CollabSpace.' }, { status: 400 });
	}
	if (!collabSpace.model) {
		return json({ success: false, message: 'Missing model in CollabSpace.' }, { status: 400 });
	}

	// const systemParts = [collabSpace.system_prompt?.trim(), collabSpace.question?.trim()]
		// .filter((part): part is string => Boolean(part && part.length > 0));

	const customSystemPrompt = collabSpace.system_prompt;
	const baseSystemPrompt =
		typeof customSystemPrompt === 'string' && customSystemPrompt.length > 0
			? customSystemPrompt
			: 'You are a helpful assistant.';
	const systemPrompt = collabSpace.mathRender
		? `${baseSystemPrompt}\n\n${LATEX_DELIMITER_SYSTEM_PROMPT}`
		: baseSystemPrompt;

	const history: ChatCompletionMessageParam[] = collabChat.ChatEntries.filter(
		(entry) => (entry.role === 'user' || entry.role === 'assistant') && typeof entry.message === 'string'
	).map((entry) =>
		entry.role === 'user'
			? {
					role: 'user',
					content: toMessageContent(entry.message as string, entry.images.map((image) => image.dataUrl))
				}
			: { role: 'assistant', content: entry.message as string }
	);

	try {
		const createUserEntryArgs = {
			data: {
				collabChatId,
				role: 'user',
				message: prompt,
				...(imageDataUrls.length > 0
					? { images: { create: imageDataUrls.map((dataUrl) => ({ dataUrl })) } }
					: {})
			}
		} satisfies Parameters<typeof prisma.chatEntry.create>[0];
		await prisma.chatEntry.create(createUserEntryArgs);

		const client = new OpenAI({
			apiKey: collabSpace.api_key,
			baseURL: collabSpace.base_url ?? undefined
		});

		const messages: ChatCompletionMessageParam[] = [
			{ role: 'system', content: systemPrompt },
			...history,
			{ role: 'user', content: toMessageContent(prompt, imageDataUrls) }
		];

		const stream = await client.chat.completions.create({
			model: collabSpace.model,
			messages,
			stream: true
		});

		const encoder = new TextEncoder();
		let fullText = '';
		let controllerClosed = false;

		const streamResponse = new ReadableStream({
			async start(controller) {
				try {
					for await (const chunk of stream) {
						if (controllerClosed) break;

						const delta = chunk.choices?.[0]?.delta?.content;
						if (typeof delta === 'string' && delta.length > 0) {
							fullText += delta;
							try {
								controller.enqueue(encoder.encode(delta));
							} catch {
								controllerClosed = true;
								break;
							}
						}
					}

					if (!controllerClosed) {
						controller.close();
					}

					const createAssistantEntryArgs = {
						data: {
							collabChatId,
							role: 'assistant',
							message: fullText
						}
					} satisfies Parameters<typeof prisma.chatEntry.create>[0];
					await prisma.chatEntry.create(createAssistantEntryArgs);
				} catch (err) {
					console.error('Collab chat stream failed', err);
					if (!controllerClosed) {
						try {
							controller.error(err);
						} catch {}
					}
				}
			},
			cancel() {
				controllerClosed = true;
			}
		});

		return new Response(streamResponse, {
			status: 200,
			headers: {
				'content-type': 'text/plain; charset=utf-8',
				'cache-control': 'no-cache, no-transform'
			}
		});
	} catch (err) {
		console.error('Collab chat completion failed', err);
		return json({ success: false, message: 'Chat failed. See server logs.' }, { status: 500 });
	}
};
