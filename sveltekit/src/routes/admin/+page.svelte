<script lang="ts">
	import type { ActionData, PageData } from './$types';
	import { resolve } from '$app/paths';
	import { localize, tr } from '$lib/i18n';

	export let data: PageData;
	export let form: ActionData;
	$: t = tr(data.lang);
	$: href = (path: string) => localize(path, data.lang);

	const spaceTitle = (space: { title: string | null }) => space.title?.trim() ?? '';
</script>

<section class="page">
	<h1>{t('Verwaltung für CollabSpace', 'CollabSpace admin')}</h1>

	<h2>{t('Bei bestehendem Space anmelden', 'Log in to an existing space')}</h2>
	{#if form?.message}
		<p class={`notice ${form?.success ? 'success' : 'error'}`}>{form.message}</p>
	{/if}

	<form method="POST" action="?/login" class="login-form">
		<label>
			{t('CollabSpace-ID', 'CollabSpace ID')}<span class="label-required">*</span>
			<input name="collabSpaceId" type="number" min="1" required />
		</label>
		<label>
			{t('Verwaltungspasswort', 'Admin password')}<span class="label-required">*</span>
			<input name="password" type="password" required />
		</label>
		<button type="submit" class="btn btn-primary">{t('Verwaltung öffnen', 'Open admin')} <i class="fas fa-wrench"></i></button>

	</form>
	{t('oder', 'or')}
	<a class="btn btn-badge" href={href(resolve("/admin/new"))}>{t('Neuen erstellen', 'Create new')} +</a>
	
</section>

	<section class="list">
		<h2>{t('Verwaltung geöffnet für CollabSpaces', 'Admin sessions open for CollabSpaces')}</h2>
		{#if data.loggedInAdminSpaces.length === 0}
			<p class="muted">{t('Keine Anmeldungen für CollabSpaces gefunden.', 'No CollabSpace logins found.')}</p>
		{:else}
			<ul>
				{#each data.loggedInAdminSpaces as space}
					<li>
						<a href={href(resolve(`/admin/${space.id}`))}>
							{t('Verwaltung: CollabSpace-ID', 'Admin: CollabSpace ID')} {space.id}
							{#if spaceTitle(space)}
								<span class="muted">- {spaceTitle(space)}</span>
							{/if}
						</a>
					</li>
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
