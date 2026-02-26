<script lang="ts">
	import favicon from '$lib/assets/favicon.svg';
	import Header from '$lib/Header.svelte';
	import { resolve } from '$app/paths';

	let { children } = $props();
  import './fonts.css';


</script>

<svelte:head>
	<link rel="icon" href={favicon} />
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
<main>
{@render children()}
</main>
<footer>
	<a href='https://www.tugraz.at/go/impressum' target="_blank">Impressum</a>
	<a href="https://www.tugraz.at/go/flaait" target="_blank">FLAAIT Group at LLT at TU Graz</a>
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
	footer {
		display: flex;
		width: 100%;
		justify-content: space-between;
		padding: 20px;
		background-color: #263B48;
		height: 70px;
	}
</style>
