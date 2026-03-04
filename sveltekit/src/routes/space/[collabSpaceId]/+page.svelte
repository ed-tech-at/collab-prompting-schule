<script lang="ts">
	import type { ActionData, PageData } from './$types';
	import { resolve } from '$app/paths';

	export let data: PageData;
	export let form: ActionData;

	const isOwnChat = (conversationId: number) => data.ownChatIds.includes(conversationId);
	const normalizeRating = (rating: string | null | undefined) => {
		const value = Number(rating);
		if (!Number.isInteger(value) || value < 1 || value > 5) return 0;
		return value;
	};
</script>

<svelte:head>
	<link rel="stylesheet" href="/fonts/fontawesome-free-5.15.3-web/css/all.min.css" />
</svelte:head>

<h1>CollabSpace ID {data.collabSpaceId} / CollabChat</h1>
{#if data.requiresLogin}
	<section class="page">
		{#if form?.message}
			<p class={`notice ${form?.success ? 'success' : 'error'}`}>{form.message}</p>
		{/if}

		<form method="POST" action="?/login" class="login-form">
			<label>
				CollabSpace ID
				<input name="collabSpaceId" type="number" min="1" value={data.collabSpaceId} readonly required />
			</label>

			<label>
				Dein Username
				<input name="username" type="text" required />
			</label>

			<label>
				Teilnahmecode
				<input name="student_pw" type="password" required />
			</label>

			<label>
				Benutzerrichtlinie
				<div class="checkbox_wrapper">
					<input name="accepted_guidelines" type="checkbox" required />
					<span>
						Ich stimme zu, dass meine eingegebenen Daten gemäß den <a href={resolve('/datenschutz')}  target="_blank">Datenschutzinformationen und Teilnahmebedingungen</a> verarbeitet und für wissenschaftliche Zwecke ausgewertet werden dürfen.
					</span>
				</div>
			</label>

			<button type="submit" class="btn btn-primary">Teilnehmen</button>
		</form>
	</section>
{:else}
	<section class="page">
		{#if data.isAdmin}
			<p>Angemeldet als Admin: <a href={resolve(`/admin/${data.collabSpaceId}`)}>Zu den Space-Einstellungen</a></p>
		{/if}

		{#if form?.message}
			<p class="notice error">{form.message}</p>
		{/if}

		{#if data.question}
			<p class="question"><b>Aufgabe:</b> {data.question}</p>
		{/if}

		<form method="POST" action="?/createChat">
			<button class="btn btn-primary" type="submit">Neuen Chat starten</button>
		</form>
	</section>

	<section>
		<h3>Bestehende Chats</h3>
		{#if data.conversations.length === 0}
			<p class="muted">Noch keine Chats vorhanden.</p>
		{:else}
			<!-- <ul> -->
			 <div class="chat-list">
				{#each data.conversations as conversation}
						<a href={resolve(`/space/${data.collabSpaceId}/chat/${conversation.id}`)} class:own-chat={isOwnChat(conversation.id)}>
							<div class="chat-card-head">
								<span class="number">#{conversation.id}</span>
								{#if conversation.username}
									<span class="chat-username">von {conversation.username}</span>
								{/if}
							</div>
							<div class="chat-rating-block">

								{#if conversation.student_rating}
									<div class="chat-rating-line">
										<span class="rating-label">Ersteller:in</span>
										<span class="rating-stars-list" aria-label={`Bewertung ${conversation.student_rating} von 5`}>
											{#each [1, 2, 3, 4, 5] as star}
												<i class={`fa-star ${star <= normalizeRating(conversation.student_rating) ? 'fas active' : 'far'}`}></i>
											{/each}
										</span>
										
										{#if conversation.student_comment}
											<p class="chat-comment"><i>Kommentar:</i> {conversation.student_comment}</p>
										{/if}
									</div>
								{/if}
								
								{#if conversation.teacher_rating}
									<div class="chat-rating-line">
										<span class="rating-label">Lehrender</span>
										<span class="rating-stars-list" aria-label={`Bewertung ${conversation.teacher_rating} von 5`}>
											{#each [1, 2, 3, 4, 5] as star}
												<i class={`fa-star ${star <= normalizeRating(conversation.teacher_rating) ? 'fas active' : 'far'}`}></i>
											{/each}
										</span>

										{#if conversation.teacher_comment}
											<p class="chat-comment"><i>Kommentar:</i> {conversation.teacher_comment}</p>
										{/if}
									</div>
								{/if}								
								
							</div>

						</a>
				{/each}
			<!-- </ul> -->
			 </div>
		{/if}
	</section>
{/if}

<style>
	/* .page {
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

	li.own-chat {
		background: #e8f3ff;
		font-weight: 700;
	}

	.meta {
		color: #666;
		font-size: 0.9rem;
	}

	.muted {
		color: #666;
		margin: 0;
	} */
</style>
