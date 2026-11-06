<script lang="ts">
	import type { Snippet } from 'svelte';

	let {
		label,
		value,
		hint = '',
		icon
	}: {
		label: string;
		value: string;
		hint?: string;
		icon: Snippet;
	} = $props();
</script>

<div class="stat-tile">
	<span class="stat-icon" aria-hidden="true">
		{@render icon()}
	</span>
	<div class="stat-body">
		<p class="stat-label">{label}</p>
		<p class="stat-value">{value}</p>
		{#if hint}<p class="stat-hint">{hint}</p>{/if}
	</div>
</div>

<style>
	.stat-tile {
		display: flex;
		align-items: center;
		gap: 0.8rem;
		padding: 0.7rem 0.75rem;
		border: 1px solid var(--border);
		border-radius: 14px;
		background: rgba(255, 255, 255, 0.025);
		transition:
			background 160ms ease,
			border-color 160ms ease;
	}

	.stat-tile:hover {
		background: rgba(255, 255, 255, 0.045);
		border-color: var(--border-strong);
	}

	.stat-icon {
		display: grid;
		place-items: center;
		width: 36px;
		height: 36px;
		flex-shrink: 0;
		border-radius: 11px;
		background: var(--accent-soft);
		color: var(--accent);
	}

	.stat-body {
		display: grid;
		grid-template-columns: 1fr auto;
		align-items: baseline;
		gap: 0.1rem 0.5rem;
		flex: 1;
		min-width: 0;
	}

	.stat-label {
		color: var(--text-muted);
		font-size: 0.78rem;
		font-weight: 500;
	}

	.stat-value {
		color: var(--text);
		font-size: 0.95rem;
		font-weight: 650;
		font-variant-numeric: tabular-nums;
	}

	.stat-hint {
		grid-column: 1 / -1;
		color: var(--text-dim);
		font-size: 0.7rem;
	}
</style>
