<script lang="ts">
	import { resolve } from '$app/paths';
</script>

<h1>Willkommen bei collab.prompting.schule</h1>
<!-- <p>Please use the direct link we provided to the chatbot.</p> -->

<p><a href={resolve('/chat')}>An einem CollabChat teilnehmen</a></p>
<!-- <p><a href={resolve('/admin')}>Admin</a></p> -->
<form method="POST" action={resolve('/logout')}>
	<button type="submit">Von allen CollabSpaces abmelden</button>
</form>

<style>
	form {
		margin-top: 8rem;
	}
	button {
		padding: 0.55rem 0.95rem;
		border-radius: 6px;
		border: 1px solid #ed0a0a;
		background: #963d0e;
		color: white;
		font-weight: 400;
		cursor: pointer;
	}
</style>
