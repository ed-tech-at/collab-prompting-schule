<script lang="ts">
	import { resolve } from '$app/paths';
	import { page } from '$app/state';
	import { alternatePath, germanVersionHref, localize, tr } from '$lib/i18n';
	import type { PageData } from './$types';

	export let data: PageData;
	$: t = tr(data.lang);
	$: href = (path: string) => localize(path, data.lang);
</script>

<h1>{t('Willkommen bei collab.prompting.schule', 'Welcome to collab.prompting.schule')}</h1>
{#if data.loggedOut}
	<p class="notice success">{t('Sie wurden von allen lokalen Sitzungen auf diesem Gerät abgemeldet.', 'You have been logged out of all local sessions on this device.')}</p>
{/if}


<section>
	<h2>{t('Teilnehmen', 'Participate')}</h2>
	<p>{t('Sie haben eine Einladung zu einem CollabSpace erhalten? Verwenden Sie die CollabSpace-ID, Ihren Anzeigenamen und den Teilnahmecode aus der Einladung.', 'Have you been invited to a CollabSpace? Use the CollabSpace ID, your display name and the participation code from the invitation.')}</p>
	<p><a class="btn btn-primary" href={href(resolve('/space'))}>{t('An einem CollabChat teilnehmen', 'Join a CollabChat')} <i class="fas fa-sign-in-alt"></i></a></p>
</section>


<section class="intro-panel">
	<div>
		<h2>{t('KI-Chats gemeinsam reflektieren', 'Reflect on AI chats together')}</h2>
		<p class="lead">{t('CollabSpaces für Lehrveranstaltungen: Aufgabe anlegen, Teilnahmelink teilen und CollabChats gemeinsam besprechen.', 'CollabSpaces for courses: create a task, share the participation link and discuss CollabChats together.')}</p>
	</div>
	<a class="btn btn-faq" href={href(resolve('/faq'))}>
		<span>FAQ & <br>{t('Kurzanleitung', 'Quick guide')}</span> <i class="fas fa-circle-question"></i>
	</a>
</section>

<section>
	<h2>{t('Eigenen CollabSpace erstellen oder verwalten', 'Create or manage your own CollabSpace')}</h2>
	<p>{t('Sie benötigen einen LLM-API-Zugang, der mit der OpenAI', 'You need LLM API access that is compatible with the OpenAI')} <a href='https://platform.openai.com/docs/api-reference/chat' target="_blank">Chat Completions API <i class="fas fa-external-link-alt" aria-hidden="true" style="font-size: 0.8em;"></i></a>{t(' kompatibel ist.', '.')}</p>
	<p><a class="btn btn-badge" href={href(resolve('/admin'))}>{t('CollabSpace-Verwaltung', 'CollabSpace admin')} <i class="fas fa-wrench"></i></a></p>
</section>

<section class="lang-bubble">
	<i class="fas fa-language" aria-hidden="true"></i>
	{#if data.lang === 'en'}
		<p lang="de">Diese Seite gibt es auch auf Deutsch. <a href={germanVersionHref(page.url)}>Zur deutschen Version</a></p>
	{:else}
		<p lang="en">This site is also available in English. <a href={alternatePath(page.url)}>Go to the English version</a></p>
	{/if}
</section>

<section>
	<h2>{t('Von allen lokalen Sitzungen abmelden', 'Log out of all local sessions')}</h2>
	<p>{t('Bei der Verwendung von CollabSpaces werden lokale Sitzungs-Cookies für 8 Tage auf Ihrem Gerät gespeichert. Es gibt dabei keinen persönlichen Account und kein Profil.', 'When you use CollabSpaces, local session cookies are stored on your device for 8 days. There is no personal account and no profile.')}</p>
	<p>{t('Das Abmelden löscht nur diese lokalen Sitzungen. Ihre CollabSpaces und CollabChats werden dadurch nicht gelöscht.', 'Logging out only deletes these local sessions. Your CollabSpaces and CollabChats are not deleted.')}</p>
	{#if data.hasLocalSessions}
		<p>
			<a class="btn btn-danger" href={href(resolve('/logout'))} data-sveltekit-preload-data='off'>{t('Von allen lokalen Sitzungen abmelden', 'Log out of all local sessions')} <i class="fa-solid fa-person-walking-arrow-right"></i></a>
		</p>
	{:else}
		<p class="muted">{t('Aktuell sind auf diesem Gerät keine lokalen CollabSpace-Sitzungen gespeichert.', 'There are currently no local CollabSpace sessions stored on this device.')}</p>
	{/if}
</section>

<style>
	.lang-bubble {
		display: flex;
		align-items: center;
		gap: 0.75rem;
		width: fit-content;
		max-width: 100%;
		padding: 0.7rem 1.1rem;
		border: 1px solid rgba(31, 111, 120, 0.22);
		border-radius: 999px;
		background: rgba(31, 111, 120, 0.06);
	}

	.lang-bubble i {
		font-size: 1.4em;
		color: var(--primary);
	}

	.lang-bubble p {
		margin: 0;
	}

	.intro-panel {
		display: flex;
		justify-content: space-between;
		align-items: center;
		gap: 1rem;
	}

	.btn-faq {
		position: relative;
		z-index: 0;
		isolation: isolate;
		display: inline-flex;
		align-items: center;
		gap: 0.55rem;
		background: transparent;
		color: #fff;
		box-shadow: 0 10px 22px rgba(31, 111, 120, 0.24);
		overflow: hidden;
		white-space: nowrap;
		transition: box-shadow 0.3s ease;
		line-height: 1.4em;
		text-align: center;

	}
	.btn-faq i {
		font-size: 2em;
	}

	.btn-faq::before,
	.btn-faq::after {
		position: absolute;
		inset: 0;
		border-radius: inherit;
		content: '';
	}

	.btn-faq::after {
		z-index: -2;
		background: linear-gradient(135deg, var(--primary) 0%, var(--primary-2) 100%);
	}

	.btn-faq::before {
		z-index: -1;
		background: linear-gradient(135deg, var(--primary-hover) 0%, #6bbfc1 100%);
		opacity: 0;
		transition: opacity 0.3s ease;
	}

	.btn-faq > span,
	.btn-faq > :global(i) {
		position: relative;
		z-index: 1;
	}

	.btn-faq:hover {
		color: #fff;
		box-shadow: 0 12px 26px rgba(31, 111, 120, 0.3);
	}

	.btn-faq:hover::before {
		opacity: 1;
	}

	@media (max-width: 700px) {
		.intro-panel {
			align-items: flex-start;
			flex-direction: column;
		}
	}

	/* form { */
		/* margin-top: 8rem; */
	/* } */
	/* button {
		padding: 0.55rem 0.95rem;
		border-radius: 6px;
		border: 1px solid #ed0a0a;
		background: #963d0e;
		color: white;
		font-weight: 400;
		cursor: pointer;
	} */
</style>
