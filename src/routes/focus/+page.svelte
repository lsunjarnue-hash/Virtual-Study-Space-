<script lang="ts">
	import FocusTimer from '#lib/components/FocusTimer.svelte';
	import TaskManager from '#lib/components/TaskManager.svelte';
	import { Sparkles } from 'lucide-svelte';
</script>

<svelte:head>
	<title>Focus — LOCK IN</title>
	<meta
		name="description"
		content="Start a focused Pomodoro session and keep your study tasks close at hand."
	/>
</svelte:head>

<div class="page">
	<header class="focus-head container">
		<div>
			<p class="eyebrow"><Sparkles size={13} /> Focus room</p>
			<h1>One thing at a time.</h1>
		</div>
		<p class="head-note">
			Press start to enter the full-screen timer. Your task list stays right here when you come
			back.
		</p>
	</header>

	<div class="focus-grid container">
		<FocusTimer />
		<TaskManager />
	</div>
</div>

<style>
	.page {
		padding-bottom: 1rem;
	}

	.focus-head {
		display: flex;
		align-items: flex-end;
		justify-content: space-between;
		gap: 2rem;
		padding: clamp(2.25rem, 5vw, 3.5rem) 0 clamp(1.5rem, 3vw, 2rem);
	}

	.focus-head h1 {
		margin-top: 0.35rem;
		font-size: clamp(2rem, 5vw, 3.4rem);
		font-weight: 600;
		letter-spacing: -0.055em;
		line-height: 1;
		animation: rise 650ms cubic-bezier(0.22, 1, 0.36, 1) both;
	}

	.head-note {
		max-width: 320px;
		padding-bottom: 0.2rem;
		color: var(--text-dim);
		font-size: 0.82rem;
		line-height: 1.6;
		text-align: right;
		animation: rise 650ms 80ms cubic-bezier(0.22, 1, 0.36, 1) both;
	}

	.focus-grid {
		display: grid;
		grid-template-columns: minmax(0, 1.08fr) minmax(0, 0.92fr);
		align-items: start;
		gap: 1.25rem;
		animation: rise 750ms 130ms cubic-bezier(0.22, 1, 0.36, 1) both;
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

	@media (max-width: 980px) {
		.focus-head {
			flex-direction: column;
			align-items: flex-start;
			gap: 0.85rem;
		}

		.head-note {
			max-width: 520px;
			text-align: left;
		}

		.focus-grid {
			grid-template-columns: 1fr;
		}
	}
</style>
