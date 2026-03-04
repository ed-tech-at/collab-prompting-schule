<script lang="ts">
	import { resolve } from '$app/paths';
</script>

<h1>Willkommen bei collab.prompting.schule</h1>
<!-- <p>Please use the direct link we provided to the chatbot.</p> -->
<section>
	<h2>Teilnehmen</h2>
	<p>Sie haben eine Einladung zu einem CollabSpace erhalten?</p>
	<p><a class="btn btn-primary" href={resolve('/space')}>An einem CollabChat teilnehmen</a></p>
</section>

<section>
	<h2>Eigenen CollabSpace erstellen</h2>
	<p>Sie möchten eine eigene Einheit mit collab.prompting.schule gestalten? Sie benötigen interessierte Teilnehmer:innen und einen LLM-API Zugang, der mit der OpenAI <a href='https://platform.openai.com/docs/api-reference/chat' target="_blank">Chat Completions API <i class="fas fa-external-link-alt" aria-hidden="true" style="font-size: 0.8em;"></i></a> kompatibel ist..</p>
	<p><a class="btn btn-badge" href={resolve('/admin')}>Neuen CollabSpace erstellen</a></p>
</section>

<section>
	<h2>Von alles CollabSpaces abmelden</h2>
	<p>Bei der Verwendung von CollabSpaces werden Cookies für 8 Tage auf Ihrem Gerät gespeichert, danach sind Sie automatisch abgemeldet. Sie können Sie mit folgem Button jetzt abmelden.</p>
	<!-- <p><a href={resolve('/admin')}>Admin</a></p> -->
	<!-- <form method="POST" action={resolve('/logout')}> -->
		<p>
			<a class="btn btn-danger" href={resolve('/logout')}  data-sveltekit-preload-data='off' >Cookies löschen und von allen CollabSpaces abmelden</a>
		</p>
	<!-- </form> -->
</section>

<style>
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
