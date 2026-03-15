<script lang="ts">
	import type { ActionData } from './$types';
	import { resolve } from '$app/paths';

	export let form: ActionData;

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
	<h1>Neuen CollabSpace erstellen</h1>

	{#if form?.message}
		<p class={`notice ${form?.success ? 'success' : 'error'}`}>{form.message}</p>
	{/if}

	<form method="POST" class="create-form">
		<h2>Verwaltung</h2>
		<label>
			Manage Passwort<sup class="label-required">*</sup>
			<input name="password" type="text" required />
		</label>
		
		<label>
			E-Mail Adresse<sup class="label-required">*</sup>
			<input name="manageEmail" type="email" required />
		</label>

		<h2>
			KI Schnittstelle
			{#if !showEnvImport}
				<button type="button" class="btn btn-ghost" on:click={() => (showEnvImport = !showEnvImport)}>
					.env importieren
				</button>
			{/if}

		</h2>
		{#if showEnvImport}
			<label>
				.env für Import
				<textarea
					rows="3"
					placeholder={`OPENAI_API_KEY=YOUR_API_KEY_HERE\nOPENAI_BASE_URL=https://flaait.tugraz.at/llmduckt/llmapi/v1/\nOPENAI_MODEL=ministral-3:14b`}
					bind:value={envText}
				></textarea>
				
				<button type="button" class="btn btn-ghost" on:click={parseEnv}>Felder importieren</button>
			</label>
		{/if}
		
		<label>
			LLM base_url<sup class="label-required">*</sup> 
			<div class="muted" style="font-weight: 400;">Kompatibel zur <a href="https://platform.openai.com/docs/api-reference/chat" target="_blank">OpenAI Chat Completions API (v1)</a>.</div>
			<input name="base_url" type="text" placeholder="https://flaait.tugraz.at/llmduckt/llmapi/v1/" bind:value={baseUrl} required />
		</label>
		<label>
			LLM API Key<sup class="label-required">*</sup>
			<input name="api_key" type="text" bind:value={apiKey} required/>
		</label>
		<label>
			LLM Model<sup class="label-required">*</sup>
			<input name="model"  type="text" bind:value={model} required />
		</label>
		<label>
			KI Systemprompt<sup class="label-required">*</sup>
			<textarea name="system_prompt" rows="5" placeholder="Du bist ein hilfreicher Assistent." required >Du bist ein hilfreicher Assistent. Antworte auf Deutsch.</textarea>
		</label>
		
		<h2>Teilnehmer:innen</h2>
		
		<label>
			Teilnahmecode für den Beitritt<sup class="label-required">*</sup>
			<input name="student_pw" type="text" required/>
		</label>
		
		<label>
			Aufgabe (optional, HTML-Darstellung)
			<textarea name="question" rows="3"></textarea>
		</label>

		<label>
			Benutzerrichtlinie
			<div class="checkbox_wrapper">
				<input name="student_pw" type="checkbox" required />
				<span>
					Ich stimme zu, dass meine eingegebenen Daten gemäß den <a href={resolve('/datenschutz')} target="_blank">Datenschutzinformationen und Teilnahmebedingungen</a> verarbeitet und für wissenschaftliche Zwecke ausgewertet werden dürfen. Ich stimme zu, kein urheberrechtlich geschütztes Material, Fragen oder Aussagen zu
            Gewalt, Waffen, illegale Aktivitäten, Diskriminierung oder Hassrede oder jegliche Inhalte, die gegen geltende Gesetze oder ethische Standards verstoßen einzugeben.

				</span>
			</div>

		</label>

		<button type="submit" class="btn btn-ghost">Erstellen</button>
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
