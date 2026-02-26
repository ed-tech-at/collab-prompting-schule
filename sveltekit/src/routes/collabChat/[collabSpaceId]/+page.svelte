<script lang="ts">
	import type { ActionData, PageData } from './$types';
	import { resolve } from '$app/paths';

	export let data: PageData;
	export let form: ActionData;
</script>

<section class="page">
	{#if data.isAdmin}
		<p><a href={resolve(`/collabSpace/${data.collabSpaceId}`)}>Zu den Space-Einstellungen</a></p>
	{/if}
	<h1>CollabChat Space #{data.collabSpaceId}</h1>

	{#if form?.message}
		<p class="notice error">{form.message}</p>
	{/if}

	<form method="POST">
		<button type="submit">Create New Chat</button>
	</form>

	<section class="list">
		<h2>Bestehende Konversationen</h2>
		{#if data.conversations.length === 0}
			<p class="muted">Noch keine Konversation vorhanden.</p>
		{:else}
			<ul>
				{#each data.conversations as conversation}
					<li>
						<a href={resolve(`/collabChat/${data.collabSpaceId}/${conversation.id}`)}>
							#{conversation.id}
						</a>
						<span class="meta">
							{new Date(conversation.createdAt).toLocaleString()}
							{#if conversation.student_rating}
								· Student: {conversation.student_rating}/5
							{/if}
							{#if conversation.teacher_rating}
								· Lehrer: {conversation.teacher_rating}/5
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
		max-width: 540px;
		margin: 2rem auto;
		display: grid;
		gap: 1rem;
		padding: 1rem;
		border: 1px solid #e3e3e3;
		border-radius: 8px;
		background: #fafafa;
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

	.notice.error {
		background: #fff0f0;
		color: #8a1c1c;
		border: 1px solid #f2c7c7;
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
