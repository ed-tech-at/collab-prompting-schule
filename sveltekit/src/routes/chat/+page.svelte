<script lang="ts">
	import type { ActionData, PageData } from './$types';
	import { resolve } from '$app/paths';

	export let data: PageData;
	export let form: ActionData;
</script>

<h1>CollabChat</h1>

<section>

	{#if form?.message}
		<p class={`notice ${form?.success ? 'success' : 'error'}`}>{form.message}</p>
	{/if}

	<form method="POST" action="?/login" class="login-form">

		<label>
				CollabSpace ID
				<input name="collabSpaceId" type="number" min="1" required />
		</label>

		<label>
			Dein Username
			<input name="username" type="text" required />
		</label>

		<label>
			Teilnahmecode
			<input name="student_pw" type="password" />
		</label>

		<label>
			Benutzerrichtlinie
			<div class="checkbox_wrapper">
				<input name="student_pw" type="checkbox" />
				<span>
					Ich stimme zu, dass meine eingegebenen Daten gemäß den <a href="/datenschutz/" target="_blank">Datenschutzinformationen und Teilnahmebedingungen</a> verarbeitet und für wissenschaftliche Zwecke ausgewertet werden dürfen.
				</span>
			</div>

		</label>

		<button type="submit" class="btn btn-primary">Teilnehmen</button>

	</form>
</section>

	<section class="list">
		<h2>Eingeloggte CollabChats</h2>
		{#if data.loggedInChats.length === 0}
			<p class="muted">Keine eingeloggt CollabChats gefunden.</p>
		{:else}
			<ul>
				{#each data.loggedInChats as chat}
					<li><a href={resolve(`/chat/${chat.id}`)}>CollabSpace ID {chat.id}</a></li>
				{/each}
			</ul>
		{/if}
	</section>
<!-- 
<style>
	.page {
		max-width: 420px;
		margin: 2rem auto;
		display: grid;
		gap: 1rem;
		padding: 1rem;
		border: 1px solid #e3e3e3;
		border-radius: 8px;
		background: #fafafa;
	}

	.login-form {
		display: grid;
		gap: 0.75rem;
	}

	label {
		display: grid;
		gap: 0.35rem;
		font-weight: 600;
	}

	input {
		width: 100%;
		padding: 0.5rem;
		border-radius: 6px;
		border: 1px solid #cfd6e0;
		font-size: 1rem;
	}

	button {
		padding: 0.55rem 0.95rem;
		border-radius: 6px;
		border: 1px solid #1f7ae0;
		background: #1f7ae0;
		color: white;
		font-weight: 600;
		cursor: pointer;
	}

	.notice {
		padding: 0.6rem;
		border-radius: 6px;
	}

	.notice.success {
		background: #e7f6ec;
		color: #1b6b3a;
		border: 1px solid #b7e0c2;
	}

	.notice.error {
		background: #fff0f0;
		color: #8a1c1c;
		border: 1px solid #f2c7c7;
	}

	.list {
		display: grid;
		gap: 0.5rem;
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
		gap: 0.45rem;
	}

	li {
		padding: 0.5rem 0.6rem;
		border: 1px solid #e3e3e3;
		border-radius: 6px;
		background: #fff;
	}

	.muted {
		margin: 0;
		color: #666;
	}
</style> -->
