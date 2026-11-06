<script lang="ts">
	import { resolve } from '$app/paths';
	import { page } from '$app/state';
	import { Menu, Timer, X } from 'lucide-svelte';
	import NavSound from './NavSound.svelte';

	type NavPath = '/' | '/focus' | '/settings';

	interface NavLink {
		href: NavPath;
		label: string;
	}

	let {
		links = [
			{ href: '/', label: 'Home' },
			{ href: '/focus', label: 'Focus' },
			{ href: '/settings', label: 'Settings' }
		]
	}: { links?: NavLink[] } = $props();

	let menuOpen = $state(false);
</script>

<svelte:window
	onkeydown={(event) => {
		if (event.key === 'Escape') menuOpen = false;
	}}
/>

<header class="navbar">
	<nav class="nav-inner container" aria-label="Main navigation">
		<a
			class="brand"
			href={resolve('/')}
			aria-label="LOCK IN home"
			onclick={() => (menuOpen = false)}
		>
			<span class="brand-mark" aria-hidden="true"><Timer size={17} strokeWidth={2.4} /></span>
			<span class="brand-name">LOCK IN<span class="brand-dot">.</span></span>
		</a>

		<div class="nav-links" class:open={menuOpen} id="primary-navigation">
			{#each links as link (link.href)}
				<a
					class="nav-link"
					href={resolve(link.href)}
					aria-current={page.url.pathname === resolve(link.href) ? 'page' : undefined}
					onclick={() => (menuOpen = false)}
				>
					{link.label}
				</a>
			{/each}
		</div>

		<div class="nav-actions">
			<NavSound />

			<button
				class="menu-toggle"
				type="button"
				aria-expanded={menuOpen}
				aria-controls="primary-navigation"
				aria-label={menuOpen ? 'Close navigation menu' : 'Open navigation menu'}
				onclick={() => (menuOpen = !menuOpen)}
			>
				{#if menuOpen}<X size={20} />{:else}<Menu size={20} />{/if}
			</button>
		</div>
	</nav>
</header>

<style>
	.navbar {
		position: sticky;
		top: 0;
		z-index: 50;
		background: rgba(7, 6, 9, 0.72);
		border-bottom: 1px solid rgba(255, 255, 255, 0.05);
		backdrop-filter: blur(20px);
	}

	.nav-inner {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 1.5rem;
		height: 72px;
	}

	.brand {
		display: inline-flex;
		align-items: center;
		gap: 0.7rem;
	}

	.brand-mark {
		display: grid;
		place-items: center;
		width: 34px;
		height: 34px;
		border-radius: 11px;
		background: linear-gradient(145deg, #bda4ff, var(--accent-strong) 48%, var(--accent-deep));
		color: #0a0710;
		box-shadow: 0 0 26px rgba(139, 92, 246, 0.4);
	}

	.brand-name {
		font-size: 0.85rem;
		font-weight: 800;
		letter-spacing: 0.18em;
	}

	.brand-dot {
		color: var(--accent);
	}

	.nav-links {
		display: flex;
		align-items: center;
		gap: 0.35rem;
	}

	.nav-link {
		padding: 0.5rem 0.95rem;
		border-radius: 999px;
		color: var(--text-muted);
		font-size: 0.88rem;
		font-weight: 500;
		transition:
			color 180ms ease,
			background 180ms ease;
	}

	.nav-link:hover {
		color: var(--text);
		background: rgba(255, 255, 255, 0.045);
	}

	.nav-link[aria-current='page'] {
		color: var(--text);
		background: var(--accent-soft);
		box-shadow: inset 0 0 0 1px rgba(167, 139, 250, 0.16);
	}

	.nav-actions {
		display: flex;
		align-items: center;
		gap: 0.5rem;
	}

	.menu-toggle {
		display: none;
		place-items: center;
		width: 40px;
		height: 40px;
		border: 1px solid var(--border);
		border-radius: 12px;
		background: rgba(255, 255, 255, 0.04);
		color: var(--text);
	}

	@media (max-width: 760px) {
		.nav-inner {
			height: 64px;
		}

		.menu-toggle {
			display: grid;
		}

		.nav-links {
			position: absolute;
			top: calc(100% + 0.5rem);
			left: 0.875rem;
			right: 0.875rem;
			display: none;
			flex-direction: column;
			align-items: stretch;
			gap: 0.25rem;
			padding: 0.5rem;
			border: 1px solid var(--border);
			border-radius: 18px;
			background: var(--surface-solid);
			box-shadow: 0 24px 60px -24px rgba(0, 0, 0, 0.9);
		}

		.nav-links.open {
			display: flex;
			animation: menu-in 180ms ease both;
		}

		.nav-link {
			padding: 0.75rem 0.9rem;
		}
	}

	@keyframes menu-in {
		from {
			opacity: 0;
			transform: translateY(-6px);
		}

		to {
			opacity: 1;
			transform: translateY(0);
		}
	}
</style>
