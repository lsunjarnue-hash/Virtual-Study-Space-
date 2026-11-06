<script lang="ts">
	import { audio } from '#lib/state/audio.svelte.ts';
	import { Music2 } from 'lucide-svelte';
	import SoundPicker from './SoundPicker.svelte';

	let open = $state(false);
	let root: HTMLDivElement | undefined = $state();

	function handleWindowClick(event: MouseEvent) {
		if (!open) return;
		if (root && !root.contains(event.target as Node)) open = false;
	}
</script>

<svelte:window
	onclick={handleWindowClick}
	onkeydown={(event) => {
		if (event.key === 'Escape') open = false;
	}}
/>

<div class="sound-menu" bind:this={root}>
	<button
		class="sound-toggle"
		class:playing={audio.playing}
		type="button"
		aria-label={audio.playing
			? `Now playing ${audio.currentLabel}. Open focus sounds.`
			: 'Open focus sounds'}
		aria-expanded={open}
		onclick={(event) => {
			event.stopPropagation();
			open = !open;
		}}
	>
		<Music2 size={18} strokeWidth={2.1} />
		<span class="sound-dot" aria-hidden="true"></span>
	</button>

	{#if open}
		<div class="sound-popover" role="dialog" aria-label="Focus sounds">
			<SoundPicker compact />
		</div>
	{/if}
</div>

<style>
	.sound-menu {
		position: relative;
	}

	.sound-toggle {
		position: relative;
		display: grid;
		place-items: center;
		width: 40px;
		height: 40px;
		border: 1px solid var(--border);
		border-radius: 12px;
		background: rgba(255, 255, 255, 0.04);
		color: var(--text-muted);
		transition:
			color 160ms ease,
			background 160ms ease,
			border-color 160ms ease;
	}

	.sound-toggle:hover {
		border-color: var(--border-strong);
		background: rgba(255, 255, 255, 0.07);
		color: var(--text);
	}

	.sound-toggle.playing {
		border-color: rgba(167, 139, 250, 0.4);
		background: var(--accent-soft);
		color: var(--accent);
	}

	.sound-dot {
		position: absolute;
		right: 8px;
		bottom: 8px;
		width: 6px;
		height: 6px;
		border-radius: 50%;
		background: var(--text-dim);
		transition: background 160ms ease;
	}

	.sound-toggle.playing .sound-dot {
		background: var(--accent);
		box-shadow: 0 0 8px var(--accent);
		animation: sound-pulse 1.6s ease-in-out infinite;
	}

	.sound-popover {
		position: absolute;
		top: calc(100% + 0.6rem);
		right: 0;
		z-index: 60;
		width: min(330px, calc(100vw - 1.75rem));
		padding: 1rem;
		border: 1px solid var(--border);
		border-radius: 20px;
		background: var(--surface-solid);
		box-shadow: 0 28px 70px -28px rgba(0, 0, 0, 0.95);
		animation: pop-in 160ms ease both;
	}

	@keyframes sound-pulse {
		0%,
		100% {
			opacity: 0.55;
		}

		50% {
			opacity: 1;
		}
	}

	@keyframes pop-in {
		from {
			opacity: 0;
			transform: translateY(-6px);
		}

		to {
			opacity: 1;
			transform: translateY(0);
		}
	}

	@media (max-width: 520px) {
		.sound-popover {
			position: fixed;
			top: 72px;
			left: 0.875rem;
			right: 0.875rem;
			width: auto;
		}
	}
</style>
