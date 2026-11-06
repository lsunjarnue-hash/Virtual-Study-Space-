<script lang="ts">
	import { SOUNDS } from '#lib/audio/soundscape.ts';
	import { audio } from '#lib/state/audio.svelte.ts';
	import { AudioLines, CloudRain, Disc3, Piano, Volume2, VolumeX, Waves } from 'lucide-svelte';

	let { compact = false }: { compact?: boolean } = $props();
</script>

<div class="sound-picker" class:compact>
	<div class="sound-head">
		<div>
			<p class="sound-eyebrow">Soundscape</p>
			<p class="sound-title">{audio.playing ? `${audio.currentLabel} playing` : 'Set the mood'}</p>
		</div>
		{#if audio.playing}
			<button class="sound-stop" type="button" onclick={() => audio.pause()}>Stop</button>
		{/if}
	</div>

	<div class="sound-grid" role="group" aria-label="Ambient sound">
		<button
			type="button"
			class="sound-option"
			class:active={!audio.playing}
			aria-pressed={!audio.playing}
			onclick={() => audio.pause()}
		>
			<span class="sound-icon"><VolumeX size={18} /></span>
			<span class="sound-copy">
				<span class="sound-name">Silence</span>
				<span class="sound-desc">No ambient sound</span>
			</span>
		</button>

		{#each SOUNDS as sound (sound.id)}
			{@const active = audio.playing && audio.track === sound.id}
			<button
				type="button"
				class="sound-option"
				class:active
				aria-pressed={active}
				onclick={() => audio.toggle(sound.id)}
			>
				<span class="sound-icon">
					{#if sound.id === 'lofi'}
						<Disc3 size={18} />
					{:else if sound.id === 'piano'}
						<Piano size={18} />
					{:else if sound.id === 'rain'}
						<CloudRain size={18} />
					{:else if sound.id === 'ocean'}
						<Waves size={18} />
					{:else}
						<AudioLines size={18} />
					{/if}
				</span>
				<span class="sound-copy">
					<span class="sound-name">{sound.label}</span>
					<span class="sound-desc">{sound.description}</span>
				</span>
				{#if active}
					<span class="playing-bars" aria-hidden="true"><i></i><i></i><i></i></span>
				{/if}
			</button>
		{/each}
	</div>

	<label class="volume">
		<Volume2 size={16} />
		<input
			type="range"
			min="0"
			max="100"
			step="1"
			value={Math.round(audio.volume * 100)}
			oninput={(event) =>
				audio.setVolume(Number((event.currentTarget as HTMLInputElement).value) / 100)}
			aria-label="Ambient volume"
		/>
		<span class="volume-value">{Math.round(audio.volume * 100)}%</span>
	</label>
</div>

<style>
	.sound-picker {
		display: grid;
		gap: 1rem;
	}

	.sound-head {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 0.75rem;
	}

	.sound-eyebrow {
		color: var(--text-dim);
		font-size: 0.66rem;
		font-weight: 700;
		letter-spacing: 0.16em;
		text-transform: uppercase;
	}

	.sound-title {
		color: var(--text);
		font-size: 0.9rem;
		font-weight: 600;
		letter-spacing: -0.01em;
	}

	.sound-stop {
		flex-shrink: 0;
		padding: 0.35rem 0.7rem;
		border: 1px solid var(--border);
		border-radius: 999px;
		background: rgba(255, 255, 255, 0.04);
		color: var(--text-muted);
		font-size: 0.72rem;
		font-weight: 600;
		transition:
			background 160ms ease,
			color 160ms ease;
	}

	.sound-stop:hover {
		background: rgba(255, 255, 255, 0.08);
		color: var(--text);
	}

	.sound-grid {
		display: grid;
		grid-template-columns: repeat(2, minmax(0, 1fr));
		gap: 0.5rem;
	}

	.sound-option {
		display: flex;
		align-items: center;
		gap: 0.7rem;
		min-width: 0;
		padding: 0.7rem;
		border: 1px solid var(--border);
		border-radius: 14px;
		background: rgba(255, 255, 255, 0.025);
		text-align: left;
		transition:
			background 160ms ease,
			border-color 160ms ease,
			transform 160ms ease;
	}

	.sound-option:hover {
		background: rgba(255, 255, 255, 0.05);
		border-color: var(--border-strong);
		transform: translateY(-1px);
	}

	.sound-option.active {
		border-color: rgba(167, 139, 250, 0.45);
		background: var(--accent-soft);
		box-shadow: inset 0 0 0 1px rgba(167, 139, 250, 0.12);
	}

	.sound-icon {
		display: grid;
		place-items: center;
		width: 36px;
		height: 36px;
		flex-shrink: 0;
		border-radius: 11px;
		background: rgba(255, 255, 255, 0.05);
		color: var(--text-muted);
		transition:
			background 160ms ease,
			color 160ms ease;
	}

	.sound-option.active .sound-icon {
		background: var(--accent-soft);
		color: var(--accent);
	}

	.sound-copy {
		display: grid;
		gap: 0.1rem;
		min-width: 0;
	}

	.sound-name {
		color: var(--text);
		font-size: 0.82rem;
		font-weight: 600;
	}

	.sound-desc {
		overflow: hidden;
		color: var(--text-dim);
		font-size: 0.68rem;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.playing-bars {
		display: inline-flex;
		align-items: flex-end;
		gap: 2px;
		height: 13px;
		margin-left: auto;
		flex-shrink: 0;
	}

	.playing-bars i {
		display: block;
		width: 2px;
		border-radius: 999px;
		background: var(--accent);
		animation: bar 900ms ease-in-out infinite;
	}

	.playing-bars i:nth-child(1) {
		height: 7px;
	}

	.playing-bars i:nth-child(2) {
		height: 13px;
		animation-delay: 150ms;
	}

	.playing-bars i:nth-child(3) {
		height: 9px;
		animation-delay: 300ms;
	}

	.volume {
		display: flex;
		align-items: center;
		gap: 0.6rem;
		padding: 0.65rem 0.8rem;
		border: 1px solid var(--border);
		border-radius: 12px;
		background: rgba(255, 255, 255, 0.025);
		color: var(--text-dim);
	}

	.volume input {
		flex: 1;
		min-width: 0;
		height: 4px;
		appearance: none;
		border-radius: 999px;
		background: linear-gradient(90deg, var(--accent-strong), var(--accent));
		outline: none;
	}

	.volume input::-webkit-slider-thumb {
		appearance: none;
		width: 14px;
		height: 14px;
		border: 2px solid #0a0710;
		border-radius: 50%;
		background: var(--accent);
		box-shadow: 0 0 12px rgba(139, 92, 246, 0.6);
		cursor: pointer;
	}

	.volume input::-moz-range-thumb {
		width: 14px;
		height: 14px;
		border: 2px solid #0a0710;
		border-radius: 50%;
		background: var(--accent);
		cursor: pointer;
	}

	.volume-value {
		min-width: 2.2rem;
		color: var(--text-muted);
		font-size: 0.72rem;
		font-variant-numeric: tabular-nums;
		text-align: right;
	}

	.compact .sound-grid {
		grid-template-columns: 1fr;
		gap: 0.35rem;
	}

	.compact .sound-option {
		padding: 0.55rem 0.6rem;
	}

	.compact .sound-icon {
		width: 32px;
		height: 32px;
		border-radius: 10px;
	}

	.compact .sound-desc {
		display: none;
	}

	@keyframes bar {
		0%,
		100% {
			transform: scaleY(0.45);
		}

		50% {
			transform: scaleY(1);
		}
	}

	@media (max-width: 420px) {
		.sound-grid {
			grid-template-columns: 1fr;
		}
	}
</style>
