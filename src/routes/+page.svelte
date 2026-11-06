<script lang="ts">
	import { resolve } from '$app/paths';
	import StudyStats from '#lib/components/StudyStats.svelte';
	import { ArrowRight, Music2, Palette, ShieldCheck, Sparkles, Timer } from 'lucide-svelte';
	import { onMount } from 'svelte';

	let greeting = $state('Hello');
	let dateLabel = $state('');

	onMount(() => {
		const now = new Date();
		const hour = now.getHours();
		greeting =
			hour < 5
				? 'Late night'
				: hour < 12
					? 'Good morning'
					: hour < 18
						? 'Good afternoon'
						: 'Good evening';
		dateLabel = now.toLocaleDateString(undefined, {
			weekday: 'long',
			month: 'long',
			day: 'numeric'
		});
	});
</script>

<svelte:head>
	<title>LOCK IN — Study Timer</title>
	<meta
		name="description"
		content="LOCK IN is a calm Pomodoro timer and study workspace with tasks and ambient soundscapes, built for deep, distraction-free focus."
	/>
</svelte:head>

<div class="home">
	<section class="hero container" aria-labelledby="hero-heading">
		<p class="eyebrow"><Sparkles size={13} /> {dateLabel || 'Your study workspace'}</p>
		<h1 id="hero-heading">{greeting} — time to <span class="gradient-text">lock in.</span></h1>
		<p class="lede">
			LOCK IN blends a Pomodoro timer, a simple task list, and ambient soundscapes into one quiet
			workspace. No accounts, no noise — just the next focused session.
		</p>

		<div class="hero-actions">
			<a class="primary-link" href={resolve('/focus')}>
				Start focusing
				<ArrowRight size={16} />
			</a>
			<a class="ghost-link" href={resolve('/settings')}>
				<Palette size={15} />
				Customize your space
			</a>
		</div>

		<div class="hero-chips" aria-label="Highlights">
			<span>Pomodoro rhythm</span>
			<span>Ambient soundscapes</span>
			<span>Local &amp; private</span>
		</div>
	</section>

	<section class="home-grid container" aria-label="About LOCK IN">
		<article class="card about-card">
			<p class="eyebrow">The workspace</p>
			<h2>Everything you need, nothing you don't.</h2>
			<p class="about-copy">
				A small, deliberate set of tools for deep work. Set a session, write down the one thing that
				matters, and let the room fall quiet.
			</p>

			<ul class="feature-list">
				<li>
					<span class="feature-icon" aria-hidden="true"><Timer size={18} /></span>
					<div>
						<strong>Focus timer</strong>
						<span>Focus, short break, and long break modes with a drift-free countdown.</span>
					</div>
				</li>
				<li>
					<span class="feature-icon" aria-hidden="true"><Music2 size={18} /></span>
					<div>
						<strong>Ambient soundscapes</strong>
						<span>Lo-fi, piano, rain, ocean, and brown noise — generated in your browser.</span>
					</div>
				</li>
				<li>
					<span class="feature-icon" aria-hidden="true"><ShieldCheck size={18} /></span>
					<div>
						<strong>Private by default</strong>
						<span>Tasks, settings, and progress stay on this device. No accounts, no tracking.</span
						>
					</div>
				</li>
			</ul>

			<a class="text-link" href={resolve('/focus')}>
				Open the focus room
				<ArrowRight size={15} />
			</a>
		</article>

		<StudyStats />
	</section>
</div>

<style>
	.home {
		padding-bottom: 1rem;
	}

	.hero {
		display: grid;
		justify-items: center;
		gap: 1.15rem;
		padding: clamp(2.75rem, 7vw, 5.5rem) 0 clamp(1.75rem, 4vw, 2.75rem);
		text-align: center;
	}

	.hero h1 {
		max-width: 920px;
		font-size: clamp(2.9rem, 8vw, 5.6rem);
		font-weight: 600;
		letter-spacing: -0.06em;
		line-height: 0.98;
		text-wrap: balance;
		animation: rise 700ms cubic-bezier(0.22, 1, 0.36, 1) both;
	}

	.hero .eyebrow {
		animation: rise 600ms cubic-bezier(0.22, 1, 0.36, 1) both;
	}

	.lede {
		max-width: 600px;
		color: var(--text-muted);
		font-size: clamp(0.95rem, 2.2vw, 1.08rem);
		line-height: 1.65;
		text-wrap: pretty;
		animation: rise 700ms 80ms cubic-bezier(0.22, 1, 0.36, 1) both;
	}

	.hero-actions {
		display: flex;
		align-items: center;
		justify-content: center;
		flex-wrap: wrap;
		gap: 0.7rem;
		margin-top: 0.35rem;
		animation: rise 700ms 120ms cubic-bezier(0.22, 1, 0.36, 1) both;
	}

	.primary-link {
		display: inline-flex;
		align-items: center;
		gap: 0.45rem;
		padding: 0.85rem 1.35rem;
		border-radius: 999px;
		background: linear-gradient(135deg, #b79cff, var(--accent-strong) 55%, var(--accent-deep));
		color: #fff;
		font-size: 0.88rem;
		font-weight: 600;
		box-shadow: 0 16px 34px -16px rgba(109, 63, 240, 0.9);
		transition: transform 180ms ease;
	}

	.primary-link:hover {
		transform: translateY(-1px);
	}

	.ghost-link {
		display: inline-flex;
		align-items: center;
		gap: 0.45rem;
		padding: 0.82rem 1.2rem;
		border: 1px solid var(--border-strong);
		border-radius: 999px;
		background: rgba(255, 255, 255, 0.035);
		color: var(--text-muted);
		font-size: 0.85rem;
		font-weight: 500;
		transition:
			background 160ms ease,
			color 160ms ease;
	}

	.ghost-link:hover {
		background: rgba(255, 255, 255, 0.06);
		color: var(--text);
	}

	.hero-chips {
		display: flex;
		flex-wrap: wrap;
		justify-content: center;
		gap: 0.5rem;
		animation: rise 700ms 180ms cubic-bezier(0.22, 1, 0.36, 1) both;
	}

	.hero-chips span {
		padding: 0.42rem 0.8rem;
		border: 1px solid var(--border);
		border-radius: 999px;
		background: rgba(255, 255, 255, 0.025);
		color: var(--text-dim);
		font-size: 0.74rem;
		font-weight: 500;
	}

	.home-grid {
		display: grid;
		grid-template-columns: minmax(0, 1.12fr) minmax(0, 0.88fr);
		align-items: start;
		gap: 1.25rem;
		margin-top: 1.25rem;
		animation: rise 800ms 240ms cubic-bezier(0.22, 1, 0.36, 1) both;
	}

	.about-card {
		display: grid;
		align-content: start;
		gap: 0.75rem;
		padding: clamp(1.5rem, 3.5vw, 2.1rem);
	}

	.about-card h2 {
		font-size: clamp(1.35rem, 3vw, 1.75rem);
		font-weight: 600;
		letter-spacing: -0.035em;
	}

	.about-copy {
		max-width: 540px;
		color: var(--text-muted);
		font-size: 0.88rem;
		line-height: 1.65;
	}

	.feature-list {
		display: grid;
		gap: 0.65rem;
		margin-top: 0.35rem;
	}

	.feature-list li {
		display: flex;
		align-items: flex-start;
		gap: 0.8rem;
		padding: 0.75rem;
		border: 1px solid var(--border);
		border-radius: 14px;
		background: rgba(255, 255, 255, 0.02);
	}

	.feature-icon {
		display: grid;
		place-items: center;
		width: 38px;
		height: 38px;
		flex-shrink: 0;
		border-radius: 11px;
		background: var(--accent-soft);
		color: var(--accent);
	}

	.feature-list div {
		display: grid;
		gap: 0.15rem;
	}

	.feature-list strong {
		color: var(--text);
		font-size: 0.86rem;
		font-weight: 600;
	}

	.feature-list div span {
		color: var(--text-dim);
		font-size: 0.78rem;
		line-height: 1.5;
	}

	.text-link {
		display: inline-flex;
		align-items: center;
		gap: 0.4rem;
		margin-top: 0.35rem;
		color: var(--accent);
		font-size: 0.82rem;
		font-weight: 600;
		transition: gap 160ms ease;
	}

	.text-link:hover {
		gap: 0.6rem;
	}

	@keyframes rise {
		from {
			opacity: 0;
			transform: translateY(14px);
		}

		to {
			opacity: 1;
			transform: translateY(0);
		}
	}

	@media (max-width: 900px) {
		.home-grid {
			grid-template-columns: 1fr;
		}
	}

	@media (max-width: 520px) {
		.hero-chips span:nth-child(3) {
			display: none;
		}
	}
</style>
