<script lang="ts">
	import type { ActionData, PageData } from './$types';
	import { resolve } from '$app/paths';
	import { renderMarkdown } from '$lib/markdown';
	import { localize, tr } from '$lib/i18n';


	export let data: PageData;
	export let form: ActionData;
	const t = tr(data.lang);

	let prompt = '';
	let loading = false;
	let errorMessage = '';
	let renderedQuestion = renderMarkdown(data.question ?? undefined, {
		mathRender: data.mathRender
	});
	let rating = Number(data.studentRating ?? 0);
	let teacherRating = Number(data.teacherRating ?? 0);
	let studentComment = data.studentComment ?? '';
	let teacherComment = data.teacherComment ?? '';
	let confirmDeleteChat = false;
	const spaceTitle = data.title?.trim() ?? '';
	let messages: Array<{ role: 'user' | 'assistant'; content: string; html?: string; images?: string[] }> = (
		data.messages ?? []
	).map((message) => ({
		role: message.role,
		content: message.content,
		images: message.images,
		html:
			message.role === 'assistant'
				? (renderMarkdown(message.content, { mathRender: data.mathRender }) ?? '')
				: undefined
	}));

	const MAX_IMAGES_PER_MESSAGE = 3;
	const MAX_IMAGE_DIMENSION = 1568;
	let pendingImages: string[] = [];
	let dragOver = false;
	let fileInput: HTMLInputElement | null = null;

	const loadImageElement = (file: File) =>
		new Promise<HTMLImageElement>((resolvePromise, rejectPromise) => {
			const objectUrl = URL.createObjectURL(file);
			const img = new Image();
			img.onload = () => resolvePromise(img);
			img.onerror = () => {
				URL.revokeObjectURL(objectUrl);
				rejectPromise(new Error(t('Bild konnte nicht gelesen werden.', 'Image could not be read.')));
			};
			img.src = objectUrl;
		});

	const compressImage = async (file: File): Promise<string> => {
		const img = await loadImageElement(file);
		try {
			const scale = Math.min(1, MAX_IMAGE_DIMENSION / Math.max(img.naturalWidth, img.naturalHeight));
			const width = Math.max(1, Math.round(img.naturalWidth * scale));
			const height = Math.max(1, Math.round(img.naturalHeight * scale));

			const canvas = document.createElement('canvas');
			canvas.width = width;
			canvas.height = height;
			const ctx = canvas.getContext('2d');
			if (!ctx) throw new Error(t('Bild konnte nicht verarbeitet werden.', 'Image could not be processed.'));
			ctx.fillStyle = '#ffffff';
			ctx.fillRect(0, 0, width, height);
			ctx.drawImage(img, 0, 0, width, height);
			return canvas.toDataURL('image/jpeg', 0.85);
		} finally {
			URL.revokeObjectURL(img.src);
		}
	};

	const addImageFiles = async (files: Iterable<File>) => {
		if (!data.imageUpload) return;
		errorMessage = '';
		for (const file of files) {
			if (!file.type.startsWith('image/')) continue;
			if (pendingImages.length >= MAX_IMAGES_PER_MESSAGE) {
				errorMessage = t(
					`Maximal ${MAX_IMAGES_PER_MESSAGE} Bilder pro Nachricht möglich.`,
					`At most ${MAX_IMAGES_PER_MESSAGE} images per message.`
				);
				break;
			}
			try {
				const dataUrl = await compressImage(file);
				pendingImages = [...pendingImages, dataUrl];
			} catch {
				errorMessage = t('Ein Bild konnte nicht verarbeitet werden.', 'An image could not be processed.');
			}
		}
	};

	const onFileInputChange = async (event: Event) => {
		const input = event.currentTarget as HTMLInputElement;
		if (input.files) {
			await addImageFiles(input.files);
		}
		input.value = '';
	};

	const onDrop = async (event: DragEvent) => {
		dragOver = false;
		if (!data.imageUpload || !event.dataTransfer) return;
		await addImageFiles(event.dataTransfer.files);
	};

	const onPaste = async (event: ClipboardEvent) => {
		if (!data.imageUpload || !event.clipboardData) return;
		const files = Array.from(event.clipboardData.items)
			.filter((item) => item.kind === 'file' && item.type.startsWith('image/'))
			.map((item) => item.getAsFile())
			.filter((file): file is File => file !== null);
		if (files.length > 0) {
			event.preventDefault();
			await addImageFiles(files);
		}
	};

	const removePendingImage = (index: number) => {
		pendingImages = pendingImages.filter((_, i) => i !== index);
	};

	const appendAssistantChunk = (assistantIndex: number, chunk: string) => {
		if (!chunk) return;
		const next = messages[assistantIndex];
		next.content += chunk;
		next.html = renderMarkdown(next.content, { mathRender: data.mathRender }) ?? '';
		messages = [...messages];
	};

	const scrollToBottom = () => {
		setTimeout(() => {
				const el = document.querySelector('.chat-window') as HTMLElement | null;
				if (el) el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' });
			}, 10);
	}

	const send = async () => {
		if (!prompt.trim() && pendingImages.length === 0) {
			errorMessage = t('Bitte geben Sie eine Nachricht ein.', 'Please enter a message.');

			scrollToBottom();

			return;
		}

		errorMessage = '';
		const nextPrompt = prompt.trim();
		const nextImages = pendingImages;
		prompt = '';
		pendingImages = [];
		loading = true;

		messages = [...messages, { role: 'user', content: nextPrompt, images: nextImages }];
		messages = [...messages, { role: 'assistant', content: '', html: '' }];
		const assistantIndex = messages.length - 1;

		try {
			const res = await fetch(
				resolve(`/api/space/${data.collabSpaceId}/${data.collabChatId}`),
				{
					method: 'POST',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify({ prompt: nextPrompt, images: nextImages })
				}
			);

			if (!res.ok || !res.body) {
				throw new Error('Request failed');
			}

			const reader = res.body.getReader();
			const decoder = new TextDecoder('utf-8');
			let done = false;

			scrollToBottom();

			while (!done) {
				const { value, done: streamDone } = await reader.read();
				if (value) {
					appendAssistantChunk(assistantIndex, decoder.decode(value, { stream: true }));
				}

				done = streamDone;
			}


		} catch (err) {
			errorMessage = err instanceof Error ? err.message : 'Request failed';
		} finally {
			loading = false;

			scrollToBottom();

		}
	};
</script>


{#if spaceTitle}
	<h1>{spaceTitle}</h1>
	<p class="space-id">{t('CollabSpace-ID', 'CollabSpace ID')} {data.collabSpaceId} / CollabChat #{data.collabChatId}</p>
{:else}
	<h1>{t('CollabSpace-ID', 'CollabSpace ID')} {data.collabSpaceId} / CollabChat #{data.collabChatId}</h1>
{/if}
<section>
	<p><a href={localize(resolve(`/space/${data.collabSpaceId}`), data.lang)}><i class="fas fa-chevron-circle-left"></i> {t('Zurück zur Übersicht', 'Back to overview')}</a></p>
	{#if data.isAdmin}
	<section class="bg-badge">
		<!-- <div class="card bg-badge"> -->
			<h3>{t('Verwaltung', 'Admin')}</h3>
			<p>{t('Angemeldet bei Verwaltung', 'Logged in as admin')}: <a href={localize(resolve(`/admin/${data.collabSpaceId}`), data.lang)}>{t('Zu den Space-Einstellungen', 'Go to space settings')} <i class="fas fa-wrench"></i></a></p>


			<form method="POST" action="?/toggleHidden">
				{#if data.hidden}
					<button type="submit" name="hiddenAction" value="unhide" class="btn btn-success">
						{t('Für Teilnehmende anzeigen', 'Show to participants')} <i class="fa-regular fa-eye"></i>
					</button>
				{:else}
					<button type="submit" name="hiddenAction" value="hide" class="btn btn-accent">
						{t('Für Teilnehmende verstecken', 'Hide from participants')} <i class="fa-regular fa-eye-slash"></i>
					</button>
				{/if}
			</form>
			{#if form?.message && form?.actionType === 'hidden'}
				<p class={form.success ? 'ok' : 'error'}>{form.message}</p>
			{/if}
			<form method="POST" action="?/deleteChat" class="delete-chat-form">
				{#if confirmDeleteChat}
				<button type="button" class="btn btn-ghost" on:click={() => (confirmDeleteChat = false)}>{t('Abbrechen', 'Cancel')}</button>
				<button type="submit" class="btn btn-danger btn-no-margin">{t('Löschung vormerken', 'Mark for deletion')}</button>
				{:else}
					<button type="button" class="btn btn-danger" on:click={() => (confirmDeleteChat = true)}>
						{t('Chat löschen', 'Delete chat')}
					</button>
				{/if}
			</form>
			{#if form?.message && form?.actionType === 'deleteChat'}
				<p class={form.success ? 'ok' : 'error'}>{form.message}</p>
			{/if}
		<!-- </div> -->
	</section>
	{/if}
	{#if data.question}
		<div class="question"><b>{t('Aufgabe', 'Task')}:</b> {@html renderedQuestion}</div>
	{/if}

	<!-- <section> -->
		<h3>Chat</h3>

		<div class="chat-window" class:empty-chat={messages.length === 0}>
			<!-- <div class="messages"> -->
				{#if messages.length === 0}
					{#if data.canChat}
						<label for="chat-prompt" class="muted empty empty-prompt">{t('Nachricht eingeben, um zu starten.', 'Enter a message to start.')}</label>
					{:else}
						<p class="muted empty">{t('Es ist noch keine Nachricht eingegeben.', 'No messages yet.')}</p>
					{/if}
				{/if}
				{#each messages as message}
					<div class="bubble {message.role}">
						{#if message.role === 'assistant'}
							<div class="bubble-content">{@html message.html}</div>
							<div class="meta">Chatbot</div>
							{:else}
							<div class="bubble-content">
								{#if message.images && message.images.length > 0}
									<div class="bubble-images">
										{#each message.images as image}
											<img src={image} alt={t('Hochgeladenes Bild', 'Uploaded image')} class="bubble-image" />
										{/each}
									</div>
								{/if}
								{message.content}
							</div>
							<div class="meta">{t('Nutzer:in', 'User')}</div>
						{/if}
					</div>
				{/each}
			<!-- </div> -->
			



		{#if data.canChat}
				<div
					class="chat-input"
					class:drag-over={dragOver}
					role="group"
					aria-label={t('Chat-Eingabe', 'Chat input')}
					on:dragover|preventDefault={() => {
						if (data.imageUpload) dragOver = true;
					}}
					on:dragleave={() => (dragOver = false)}
					on:drop|preventDefault={onDrop}
				>
						{#if data.imageUpload}
							<div class="image-actions">
								<input
									type="file"
									accept="image/*"
									multiple
									class="image-file-input"
									bind:this={fileInput}
									on:change={onFileInputChange}
								/>
								<button
									type="button"
									class="btn btn-badge send-button"
									on:click={() => fileInput?.click()}
									disabled={loading}
									aria-label={t('Bild anhängen', 'Attach image')}
									title={t('Bild anhängen (oder per Drag & Drop / Einfügen)', 'Attach image (or via drag & drop / paste)')}
								>
									<i class="far fa-image" aria-hidden="true"></i>
								</button>
							</div>
						{/if}
						<div class="prompt-column">
							{#if data.imageUpload && pendingImages.length > 0}
								<div class="pending-images">
									{#each pendingImages as image, index}
										<div class="pending-image">
											<img src={image} alt={`${t('Bild', 'Image')} ${index + 1} (${t('Vorschau', 'preview')})`} />
											<button
												type="button"
												class="pending-image-remove"
												on:click={() => removePendingImage(index)}
												aria-label={t('Bild entfernen', 'Remove image')}
											>
												<i class="fas fa-times" aria-hidden="true"></i>
											</button>
										</div>
									{/each}
								</div>
							{/if}
							<textarea
								id="chat-prompt"
								bind:value={prompt}
								class={loading ? 'chat-prompt-loading' : ''}
								rows="3"
								placeholder={t('Geben Sie Ihre Nachricht ein...', 'Type your message...')}
								on:paste={onPaste}
								on:keydown={(e) => {
									if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
										e.preventDefault();
										send();
									}
								}}
							></textarea>
						</div>
						<div class="actions">
							<button type="button" class="btn btn-primary send-button" on:click={send} disabled={loading} aria-label={t('Nachricht senden', 'Send message')}>
								<i class={loading ? 'fas fa-spinner fa-spin' : 'far fa-paper-plane'} aria-hidden="true"></i>
							</button>
							<button type="button" class="btn btn-badge send-button" on:click={scrollToBottom} aria-label={t('Zum Chat-Ende springen', 'Jump to end of chat')}>
							<i class="fa fa-arrow-down"></i>
							</button>
						</div>

				</div>
				{#if errorMessage}
				<p class="error-window">
					<span class="error">{errorMessage}</span>
				</p>
				{/if}
			{:else}
				<!-- <div class="chat-input">
					<p class="muted">Nur der/die Ersteller:in dieses Chats kann Nachrichten senden.</p>
				</div> -->
			{/if}
		</div>

	<!-- </section> -->

	{#if data.canChat}
		<div class="card rating-card">
			<h3>{t('Ihre Bewertung', 'Your rating')}</h3>
			<form method="POST" action="?/rate" class="rating-form">
				<div class="stars" role="radiogroup" aria-label={t('Bewertung von 1 bis 5', 'Rating from 1 to 5')}>
					{#each [1, 2, 3, 4, 5] as value}
						<label class="star" class:active={value <= rating}>
							<input type="radio" name="rating" value={value} bind:group={rating} />
							<i aria-hidden="true" class={`fa-star ${value <= rating ? 'fas' : 'far'}`}></i>
						</label>
					{/each}
				</div>
				<label class="rating-comment-label" for="student-comment">{t('Kommentar', 'Comment')}</label>
				<textarea
					id="student-comment"
					name="studentComment"
					class="rating-comment-input"
					rows="3"
					bind:value={studentComment}
					placeholder={t('Optionaler Kommentar zur Bewertung', 'Optional comment on the rating')}
				></textarea>
				<p>{t('Nach Ihrer Bewertung können andere Teilnehmende diesen CollabChat sehen.', 'Once you rate it, other participants can see this CollabChat.')}</p>
				<button type="submit" class="btn">{t('Bewertung speichern', 'Save rating')}</button>
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
				<h3>{t('Bewertung der:des Ersteller:in', 'Rating by the creator')}</h3>
				{#if data.studentRating}
					<div class="stars" aria-label={t('Bewertung', 'Rating')}>
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
					<p class="saved-comment"><b>{t('Kommentar', 'Comment')}:</b> {data.studentComment}</p>
				{/if}
			</div>
		{/if}
	{/if}

	{#if data.isAdmin}
		<div class="card rating-card teacher-rating-card" style="margin-top: 3em;">
			<h3>{t('Lehrenden-Bewertung', 'Teacher rating')}</h3>
			<form method="POST" action="?/rateTeacher" class="rating-form">
				<div class="stars teacher-stars" role="radiogroup" aria-label={t('Lehrenden-Bewertung von 1 bis 5', 'Teacher rating from 1 to 5')}>
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
				<label class="rating-comment-label" for="teacher-comment">{t('Kommentar', 'Comment')}</label>
				<textarea
					id="teacher-comment"
					name="teacherComment"
					class="rating-comment-input"
					rows="3"
					bind:value={teacherComment}
					placeholder={t('Optionaler Kommentar zur Lehrenden-Bewertung', 'Optional comment on the teacher rating')}
				></textarea>
				<button type="submit" class="btn">{t('Lehrenden-Bewertung speichern', 'Save teacher rating')}</button>
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

	.delete-chat-form {
		display: flex;
		flex-wrap: wrap;
		gap: 8px;
		align-items: center;
		margin-top: 1rem;
	}

	.chat-window.empty-chat {
		min-height: 220px;
		height: auto;
	}

	.bubble-images {
		display: flex;
		flex-wrap: wrap;
		gap: 6px;
		margin-bottom: 0.35rem;
	}

	.bubble-image {
		max-width: 100%;
		max-height: 240px;
		border-radius: 8px;
		display: block;
	}

	.prompt-column {
		flex: 1;
		min-width: 0;
		display: flex;
		flex-direction: column;
		gap: 6px;
	}

	.pending-images {
		display: flex;
		flex-wrap: wrap;
		gap: 8px;
		padding: 10px;
		background: white;
		border: 1px solid #cfd6e0;
		border-radius: 6px;
	}

	.pending-image {
		position: relative;
	}

	.pending-image img {
		height: 80px;
		width: auto;
		max-width: 140px;
		object-fit: cover;
		border-radius: 8px;
		border: 1px solid #cfd6e0;
		display: block;
	}

	.pending-image-remove {
		position: absolute;
		top: -8px;
		right: -8px;
		width: 22px;
		height: 22px;
		border-radius: 50%;
		border: none;
		background: #333;
		color: #fff;
		font-size: 0.7rem;
		line-height: 1;
		cursor: pointer;
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 0;
	}

	.pending-image-remove:hover {
		background: #8a1c1c;
	}

	.image-file-input {
		display: none;
	}

	.image-actions {
		display: flex;
		flex-direction: column;
		align-self: center;
	}

	.chat-input.drag-over {
		outline: 2px dashed #1f7ae0;
		outline-offset: 2px;
		border-radius: 8px;
	}

	.empty-prompt {
		font-weight: 200;
		text-align: center;
		margin-top: 1rem;
		margin-bottom: 1rem;
	}

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

	.empty-prompt {
		cursor: pointer;
		font-weight: 400;
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
