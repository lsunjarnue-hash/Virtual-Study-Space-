import { browser } from '$app/env';
import {
	createSoundscape,
	findFileSound,
	isBuiltInSoundId,
	isFileSoundId,
	SOUNDS,
	type SoundId
} from '#lib/audio/soundscape.ts';

const STORAGE_KEY = 'lockin:sound';
const DEFAULT_VOLUME = 0.55;
const AUDIO_EXTENSIONS = /\.(mp3|wav|ogg|oga|m4a|aac|flac|opus|weba|webm|wma|aiff?)$/i;

export interface CustomTrack {
	id: `custom:${string}`;
	label: string;
	url: string;
}

function isAudioFile(file: File) {
	return file.type.startsWith('audio/') || AUDIO_EXTENSIONS.test(file.name);
}

function createId() {
	if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
		return crypto.randomUUID();
	}
	return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`;
}

class AudioStore {
	track = $state<SoundId>('none');
	volume = $state(DEFAULT_VOLUME);
	playing = $state(false);
	customTracks = $state<CustomTrack[]>([]);

	private context: AudioContext | null = null;
	private master: GainNode | null = null;
	private stopCurrent: (() => void) | null = null;
	private mediaElement: HTMLAudioElement | null = null;
	private mediaSource: MediaElementAudioSourceNode | null = null;
	private playToken = 0;
	private initialized = false;

	get currentLabel() {
		return (
			SOUNDS.find((sound) => sound.id === this.track)?.label ??
			findFileSound(this.track)?.label ??
			this.customTracks.find((track) => track.id === this.track)?.label ??
			'No sound'
		);
	}

	init() {
		if (this.initialized || !browser) return;
		this.initialized = true;

		try {
			const raw = localStorage.getItem(STORAGE_KEY);
			if (raw) {
				const stored = JSON.parse(raw) as { track?: unknown; volume?: unknown } | null;
				if (stored && (isBuiltInSoundId(stored.track) || findFileSound(stored.track))) {
					this.track = stored.track as SoundId;
				} else {
					this.track = 'none';
				}
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

		if (id.startsWith('custom:')) {
			const custom = this.customTracks.find((track) => track.id === id);
			if (custom) await this.playMedia(custom.url, custom.id);
			return;
		}

		if (isFileSoundId(id)) {
			const file = findFileSound(id);
			if (file) await this.playMedia(file.src, file.id);
			return;
		}

		if (!isBuiltInSoundId(id)) return;

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
		this.stopMedia();

		this.track = id;
		this.playing = true;
		this.stopCurrent = createSoundscape(context, this.master, id);
		this.persist();
	}

	pause() {
		this.stopCurrent?.();
		this.stopCurrent = null;
		this.stopMedia();
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

	addCustomTracks(files: FileList | File[]): number {
		if (!browser) return 0;

		let added = 0;

		for (const file of Array.from(files)) {
			if (!isAudioFile(file)) continue;

			const id: CustomTrack['id'] = `custom:${createId()}`;
			const label = file.name.replace(/\.[^.]+$/, '') || file.name;
			const url = URL.createObjectURL(file);

			this.customTracks.push({ id, label, url });
			added += 1;
		}

		return added;
	}

	removeCustomTrack(id: SoundId) {
		const index = this.customTracks.findIndex((track) => track.id === id);
		if (index === -1) return;

		if (this.track === id) this.pause();

		const [removed] = this.customTracks.splice(index, 1);
		if (removed) URL.revokeObjectURL(removed.url);
	}

	private async playMedia(src: string, id: SoundId) {
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

		const token = this.stopMedia();
		const element = this.getMediaElement(context);

		element.src = src;

		try {
			await element.play();
		} catch {
			if (token === this.playToken) element.pause();
			return;
		}

		if (token !== this.playToken) {
			element.pause();
			return;
		}

		this.track = id;
		this.playing = true;
		this.persist();
	}

	private getMediaElement(context: AudioContext) {
		if (!this.mediaElement) {
			const element = new Audio();
			element.loop = true;
			element.preload = 'auto';

			const source = context.createMediaElementSource(element);
			source.connect(this.master as GainNode);

			this.mediaElement = element;
			this.mediaSource = source;
		}

		return this.mediaElement;
	}

	private stopMedia() {
		const token = ++this.playToken;

		if (this.mediaElement) {
			this.mediaElement.pause();
			this.mediaElement.removeAttribute('src');
			this.mediaElement.load();
		}

		return token;
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
