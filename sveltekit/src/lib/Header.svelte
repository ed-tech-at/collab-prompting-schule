<script lang="ts">
	import { asset } from '$app/paths';

	export let navItems: { name: string; href: string }[] = [];
</script>

<header class="site-header">
	<a class="brand" href="/">collab.prompting.schule</a>
	<nav class="main-nav" aria-label="Main navigation">
		{#each navItems as item}
			<a href={item.href}>{item.name}</a>
		{/each}
	</nav>
	<a class="tugraz" href="https://www.tugraz.at/" target="_blank" rel="noreferrer">
		<img src={asset('/logo-tugraz.svg')} alt="TU Graz Logo" />
	</a>
</header>

<style>
	.site-header {
		/* position: sticky; */
		top: 0;
		z-index: 20;
		display: grid;
		grid-template-columns: 1fr auto 1fr;
		align-items: center;
		gap: 1rem;
		padding: 0.75rem 1rem;
		background: #eefefe;
		border-bottom: 1px solid #e3e3e3;
    /* height: 50px; */
	}

	.brand {
		justify-self: start;
		font-weight: 700;
		color: #111;
		text-decoration: none;
	}

	.main-nav {
		justify-self: center;
		display: flex;
		flex-wrap: wrap;
		justify-content: center;
		gap: 0.8rem;
	}

	.main-nav a {
		color: #1f7ae0;
		text-decoration: none;
		font-weight: 600;
	}

	.tugraz {
		justify-self: end;
		display: inline-flex;
		align-items: center;
	}

	.tugraz img {
		height: 28px;
		width: auto;
		display: block;
	}

	@media (max-width: 760px) {
		.site-header {
			grid-template-columns: 1fr;
			justify-items: center;
		}

		.brand,
		.tugraz {
			justify-self: center;
		}
	}
</style>
