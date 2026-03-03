<script lang="ts">
	import type { ActionData, PageData } from './$types';
	import { resolve } from '$app/paths';

	export let data: PageData;
	export let form: ActionData;
</script>

<section class="page">
	<h1>Admin für CollabSpace</h1>

	<h2>Bei bestehendem Space Anmelden</h2>
	{#if form?.message}
		<p class={`notice ${form?.success ? 'success' : 'error'}`}>{form.message}</p>
	{/if}

	<form method="POST" action="?/login" class="login-form">
		<label>
			CollabSpace ID
			<input name="collabSpaceId" type="number" min="1" required />
		</label>
		<label>
			Manage Passwort
			<input name="password" type="password" required />
		</label>
		<button type="submit" class="btn btn-accent">Anmelden</button>

	</form>
	oder
	<a class="btn btn-badge" href={resolve("/admin/new")}>Neuen erstellen +</a>
	
</section>

	<section class="list">
		<h2>Eingeloggte Admin Spaces</h2>
		{#if data.loggedInAdminSpaces.length === 0}
			<p class="muted">Keine Anmeldungen für CollabSpaces gefunden.</p>
		{:else}
			<ul>
				{#each data.loggedInAdminSpaces as space}
					<li><a href={resolve(`/admin/${space.id}`)}>Space #{space.id}</a></li>
				{/each}
			</ul>
		{/if}
	</section>

<style>
	/* .page {
		max-width: 420px;
		margin: 2rem auto;
		display: grid;
		gap: 1rem;
		padding: 1rem;
		border: 1px solid #e3e3e3;
		border-radius: 8px;
		background: #fafafa;
	}

	.new-button {
		width: fit-content;
		padding: 0.55rem 0.95rem;
		border-radius: 6px;
		border: 1px solid #1f7ae0;
		background: #1f7ae0;
		color: #fff;
		font-weight: 600;
		text-decoration: none;
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
	} */
</style>
