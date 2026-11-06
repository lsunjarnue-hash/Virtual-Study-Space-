<script lang="ts">
	import { audio } from '#lib/state/audio.svelte.ts';
	import { MODE_LABELS, study, type TimerMode } from '#lib/state/study.svelte.ts';
	import { Maximize, Music2, Pause, Play, RotateCcw, X } from 'lucide-svelte';

	const modes: TimerMode[] = ['focus', 'short', 'long'];
	const radius = 140;
	const circumference = 2 * Math.PI * radius;

	let immersive = $state(false);

	function portal(node: HTMLElement) {
		document.body.appendChild(node);

		return () => node.remove();
	}

	const dashOffset = $derived(circumference * (1 - study.remainingFraction));

	const sessionLabel = $derived(
		study.completedSessions >= study.dailyGoal
			? 'Daily goal reached'
			: `${study.completedSessions} / ${study.dailyGoal} sessions`
	);

	const status = $derived(
		study.sessionComplete
			? study.mode === 'focus'
				? 'Focus session logged. Take a breath and reset.'
				: 'Break complete. Ready for another round?'
			: study.running
				? 'Deep work in progress. Stay with it.'
				: 'Pick a mode, start the clock, and let the rest wait.'
	);

	function startFocusMode() {
		if (!study.running) study.start();
		immersive = true;
	}

	function toggleSound() {
		if (audio.track === 'none') {
			void audio.play('lofi');
		} else {
			audio.toggle();
		}
	}

	$effect(() => {
		const base = 'LOCK IN — Study Timer';
		const next = study.running ? `${study.formattedTime} · LOCK IN` : base;
		document.title = next;

		return () => {
			if (document.title === next) document.title = base;
		};
	});

	$effect(() => {
		if (!immersive || typeof document === 'undefined') return;

		const previous = document.body.style.overflow;
		document.body.style.overflow = 'hidden';

		return () => {
			document.body.style.overflow = previous;
		};
	});
</script>

<svelte:window
	onkeydown={(event) => {
		if (event.key === 'Escape') immersive = false;
	}}
/>

{#snippet timerRing()}
	<div class="timer-ring" class:complete={study.sessionComplete}>
		<svg viewBox="0 0 320 320" aria-hidden="true">
			<defs>
				<linearGradient id="ring-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
					<stop offset="0%" stop-color="#d3c5ff" />
					<stop offset="52%" stop-color="#8b5cf6" />
					<stop offset="100%" stop-color="#6d3ff0" />
				</linearGradient>
			</defs>
			<circle class="ring-track" cx="160" cy="160" r={radius} />
			<circle
				class="ring-progress"
				cx="160"
				cy="160"
				r={radius}
				style="stroke-dasharray: {circumference}; stroke-dashoffset: {dashOffset}"
			/>
		</svg>

		<div class="timer-center">
			<span class="timer-time" role="timer" aria-label="{study.formattedTime} remaining">
				{study.formattedTime}
			</span>
			<span class="timer-caption">
				{study.running
					? 'focus in progress'
					: study.sessionComplete
						? 'session complete'
						: 'ready to focus'}
			</span>
		</div>
	</div>
{/snippet}

<section class="timer-card" aria-labelledby="timer-heading">
	<div class="timer-head">
		<div>
			<p class="eyebrow">Pomodoro</p>
			<h2 id="timer-heading">{study.modeLabel}</h2>
		</div>
		<span class="session-pill">{sessionLabel}</span>
	</div>

	<div class="modes" role="group" aria-label="Timer mode">
		{#each modes as mode (mode)}
			<button
				type="button"
				class="mode"
				class:active={study.mode === mode}
				aria-pressed={study.mode === mode}
				onclick={() => study.setMode(mode)}
			>
				{MODE_LABELS[mode]}
			</button>
		{/each}
	</div>

	{@render timerRing()}

	<p class="status" aria-live="polite">{status}</p>

	<div class="controls">
		<button
			class="control primary"
			type="button"
			onclick={() => (study.running ? study.pause() : startFocusMode())}
			aria-label={study.running ? 'Pause timer' : 'Start timer in focus mode'}
		>
			{#if study.running}
				<Pause size={19} strokeWidth={2.2} />
				Pause
			{:else}
				<Play size={19} strokeWidth={2.2} />
				Start
			{/if}
		</button>

		{#if study.running}
			<button class="control ghost" type="button" onclick={() => (immersive = true)}>
				<Maximize size={18} />
				Focus mode
			</button>
		{/if}

		<button class="control ghost" type="button" onclick={() => study.reset()}>
			<RotateCcw size={18} />
			Reset
		</button>
	</div>
</section>

{#if immersive}
	<div class="immersive" role="dialog" aria-modal="true" aria-label="Focus mode" {@attach portal}>
		<div class="immersive-top">
			<div class="immersive-heading">
				<p class="eyebrow">Focus mode</p>
				<span class="immersive-mode">{study.modeLabel}</span>
			</div>

			<div class="immersive-tools">
				<button
					class="tool"
					class:playing={audio.playing}
					type="button"
					onclick={toggleSound}
					aria-label={audio.playing ? 'Pause ambient sound' : 'Play ambient sound'}
				>
					<Music2 size={18} />
				</button>

				<button class="tool exit" type="button" onclick={() => (immersive = false)}>
					<X size={17} />
					Exit
				</button>
			</div>
		</div>

		<div class="immersive-stage">
			{@render timerRing()}

			<div class="immersive-copy">
				<p class="immersive-session">{sessionLabel}</p>
				<p class="immersive-status">{status}</p>
			</div>
		</div>

		<div class="immersive-controls">
			<button class="control ghost" type="button" onclick={() => study.reset()}>
				<RotateCcw size={18} />
				Reset
			</button>

			<button
				class="control primary immersive-primary"
				type="button"
				onclick={() => (study.running ? study.pause() : study.start())}
				aria-label={study.running ? 'Pause timer' : 'Start timer'}
			>
				{#if study.running}
					<Pause size={20} strokeWidth={2.2} />
					Pause
				{:else if study.sessionComplete}
					<Play size={20} strokeWidth={2.2} />
					Start again
				{:else}
					<Play size={20} strokeWidth={2.2} />
					Start
				{/if}
			</button>
		</div>
	</div>
{/if}

<style>
	.timer-card {
		position: relative;
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 1.75rem;
		width: 100%;
		max-width: 720px;
		margin-inline: auto;
		padding: clamp(1.35rem, 3.5vw, 2.5rem);
		border: 1px solid var(--border);
		border-radius: var(--radius-xl);
		background:
			radial-gradient(120% 90% at 50% 0%, rgba(139, 92, 246, 0.11), transparent 58%),
			linear-gradient(180deg, rgba(255, 255, 255, 0.035), transparent 42%), var(--surface);
		box-shadow:
			var(--shadow-card),
			inset 0 1px 0 rgba(255, 255, 255, 0.06);
		backdrop-filter: blur(18px);
		overflow: hidden;
	}

	.timer-card::before {
		content: '';
		position: absolute;
		top: -180px;
		left: 50%;
		width: 420px;
		height: 420px;
		border-radius: 50%;
		background: radial-gradient(circle, rgba(139, 92, 246, 0.18), transparent 68%);
		transform: translateX(-50%);
		pointer-events: none;
	}

	.timer-head {
		position: relative;
		z-index: 1;
		display: flex;
		align-items: flex-start;
		justify-content: space-between;
		gap: 1rem;
		width: 100%;
	}

	.timer-head h2 {
		margin-top: 0.15rem;
		font-size: 1.05rem;
		font-weight: 600;
		letter-spacing: -0.01em;
	}

	.session-pill {
		flex-shrink: 0;
		padding: 0.4rem 0.7rem;
		border: 1px solid var(--border);
		border-radius: 999px;
		background: rgba(255, 255, 255, 0.03);
		color: var(--text-muted);
		font-size: 0.72rem;
		font-weight: 600;
		letter-spacing: 0.04em;
	}

	.modes {
		position: relative;
		z-index: 1;
		display: flex;
		gap: 0.25rem;
		width: min(100%, 440px);
		padding: 0.3rem;
		border: 1px solid var(--border);
		border-radius: 999px;
		background: rgba(255, 255, 255, 0.025);
	}

	.mode {
		flex: 1;
		padding: 0.55rem 0.5rem;
		border: 0;
		border-radius: 999px;
		background: transparent;
		color: var(--text-muted);
		font-size: clamp(0.74rem, 2.4vw, 0.84rem);
		font-weight: 600;
		white-space: nowrap;
		transition:
			color 180ms ease,
			background 180ms ease,
			box-shadow 180ms ease;
	}

	.mode:hover {
		color: var(--text);
	}

	.mode.active {
		background: linear-gradient(180deg, rgba(167, 139, 250, 0.26), rgba(139, 92, 246, 0.14));
		color: #ede9fe;
		box-shadow: inset 0 0 0 1px rgba(196, 181, 253, 0.22);
	}

	.timer-ring {
		position: relative;
		z-index: 1;
		width: min(360px, 78vw);
		aspect-ratio: 1;
	}

	.timer-ring svg {
		width: 100%;
		height: 100%;
		transform: rotate(-90deg);
	}

	.ring-track,
	.ring-progress {
		fill: none;
		stroke-width: 9;
	}

	.ring-track {
		stroke: rgba(255, 255, 255, 0.06);
	}

	.ring-progress {
		stroke: url(#ring-gradient);
		stroke-linecap: round;
		transition: stroke-dashoffset 420ms linear;
		filter: drop-shadow(0 0 14px rgba(139, 92, 246, 0.45));
	}

	.timer-ring.complete .ring-progress {
		animation: ring-pulse 1.6s ease-in-out infinite;
	}

	.timer-center {
		position: absolute;
		inset: 0;
		display: grid;
		place-content: center;
		justify-items: center;
		gap: 0.35rem;
		text-align: center;
	}

	.timer-time {
		font-size: clamp(3.4rem, 9vw, 5.1rem);
		font-weight: 600;
		letter-spacing: -0.055em;
		line-height: 1;
		font-variant-numeric: tabular-nums;
		text-shadow: 0 0 40px rgba(167, 139, 250, 0.2);
	}

	.timer-caption {
		color: var(--text-dim);
		font-size: 0.7rem;
		font-weight: 600;
		letter-spacing: 0.16em;
		text-transform: uppercase;
	}

	.status {
		position: relative;
		z-index: 1;
		min-height: 1.5rem;
		color: var(--text-muted);
		font-size: 0.86rem;
		text-align: center;
	}

	.controls {
		position: relative;
		z-index: 1;
		display: flex;
		flex-wrap: wrap;
		justify-content: center;
		gap: 0.7rem;
		width: 100%;
	}

	.control {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		gap: 0.5rem;
		min-width: 118px;
		padding: 0.85rem 1.35rem;
		border-radius: 999px;
		font-size: 0.92rem;
		font-weight: 600;
		transition:
			transform 180ms ease,
			box-shadow 180ms ease,
			background 180ms ease,
			opacity 180ms ease;
	}

	.control:hover:not(:disabled) {
		transform: translateY(-1px);
	}

	.control:active:not(:disabled) {
		transform: translateY(0);
	}

	.control:disabled {
		cursor: not-allowed;
		opacity: 0.4;
		box-shadow: none;
	}

	.primary {
		border: 0;
		background: linear-gradient(135deg, #b79cff, var(--accent-strong) 52%, var(--accent-deep));
		color: #fff;
		box-shadow:
			0 18px 38px -18px rgba(109, 63, 240, 0.9),
			inset 0 1px 0 rgba(255, 255, 255, 0.28);
	}

	.primary:hover:not(:disabled) {
		box-shadow:
			0 22px 46px -18px rgba(139, 92, 246, 0.95),
			inset 0 1px 0 rgba(255, 255, 255, 0.32);
	}

	.ghost {
		border: 1px solid var(--border-strong);
		background: rgba(255, 255, 255, 0.035);
		color: var(--text-muted);
	}

	.ghost:hover {
		background: rgba(255, 255, 255, 0.06);
		color: var(--text);
	}

	.immersive {
		position: fixed;
		inset: 0;
		z-index: 200;
		display: flex;
		flex-direction: column;
		gap: 1.5rem;
		height: 100dvh;
		padding: clamp(1.1rem, 3vw, 2.2rem);
		background:
			radial-gradient(120% 100% at 50% 0%, var(--glow-1), transparent 62%),
			radial-gradient(90% 80% at 100% 100%, var(--glow-2), transparent 58%), var(--bg);
		overflow: hidden;
		overscroll-behavior: contain;
		animation: immersive-in 260ms ease both;
	}

	.immersive::before {
		content: '';
		position: absolute;
		inset: 0;
		pointer-events: none;
		background-image:
			linear-gradient(var(--grid-color) 1px, transparent 1px),
			linear-gradient(90deg, var(--grid-color) 1px, transparent 1px);
		background-size: 72px 72px;
		-webkit-mask-image: radial-gradient(ellipse 70% 60% at 50% 40%, black, transparent 78%);
		mask-image: radial-gradient(ellipse 70% 60% at 50% 40%, black, transparent 78%);
	}

	.immersive-top {
		position: relative;
		z-index: 1;
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 1rem;
	}

	.immersive-heading {
		display: grid;
		gap: 0.15rem;
	}

	.immersive-mode {
		color: var(--text);
		font-size: 0.95rem;
		font-weight: 600;
		letter-spacing: -0.01em;
	}

	.immersive-tools {
		display: flex;
		align-items: center;
		gap: 0.5rem;
	}

	.tool {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		gap: 0.4rem;
		height: 42px;
		padding: 0 0.9rem;
		border: 1px solid var(--border);
		border-radius: 12px;
		background: rgba(255, 255, 255, 0.04);
		color: var(--text-muted);
		font-size: 0.82rem;
		font-weight: 600;
		transition:
			background 160ms ease,
			border-color 160ms ease,
			color 160ms ease;
	}

	.tool:hover {
		border-color: var(--border-strong);
		background: rgba(255, 255, 255, 0.08);
		color: var(--text);
	}

	.tool.playing {
		border-color: rgba(167, 139, 250, 0.4);
		background: var(--accent-soft);
		color: var(--accent);
	}

	.immersive-stage {
		position: relative;
		z-index: 1;
		display: grid;
		justify-items: center;
		align-content: center;
		gap: clamp(1rem, 2.5vw, 1.75rem);
		flex: 1;
		min-height: 0;
	}

	.immersive .timer-ring {
		width: min(560px, 82vmin, 52dvh);
	}

	.immersive .timer-time {
		font-size: clamp(4rem, 14vmin, 7.5rem);
	}

	.immersive .timer-caption {
		font-size: 0.78rem;
	}

	.immersive-copy {
		display: grid;
		gap: 0.35rem;
		text-align: center;
	}

	.immersive-session {
		color: var(--accent);
		font-size: 0.72rem;
		font-weight: 700;
		letter-spacing: 0.18em;
		text-transform: uppercase;
	}

	.immersive-status {
		color: var(--text-muted);
		font-size: clamp(0.85rem, 1.8vw, 1rem);
	}

	.immersive-controls {
		position: relative;
		z-index: 1;
		display: flex;
		justify-content: center;
		flex-wrap: wrap;
		gap: 0.7rem;
		padding-bottom: 0.25rem;
	}

	.immersive .control {
		min-width: 152px;
	}

	.immersive-primary {
		min-width: 184px;
	}

	@keyframes immersive-in {
		from {
			opacity: 0;
		}

		to {
			opacity: 1;
		}
	}

	@keyframes ring-pulse {
		0%,
		100% {
			opacity: 0.45;
		}

		50% {
			opacity: 1;
		}
	}

	@media (max-width: 520px) {
		.timer-head {
			flex-direction: column;
			align-items: flex-start;
		}

		.session-pill {
			align-self: flex-start;
		}

		.status {
			font-size: 0.8rem;
		}

		.control {
			flex: 1;
			min-width: 0;
			padding-inline: 1rem;
		}

		.immersive {
			padding: 1rem;
			gap: 1rem;
		}

		.immersive .timer-ring {
			width: min(78vmin, 340px, 52dvh);
		}

		.immersive .control {
			flex: 1;
			min-width: 0;
		}

		.immersive-primary {
			min-width: 0;
		}
	}

	@media (max-height: 680px) {
		.immersive {
			gap: 0.75rem;
			padding-block: 0.9rem;
		}

		.immersive-stage {
			gap: 0.5rem;
		}

		.immersive .timer-ring {
			width: min(420px, 70vmin, 56dvh);
		}

		.immersive .timer-time {
			font-size: clamp(2.4rem, 10vmin, 4.25rem);
		}
	}

	@media (max-height: 560px) {
		.immersive {
			gap: 0.5rem;
		}

		.immersive-copy {
			display: none;
		}

		.immersive .timer-ring {
			width: min(360px, 62vmin, 64dvh);
		}

		.immersive .timer-time {
			font-size: clamp(2rem, 9vmin, 3.25rem);
		}
	}
</style>
