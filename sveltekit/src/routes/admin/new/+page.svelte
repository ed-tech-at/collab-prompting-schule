<script lang="ts">
	import type { ActionData } from './$types';

	export let form: ActionData;
</script>

<section class="page">
	<h1>Create CollabSpace</h1>

	{#if form?.message}
		<p class={`notice ${form?.success ? 'success' : 'error'}`}>{form.message}</p>
	{/if}

	<form method="POST" class="create-form">
		<label>
			Password (plaintext)
			<input name="password" type="text" required />
		</label>
		<label>
			Student Password (optional)
			<input name="student_pw" type="text" />
		</label>
		<label>
			base_url
			<input name="base_url" type="text"  />
		</label>
		<label>
			api_key
			<input name="api_key" type="text"  />
		</label>
		<label>
			model
			<input name="model"  type="text" />
		</label>
		<label>
			question
			<textarea name="question" rows="3"></textarea>
		</label>
		<label>
			system_prompt
			<textarea name="system_prompt" rows="5"></textarea>
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
