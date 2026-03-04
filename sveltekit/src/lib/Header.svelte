<script lang="ts">
	import { asset } from '$app/paths';

	export let navItems: { name: string; href: string }[] = [];
</script>

<header class="site-header">
	<div class="main-width">
		<a class="brand" href="/"><img src={asset('/favicon/favicon.svg')} alt="Logo" style="height: 2em;" /><span>collab.<wbr />prompting.<wbr />schule</span></a>
		<nav class="main-nav" aria-label="Main navigation">
			{#each navItems as item, i}
				<a href={item.href}>{@html item.name}</a>
				{#if i < navItems.length - 1}
					<span aria-hidden="true">/</span>
				{/if}
			{/each}
		</nav>
		<a class="tugraz" href="https://www.tugraz.at/" target="_blank" rel="noreferrer">
			<img src={asset('/powered-by-tu.svg')} alt="TU Graz Logo" />
		</a>
		</div>
</header>

<style>
	.site-header {
		/* position: sticky; */
		top: 0;
		z-index: 20;
		
		/* background: #eefefe; */
		background: rgba(255,255,255,0.78);
		backdrop-filter: blur(10px);

		border-bottom: 2px solid rgb(138, 172, 176);
    /* height: 50px; */
	}
	.site-header .main-width {
		display: grid;
		grid-template-columns: 1fr auto 1fr;
		align-items: center;
		gap: 1rem;
		padding: 0.75rem 1rem;
	}

	.brand {
		justify-self: start;
		font-weight: 700;
		/* color: var(--primary); */
		text-decoration: none;
	}

	.main-nav {
		justify-self: center;
		display: flex;
		flex-wrap: wrap;
		justify-content: center;
		gap: 0.4rem;
		font-size: 0.9em;

	}

	.main-nav a {
		/* color: var(--primary); */
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
			flex-wrap: wrap;
			font-size: 0.9em;
      gap: 0.4em;

		}
	}
</style>
