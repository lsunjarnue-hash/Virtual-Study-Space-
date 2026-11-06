<script lang="ts">
	import { study } from '#lib/state/study.svelte.ts';
	import StatTile from './StatTile.svelte';
	import { Clock, Flame, ListChecks } from 'lucide-svelte';

	function formatMinutes(total: number) {
		const hours = Math.floor(total / 60);
		const minutes = total % 60;
		if (hours > 0) return `${hours}h ${minutes}m`;
		return `${minutes}m`;
	}

	const focusTime = $derived(formatMinutes(study.focusMinutes));
	const completedTasks = $derived(study.tasks.filter((task) => task.done).length);
	const goalPercent = $derived(
		study.dailyGoal > 0
			? Math.min(100, Math.round((study.completedSessions / study.dailyGoal) * 100))
			: 0
	);
	const remainingSessions = $derived(Math.max(0, study.dailyGoal - study.completedSessions));

	const goalNote = $derived(
		study.completedSessions >= study.dailyGoal
			? 'Daily goal reached. Protect the momentum.'
			: study.completedSessions > 0
				? `${remainingSessions} more ${remainingSessions === 1 ? 'session' : 'sessions'} to hit today's goal.`
				: 'One focused session is enough to start.'
	);
</script>

<section class="stats-card card" aria-labelledby="stats-heading">
	<header class="stats-head">
		<div>
			<p class="eyebrow">Today</p>
			<h2 id="stats-heading">Daily progress</h2>
		</div>
		<span class="goal-percent">{goalPercent}%</span>
	</header>

	<div class="goal">
		<div class="goal-row">
			<p class="goal-value">
				{study.completedSessions}<span> / {study.dailyGoal} sessions</span>
			</p>
			<p class="goal-caption">goal</p>
		</div>
		<div
			class="progress-track"
			role="progressbar"
			aria-label="Daily session goal"
			aria-valuemin={0}
			aria-valuemax={study.dailyGoal}
			aria-valuenow={Math.min(study.completedSessions, study.dailyGoal)}
		>
			<span class="progress-fill" style="width: {goalPercent}%"></span>
		</div>
	</div>

	<div class="stat-grid">
		<StatTile label="Focus time" value={focusTime} hint="logged today">
			{#snippet icon()}<Clock size={17} />{/snippet}
		</StatTile>

		<StatTile
			label="Sessions"
			value={String(study.completedSessions)}
			hint="{study.dailyGoal} session goal"
		>
			{#snippet icon()}<Flame size={17} />{/snippet}
		</StatTile>

		<StatTile
			label="Tasks done"
			value="{completedTasks} / {study.tasks.length}"
			hint="across your checklist"
		>
			{#snippet icon()}<ListChecks size={17} />{/snippet}
		</StatTile>
	</div>

	<p class="goal-note">
		<Flame size={14} strokeWidth={2.2} aria-hidden="true" />
		{goalNote}
	</p>
</section>

<style>
	.stats-card {
		display: flex;
		flex-direction: column;
		gap: 1.35rem;
		padding: clamp(1.35rem, 3vw, 1.85rem);
	}

	.stats-head {
		display: flex;
		align-items: flex-start;
		justify-content: space-between;
		gap: 1rem;
	}

	.stats-head h2 {
		margin-top: 0.2rem;
		font-size: 1.15rem;
		font-weight: 600;
		letter-spacing: -0.02em;
	}

	.goal-percent {
		display: grid;
		place-items: center;
		min-width: 62px;
		padding: 0.4rem 0.65rem;
		border: 1px solid rgba(167, 139, 250, 0.22);
		border-radius: 12px;
		background: var(--accent-soft);
		color: var(--accent);
		font-size: 0.82rem;
		font-weight: 700;
		font-variant-numeric: tabular-nums;
	}

	.goal {
		display: grid;
		gap: 0.65rem;
	}

	.goal-row {
		display: flex;
		align-items: baseline;
		justify-content: space-between;
		gap: 1rem;
	}

	.goal-value {
		color: var(--text);
		font-size: 2rem;
		font-weight: 600;
		letter-spacing: -0.04em;
		line-height: 1;
		font-variant-numeric: tabular-nums;
	}

	.goal-value span {
		color: var(--text-dim);
		font-size: 0.85rem;
		font-weight: 500;
		letter-spacing: 0;
	}

	.goal-caption {
		color: var(--text-dim);
		font-size: 0.72rem;
		font-weight: 600;
		letter-spacing: 0.12em;
		text-transform: uppercase;
	}

	.progress-track {
		position: relative;
		height: 8px;
		overflow: hidden;
		border-radius: 999px;
		background: rgba(255, 255, 255, 0.055);
	}

	.progress-fill {
		display: block;
		height: 100%;
		border-radius: inherit;
		background: linear-gradient(90deg, var(--accent-strong), var(--accent));
		box-shadow: 0 0 18px rgba(139, 92, 246, 0.55);
		transition: width 500ms cubic-bezier(0.22, 1, 0.36, 1);
	}

	.stat-grid {
		display: grid;
		gap: 0.5rem;
	}

	.goal-note {
		display: flex;
		align-items: flex-start;
		gap: 0.5rem;
		padding-top: 0.9rem;
		border-top: 1px solid var(--border);
		color: var(--text-dim);
		font-size: 0.78rem;
		line-height: 1.5;
	}

	.goal-note :global(svg) {
		flex-shrink: 0;
		margin-top: 0.15rem;
		color: var(--accent);
	}
</style>
