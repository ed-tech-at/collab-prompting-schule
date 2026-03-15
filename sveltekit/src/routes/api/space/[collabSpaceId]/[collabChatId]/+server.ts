import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import OpenAI from 'openai';
import type { ChatCompletionMessageParam } from 'openai/resources/space/completions';
import prisma from '$lib/server/db';
import { getJwtCookie } from '$lib/server/jwt';
import { validateStudentCookie } from '$lib/server/collab-space-auth';

export const POST: RequestHandler = async ({ request, params, cookies }) => {
	const collabSpaceId = Number(params.collabSpaceId);
	const collabChatId = Number(params.collabChatId);

	if (!Number.isInteger(collabSpaceId) || collabSpaceId <= 0) {
		return json({ success: false, message: 'Invalid CollabSpace ID.' }, { status: 400 });
	}
	if (!Number.isInteger(collabChatId) || collabChatId <= 0) {
		return json({ success: false, message: 'Invalid CollabChat ID.' }, { status: 400 });
	}
	const chatCookie = await getJwtCookie<{ collabChatId?: string }>(cookies, `CollabChatId${collabChatId}`);
	if (chatCookie?.collabChatId !== String(collabChatId)) {
		return json({ success: false, message: 'CollabChat cookie required.' }, { status: 403 });
	}

	let body: unknown;
	try {
		body = await request.json();
	} catch {
		return json({ success: false, message: 'Invalid JSON body.' }, { status: 400 });
	}

	const prompt =
		body && typeof body === 'object' && 'prompt' in body && typeof (body as { prompt?: unknown }).prompt === 'string'
			? (body as { prompt: string }).prompt.trim()
			: '';

	if (!prompt) {
		return json({ success: false, message: 'Missing prompt.' }, { status: 400 });
	}

	const studentCookie = await getJwtCookie<{ studentPw?: string }>(cookies, `studentPw${collabSpaceId}`);
	const adminCookie = await getJwtCookie<{ password?: string }>(cookies, `collabSpacePw${collabSpaceId}`);
	const collabSpace = await validateStudentCookie(
		collabSpaceId,
		studentCookie?.studentPw,
		adminCookie?.password
	);

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
		return json({ success: false, message: 'CollabChat not found.' }, { status: 404 });
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
	const latexFormattingInstruction =
		'When writing mathematical formulas, always use valid LaTeX delimiters. Use $$...$$ for display math on separate lines and $...$ for inline math. Do not use \\(...\\), \\[...\\], plain parentheses, or plain brackets as math delimiters.';
	const systemPrompt = collabSpace.mathRender
		? `${baseSystemPrompt}\n\n${latexFormattingInstruction}`
		: baseSystemPrompt;

	const history = collabChat.ChatEntries.filter(
		(entry) => (entry.role === 'user' || entry.role === 'assistant') && typeof entry.message === 'string'
	).map((entry) => ({ role: entry.role as 'user' | 'assistant', content: entry.message as string }));

	try {
		const createUserEntryArgs = {
			data: {
				collabChatId,
				role: 'user',
				message: prompt
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
			{ role: 'user', content: prompt }
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
