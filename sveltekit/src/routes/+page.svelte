<script lang="ts">
	import { resolve } from '$app/paths';
</script>

<h1>Welcome to collab.prompting.schule</h1>
<p>Please use the direct link we provided to the chatbot.</p>
<p><a href={resolve('/admin')}>Admin</a></p>
<p><a href={resolve('/chat')}>Student collabChat</a></p>
<form method="POST" action={resolve('/logout')}>
	<button type="submit">Logout all</button>
</form>

<style>
	button {
		padding: 0.55rem 0.95rem;
		border-radius: 6px;
		border: 1px solid #1f7ae0;
		background: #1f7ae0;
		color: white;
		font-weight: 600;
		cursor: pointer;
	}
</style>
