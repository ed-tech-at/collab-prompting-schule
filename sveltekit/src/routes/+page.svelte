<script lang="ts">
	import { resolve } from '$app/paths';
	import type { PageData } from './$types';

	export let data: PageData;
</script>

<h1>Willkommen bei collab.prompting.schule</h1>
{#if data.loggedOut}
	<p class="notice success">Sie wurden von allen lokalen Sitzungen auf diesem Gerät abgemeldet.</p>
{/if}


<section>
	<h2>Teilnehmen</h2>
	<p>Sie haben eine Einladung zu einem CollabSpace erhalten? Verwenden Sie die CollabSpace-ID, Ihren Anzeigenamen und den Teilnahmecode aus der Einladung.</p>
	<p><a class="btn btn-primary" href={resolve('/space')}>An einem CollabChat teilnehmen <i class="fas fa-sign-in-alt"></i></a></p>
</section>


<section class="intro-panel">
	<div>
		<h2>KI-Chats gemeinsam reflektieren</h2>
		<p class="lead">CollabSpaces für Lehrveranstaltungen: Aufgabe anlegen, Teilnahmelink teilen und CollabChats gemeinsam besprechen.</p>
	</div>
	<a class="btn btn-faq" href={resolve('/faq')}>
		<span>FAQ & <br>Kurzanleitung</span> <i class="fas fa-circle-question"></i>
	</a>
</section>

<section>
	<h2>Eigenen CollabSpace erstellen oder verwalten</h2>
	<p>Sie benötigen einen LLM-API-Zugang, der mit der OpenAI <a href='https://platform.openai.com/docs/api-reference/chat' target="_blank">Chat Completions API <i class="fas fa-external-link-alt" aria-hidden="true" style="font-size: 0.8em;"></i></a> kompatibel ist.</p>
	<p><a class="btn btn-badge" href={resolve('/admin')}>CollabSpace-Verwaltung <i class="fas fa-wrench"></i></a></p>
</section>

<section>
	<h2>Von allen lokalen Sitzungen abmelden</h2>
	<p>Bei der Verwendung von CollabSpaces werden lokale Sitzungs-Cookies für 8 Tage auf Ihrem Gerät gespeichert. Es gibt dabei keinen persönlichen Account und kein Profil.</p>
	<p>Das Abmelden löscht nur diese lokalen Sitzungen. Ihre CollabSpaces und CollabChats werden dadurch nicht gelöscht.</p>
	{#if data.hasLocalSessions}
		<p>
			<a class="btn btn-danger" href={resolve('/logout')} data-sveltekit-preload-data='off'>Von allen lokalen Sitzungen abmelden <i class="fa-solid fa-person-walking-arrow-right"></i></a>
		</p>
	{:else}
		<p class="muted">Aktuell sind auf diesem Gerät keine lokalen CollabSpace-Sitzungen gespeichert.</p>
	{/if}
</section>

<style>
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
