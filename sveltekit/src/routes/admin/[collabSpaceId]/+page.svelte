<script lang="ts">
	import type { ActionData, PageData } from './$types';
	import { tr } from '$lib/i18n';
	import AdminView from './AdminView.svelte';

	export let data: PageData;
	export let form: ActionData;
	$: t = tr(data.lang);
	$: loginMessage = (form?.message as string | undefined) ?? (data.requiresLogin ? data.loginMessage : null);
</script>

{#if data.requiresLogin}
	<section class="page">
		<h1>{t('CollabSpace-ID', 'CollabSpace ID')} {data.collabSpaceId} / {t('Verwaltung', 'Admin')}</h1>
		{#if data.title?.trim()}
			<p class="space-title">{t('Titel', 'Title')}: {data.title.trim()}</p>
		{/if}
		{#if loginMessage}
			<p class="notice error">{loginMessage}</p>
		{/if}

		<form method="POST" action="?/login" class="login-form">
			<label>
				{t('Verwaltungspasswort', 'Admin password')}<span class="label-required">*</span>
				<!-- svelte-ignore a11y_autofocus -->
				<input name="password" type="password" required autofocus />
			</label>
			<button type="submit" class="btn btn-primary">{t('Verwaltung öffnen', 'Open admin')} <i class="fas fa-wrench"></i></button>
		</form>
	</section>
{:else}
	<AdminView {data} {form} />
{/if}
