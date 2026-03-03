<script lang="ts">
	import Header from '$lib/Header.svelte';
	import { page } from '$app/state';
	import { asset } from '$app/paths';

	let { children } = $props();
	import './fonts.css';
	import './style.css';

	const navItems = $derived(
		(page.data.navItems as { name: string; href: string }[] | undefined) ?? []
	);

</script>

<svelte:head>
	<title>collab.prompting.schule</title>
	<link rel="icon" type="image/png" href={asset("/favicon/favicon-96x96.png")} sizes="96x96" />
	<link rel="icon" type="image/svg+xml" href={asset("/favicon/favicon.svg")} />
	<link rel="shortcut icon" href={asset("/favicon/favicon.ico")} />
	<link rel="apple-touch-icon" sizes="180x180" href={asset("/favicon/apple-touch-icon.png")} />
	<link rel="manifest" href={asset("/favicon/site.webmanifest")} />
	<link rel="stylesheet" href={asset("/fonts/fontawesome-free-5.15.3-web/css/all.min.css")} />

</svelte:head>
<Header
	navItems={navItems}
/>
<main class="main-width">
{@render children()}
</main>
<footer>
	<div class="main-width">
		<a href='https://www.tugraz.at/go/impressum' target="_blank">Impressum</a>
		<a href="https://www.tugraz.at/go/flaait" target="_blank">FLAAIT Group at LLT at TU Graz</a>
	</div>
</footer>

<style>
	/* :global(html, body) {
		margin: 0;
		padding: 0;
		font-family: 'Jost', sans-serif;
	}
	:global(*) {
		box-sizing: border-box;
	} */

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
	footer .main-width {
		display: flex;
		width: 100%;
		justify-content: space-between;
		padding: 20px;
		background-color: #263B48;
		height: 70px;
	}
</style>
