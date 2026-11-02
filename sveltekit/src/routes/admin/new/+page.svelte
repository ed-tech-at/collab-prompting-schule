<script lang="ts">
	import type { ActionData, PageData } from './$types';
	import { resolve } from '$app/paths';
	import { localize, tr } from '$lib/i18n';

	export let data: PageData;
	export let form: ActionData;
	$: t = tr(data.lang);

	let showEnvImport = false;
	let envText = '';
	let baseUrl = 'https://api.openai.com/v1/';
	let apiKey = '';
	let model = '';

	const parseEnv = () => {
		const map = new Map<string, string>();
		for (const rawLine of envText.split(/\r?\n/)) {
			const line = rawLine.trim();
			if (!line || line.startsWith('#')) continue;
			const eqIdx = line.indexOf('=');
			if (eqIdx === -1) continue;
			const key = line.slice(0, eqIdx).trim();
			let value = line.slice(eqIdx + 1).trim();
			if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
				value = value.slice(1, -1);
			}
			map.set(key, value);
		}
		if (map.has('OPENAI_BASE_URL')) baseUrl = map.get('OPENAI_BASE_URL') ?? baseUrl;
		if (map.has('OPENAI_API_KEY')) apiKey = map.get('OPENAI_API_KEY') ?? apiKey;
		if (map.has('OPENAI_MODEL')) model = map.get('OPENAI_MODEL') ?? model;
		showEnvImport = false;
	};
</script>

<section class="page">
	<h1>{t('Neuen CollabSpace erstellen', 'Create a new CollabSpace')}</h1>

	{#if form?.message}
		<p class={`notice ${form?.success ? 'success' : 'error'}`}>{form.message}</p>
	{/if}

	<form method="POST" class="create-form">
		<h2>{t('Verwaltung', 'Administration')}</h2>
		<label>
			{t('Titel des CollabSpace', 'CollabSpace title')}
			<div class="muted" style="font-weight: 400;">{t('Optional. Die CollabSpace-ID wird immer zusätzlich angezeigt.', 'Optional. The CollabSpace ID is always shown as well.')}</div>
			<input name="title" type="text" />
		</label>
		<label>
			{t('Verwaltungspasswort', 'Admin password')}<sup class="label-required">*</sup>
			<div class="muted" style="font-weight: 400;">{t('Dieses Passwort ist nur für Lehrende zur späteren Verwaltung dieses CollabSpace.', 'This password is only for teachers, to manage this CollabSpace later.')}</div>
			<input name="password" type="text" required />
		</label>
		
		<label>
			{t('E-Mail-Adresse', 'Email address')}<sup class="label-required">*</sup>
			<div class="muted" style="font-weight: 400;">{t('Die Adresse wird für Benachrichtigungen und Meldungen zum CollabSpace verwendet. Dadurch wird kein Account erstellt.', 'The address is used for notifications and reports about the CollabSpace. No account is created.')}</div>
			<input name="manageEmail" type="email" required />
		</label>

		<h2>
			{t('KI-Schnittstelle', 'AI interface')}
			{#if !showEnvImport}
				<button type="button" class="btn btn-ghost" on:click={() => (showEnvImport = !showEnvImport)}>
					{t('.env importieren', 'Import .env')}
				</button>
			{/if}

		</h2>
		{#if showEnvImport}
			<label>
				{t('.env für Import', '.env to import')}
				<textarea
					rows="3"
					placeholder={`OPENAI_API_KEY=YOUR_API_KEY_HERE\nOPENAI_BASE_URL=https://flaait.tugraz.at/llmduckt/llmapi/v1/\nOPENAI_MODEL=ministral-3:14b`}
					bind:value={envText}
				></textarea>
				
				<button type="button" class="btn btn-ghost" on:click={parseEnv}>{t('Felder importieren', 'Import fields')}</button>
			</label>
		{/if}
		
		<label>
			LLM base_url<sup class="label-required">*</sup> 
			<div class="muted" style="font-weight: 400;">{t('Kompatibel zur', 'Compatible with the')} <a href="https://platform.openai.com/docs/api-reference/chat" target="_blank">OpenAI Chat Completions API (v1)</a>.</div>
			<input name="base_url" type="text" placeholder="https://flaait.tugraz.at/llmduckt/llmapi/v1/" bind:value={baseUrl} required />
		</label>
		<label>
			LLM API Key<sup class="label-required">*</sup>
			<input name="api_key" type="text" bind:value={apiKey} required/>
		</label>
		<label>
			{t('LLM-Modell', 'LLM model')}<sup class="label-required">*</sup>
			<input name="model"  type="text" bind:value={model} required />
		</label>
		<label>
			{t('KI-Systemprompt', 'AI system prompt')}<sup class="label-required">*</sup>
			<textarea name="system_prompt" rows="5" placeholder={t('Du bist ein hilfreicher Assistent.', 'You are a helpful assistant.')} required >{t('Du bist ein hilfreicher Assistent. Antworte auf Deutsch.', 'You are a helpful assistant. Answer in English.')}</textarea>
		</label>
		
		<h2>{t('Teilnehmer:innen', 'Participants')}</h2>
		
		<label>
			{t('Teilnahmecode für den Beitritt', 'Participation code for joining')}<sup class="label-required">*</sup>
			<div class="muted" style="font-weight: 400;">{t('Diesen Code geben Teilnehmende ein. Er ist nicht das Verwaltungspasswort.', 'Participants enter this code. It is not the admin password.')}</div>
			<input name="student_pw" type="text" required/>
		</label>
		
		<label>
			{t('Aufgabe (optional, HTML-Darstellung)', 'Task (optional, rendered as HTML)')}
			<textarea name="question" rows="3"></textarea>
			
			<label class="math-render-toggle checkbox_wrapper">
				<input type="checkbox" name="mathRender" />
				{t('Mathematik-Rendering aktivieren', 'Enable math rendering')} (<a href="https://katex.org/" target="_blank">KaTeX <i class="fas fa-external-link-alt" aria-hidden="true" style="font-size: 0.8em;"></i></a>)
			</label>

			<label class="math-render-toggle checkbox_wrapper">
				<input type="checkbox" name="imageUpload" />
				{t('Bild-Upload für Teilnehmende erlauben (LLM-Modell muss Bildeingaben unterstützen)', 'Allow image upload for participants (the LLM model must support image input)')}
			</label>

		</label>

		<label>
			{t('Benutzerrichtlinie', 'User policy')}<span class="label-required">*</span>
			<div class="checkbox_wrapper">
				<input name="accepted_guidelines" type="checkbox" required />
				<span>
					{#if data.lang === 'en'}
						I agree that the data I enter may be processed in accordance with the <a href={localize(resolve('/datenschutz'), data.lang)} target="_blank">privacy information and terms of participation</a> and evaluated for scientific purposes. I agree not to enter any copyrighted material, questions or statements about
						violence, weapons, illegal activities, discrimination or hate speech, or any content that violates applicable law or ethical standards.
					{:else}
						Ich stimme zu, dass meine eingegebenen Daten gemäß den <a href={resolve('/datenschutz')} target="_blank">Datenschutzinformationen und Teilnahmebedingungen</a> verarbeitet und für wissenschaftliche Zwecke ausgewertet werden dürfen. Ich stimme zu, kein urheberrechtlich geschütztes Material, Fragen oder Aussagen zu
						Gewalt, Waffen, illegale Aktivitäten, Diskriminierung oder Hassrede oder jegliche Inhalte, die gegen geltende Gesetze oder ethische Standards verstoßen einzugeben.
					{/if}

				</span>
			</div>

		</label>

		<button type="submit" class="btn btn-badge">{t('Erstellen', 'Create')}</button>
	</form>
</section>

<style>
	/* .page {
		max-width: 640px;
		margin: 2rem auto;
		display: grid;
		gap: 1rem;
		padding: 1rem;
		border: 1px solid #e3e3e3;
		border-radius: 8px;
		background: #fafafa;
	}

	.create-form {
		display: grid;
		gap: 0.75rem;
	}

	label {
		display: grid;
		gap: 0.35rem;
		font-weight: 600;
	}

	input,
	textarea {
		width: 100%;
		padding: 0.5rem;
		border-radius: 6px;
		border: 1px solid #cfd6e0;
		font-size: 1rem;
		font-family: inherit;
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
	} */
</style>
