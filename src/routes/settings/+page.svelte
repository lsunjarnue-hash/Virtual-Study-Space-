<script lang="ts">
	import { resolve } from '$app/paths';
	import SoundPicker from '#lib/components/SoundPicker.svelte';
	import { audio } from '#lib/state/audio.svelte.ts';
	import { BACKGROUNDS, preferences } from '#lib/state/preferences.svelte.ts';
	import { study } from '#lib/state/study.svelte.ts';
	import {
		ArrowLeft,
		Check,
		Clock,
		Music2,
		Palette,
		RotateCcw,
		ShieldCheck,
		Sparkles
	} from 'lucide-svelte';
	import { onDestroy, onMount } from 'svelte';

	interface Draft {
		focus: number;
		short: number;
		long: number;
		dailyGoal: number;
	}

	const defaults: Draft = { focus: 25, short: 5, long: 15, dailyGoal: 8 };

	let draft = $state<Draft>({ ...defaults });
	let saved = $state(false);
	let saveTimer: ReturnType<typeof setTimeout> | undefined;

	onMount(() => {
		preferences.init();
		audio.init();
		study.init();
		draft = {
			focus: study.durations.focus,
			short: study.durations.short,
			long: study.durations.long,
			dailyGoal: study.dailyGoal
		};
	});

	onDestroy(() => {
		if (saveTimer) clearTimeout(saveTimer);
	});

	function apply() {
		study.setDuration('focus', draft.focus);
		study.setDuration('short', draft.short);
		study.setDuration('long', draft.long);
		study.setDailyGoal(draft.dailyGoal);

		draft = {
			focus: study.durations.focus,
			short: study.durations.short,
			long: study.durations.long,
			dailyGoal: study.dailyGoal
		};

		saved = true;
		if (saveTimer) clearTimeout(saveTimer);
		saveTimer = setTimeout(() => (saved = false), 2400);
	}

	function handleSubmit(event: SubmitEvent) {
		event.preventDefault();
		apply();
	}

	function restoreDefaults() {
		draft = { ...defaults };
		apply();
	}

	function resetToday() {
		if (confirm("Reset today's sessions and focus time?")) {
			study.resetToday();
		}
	}
</script>

<svelte:head>
	<title>Settings — LOCK IN</title>
	<meta
		name="description"
		content="Customize your LOCK IN background, focus sounds, timer lengths, and daily goal."
	/>
</svelte:head>

<div class="page">
	<header class="settings-hero container">
		<p class="eyebrow"><Sparkles size={13} /> Customize</p>
		<h1>Make the space <span class="gradient-text">yours.</span></h1>
		<p class="lede">
			Change the background, choose a soundscape, and tune each session. Everything is saved to this
			device.
		</p>
	</header>

	<div class="settings-grid container">
		<div class="main-col">
			<section class="card panel" aria-labelledby="background-heading">
				<header class="panel-head">
					<span class="panel-icon" aria-hidden="true"><Palette size={18} /></span>
					<div>
						<h2 id="background-heading">Background</h2>
						<p>Tint the room to match your mood.</p>
					</div>
				</header>

				<div class="bg-grid" role="group" aria-label="Background theme">
					{#each BACKGROUNDS as background (background.id)}
						{@const active = preferences.background === background.id}
						<button
							type="button"
							class="bg-option"
							class:active
							aria-pressed={active}
							onclick={() => preferences.setBackground(background.id)}
						>
							<span class="bg-swatch" style="background: {background.preview}">
								{#if active}<span class="bg-check"><Check size={13} strokeWidth={3} /></span>{/if}
							</span>
							<span class="bg-label">{background.label}</span>
							<span class="bg-hint">{background.hint}</span>
						</button>
					{/each}
				</div>
			</section>

			<section class="card panel" aria-labelledby="sound-heading">
				<header class="panel-head">
					<span class="panel-icon" aria-hidden="true"><Music2 size={18} /></span>
					<div>
						<h2 id="sound-heading">Focus sounds</h2>
						<p>Ambient audio generated in your browser.</p>
					</div>
				</header>

				<SoundPicker />
			</section>

			<form class="card panel" onsubmit={handleSubmit}>
				<header class="panel-head">
					<span class="panel-icon" aria-hidden="true"><Clock size={18} /></span>
					<div>
						<h2>Timer &amp; goal</h2>
						<p>Choose how long each mode runs and what a good day looks like.</p>
					</div>
				</header>

				<fieldset>
					<legend>Timer lengths</legend>

					<div class="field-grid">
						<label class="field">
							<span class="field-label">Focus</span>
							<span class="input-wrap">
								<input type="number" min="1" max="180" step="1" bind:value={draft.focus} />
								<span class="unit">min</span>
							</span>
							<span class="field-hint">Deep work session</span>
						</label>

						<label class="field">
							<span class="field-label">Short break</span>
							<span class="input-wrap">
								<input type="number" min="1" max="60" step="1" bind:value={draft.short} />
								<span class="unit">min</span>
							</span>
							<span class="field-hint">Reset between sessions</span>
						</label>

						<label class="field">
							<span class="field-label">Long break</span>
							<span class="input-wrap">
								<input type="number" min="1" max="60" step="1" bind:value={draft.long} />
								<span class="unit">min</span>
							</span>
							<span class="field-hint">After a longer stretch</span>
						</label>
					</div>
				</fieldset>

				<fieldset>
					<legend>Daily goal</legend>

					<label class="field goal-field">
						<span class="field-label">Sessions per day</span>
						<span class="input-wrap">
							<input type="number" min="1" max="24" step="1" bind:value={draft.dailyGoal} />
							<span class="unit">sessions</span>
						</span>
						<span class="field-hint">A realistic target beats a perfect one.</span>
					</label>
				</fieldset>

				<div class="form-actions">
					<button class="primary" type="submit">Save changes</button>
					<button class="ghost" type="button" onclick={restoreDefaults}>
						<RotateCcw size={16} />
						Restore defaults
					</button>
					<p class="save-status" aria-live="polite">{saved ? 'Settings saved.' : ''}</p>
				</div>
			</form>
		</div>

		<aside class="side-col">
			<section class="card info-card" aria-labelledby="data-heading">
				<span class="info-icon" aria-hidden="true"><ShieldCheck size={19} /></span>
				<h2 id="data-heading">Private by default</h2>
				<p>
					Your tasks, timer settings, background, and daily progress live in your browser's local
					storage. Nothing leaves this device.
				</p>
			</section>

			<section class="card info-card" aria-labelledby="reset-heading">
				<h2 id="reset-heading">Fresh start</h2>
				<p>
					Clear today's completed sessions and focus time without touching your tasks or settings.
				</p>
				<button class="reset-button" type="button" onclick={resetToday}
					>Reset today's progress</button
				>
			</section>

			<a class="back-link" href={resolve('/focus')}>
				<ArrowLeft size={15} />
				Back to focus
			</a>
		</aside>
	</div>
</div>

<style>
	.page {
		padding-bottom: 1rem;
	}

	.settings-hero {
		display: grid;
		justify-items: center;
		gap: 1rem;
		padding: clamp(2.75rem, 7vw, 5rem) 0 clamp(2rem, 4vw, 3rem);
		text-align: center;
	}

	.settings-hero h1 {
		max-width: 820px;
		font-size: clamp(2.5rem, 6.5vw, 4.6rem);
		font-weight: 600;
		letter-spacing: -0.055em;
		line-height: 1;
		text-wrap: balance;
		animation: rise 700ms cubic-bezier(0.22, 1, 0.36, 1) both;
	}

	.lede {
		max-width: 600px;
		color: var(--text-muted);
		font-size: clamp(0.95rem, 2.2vw, 1.05rem);
		line-height: 1.7;
		text-wrap: pretty;
		animation: rise 700ms 80ms cubic-bezier(0.22, 1, 0.36, 1) both;
	}

	.settings-grid {
		display: grid;
		grid-template-columns: minmax(0, 1.3fr) minmax(0, 0.7fr);
		align-items: start;
		gap: 1.25rem;
		max-width: 1040px;
	}

	.main-col,
	.side-col {
		display: grid;
		gap: 1.25rem;
	}

	.panel {
		display: grid;
		gap: 1.35rem;
		padding: clamp(1.35rem, 3vw, 1.9rem);
	}

	.panel-head {
		display: flex;
		align-items: flex-start;
		gap: 0.8rem;
	}

	.panel-icon {
		display: grid;
		place-items: center;
		width: 40px;
		height: 40px;
		flex-shrink: 0;
		border-radius: 12px;
		background: var(--accent-soft);
		color: var(--accent);
	}

	.panel-head h2 {
		font-size: 1.02rem;
		font-weight: 600;
		letter-spacing: -0.01em;
	}

	.panel-head p {
		margin-top: 0.15rem;
		color: var(--text-dim);
		font-size: 0.8rem;
		line-height: 1.5;
	}

	.bg-grid {
		display: grid;
		grid-template-columns: repeat(3, minmax(0, 1fr));
		gap: 0.6rem;
	}

	.bg-option {
		display: grid;
		gap: 0.35rem;
		padding: 0.5rem;
		border: 1px solid var(--border);
		border-radius: 14px;
		background: rgba(255, 255, 255, 0.02);
		text-align: left;
		transition:
			border-color 160ms ease,
			background 160ms ease,
			transform 160ms ease;
	}

	.bg-option:hover {
		border-color: var(--border-strong);
		transform: translateY(-1px);
	}

	.bg-option.active {
		border-color: rgba(167, 139, 250, 0.5);
		background: var(--accent-soft);
	}

	.bg-swatch {
		position: relative;
		display: block;
		height: 58px;
		border: 1px solid rgba(255, 255, 255, 0.08);
		border-radius: 10px;
	}

	.bg-check {
		position: absolute;
		top: 5px;
		right: 5px;
		display: grid;
		place-items: center;
		width: 20px;
		height: 20px;
		border-radius: 50%;
		background: rgba(10, 7, 16, 0.8);
		color: var(--accent);
	}

	.bg-label {
		color: var(--text);
		font-size: 0.8rem;
		font-weight: 600;
	}

	.bg-hint {
		color: var(--text-dim);
		font-size: 0.68rem;
	}

	fieldset {
		min-width: 0;
		margin: 0;
		padding: 0;
		border: 0;
	}

	legend {
		margin-bottom: 0.7rem;
		padding: 0;
		color: var(--text-muted);
		font-size: 0.8rem;
		font-weight: 600;
	}

	.field-grid {
		display: grid;
		grid-template-columns: repeat(3, minmax(0, 1fr));
		gap: 0.8rem;
	}

	.field {
		display: grid;
		gap: 0.4rem;
	}

	.field-label {
		color: var(--text-muted);
		font-size: 0.78rem;
		font-weight: 500;
	}

	.input-wrap {
		display: flex;
		align-items: center;
		gap: 0.4rem;
		padding: 0 0.75rem;
		border: 1px solid var(--border);
		border-radius: 12px;
		background: rgba(255, 255, 255, 0.035);
		transition:
			border-color 180ms ease,
			box-shadow 180ms ease;
	}

	.input-wrap:focus-within {
		border-color: rgba(167, 139, 250, 0.5);
		box-shadow: 0 0 0 4px rgba(139, 92, 246, 0.1);
	}

	.input-wrap input {
		width: 100%;
		min-width: 0;
		padding: 0.68rem 0;
		border: 0;
		background: transparent;
		color: var(--text);
		font-size: 0.92rem;
		font-variant-numeric: tabular-nums;
		outline: none;
	}

	.unit {
		flex-shrink: 0;
		color: var(--text-dim);
		font-size: 0.7rem;
	}

	.field-hint {
		color: var(--text-dim);
		font-size: 0.68rem;
	}

	.goal-field {
		max-width: 260px;
	}

	.form-actions {
		display: flex;
		align-items: center;
		flex-wrap: wrap;
		gap: 0.7rem;
		padding-top: 1.15rem;
		border-top: 1px solid var(--border);
	}

	.primary {
		padding: 0.8rem 1.4rem;
		border: 0;
		border-radius: 999px;
		background: linear-gradient(135deg, #b79cff, var(--accent-strong) 55%, var(--accent-deep));
		color: #fff;
		font-size: 0.86rem;
		font-weight: 600;
		box-shadow: 0 16px 34px -16px rgba(109, 63, 240, 0.9);
		transition: transform 180ms ease;
	}

	.primary:hover {
		transform: translateY(-1px);
	}

	.ghost {
		display: inline-flex;
		align-items: center;
		gap: 0.4rem;
		padding: 0.76rem 1.1rem;
		border: 1px solid var(--border-strong);
		border-radius: 999px;
		background: rgba(255, 255, 255, 0.035);
		color: var(--text-muted);
		font-size: 0.82rem;
		transition:
			background 180ms ease,
			color 180ms ease;
	}

	.ghost:hover {
		background: rgba(255, 255, 255, 0.06);
		color: var(--text);
	}

	.save-status {
		min-height: 1.2rem;
		margin-left: auto;
		color: var(--accent);
		font-size: 0.76rem;
		font-weight: 500;
	}

	.info-card {
		display: grid;
		gap: 0.6rem;
		padding: 1.4rem;
	}

	.info-card h2 {
		font-size: 0.95rem;
		font-weight: 600;
		letter-spacing: -0.01em;
	}

	.info-card p {
		color: var(--text-muted);
		font-size: 0.8rem;
		line-height: 1.6;
	}

	.info-icon {
		display: grid;
		place-items: center;
		width: 40px;
		height: 40px;
		border-radius: 12px;
		background: var(--accent-soft);
		color: var(--accent);
	}

	.reset-button {
		justify-self: start;
		margin-top: 0.2rem;
		padding: 0.55rem 0.9rem;
		border: 1px solid rgba(251, 113, 133, 0.24);
		border-radius: 999px;
		background: rgba(251, 113, 133, 0.06);
		color: #fda4af;
		font-size: 0.76rem;
		transition: background 160ms ease;
	}

	.reset-button:hover {
		background: rgba(251, 113, 133, 0.12);
	}

	.back-link {
		display: inline-flex;
		align-items: center;
		gap: 0.4rem;
		padding: 0.25rem 0.15rem;
		color: var(--text-dim);
		font-size: 0.8rem;
		transition: color 160ms ease;
	}

	.back-link:hover {
		color: var(--text-muted);
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
		.settings-grid {
			grid-template-columns: 1fr;
		}

		.field-grid {
			grid-template-columns: 1fr;
		}

		.save-status {
			margin-left: 0;
		}

		.bg-grid {
			grid-template-columns: repeat(2, minmax(0, 1fr));
		}
	}

	@media (max-width: 520px) {
		.bg-grid {
			grid-template-columns: 1fr;
		}

		.form-actions {
			align-items: stretch;
		}

		.primary,
		.ghost {
			justify-content: center;
		}
	}
</style>
