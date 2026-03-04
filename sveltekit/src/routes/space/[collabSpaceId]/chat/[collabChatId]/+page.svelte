<script lang="ts">
	import type { ActionData, PageData } from './$types';
	import { resolve } from '$app/paths';
	import { renderMarkdownWithBlankTargets } from '$lib/markdown';


	export let data: PageData;
	export let form: ActionData;

	let prompt = '';
	let loading = false;
	let errorMessage = '';
	let rating = Number(data.studentRating ?? 0);
	let teacherRating = Number(data.teacherRating ?? 0);
	let studentComment = data.studentComment ?? '';
	let teacherComment = data.teacherComment ?? '';
	const FOOTER_MARKER = '[__FOOTER__]';
	let messages: Array<{ role: 'user' | 'assistant'; content: string; html?: string }> = (
		data.messages ?? []
	).map((message) => ({
		role: message.role,
		content: message.content,
		html:
			message.role === 'assistant'
				? (renderMarkdownWithBlankTargets(message.content) ?? '')
				: undefined
	}));

	const appendAssistantChunk = (assistantIndex: number, chunk: string) => {
		if (!chunk) return;
		const next = messages[assistantIndex];
		next.content += chunk;
		next.html = renderMarkdownWithBlankTargets(next.content) ?? '';
		messages = [...messages];
	};

	const scrollToBottom = () => {
		setTimeout(() => {
				const el = document.querySelector('.chat-window') as HTMLElement | null;
				if (el) el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' });
			}, 10);
	}

	const send = async () => {
		if (!prompt.trim()) {
			errorMessage = 'Bitte geben Sie eine Nachricht ein.';

			scrollToBottom();

			return;
		}

		errorMessage = '';
		const nextPrompt = prompt.trim();
		prompt = '';
		loading = true;

		messages = [...messages, { role: 'user', content: nextPrompt }];
		messages = [...messages, { role: 'assistant', content: '', html: '' }];
		const assistantIndex = messages.length - 1;

		try {
			const res = await fetch(
				resolve(`/api/space/${data.collabSpaceId}/${data.collabChatId}`),
				{
					method: 'POST',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify({ prompt: nextPrompt })
				}
			);

			if (!res.ok || !res.body) {
				throw new Error('Request failed');
			}

			const reader = res.body.getReader();
			const decoder = new TextDecoder('utf-8');
			let done = false;
			let buffer = '';
			let footerSeen = false;

			scrollToBottom();

			while (!done) {
				const { value, done: streamDone } = await reader.read();
				if (value) {
					buffer += decoder.decode(value, { stream: true });

					const markerIndex = buffer.indexOf(FOOTER_MARKER);
					if (markerIndex !== -1) {
						const textBeforeFooter = buffer.slice(0, markerIndex);
						appendAssistantChunk(assistantIndex, textBeforeFooter);

						const footerRaw = buffer.slice(markerIndex + FOOTER_MARKER.length).trim();
						if (footerRaw) {
							try {
								JSON.parse(footerRaw);
							} catch {
								// ignore malformed footer payload
							}
						}

						footerSeen = true;
						done = true;
						break;
					}

					// Keep a short tail in case footer marker is split across chunks.
					const safeLen = Math.max(0, buffer.length - (FOOTER_MARKER.length - 1));
					if (safeLen > 0) {
						appendAssistantChunk(assistantIndex, buffer.slice(0, safeLen));
						buffer = buffer.slice(safeLen);
					}
				}

				done = done || streamDone;
			}

			if (!footerSeen && buffer.length > 0) {
				appendAssistantChunk(assistantIndex, buffer);
			}


		} catch (err) {
			errorMessage = err instanceof Error ? err.message : 'Request failed';
		} finally {
			loading = false;

			scrollToBottom();

		}
	};
</script>


<h1>Space ID {data.collabSpaceId} / CollabChat #{data.collabChatId}</h1>
<section>
	<p><a href={resolve(`/space/${data.collabSpaceId}`)}>Zurück zur Übersicht</a></p>
	{#if data.isAdmin}
		<div class="card">
			<h2>Admin</h2>
			<form method="POST" action="?/toggleHidden">
				{#if data.hidden}
					<button type="submit" name="hiddenAction" value="unhide" class="btn btn-success">
						Für Teilnehmende entsperren
					</button>
				{:else}
					<button type="submit" name="hiddenAction" value="hide" class="btn btn-danger">
						Für Teilnehmende verstecken
					</button>
				{/if}
			</form>
			{#if form?.message && form?.actionType === 'hidden'}
				<p class={form.success ? 'ok' : 'error'}>{form.message}</p>
			{/if}
		</div>
	{/if}
	{#if data.question}
		<p class="question"><b>Aufgabe:</b> {data.question}</p>
	{/if}

	<!-- <section> -->
		<h3>Chat</h3>

		<div class="chat-window">
			<!-- <div class="messages"> -->
				{#if messages.length === 0}
					<p class="muted empty">Nachricht eingeben um zu starten.</p>
				{/if}
				{#each messages as message}
					<div class="bubble {message.role}">
						{#if message.role === 'assistant'}
							<div class="bubble-content">{@html message.html}</div>
							<div class="meta">Chatbot</div>
							{:else}
							<div class="bubble-content">{message.content}</div>
							<div class="meta">Nutzer:in</div>
						{/if}
					</div>
				{/each}
			<!-- </div> -->
			



		{#if data.canChat}
				<div class="chat-input">
					<!-- <label style="width: 100%;"> -->
						<!-- Nachricht -->
						<textarea
							bind:value={prompt}
							class=""
							rows="3"
							placeholder="Geben Sie Ihre Nachricht ein..."
							on:keydown={(e) => {
								if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
									e.preventDefault();
									send();
								}
							}}
						></textarea>
					<!-- </label> -->
						<div class="actions">
							<button type="button" class="btn btn-primary send-button" on:click={send} disabled={loading}>
								<i class={loading ? 'fas fa-spinner fa-spin' : 'far fa-paper-plane'} aria-hidden="true"></i>
							</button>
						</div>

				</div>
				{#if errorMessage}
				<p class="error-window">
					<span class="error">{errorMessage}</span>
				</p>
				{/if}
			{:else}
				<div class="chat-input">
					<p class="muted">Nur der/die Ersteller:in dieses Chats kann Nachrichten senden.</p>
				</div>
			{/if}
		</div>

	<!-- </section> -->

	{#if data.canChat}
		<div class="card rating-card">
			<h2>Ihre Bewertung</h2>
			<form method="POST" action="?/rate" class="rating-form">
				<div class="stars" role="radiogroup" aria-label="Bewertung von 1 bis 5">
					{#each [1, 2, 3, 4, 5] as value}
						<label class="star" class:active={value <= rating}>
							<input type="radio" name="rating" value={value} bind:group={rating} />
							<i aria-hidden="true" class={`fa-star ${value <= rating ? 'fas' : 'far'}`}></i>
						</label>
					{/each}
				</div>
				<label class="rating-comment-label" for="student-comment">Kommentar</label>
				<textarea
					id="student-comment"
					name="studentComment"
					class="rating-comment-input"
					rows="3"
					bind:value={studentComment}
					placeholder="Optionaler Kommentar zur Bewertung"
				></textarea>
				<button type="submit" class="btn">Bewertung speichern</button>
			</form>
			<!-- {#if data.studentComment} -->
				<!-- <p class="saved-comment"><b>Gespeicherter Kommentar:</b> {data.studentComment}</p> -->
			<!-- {/if} -->
			{#if form?.message && form?.ratingType === 'student'}
				<p class={form.success ? 'ok' : 'error'}>{form.message}</p>
			{/if}
		</div>
	{:else}
		{#if data.studentRating || data.studentComment}
			<div class="card rating-card">
				<h2>Bewertung der:des Ersteller:in</h2>
				{#if data.studentRating}
					<div class="stars" aria-label="Bewertung">
						{#each [1, 2, 3, 4, 5] as value}
							<span class="star active">
								<i
									aria-hidden="true"
									class={`fa-star ${value <= Number(data.studentRating) ? 'fas' : 'far'}`}
								></i>
							</span>
						{/each}
					</div>
				{/if}
				{#if data.studentComment}
					<p class="saved-comment"><b>Kommentar:</b> {data.studentComment}</p>
				{/if}
			</div>
		{/if}
	{/if}

	{#if data.isAdmin}
		<div class="card rating-card teacher-rating-card">
			<h2>Lehrenden-Bewertung</h2>
			<form method="POST" action="?/rateTeacher" class="rating-form">
				<div class="stars teacher-stars" role="radiogroup" aria-label="Lehrerenden-Bewertung von 1 bis 5">
					{#each [1, 2, 3, 4, 5] as value}
						<label class="star" class:active={value <= teacherRating}>
							<input type="radio" name="teacherRating" value={value} bind:group={teacherRating} />
							<i
								aria-hidden="true"
								class={`fa-star ${value <= teacherRating ? 'fas' : 'far'}`}
							></i>
						</label>
					{/each}
				</div>
				<label class="rating-comment-label" for="teacher-comment">Kommentar</label>
				<textarea
					id="teacher-comment"
					name="teacherComment"
					class="rating-comment-input"
					rows="3"
					bind:value={teacherComment}
					placeholder="Optionaler Kommentar zur Lehrenden-Bewertung"
				></textarea>
				<button type="submit" class="btn">Lehrerenden-Bewertung speichern</button>
			</form>
			<!-- {#if data.teacherComment} -->
				<!-- <p class="saved-comment"><b>Gespeicherter Kommentar:</b> {data.teacherComment}</p> -->
			<!-- {/if} -->
			{#if form?.message && form?.ratingType === 'teacher'}
				<p class={form.success ? 'ok' : 'error'}>{form.message}</p>
			{/if}
		</div>
	{/if}
</section>

<style>
	/* .page {
		display: grid;
		gap: 1rem;
		max-width: 800px;
		margin: 0 auto;
		padding: 1rem;
	}

	.question {
		margin: 0;
		padding: 0.75rem;
		border: 1px solid #e3e3e3;
		border-radius: 8px;
		background: #f7fafc;
	}

	.muted {
		color: #666;
	}

	.card {
		border: 1px solid #e3e3e3;
		border-radius: 8px;
		padding: 0.75rem;
		display: grid;
		gap: 0.5rem;
		background: #fafafa;
	}

	label {
		display: grid;
		gap: 0.35rem;
		font-weight: 600;
	}

	textarea {
		width: 100%;
		border: 1px solid #cfd6e0;
		border-radius: 6px;
		padding: 0.5rem;
		font-family: inherit;
		font-size: 1rem;
		min-height: 90px;
		resize: vertical;
	}

	.actions {
		display: flex;
		align-items: center;
		gap: 0.75rem;
	}

	button {
		padding: 0.55rem 0.95rem;
		border-radius: 6px;
		border: 1px solid #1f7ae0;
		background: #1f7ae0;
		color: white;
		font-weight: 600;
		cursor: pointer;
		min-width: 110px;
	}

	.error {
		color: #8a1c1c;
		font-size: 0.95rem;
	}

	.chat-card {
		padding: 0;
		overflow: hidden;
	}

	.messages {
		display: grid;
		gap: 0.75rem;
		padding: 1rem;
		max-height: 60vh;
		overflow: auto;
		background: #ffffff;
	}

	.empty {
		text-align: center;
		margin: 2rem 0;
	}

	.bubble {
		display: flex;
	}

	.bubble.user {
		justify-content: flex-end;
	}

	.bubble.assistant {
		justify-content: flex-start;
	}

	.bubble-content {
		max-width: min(72%, 520px);
		padding: 0.6rem 0.8rem;
		border-radius: 14px;
		border: 1px solid #e3e3e3;
		background: #f6f6f6;
		white-space: pre-wrap;
	}

	.bubble.user .bubble-content {
		background: #1f7ae0;
		color: white;
		border-color: #1f7ae0;
	}

	.bubble.assistant .bubble-content :global(p) {
		margin: 0 0 0.5rem 0;
	}

	.bubble.assistant .bubble-content :global(p:last-child) {
		margin-bottom: 0;
	}

	.composer {
		border-top: 1px solid #e3e3e3;
		padding: 0.75rem;
		background: #fafafa;
		display: grid;
		gap: 0.5rem;
	}

	.rating-card {
		display: grid;
		gap: 0.75rem;
	}

	.rating-card h2 {
		margin: 0;
		font-size: 1rem;
	}

	.rating-form {
		display: grid;
		gap: 0.75rem;
	}

	.stars {
		display: flex;
		gap: 0.35rem;
	}

	.star {
		cursor: pointer;
		font-size: 1.6rem;
		line-height: 1;
	}

	.teacher-stars .star span {
		color: #1f7ae0;
	}

	.star input {
		position: absolute;
		opacity: 0;
		pointer-events: none;
	}

	.ok {
		color: #1b6b3a;
		font-size: 0.95rem;
		margin: 0;
	} */
</style>
