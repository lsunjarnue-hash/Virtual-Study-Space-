<script lang="ts">
	import { resolve } from '$app/paths';

	const year = new Date().getFullYear();
</script>

<footer class="footer">
	<div class="footer-inner container">
		<div class="footer-brand">
			<a class="brand" href={resolve('/')} aria-label="LOCK IN home">
				LOCK IN<span class="brand-dot">.</span>
			</a>
			<p>Quiet tools for loud ambitions. Stay present, one session at a time.</p>
		</div>

		<nav class="footer-nav" aria-label="Footer navigation">
			<a href={resolve('/')}>Home</a>
			<a href={resolve('/focus')}>Focus</a>
			<a href={resolve('/settings')}>Settings</a>
		</nav>

		<p class="copyright">&copy; {year} LOCK IN — Study Timer</p>
	</div>
</footer>

<style>
	.footer {
		margin-top: 5rem;
		border-top: 1px solid var(--border);
		background: linear-gradient(180deg, transparent, rgba(139, 92, 246, 0.035));
	}

	.footer-inner {
		display: grid;
		grid-template-columns: 1.4fr auto auto;
		align-items: center;
		gap: 2rem;
		padding: 2.5rem 0;
	}

	.footer-brand {
		display: grid;
		gap: 0.35rem;
		max-width: 340px;
	}

	.brand {
		font-size: 0.8rem;
		font-weight: 800;
		letter-spacing: 0.18em;
	}

	.brand-dot {
		color: var(--accent);
	}

	.footer-brand p {
		color: var(--text-dim);
		font-size: 0.83rem;
		line-height: 1.5;
	}

	.footer-nav {
		display: flex;
		gap: 1.25rem;
	}

	.footer-nav a {
		color: var(--text-muted);
		font-size: 0.85rem;
		transition: color 160ms ease;
	}

	.footer-nav a:hover {
		color: var(--accent);
	}

	.copyright {
		color: var(--text-dim);
		font-size: 0.78rem;
	}

	@media (max-width: 780px) {
		.footer-inner {
			grid-template-columns: 1fr;
			gap: 1.25rem;
			padding: 2rem 0;
		}
	}
</style>
