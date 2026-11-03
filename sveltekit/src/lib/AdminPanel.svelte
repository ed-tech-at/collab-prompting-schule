<script lang="ts">
	import { onMount, type Snippet } from 'svelte';
	import { slide } from 'svelte/transition';
	import QRCode from 'qrcode';
	import { resolve } from '$app/paths';
	import { localize, tr, type Lang } from '$lib/i18n';
	import { adminPanel, initAdminPanel, setAdminPanelMinimized } from '$lib/admin-panel-state.svelte';

	let {
		collabSpaceId,
		studentPw = null,
		lang,
		children
	}: { collabSpaceId: number; studentPw?: string | null; lang: Lang; children?: Snippet } = $props();

	const t = $derived(tr(lang));
	let mounted = $state(false);
	// No animation while restoring the remembered state on load, only for clicks afterwards
	let animate = $state(false);
	let showCode = $state(false);
	let qrCodeDataUrl = $state('');
	let copyStatus = $state('');

	const participationLink = $derived(
		mounted
			? new URL(localize(resolve(`/space/${collabSpaceId}`), lang), window.location.href)
					.toString()
					.replace(/^http:/, 'https:')
			: ''
	);

	onMount(() => {
		initAdminPanel();
		mounted = true;
		requestAnimationFrame(() => (animate = true));
	});

	const toggleCode = async () => {
		showCode = !showCode;
		if (showCode && !qrCodeDataUrl) {
			qrCodeDataUrl = await QRCode.toDataURL(participationLink, {
				margin: 1,
				width: 240,
				errorCorrectionLevel: 'M'
			});
		}
	};

	const copyLink = async () => {
		await navigator.clipboard.writeText(participationLink);
		copyStatus = t('Link kopiert.', 'Link copied.');
		setTimeout(() => {
			copyStatus = '';
		}, 1800);
	};
</script>

{#if !(mounted && adminPanel.minimized)}
	<section class="bg-badge admin-panel" transition:slide={{ duration: animate ? 200 : 0 }}>
		<button
			type="button"
			class="close"
			title={t('Verwaltung minimieren', 'Minimize admin panel')}
			aria-label={t('Verwaltung minimieren', 'Minimize admin panel')}
			onclick={() => setAdminPanelMinimized(true)}
		>
			<i class="fas fa-times"></i>
		</button>

		<p class="admin-line">
			{t('Angemeldet bei Verwaltung', 'Logged in as admin')}:
			<a href={localize(resolve(`/admin/${collabSpaceId}`), lang)} class="btn btn-badge">
				{t('Zu den Space-Einstellungen', 'Go to space settings')} <i class="fas fa-wrench"></i>
			</a>
			<button type="button" class="btn btn-ghost" onclick={toggleCode} aria-expanded={showCode}>
				{#if showCode}
					{t('Teilnehmercode ausblenden', 'Hide participant code')} <i class="fas fa-chevron-up"></i>
				{:else}
					{t('Teilnehmercode anzeigen', 'Show participant code')} <i class="fas fa-qrcode"></i>
				{/if}
			</button>
		</p>

		{#if showCode}
			<div class="participation" transition:slide={{ duration: 200 }}>
				{#if qrCodeDataUrl}
					<div class="qr-code">
						<img src={qrCodeDataUrl} alt={`${t('QR-Code für CollabSpace-ID', 'QR code for CollabSpace ID')} ${collabSpaceId}`} />
					</div>
				{/if}
				<div class="details">
					<label>
						{t('Teilnahmelink', 'Participation link')}
						<span class="link-row">
							<input type="text" value={participationLink.replace(/^https?:\/\//, '')} readonly />
							<button type="button" class="btn btn-ghost" onclick={copyLink} title={t('Link kopieren', 'Copy link')}>
								<i class="fas fa-copy"></i>
							</button>
						</span>
					</label>
					{#if copyStatus}
						<span class="ok">{copyStatus}</span>
					{/if}
					<div>
						<div class="label">{t('Teilnahmecode', 'Participation code')}</div>
						{#if studentPw}
							<div class="code">{studentPw}</div>
						{:else}
							<p class="muted">{t('Kein Teilnahmecode gesetzt – in den Space-Einstellungen festlegen.', 'No participation code set – define one in the space settings.')}</p>
						{/if}
					</div>
				</div>
			</div>
		{/if}

		{@render children?.()}
	</section>
{/if}

<style>
	.admin-panel {
		position: relative;
		padding-right: 3rem;
	}

	.close {
		position: absolute;
		top: 0.6rem;
		right: 0.6rem;
		width: 2rem;
		height: 2rem;
		border: none;
		border-radius: 999px;
		background: transparent;
		color: var(--primary);
		cursor: pointer;
		font-size: 1.1rem;
	}

	.close:hover {
		background: rgba(31, 111, 120, 0.1);
	}

	.admin-line {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: 10px;
	}

	.participation {
		display: flex;
		flex-wrap: wrap;
		gap: 1.5rem;
		align-items: flex-start;
		margin-bottom: 1rem;
	}

	.qr-code {
		padding: 10px;
		border: 1px solid var(--border);
		border-radius: 12px;
		background: #fff;
	}

	.qr-code img {
		display: block;
		width: 240px;
		height: 240px;
	}

	.details {
		flex: 1 1 260px;
		display: grid;
		gap: 1rem;
	}

	.link-row {
		display: flex;
		gap: 8px;
		align-items: center;
	}

	.link-row input {
		flex: 1;
		min-width: 0;
		font-size: 1.5rem;
		font-weight: 700;
		color: var(--primary);
		padding: 0.5rem 0.8rem;
		border-radius: 12px;
	}

	.link-row .btn {
		font-size: 1.2rem;
		padding: 0.7rem 0.9rem;
	}

	.label {
		font-weight: 600;
		margin-bottom: 0.3rem;
	}

	.code {
		font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
		font-size: 2rem;
		font-weight: 700;
		letter-spacing: 0.08em;
		color: var(--primary);
		background: #fff;
		border: 1px solid var(--border);
		border-radius: 12px;
		padding: 0.4rem 0.9rem;
		width: fit-content;
		word-break: break-all;
	}
</style>
