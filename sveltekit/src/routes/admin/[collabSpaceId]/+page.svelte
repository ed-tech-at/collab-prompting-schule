<script lang="ts">
	import type { PageData } from './$types';
	import { resolve } from '$app/paths';

	export let data: PageData;
	let showSettings = false;
	let overwriteApiKey = false;
	const normalizeRating = (rating: string | null | undefined) => {
		const value = Number(rating);
		if (!Number.isInteger(value) || value < 1 || value > 5) return 0;
		return value;
	};

	let collabSpace = {
		id: data.collabSpace.id,
		base_url: data.collabSpace.base_url ?? '',
		api_key: data.collabSpace.api_key ?? '',
		model: data.collabSpace.model ?? '',
		password: data.collabSpace.password,
		student_pw: data.collabSpace.student_pw ?? '',
		cryptVersion: data.collabSpace.cryptVersion,
		mathRender: data.collabSpace.mathRender,
		question: data.collabSpace.question ?? '',
		system_prompt: data.collabSpace.system_prompt ?? '',
		createdAt: new Date(data.collabSpace.createdAt).toISOString().slice(0, 16),
		collabChatsCount: data.collabSpace.collabChatsCount,
		manageEmail: data.collabSpace.manageEmail
	};
</script>


<section class="bg-badge">
	<h1>CollabSpace ID {data.collabSpace.id} / Verwaltung</h1>
	<button type="button" class="btn btn-ghost" on:click={() => (showSettings = !showSettings)}>
		{showSettings ? 'Einstellungen ausblenden' : 'Einstellungen anzeigen'}
	</button>
	<form method="POST" class="settings-form" hidden={!showSettings}>
		<table>
			<tbody>
				<tr>
					<th>CollabSapce ID</th>
					<td><input name="id" type="number" bind:value={collabSpace.id} readonly /></td>
				</tr>
				<tr>
					<th>Manage Passwort</th>
					<td><input name="password" type="text" bind:value={collabSpace.password} /></td>
				</tr>
				<tr>
					<th>E-Mail Adresse</th>
					<td><input name="manageEmail" type="email" bind:value={collabSpace.manageEmail}/></td>
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
					<th>LLM Model</th>
					<td><input name="model" type="text" bind:value={collabSpace.model} /></td>
				</tr>

				<tr>
					<th>KI Systemprompt</th>
					<td>
						<textarea name="system_prompt" rows="5" bind:value={collabSpace.system_prompt}></textarea>
						<label class="math-render-toggle">
							<input type="checkbox" name="mathRender" bind:checked={collabSpace.mathRender} />
							Math rendering aktivieren (<a href="https://katex.org/" target="_blank">KaTeX <i class="fas fa-external-link-alt" aria-hidden="true" style="font-size: 0.8em;"></i></a>)
						</label>
						{#if collabSpace.mathRender}
							<p class="system-prompt-note">
								When writing mathematical formulas, always use valid LaTeX delimiters. Use $$...$$ for display math on separate lines and $...$ for inline math. Do not use \\(...\\), \\[...\\], plain parentheses, or plain brackets as math delimiters. (this is automatically appended)
							</p>
						{/if}
					</td>
				</tr>
			
				<tr>
					<th>Aufgabe (optional, HTML-Darstellung)</th>
					<td><textarea name="question" rows="3" bind:value={collabSpace.question}></textarea></td>
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
</section>

<section>
	<h3>Bestehende Konversationen</h3>
	{#if data.conversations.length === 0}
		<p class="muted">Noch keine Konversation vorhanden.</p>
	{:else}
		<div class="chat-list">
			{#each data.conversations as conversation}
				<a href={resolve(`/space/${data.collabSpace.id}/chat/${conversation.id}`)} class:hidden-chat={conversation.hidden}>
					<div class="chat-card-head">
						<span class="number">#{conversation.id}</span>
						{#if conversation.username}
							<span class="chat-username">von {conversation.username}</span>
						{/if}
						{#if conversation.hidden}
							<span class="hidden-tag">[versteckt]</span>
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
								<span class="rating-label">Lehrender</span>
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
			{/each}
		</div>
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

	.settings-form[hidden] {
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

	input[readonly],
	textarea[readonly] {
		background: #f3f6f8;
		color: var(--muted);
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

	.chat-list a.hidden-chat {
		border-color: rgba(178, 58, 58, 0.25);
		background: linear-gradient(180deg, rgba(178, 58, 58, 0.05) 0%, rgba(178, 58, 58, 0.02) 100%);
	}

	.meta {
		margin: 0;
		font-size: 13px;
	}

	.muted {
		margin: 0;
	}
</style>
