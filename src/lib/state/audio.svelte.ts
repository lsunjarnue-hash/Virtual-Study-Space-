import { browser } from '$app/env';
import { createSoundscape, SOUNDS, type SoundId } from '#lib/audio/soundscape.ts';

const STORAGE_KEY = 'lockin:sound';
const DEFAULT_VOLUME = 0.55;

function isSoundId(value: unknown): value is SoundId {
	return value === 'none' || SOUNDS.some((sound) => sound.id === value);
}

class AudioStore {
	track = $state<SoundId>('none');
	volume = $state(DEFAULT_VOLUME);
	playing = $state(false);

	private context: AudioContext | null = null;
	private master: GainNode | null = null;
	private stopCurrent: (() => void) | null = null;
	private initialized = false;

	get currentLabel() {
		return SOUNDS.find((sound) => sound.id === this.track)?.label ?? 'No sound';
	}

	init() {
		if (this.initialized || !browser) return;
		this.initialized = true;

		try {
			const raw = localStorage.getItem(STORAGE_KEY);
			if (raw) {
				const stored = JSON.parse(raw) as { track?: unknown; volume?: unknown } | null;
				if (stored && isSoundId(stored.track)) this.track = stored.track;
				if (stored && typeof stored.volume === 'number' && Number.isFinite(stored.volume)) {
					this.volume = Math.min(1, Math.max(0, stored.volume));
				}
			}
		} catch {
			/* Ignore unreadable preferences and keep defaults. */
		}
	}

	async play(id: SoundId = this.track) {
		if (!browser || id === 'none') {
			this.pause();
			return;
		}

		const context = this.ensureContext();
		if (!context || !this.master) return;

		if (context.state === 'suspended') {
			try {
				await context.resume();
			} catch {
				return;
			}
		}

		this.stopCurrent?.();
		this.stopCurrent = null;

		this.track = id;
		this.playing = true;
		this.stopCurrent = createSoundscape(context, this.master, id);
		this.persist();
	}

	pause() {
		this.stopCurrent?.();
		this.stopCurrent = null;
		this.playing = false;
		this.persist();
	}

	toggle(id: SoundId = this.track) {
		if (this.playing && id === this.track) {
			this.pause();
		} else {
			void this.play(id);
		}
	}

	setVolume(value: number) {
		const next = Number.isFinite(value) ? Math.min(1, Math.max(0, value)) : DEFAULT_VOLUME;
		this.volume = next;

		if (this.master && this.context) {
			this.master.gain.setTargetAtTime(this.gainFor(next), this.context.currentTime, 0.05);
		}

		this.persist();
	}

	private ensureContext() {
		if (!browser) return null;

		if (!this.context) {
			const ContextCtor =
				window.AudioContext ??
				(window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
			if (!ContextCtor) return null;

			this.context = new ContextCtor();
			this.master = this.context.createGain();
			this.master.gain.value = this.gainFor(this.volume);

			const compressor = this.context.createDynamicsCompressor();
			compressor.threshold.value = -20;
			compressor.knee.value = 22;
			compressor.ratio.value = 3;
			compressor.attack.value = 0.02;
			compressor.release.value = 0.3;

			this.master.connect(compressor);
			compressor.connect(this.context.destination);
		}

		return this.context;
	}

	private gainFor(volume: number) {
		return Math.pow(volume, 1.6) * 0.9;
	}

	private persist() {
		if (!browser) return;
		try {
			localStorage.setItem(STORAGE_KEY, JSON.stringify({ track: this.track, volume: this.volume }));
		} catch {
			/* Ignore quota or privacy-mode failures. */
		}
	}
}

export const audio = new AudioStore();
