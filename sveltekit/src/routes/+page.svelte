<script lang="ts">
	import { resolve } from '$app/paths';
</script>

<h1>Willkommen bei collab.prompting.schule</h1>
<!-- <p>Please use the direct link we provided to the chatbot.</p> -->
<section>
	<h2>Teilnahme</h2>
	<p></p>
	<p><a class="btn btn-primary" href={resolve('/space')}>An einem CollabChat teilnehmen</a></p>
</section>

<section>
	<h2>Eigenen CollabSpace erstellen</h2>
	<p></p>
	<p><a class="btn btn-badge" href={resolve('/admin')}>Neuen CollabSpace erstellen</a></p>
</section>

<section>
	<h2>Abmelden</h2>
	<p>Sie sind</p>
	<!-- <p><a href={resolve('/admin')}>Admin</a></p> -->
	<form method="POST" action={resolve('/logout')}>
		<button type="submit" class="btn btn-accent">Cookies löschen und von allen CollabSpaces abmelden</button>
	</form>
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
