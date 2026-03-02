<script lang="ts">
	
	import Header from '$lib/Header.svelte';
	import { resolve, asset } from '$app/paths';

	let { children } = $props();
  import './fonts.css';
	import './style.css';


</script>

<svelte:head>
	<title>collab.prompting.schule</title>
	<link rel="icon" type="image/png" href={asset("/favicon/favicon-96x96.png")} sizes="96x96" />
	<link rel="icon" type="image/svg+xml" href={asset("/favicon/favicon.svg")} />
	<link rel="shortcut icon" href={asset("/favicon/favicon.ico")} />
	<link rel="apple-touch-icon" sizes="180x180" href={asset("/favicon/apple-touch-icon.png")} />
	<link rel="manifest" href={asset("/favicon/site.webmanifest")} />

</svelte:head>
<Header
	navItems={[
		{ name: 'Home', href: resolve('/') },
		{ name: 'CollabChat', href: resolve('/chat') },
		{ name: 'Admin', href: resolve('/admin') },
		// { name: 'Admin', href: '/admin' },
		// { name: 'Login', href: '/login' },
		// { name: 'Logout', href: '/logout' }
	]}
/>
<main class="container">
{@render children()}
</main>
<footer>
	<div class="container">
		<a href='https://www.tugraz.at/go/impressum' target="_blank">Impressum</a>
		<a href="https://www.tugraz.at/go/flaait" target="_blank">FLAAIT Group at LLT at TU Graz</a>
	</div>
</footer>

<style>
	:global(html, body) {
		margin: 0;
		padding: 0;
		font-family: 'Jost', sans-serif;
	}
	:global(*) {
		box-sizing: border-box;
	}

	footer {
		background-color: #263B48;
		height: 70px;
	}
	footer a {
		color: white;
	}
	main {
		padding: 20px;
		min-height: calc(100dvh - 120px);
	}
	footer .container {
		display: flex;
		width: 100%;
		justify-content: space-between;
		padding: 20px;
		background-color: #263B48;
		height: 70px;
	}
</style>
