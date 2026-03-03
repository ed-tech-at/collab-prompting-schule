<script lang="ts">
	import type { PageData } from './$types';
	import { resolve } from '$app/paths';

	export let data: PageData;
	let showSettings = false;
	let overwriteApiKey = false;

	let collabSpace = {
		id: data.collabSpace.id,
		base_url: data.collabSpace.base_url ?? '',
		api_key: data.collabSpace.api_key ?? '',
		model: data.collabSpace.model ?? '',
		password: data.collabSpace.password,
		student_pw: data.collabSpace.student_pw ?? '',
		cryptVersion: data.collabSpace.cryptVersion,
		question: data.collabSpace.question ?? '',
		system_prompt: data.collabSpace.system_prompt ?? '',
		createdAt: new Date(data.collabSpace.createdAt).toISOString().slice(0, 16),
		collabChatsCount: data.collabSpace.collabChatsCount
	};
</script>

<section class="page">
	<h1>CollabSpace ID {data.collabSpace.id}</h1>
	<button type="button" on:click={() => (showSettings = !showSettings)}>
		{showSettings ? 'Einstellungen ausblenden' : 'Einstellungen anzeigen'}
	</button>
	<form method="POST" class="settings-form" hidden={!showSettings}>
		<table>
			<tbody>
				<tr>
					<th>id</th>
					<td><input name="id" type="number" bind:value={collabSpace.id} /></td>
				</tr>
				<tr>
					<th>base_url</th>
					<td><input name="base_url" bind:value={collabSpace.base_url} /></td>
				</tr>
				<tr>
					<th>api_key</th>
					<td>
						<label class="api-key-toggle">
							<input type="checkbox" name="overwrite_api_key" bind:checked={overwriteApiKey} />
							api_key überschreiben
						</label>
						<input
							name="api_key"
							bind:value={collabSpace.api_key}
							disabled={!overwriteApiKey}
							readonly={!overwriteApiKey}
						/>
					</td>
				</tr>
				<tr>
					<th>model</th>
					<td><input name="model" bind:value={collabSpace.model} /></td>
				</tr>
				<tr>
					<th>password</th>
					<td><input name="password" bind:value={collabSpace.password} /></td>
				</tr>
				<tr>
					<th>student_pw</th>
					<td><input name="student_pw" bind:value={collabSpace.student_pw} /></td>
				</tr>
				<tr>
					<th>cryptVersion</th>
					<td>
						<input name="cryptVersion" type="number" bind:value={collabSpace.cryptVersion} readonly />
					</td>
				</tr>
				<tr>
					<th>question</th>
					<td><textarea name="question" rows="3" bind:value={collabSpace.question}></textarea></td>
				</tr>
				<tr>
					<th>system_prompt</th>
					<td><textarea name="system_prompt" rows="5" bind:value={collabSpace.system_prompt}></textarea></td>
				</tr>
				<tr>
					<th>createdAt</th>
					<td>
						<input name="createdAt" type="datetime-local" bind:value={collabSpace.createdAt} readonly />
					</td>
				</tr>
				<tr>
					<th>collabChats</th>
					<td>
						<input name="collabChatsCount" type="number" bind:value={collabSpace.collabChatsCount} readonly />
					</td>
				</tr>
			</tbody>
		</table>
		<button type="submit">Save</button>
	</form>

	<section class="list">
		<h2>Bestehende Konversationen</h2>
		{#if data.conversations.length === 0}
			<p class="muted">Noch keine Konversation vorhanden.</p>
		{:else}
			<ul>
				{#each data.conversations as conversation}
					<li>
						<a href={resolve(`/space/${data.collabSpace.id}/chat/${conversation.id}`)}>
							Chat #{conversation.id}
						</a>
						<span class="meta">
							{new Date(conversation.createdAt).toLocaleString()}
							{#if conversation.student_rating}
								· Student:in {conversation.student_rating}/5
							{/if}
							{#if conversation.teacher_rating}
								· Lehrender: {conversation.teacher_rating}/5
							{/if}
						</span>
					</li>
				{/each}
			</ul>
		{/if}
	</section>
</section>

<style>
	.page {
		max-width: 820px;
		margin: 2rem auto;
		display: grid;
		gap: 1rem;
		padding: 1rem;
		border: 1px solid #e3e3e3;
		border-radius: 8px;
		background: #fafafa;
	}

	table {
		width: 100%;
		border-collapse: collapse;
	}

	form {
		display: grid;
		gap: 0.75rem;
	}

	.settings-form[hidden] {
		display: none;
	}

	th,
	td {
		border-bottom: 1px solid #e3e3e3;
		padding: 0.6rem 0.5rem;
		text-align: left;
		vertical-align: top;
	}

	th {
		width: 180px;
		font-weight: 600;
		color: #333;
	}

	td {
		word-break: break-word;
	}

	input,
	textarea {
		width: 100%;
		padding: 0.45rem 0.5rem;
		border-radius: 6px;
		border: 1px solid #cfd6e0;
		font-size: 0.95rem;
		font-family: inherit;
	}

	input[readonly],
	textarea[readonly] {
		background: #eceff3;
		color: #555;
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

	input:disabled {
		background: #eceff3;
		color: #555;
		cursor: not-allowed;
	}

	button {
		padding: 0.55rem 0.95rem;
		border-radius: 6px;
		border: 1px solid #1f7ae0;
		background: #1f7ae0;
		color: white;
		font-weight: 600;
		cursor: pointer;
		width: fit-content;
	}

	.list {
		display: grid;
		gap: 0.6rem;
	}

	.list h2 {
		margin: 0;
		font-size: 1rem;
	}

	ul {
		list-style: none;
		margin: 0;
		padding: 0;
		display: grid;
		gap: 0.5rem;
	}

	li {
		display: flex;
		gap: 0.5rem;
		align-items: baseline;
		padding: 0.5rem 0.6rem;
		border: 1px solid #e3e3e3;
		border-radius: 6px;
		background: #fff;
	}

	.meta {
		color: #666;
		font-size: 0.9rem;
	}

	.muted {
		color: #666;
		margin: 0;
	}
</style>
