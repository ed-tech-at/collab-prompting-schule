import { error, json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import OpenAI from 'openai';
import type { ChatCompletionMessageParam } from 'openai/resources/chat/completions';
import prisma from '$lib/server/db';

const validateStudentCookie = async (collabSpaceId: number, cookieValue: string | undefined) => {
	const findSpaceArgs = {
		where: { id: collabSpaceId },
		select: {
			id: true,
			student_pw: true,
			api_key: true,
			base_url: true,
			model: true,
			system_prompt: true,
			question: true
		}
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

export const POST: RequestHandler = async ({ request, params, cookies }) => {
	const collabSpaceId = Number(params.collabSpaceId);
	const collabChatId = Number(params.collabChatId);

	if (!Number.isInteger(collabSpaceId) || collabSpaceId <= 0) {
		return json({ success: false, message: 'Invalid CollabSpace ID.' }, { status: 400 });
	}
	if (!Number.isInteger(collabChatId) || collabChatId <= 0) {
		return json({ success: false, message: 'Invalid CollabChat ID.' }, { status: 400 });
	}
	if (cookies.get('CollabChatId') !== String(collabChatId)) {
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

	const collabSpace = await validateStudentCookie(collabSpaceId, cookies.get(`studentPw${collabSpaceId}`));

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

	const systemParts = [collabSpace.system_prompt?.trim(), collabSpace.question?.trim()]
		.filter((part): part is string => Boolean(part && part.length > 0));
	const systemPrompt = systemParts.length > 0 ? systemParts.join('\n\n') : 'You are a helpful assistant.';

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
			stream: true,
			stream_options: { include_usage: true }
		});

		const encoder = new TextEncoder();
		let fullText = '';
		let usage: { promptTokens: number; completionTokens: number } = {
			promptTokens: 0,
			completionTokens: 0
		};

		const streamResponse = new ReadableStream({
			async start(controller) {
				try {
					for await (const chunk of stream) {
						const delta = chunk.choices?.[0]?.delta?.content;
						if (typeof delta === 'string' && delta.length > 0) {
							fullText += delta;
							controller.enqueue(encoder.encode(delta));
						}

						if (chunk.usage) {
							usage = {
								promptTokens: chunk.usage.prompt_tokens ?? usage.promptTokens,
								completionTokens: chunk.usage.completion_tokens ?? usage.completionTokens
							};
						}
					}

					const footer = JSON.stringify({ __footer: true, ...usage });
					controller.enqueue(encoder.encode(`\n[__FOOTER__]${footer}`));
					controller.close();

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
					controller.error(err);
				}
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
