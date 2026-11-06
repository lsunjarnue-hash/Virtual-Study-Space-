import { browser } from '$app/env';

export type TimerMode = 'focus' | 'short' | 'long';

export interface StudyTask {
	id: string;
	text: string;
	done: boolean;
}

export interface Durations {
	focus: number;
	short: number;
	long: number;
}

interface PersistedState {
	day: string;
	durations: Durations;
	dailyGoal: number;
	tasks: StudyTask[];
	completedSessions: number;
	focusMinutes: number;
}

export const MODE_LABELS: Record<TimerMode, string> = {
	focus: 'Focus',
	short: 'Short Break',
	long: 'Long Break'
};

const STORAGE_KEY = 'lockin:study-state';
const DEFAULT_DURATIONS: Durations = { focus: 25, short: 5, long: 15 };
const DEFAULT_DAILY_GOAL = 8;
const MAX_TASK_LENGTH = 120;
const MAX_TASKS = 50;

function todayKey() {
	const now = new Date();
	return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
}

function clampMinutes(value: unknown, fallback: number, max = 180) {
	const number = Number(value);
	if (!Number.isFinite(number)) return fallback;
	return Math.min(max, Math.max(1, Math.round(number)));
}

function createId() {
	if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
		return crypto.randomUUID();
	}
	return `task-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

class StudyStore {
	mode = $state<TimerMode>('focus');
	durations = $state<Durations>({ ...DEFAULT_DURATIONS });
	remaining = $state(DEFAULT_DURATIONS.focus * 60);
	running = $state(false);
	sessionComplete = $state(false);

	tasks = $state<StudyTask[]>([]);
	completedSessions = $state(0);
	focusMinutes = $state(0);
	dailyGoal = $state(DEFAULT_DAILY_GOAL);

	private interval: ReturnType<typeof setInterval> | null = null;
	private endAt = 0;
	private initialized = false;
	private day = todayKey();

	get formattedTime() {
		const minutes = Math.floor(this.remaining / 60);
		const seconds = this.remaining % 60;
		return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
	}

	get modeLabel() {
		return MODE_LABELS[this.mode];
	}

	get totalSeconds() {
		return this.durations[this.mode] * 60;
	}

	get remainingFraction() {
		const total = this.totalSeconds;
		if (total <= 0) return 0;
		return Math.min(1, Math.max(0, this.remaining / total));
	}

	init() {
		if (this.initialized || !browser) return;
		this.initialized = true;
		this.load();
	}

	start() {
		this.init();
		this.ensureToday();
		if (this.running) return;

		if (this.remaining <= 0) {
			this.remaining = this.totalSeconds;
		}

		this.sessionComplete = false;
		this.running = true;
		this.endAt = Date.now() + this.remaining * 1000;
		this.stopTicking();
		this.interval = setInterval(() => this.tick(), 200);
	}

	pause() {
		if (!this.running) return;
		this.running = false;
		this.remaining = Math.max(0, Math.ceil((this.endAt - Date.now()) / 1000));
		this.stopTicking();

		if (this.remaining === 0) {
			this.finish();
		}
	}

	toggle() {
		if (this.running) {
			this.pause();
		} else {
			this.start();
		}
	}

	reset() {
		this.stopTicking();
		this.running = false;
		this.sessionComplete = false;
		this.remaining = this.totalSeconds;
	}

	setMode(mode: TimerMode) {
		if (this.mode === mode) return;
		this.stopTicking();
		this.running = false;
		this.sessionComplete = false;
		this.mode = mode;
		this.remaining = this.totalSeconds;
	}

	setDuration(mode: TimerMode, value: number) {
		const minutes = clampMinutes(value, this.durations[mode]);
		this.durations = { ...this.durations, [mode]: minutes };

		if (!this.running && this.mode === mode) {
			this.sessionComplete = false;
			this.remaining = minutes * 60;
		}

		this.persist();
	}

	setDailyGoal(value: number) {
		this.dailyGoal = clampMinutes(value, this.dailyGoal, 24);
		this.persist();
	}

	addTask(text: string) {
		const clean = text.trim().slice(0, MAX_TASK_LENGTH);
		if (!clean) return;
		this.ensureToday();
		this.tasks = [...this.tasks, { id: createId(), text: clean, done: false }].slice(-MAX_TASKS);
		this.persist();
	}

	toggleTask(id: string) {
		this.tasks = this.tasks.map((task) => (task.id === id ? { ...task, done: !task.done } : task));
		this.persist();
	}

	removeTask(id: string) {
		this.tasks = this.tasks.filter((task) => task.id !== id);
		this.persist();
	}

	clearCompleted() {
		this.tasks = this.tasks.filter((task) => !task.done);
		this.persist();
	}

	resetToday() {
		this.ensureToday();
		this.completedSessions = 0;
		this.focusMinutes = 0;
		this.persist();
	}

	private tick() {
		const next = Math.max(0, Math.ceil((this.endAt - Date.now()) / 1000));
		if (next === this.remaining) return;
		this.remaining = next;
		if (next === 0) {
			this.finish();
		}
	}

	private finish() {
		this.stopTicking();
		this.running = false;
		this.remaining = 0;
		this.sessionComplete = true;

		if (this.mode === 'focus') {
			this.ensureToday();
			this.completedSessions += 1;
			this.focusMinutes += this.durations.focus;
		}

		this.persist();
	}

	private ensureToday() {
		const current = todayKey();
		if (this.day === current) return;
		this.day = current;
		this.completedSessions = 0;
		this.focusMinutes = 0;
		this.persist();
	}

	private stopTicking() {
		if (this.interval !== null) {
			clearInterval(this.interval);
			this.interval = null;
		}
	}

	private load() {
		try {
			const raw = localStorage.getItem(STORAGE_KEY);
			if (!raw) return;
			const stored = JSON.parse(raw) as Partial<PersistedState> | null;
			if (!stored || typeof stored !== 'object') return;

			this.durations = {
				focus: clampMinutes(stored.durations?.focus, DEFAULT_DURATIONS.focus),
				short: clampMinutes(stored.durations?.short, DEFAULT_DURATIONS.short, 60),
				long: clampMinutes(stored.durations?.long, DEFAULT_DURATIONS.long, 60)
			};
			this.dailyGoal = clampMinutes(stored.dailyGoal, DEFAULT_DAILY_GOAL, 24);

			if (Array.isArray(stored.tasks)) {
				this.tasks = stored.tasks
					.filter((task) => task && typeof task.text === 'string')
					.slice(0, MAX_TASKS)
					.map((task, index) => ({
						id: typeof task.id === 'string' ? task.id : `restored-${index}`,
						text: task.text.slice(0, MAX_TASK_LENGTH),
						done: task.done === true
					}));
			}

			const current = todayKey();
			if (stored.day === current) {
				this.completedSessions = Math.max(0, Math.round(Number(stored.completedSessions) || 0));
				this.focusMinutes = Math.max(0, Math.round(Number(stored.focusMinutes) || 0));
			}

			this.day = current;
			this.remaining = this.totalSeconds;
		} catch {
			/* Ignore unreadable persisted state and keep defaults. */
		}
	}

	private persist() {
		if (!browser) return;

		const payload: PersistedState = {
			day: todayKey(),
			durations: { ...this.durations },
			dailyGoal: this.dailyGoal,
			tasks: this.tasks.map((task) => ({ ...task })),
			completedSessions: this.completedSessions,
			focusMinutes: this.focusMinutes
		};

		this.day = payload.day;

		try {
			localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
		} catch {
			/* Ignore quota or privacy-mode failures. */
		}
	}
}

export const study = new StudyStore();
