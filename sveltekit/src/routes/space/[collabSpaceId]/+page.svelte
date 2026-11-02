<script lang="ts">
	import type { ActionData, PageData } from './$types';
	import { resolve } from '$app/paths';
	import { renderMarkdown } from '$lib/markdown';
	import { localize, tr } from '$lib/i18n';

	export let data: PageData;
	export let form: ActionData;
	const t = tr(data.lang);
	const href = (path: string) => localize(path, data.lang);
	type BasicForm = { success?: boolean; message?: string };
	$: formState = form as BasicForm | undefined;
	let renderedQuestion = renderMarkdown(data.question ?? undefined, {
		mathRender: data.mathRender
	});
	const spaceTitle = data.title?.trim() ?? '';

	const isOwnChat = (conversationId: number) => data.ownChatIds.includes(conversationId);
	const conversationOwnerLabel = (username: string | null) => username?.trim() || t('ohne Anzeigename', 'no display name');
	const normalizeRating = (rating: string | null | undefined) => {
		const value = Number(rating);
		if (!Number.isInteger(value) || value < 1 || value > 5) return 0;
		return value;
	};
</script>


{#if spaceTitle}
	<h1>{spaceTitle}</h1>
	<p class="space-id">{t('CollabSpace-ID', 'CollabSpace ID')} {data.collabSpaceId}</p>
{:else}
	<h1>{t('CollabSpace-ID', 'CollabSpace ID')} {data.collabSpaceId} / CollabChat</h1>
{/if}
{#if data.requiresLogin}
	<section class="page">
		{#if formState?.message}
			<p class={`notice ${formState?.success ? 'success' : 'error'}`}>{formState.message}</p>
		{/if}

		<form method="POST" action="?/login" class="login-form">
			<label>
				{t('CollabSpace-ID', 'CollabSpace ID')}<span class="label-required">*</span>
				<input name="collabSpaceId" type="number" min="1" value={data.collabSpaceId} readonly required />
			</label>

			<label>
				{t('Ihr Anzeigename', 'Your display name')}<span class="label-required">*</span>
				<input name="username" type="text" required />
			</label>

			<label>
				{t('Teilnahmecode', 'Participation code')}<span class="label-required">*</span>
				<!-- <div class="muted" style="font-weight: 400;">Der Teilnahmecode ist der Code aus Ihrer Einladung, nicht das Verwaltungspasswort.</div> -->
				<input name="student_pw" type="password" required />
			</label>

			<label>
				{t('Benutzerrichtlinie', 'User policy')}<span class="label-required">*</span>
				<div class="checkbox_wrapper">
					<input name="accepted_guidelines" type="checkbox" required />
					<span>
						{#if data.lang === 'en'}
							I agree that the data I enter may be processed in accordance with the <a href={localize(resolve('/datenschutz'), data.lang)} target="_blank">privacy information and terms of participation</a> and evaluated for scientific purposes.
						{:else}
							Ich stimme zu, dass meine eingegebenen Daten gemäß den <a href={resolve('/datenschutz')} target="_blank">Datenschutzinformationen und Teilnahmebedingungen</a> verarbeitet und für wissenschaftliche Zwecke ausgewertet werden dürfen.
						{/if}
					</span>
				</div>
			</label>

			<button type="submit" class="btn btn-primary">{t('Teilnehmen', 'Join')} <i class="fas fa-sign-in-alt"></i></button>
		</form>
	</section>
{:else}
	<section class="page">
		{#if data.isAdmin}
			<p>{t('Angemeldet bei Verwaltung', 'Logged in as admin')}: <a href={href(resolve(`/admin/${data.collabSpaceId}`))} class="btn btn-badge">{t('Zu den Space-Einstellungen', 'Go to space settings')} <i class="fas fa-wrench"></i></a></p>
		{/if}

		{#if formState?.message}
			<p class="notice error">{formState.message}</p>
		{/if}

		{#if data.question}
			<div class="question"><b>{t('Aufgabe', 'Task')}:</b> {@html renderedQuestion}</div>
		{/if}

		<form method="POST" action="?/createChat">
			<button class="btn btn-primary" type="submit">{t('Neuen Chat starten', 'Start new chat')} <i class="fas fa-plus-square"></i></button>
		</form>
	</section>

	<section>
		<h3>{t('Bestehende Chats', 'Existing chats')}</h3>
		{#if data.conversations.length === 0}
			<p class="muted">{t('Noch keine Chats vorhanden.', 'No chats yet.')}</p>
		{:else}
			<!-- <ul> -->
			 <div class="chat-list">
				{#each data.conversations as conversation}
						<a href={href(resolve(`/space/${data.collabSpaceId}/chat/${conversation.id}`))} class:own-chat={isOwnChat(conversation.id)} class:hidden-chat={conversation.hidden}>
							<div class="chat-card-head">
								<span class="number">#{conversation.id}</span>
								<span class="chat-username">{t('von', 'by')} {conversationOwnerLabel(conversation.username)}</span>
								{#if isOwnChat(conversation.id)}
									<span class="own-tag">{t('Ihr Chat', 'Your chat')}</span>
								{/if}
								{#if data.isAdmin && conversation.hidden}
									<span class="hidden-tag">{t('versteckt', 'hidden')}</span>
								{/if}
							</div>
							<div class="chat-rating-block">

								{#if conversation.student_rating}
									<div class="chat-rating-line">
										<span class="rating-label">{t('Ersteller:in', 'Creator')}</span>
										<span class="rating-stars-list" aria-label={`${t('Bewertung', 'Rating')} ${conversation.student_rating} ${t('von', 'of')} 5`}>
											{#each [1, 2, 3, 4, 5] as star}
												<i class={`fa-star ${star <= normalizeRating(conversation.student_rating) ? 'fas active' : 'far'}`}></i>
											{/each}
										</span>
										
										{#if conversation.student_comment}
											<p class="chat-comment"><i>{t('Kommentar', 'Comment')}:</i> {conversation.student_comment}</p>
										{/if}
									</div>
								{/if}
								
								{#if conversation.teacher_rating}
									<div class="chat-rating-line">
										<span class="rating-label">{t('Lehrende:r', 'Teacher')}</span>
										<span class="rating-stars-list" aria-label={`${t('Bewertung', 'Rating')} ${conversation.teacher_rating} ${t('von', 'of')} 5`}>
											{#each [1, 2, 3, 4, 5] as star}
												<i class={`fa-star ${star <= normalizeRating(conversation.teacher_rating) ? 'fas active' : 'far'}`}></i>
											{/each}
										</span>

										{#if conversation.teacher_comment}
											<p class="chat-comment"><i>{t('Kommentar', 'Comment')}:</i> {conversation.teacher_comment}</p>
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
	.own-tag,
	.hidden-tag {
		font-size: 13px;
		font-weight: 700;
		border-radius: 999px;
		padding: 2px 8px;
	}

	.own-tag {
		color: var(--primary);
		background: rgba(31, 111, 120, 0.1);
		border: 1px solid rgba(31, 111, 120, 0.22);
	}

	.hidden-tag {
		color: var(--danger);
		background: rgba(178, 58, 58, 0.1);
		border: 1px solid rgba(178, 58, 58, 0.25);
	}

	.chat-list a.hidden-chat {
		border-color: rgba(178, 58, 58, 0.25);
		background: linear-gradient(180deg, rgba(178, 58, 58, 0.05) 0%, rgba(178, 58, 58, 0.02) 100%);
	}

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
