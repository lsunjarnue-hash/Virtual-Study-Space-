import { browser } from '$app/env';

export type BackgroundId = 'midnight' | 'aurora' | 'ocean' | 'sunset' | 'sakura' | 'forest';

export interface BackgroundPreset {
	id: BackgroundId;
	label: string;
	hint: string;
	preview: string;
}

export const BACKGROUNDS: BackgroundPreset[] = [
	{
		id: 'midnight',
		label: 'Midnight',
		hint: 'Violet after dark',
		preview: 'linear-gradient(135deg, #070609, #2a1b4d 58%, #8b5cf6)'
	},
	{
		id: 'aurora',
		label: 'Aurora',
		hint: 'Teal polar sky',
		preview: 'linear-gradient(135deg, #04110f, #0f3d36 55%, #2dd4bf)'
	},
	{
		id: 'ocean',
		label: 'Ocean',
		hint: 'Deep blue current',
		preview: 'linear-gradient(135deg, #04101c, #0b2a4a 55%, #38bdf8)'
	},
	{
		id: 'sunset',
		label: 'Sunset',
		hint: 'Amber horizon',
		preview: 'linear-gradient(135deg, #150a0c, #4a1d22 52%, #fb923c)'
	},
	{
		id: 'sakura',
		label: 'Sakura',
		hint: 'Soft pink bloom',
		preview: 'linear-gradient(135deg, #140810, #43162f 52%, #f472b6)'
	},
	{
		id: 'forest',
		label: 'Forest',
		hint: 'Quiet green canopy',
		preview: 'linear-gradient(135deg, #06110b, #14301d 55%, #4ade80)'
	}
];

const DEFAULT_BACKGROUND: BackgroundId = 'midnight';
const STORAGE_KEY = 'lockin:preferences';

function isBackground(value: unknown): value is BackgroundId {
	return BACKGROUNDS.some((preset) => preset.id === value);
}

class PreferencesStore {
	background = $state<BackgroundId>(DEFAULT_BACKGROUND);

	private initialized = false;

	init() {
		if (this.initialized || !browser) return;
		this.initialized = true;

		try {
			const raw = localStorage.getItem(STORAGE_KEY);
			if (raw) {
				const stored = JSON.parse(raw) as { background?: unknown } | null;
				if (stored && isBackground(stored.background)) {
					this.background = stored.background;
				}
			}
		} catch {
			/* Ignore unreadable preferences and keep defaults. */
		}

		this.apply();
	}

	setBackground(id: BackgroundId) {
		if (this.background === id) return;
		this.background = id;
		this.apply();
		this.persist();
	}

	private apply() {
		if (!browser) return;
		document.documentElement.dataset.theme = this.background;
	}

	private persist() {
		if (!browser) return;
		try {
			localStorage.setItem(STORAGE_KEY, JSON.stringify({ background: this.background }));
		} catch {
			/* Ignore quota or privacy-mode failures. */
		}
	}
}

export const preferences = new PreferencesStore();
