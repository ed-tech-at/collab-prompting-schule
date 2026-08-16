<script lang="ts">
	import { browser } from '$app/environment';
	import { onMount } from 'svelte';
	import QRCode from 'qrcode';
	import type { ActionData, PageData } from './$types';
	import { resolve } from '$app/paths';
	import { LATEX_DELIMITER_SYSTEM_PROMPT } from '$lib/markdown';

	export let data: PageData;
	export let form: ActionData;
	let showSettings = false;
	let overwriteApiKey = false;
	let confirmDeleteSpace = false;
	let confirmDeleteChatId: number | null = null;
	let qrCodeDataUrl = '';
	let copyStatus = '';
	const nl2br = (value: string) => value.replace(/\n/g, '<br>');
	const mathSystemPromptNote = `${LATEX_DELIMITER_SYSTEM_PROMPT} (wird automatisch an den KI-Systemprompt angefügt)`;
	const normalizeRating = (rating: string | null | undefined) => {
		const value = Number(rating);
		if (!Number.isInteger(value) || value < 1 || value > 5) return 0;
		return value;
	};
	const participationPath = resolve(`/space/${data.collabSpace.id}`);
	const participationLink = browser
		? new URL(participationPath, window.location.href).toString().replace(/^http:/, 'https:')
		: participationPath;

	let collabSpace = {
		id: data.collabSpace.id,
		title: data.collabSpace.title ?? '',
		base_url: data.collabSpace.base_url ?? '',
		api_key: data.collabSpace.api_key ?? '',
		model: data.collabSpace.model ?? '',
		password: data.collabSpace.password,
		student_pw: data.collabSpace.student_pw ?? '',
		cryptVersion: data.collabSpace.cryptVersion,
		mathRender: data.collabSpace.mathRender,
		imageUpload: data.collabSpace.imageUpload,
		question: data.collabSpace.question ?? '',
		system_prompt: data.collabSpace.system_prompt ?? '',
		createdAt: new Date(data.collabSpace.createdAt).toISOString().slice(0, 16),
		collabChatsCount: data.collabSpace.collabChatsCount,
		manageEmail: data.collabSpace.manageEmail
	};

	$: spaceTitle = collabSpace.title.trim();
	$: spaceLabel = spaceTitle
		? `CollabSpace-ID ${collabSpace.id}: ${spaceTitle}`
		: `CollabSpace-ID ${collabSpace.id}`;

	onMount(async () => {
		qrCodeDataUrl = await QRCode.toDataURL(participationLink, {
			margin: 1,
			width: 180,
			errorCorrectionLevel: 'M'
		});
	});

	const copyParticipationLink = async () => {
		await navigator.clipboard.writeText(participationLink);
		copyStatus = 'Link kopiert.';
		setTimeout(() => {
			copyStatus = '';
		}, 1800);
	};

	const conversationOwnerLabel = (username: string | null) => username?.trim() || 'ohne Anzeigename';
</script>


<section class="bg-badge">
	<h1>CollabSpace-ID {data.collabSpace.id} / Verwaltung</h1>
	{#if spaceTitle}
		<p class="space-title">Titel: {spaceTitle}</p>
	{/if}
	<p class="notice success">Merken Sie sich die CollabSpace-ID {data.collabSpace.id} und das Verwaltungspasswort. Beides benötigen Sie, um diesen Space später wieder zu verwalten.</p>

	<label>
		Teilnahmelink:
		<input type="text" value={participationLink} readonly />
	</label>
	<div class="link-actions">
		<a class="btn btn-primary" href={participationLink} target="_blank" rel="noreferrer">
			Space öffnen <i class="fas fa-external-link-alt"></i>
		</a>
		<button type="button" class="btn btn-ghost" on:click={copyParticipationLink}>
			Link kopieren <i class="fas fa-copy"></i>
		</button>
		{#if copyStatus}
			<span class="ok">{copyStatus}</span>
		{/if}
	</div>
	{#if qrCodeDataUrl}
		<div class="qr-code">
			<img src={qrCodeDataUrl} alt={`QR-Code für ${spaceLabel}`} />
		</div>
	{/if}

	<p><button type="button" class="btn btn-ghost" on:click={() => (showSettings = !showSettings)}>
		{#if showSettings}
			Einstellungen ausblenden
		{:else}
			Vertrauliche Einstellungen anzeigen <i class="fa-solid fa-key"></i>
		{/if}
	</button>
	</p>
	<div class="settings-panel" hidden={!showSettings}>
		<form method="POST" action="?/saveSettings" class="settings-form">
			<table>
				<tbody>
					<tr>
						<th>CollabSpace-ID</th>
						<td><input name="id" type="number" bind:value={collabSpace.id} readonly /></td>
					</tr>
					<tr>
						<th>Titel</th>
						<td>
							<input name="title" type="text" bind:value={collabSpace.title} placeholder={`CollabSpace-ID ${collabSpace.id}`} />
							<p class="field-help">Optional. Die CollabSpace-ID wird immer zusätzlich angezeigt.</p>
						</td>
					</tr>
					<tr>
						<th>Verwaltungspasswort</th>
						<td><input name="password" type="text" bind:value={collabSpace.password} /></td>
					</tr>
					<tr>
						<th>E-Mail-Adresse</th>
						<td>
							<input name="manageEmail" type="email" bind:value={collabSpace.manageEmail}/>
							<p class="field-help">Wird für Benachrichtigungen und Meldungen zum CollabSpace verwendet. Dadurch wird kein Account erstellt.</p>
						</td>
					</tr>
					<tr>
						<th>LLM base_url</th>
						<td><input name="base_url" type="text" bind:value={collabSpace.base_url} placeholder="https://flaait.tugraz.at/llmduckt/llmapi/v1/" /></td>
					</tr>
					<tr>
						<th>LLM API Key</th>
						<td>
							<label class="api-key-toggle">
								<input type="checkbox" name="overwrite_api_key" bind:checked={overwriteApiKey} />
								LLM API Key überschreiben
							</label>
							<input
								name="api_key"
								 type="text"
								bind:value={collabSpace.api_key}
								disabled={!overwriteApiKey}
								readonly={!overwriteApiKey}
							/>
						</td>
					</tr>
					<tr>
						<th>LLM-Modell</th>
						<td><input name="model" type="text" bind:value={collabSpace.model} /></td>
					</tr>

					<tr>
						<th>KI-Systemprompt</th>
						<td>
							<textarea name="system_prompt" rows="5" bind:value={collabSpace.system_prompt}></textarea>
						</td>
					</tr>
				
					<tr>
						<th>Aufgabe (optional, HTML-Darstellung)</th>
						<td>
							<textarea name="question" rows="3" bind:value={collabSpace.question}></textarea>
							<label class="math-render-toggle">
								<input type="checkbox" name="mathRender" bind:checked={collabSpace.mathRender} />
								Mathematik-Rendering aktivieren (<a href="https://katex.org/" target="_blank">KaTeX <i class="fas fa-external-link-alt" aria-hidden="true" style="font-size: 0.8em;"></i></a>)
							</label>
							{#if collabSpace.mathRender}
								<p class="system-prompt-note">Folgender Text wird automatisch an den KI-Systemprompt angefügt:</p>
								<pre class="system-prompt-note" style="color: var(--primary-hover);">{@html nl2br(mathSystemPromptNote)}</pre>
							{/if}
						</td>
					</tr>

					<tr>
						<th>Bild-Upload</th>
						<td>
							<label class="math-render-toggle">
								<input type="checkbox" name="imageUpload" bind:checked={collabSpace.imageUpload} />
								Bild-Upload für Teilnehmende erlauben
							</label>
							{#if collabSpace.imageUpload}
								<p class="field-help">Das gewählte LLM-Modell muss Bildeingaben (Vision) unterstützen, sonst schlagen Nachrichten mit Bildern fehl.</p>
							{/if}
						</td>
					</tr>

					<tr>
						<th>Teilnahmecode für den Beitritt</th>
						<td><input name="student_pw" type="text" bind:value={collabSpace.student_pw} /></td>
					</tr>
					
					
				
					<tr>
						<th>Erstellt am</th>
						<td>
							<input name="createdAt" type="datetime-local" bind:value={collabSpace.createdAt} readonly />
						</td>
					</tr>
					<tr>
						<th>Anzahl an collabChats</th>
						<td>
							<input name="collabChatsCount" type="number" bind:value={collabSpace.collabChatsCount} readonly />
						</td>
					</tr>
				</tbody>
			</table>
			<button type="submit" class="btn btn-primary">Speichern</button>
		</form>

		<div class="danger-zone">
			<h3>CollabSpace löschen</h3>
			<p>Der CollabSpace wird zur Löschung vorgemerkt und verschwindet sofort aus normalen Ansichten.</p>
			<form method="POST" action="?/deleteSpace">
				{#if confirmDeleteSpace}
				<button type="button" class="btn btn-ghost" on:click={() => (confirmDeleteSpace = false)}>Abbrechen</button>
					<button type="submit" class="btn btn-danger btn-no-margin">Löschung vormerken</button>
				{:else}
					<button type="button" class="btn btn-danger" on:click={() => (confirmDeleteSpace = true)}>
						CollabSpace löschen
					</button>
				{/if}
			</form>
			{#if form?.message && form?.actionType === 'deleteSpace'}
				<p class={`notice ${form?.success ? 'success' : 'error'}`}>{form.message}</p>
			{/if}
		</div>

		<div class="export-zone">
			<h3>JSON-Export</h3>
			<p>Enthält die Einstellungen, Chats und Nachrichten dieses CollabSpace inklusive vorgemerkter Löschungen. API-Key sowie Verwaltungs- und Teilnahmepasswort sind nicht enthalten.</p>
			<a class="btn btn-ghost" href={resolve(`/admin/${data.collabSpace.id}/export`)}>
				JSON-Export <i class="fas fa-download"></i>
			</a>
		</div>
	</div>
</section>
<section>
	<h3>Bestehende Konversationen</h3>
	{#if data.conversations.length === 0}
		<p class="muted">Noch keine Konversation vorhanden.</p>
	{:else}
		<div class="chat-list">
			{#each data.conversations as conversation}
				<div class="chat-card" class:hidden-chat={conversation.hidden}>
					<a href={resolve(`/space/${data.collabSpace.id}/chat/${conversation.id}`)}>
						<div class="chat-card-head">
							<span class="number">#{conversation.id}</span>
							<span class="chat-username">von {conversationOwnerLabel(conversation.username)}</span>
							{#if conversation.hidden}
								<span class="hidden-tag">versteckt</span>
							{/if}
						</div>
						<div class="chat-rating-block">
							<p class="meta">{new Date(conversation.createdAt).toLocaleString()}</p>
							{#if conversation.student_rating || conversation.student_comment}
								<div class="chat-rating-line">
									<span class="rating-label">Ersteller:in</span>
									{#if conversation.student_rating}
										<span class="rating-stars-list" aria-label={`Bewertung ${conversation.student_rating} von 5`}>
											{#each [1, 2, 3, 4, 5] as star}
												<i class={`fa-star ${star <= normalizeRating(conversation.student_rating) ? 'fas active' : 'far'}`}></i>
											{/each}
										</span>
										<span>{conversation.student_rating}/5</span>
									{/if}
									{#if conversation.student_comment}
										<p class="chat-comment"><i>Kommentar:</i> {conversation.student_comment}</p>
									{/if}
								</div>
							{/if}
							{#if conversation.teacher_rating || conversation.teacher_comment}
								<div class="chat-rating-line">
									<span class="rating-label">Lehrende:r</span>
									{#if conversation.teacher_rating}
										<span class="rating-stars-list" aria-label={`Bewertung ${conversation.teacher_rating} von 5`}>
											{#each [1, 2, 3, 4, 5] as star}
												<i class={`fa-star ${star <= normalizeRating(conversation.teacher_rating) ? 'fas active' : 'far'}`}></i>
											{/each}
										</span>
										<span>{conversation.teacher_rating}/5</span>
									{/if}
									{#if conversation.teacher_comment}
										<p class="chat-comment"><i>Kommentar:</i> {conversation.teacher_comment}</p>
									{/if}
								</div>
							{/if}
						</div>
					</a>
					<form method="POST" action="?/deleteChat" class="chat-delete-form">
						<input type="hidden" name="collabChatId" value={conversation.id} />
						<!-- {#if confirmDeleteChatId === conversation.id}
							<button type="submit" class="btn btn-danger">Löschung vormerken</button>
							<button type="button" class="btn btn-ghost" on:click={() => (confirmDeleteChatId = null)}>Abbrechen</button>
						{:else}
							<button type="button" class="btn btn-danger" on:click={() => (confirmDeleteChatId = conversation.id)}>
								Chat löschen
							</button>
						{/if} -->
					</form>
				</div>
			{/each}
		</div>
	{/if}
	{#if form?.message && form?.actionType === 'deleteChat'}
		<p class={`notice ${form?.success ? 'success' : 'error'}`}>{form.message}</p>
	{/if}
</section>

<style>
	.page {
		display: grid;
		gap: 1rem;
	}

	table {
		width: 100%;
		border-collapse: collapse;
		border: 1px solid var(--border);
		border: none;
		border-radius: 12px;
		overflow: hidden;
		background: #fff;
	}

	.settings-form {
		display: grid;
		gap: 0.75rem;
	}

	.settings-panel {
		display: grid;
		gap: 1rem;
	}

	.settings-panel[hidden] {
		display: none;
	}

	th,
	td {
		border-bottom: 1px solid var(--border);
		padding: 0.6rem 0.5rem;
		text-align: left;
		vertical-align: top;
	}

	th {
		width: 180px;
		font-weight: 600;
		color: var(--text);
		background: rgba(31, 111, 120, 0.04);
	}

	td {
		word-break: break-word;
	}

	input,
	textarea {
		font-size: 14px;
	}

	.link-actions {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: 10px;
		margin-bottom: 1rem;
	}

	.qr-code {
		width: fit-content;
		padding: 10px;
		border: 1px solid var(--border);
		border-radius: 12px;
		background: #fff;
		margin-bottom: 1rem;
	}

	.qr-code img {
		display: block;
		width: 180px;
		height: 180px;
	}

	.field-help {
		margin: 0.35rem 0 0;
		font-size: 13px;
		color: var(--muted);
		font-weight: 400;
	}

	.danger-zone {
		border: 2px solid rgba(178, 58, 58, 0.35);
		border-radius: 12px;
		padding: 1rem;
		background: rgba(178, 58, 58, 0.04);
	}

	.export-zone {
		border: 1px solid var(--border);
		border-radius: 12px;
		padding: 1rem;
		background: #fff;
	}

	.export-zone h3,
	.export-zone p {
		margin-top: 0;
	}

	.export-zone p {
		color: var(--muted);
	}

	.danger-zone form,
	.chat-delete-form {
		display: flex;
		flex-wrap: wrap;
		gap: 8px;
		align-items: center;
	}

	

	.api-key-toggle {
		display: inline-flex;
		gap: 0.4rem;
		align-items: center;
		margin-bottom: 0.45rem;
		font-weight: 600;
	}

	.api-key-toggle input[type='checkbox'] {
		width: auto;
	}

	.math-render-toggle {
		display: inline-flex;
		gap: 0.4rem;
		align-items: center;
		margin-top: 0.65rem;
		font-weight: 600;
		margin-bottom: 0;
	}

	.math-render-toggle input[type='checkbox'] {
		width: auto;
	}

	.system-prompt-note {
		margin: 0.6rem 0 0;
		font-size: 13px;
		line-height: 1.45;
		color: var(--muted);
	}

	input:disabled {
		background: #f3f6f8;
		color: var(--muted);
		cursor: not-allowed;
	}

	.number {
		font-weight: 700;
	}

	.hidden-tag {
		font-size: 13px;
		font-weight: 700;
		color: var(--danger);
		background: rgba(178, 58, 58, 0.1);
		border: 1px solid rgba(178, 58, 58, 0.25);
		border-radius: 999px;
		padding: 2px 8px;
	}

	.chat-list .chat-card {
		width: 100%;
		display: grid;
		gap: 8px;
	}

	.chat-list .chat-card.hidden-chat > a {
		border-color: rgba(178, 58, 58, 0.25);
		background: linear-gradient(180deg, rgba(178, 58, 58, 0.05) 0%, rgba(178, 58, 58, 0.02) 100%);
	}

	.chat-delete-form {
		justify-content: flex-end;
		margin: 0;
	}

	.meta {
		margin: 0;
		font-size: 13px;
	}

	.muted {
		margin: 0;
	}
</style>
