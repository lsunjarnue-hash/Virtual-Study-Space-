export type BuiltInSoundId = 'none' | 'lofi' | 'piano' | 'rain' | 'ocean' | 'brown';
export type FileSoundId = `file:${string}`;
export type SoundId = BuiltInSoundId | FileSoundId | `custom:${string}`;

export interface SoundMeta {
	id: BuiltInSoundId;
	label: string;
	description: string;
}

export interface FileSoundMeta {
	id: FileSoundId;
	label: string;
	description: string;
	src: string;
}

export const MUSIC: FileSoundMeta[] = [
	{
		id: 'file:classical',
		label: 'Classical',
		description: 'Orchestral study piece',
		src: '/audio/classical.mp3'
	},
	{
		id: 'file:among-mountains',
		label: 'Among Mountains',
		description: 'Calm highland ambience',
		src: '/audio/Amongmountains.mp3'
	},
	{
		id: 'file:brain-stimulating',
		label: 'Brain Stimulating',
		description: 'Bright, energizing focus',
		src: '/audio/Brainstimualating.mp3'
	},
	{
		id: 'file:cozy-morning',
		label: 'Cozy Morning',
		description: 'Warm, gentle start',
		src: '/audio/Cozymorning.mp3'
	},
	{
		id: 'file:happy-life',
		label: 'Happy Life',
		description: 'Light and upbeat',
		src: '/audio/happylife.mp3'
	},
	{
		id: 'file:doing-well',
		label: 'I Am Doing Well',
		description: 'Uplifting and steady',
		src: '/audio/Iamdoingwell.mp3'
	},
	{
		id: 'file:latin-lofi',
		label: 'Latin Lo-fi',
		description: 'Lo-fi with a latin groove',
		src: '/audio/Latinlofi.mp3'
	},
	{
		id: 'file:night-sky',
		label: 'Night Sky',
		description: 'Quiet late-night focus',
		src: '/audio/Nightsky.mp3'
	},
	{
		id: 'file:possible-dreams',
		label: 'Possible Dreams',
		description: 'Dreamy, soft textures',
		src: '/audio/Possibledreams.mp3'
	},
	{
		id: 'file:soul-calming',
		label: 'Soul Calming',
		description: 'Slow, soothing tones',
		src: '/audio/Soul-calming.mp3'
	},
	{
		id: 'file:studying',
		label: 'Studying',
		description: 'Straightforward study flow',
		src: '/audio/Studying.mp3'
	}
];

export function isFileSoundId(value: unknown): value is FileSoundId {
	return typeof value === 'string' && value.startsWith('file:');
}

export function findFileSound(id: unknown): FileSoundMeta | undefined {
	return MUSIC.find((sound) => sound.id === id);
}

export const SOUNDS: SoundMeta[] = [
	{ id: 'lofi', label: 'Lo-fi', description: 'Warm chords, vinyl crackle' },
	{ id: 'piano', label: 'Piano', description: 'Slow, soft arpeggios' },
	{ id: 'rain', label: 'Rain', description: 'Steady rain on a window' },
	{ id: 'ocean', label: 'Ocean', description: 'Rolling waves on a shore' },
	{ id: 'brown', label: 'Brown noise', description: 'A deep, even focus blanket' }
];

export function isBuiltInSoundId(value: unknown): value is BuiltInSoundId {
	return value === 'none' || SOUNDS.some((sound) => sound.id === value);
}

const A4_FREQUENCY = 440;
const A4_MIDI = 69;

function midiToFrequency(midi: number) {
	return A4_FREQUENCY * Math.pow(2, (midi - A4_MIDI) / 12);
}

function createNoiseBuffer(context: AudioContext, seconds: number) {
	const length = Math.floor(context.sampleRate * seconds);
	const buffer = context.createBuffer(1, length, context.sampleRate);
	const data = buffer.getChannelData(0);
	for (let index = 0; index < length; index += 1) {
		data[index] = Math.random() * 2 - 1;
	}
	return buffer;
}

function createBrownNoiseBuffer(context: AudioContext, seconds: number) {
	const length = Math.floor(context.sampleRate * seconds);
	const buffer = context.createBuffer(1, length, context.sampleRate);
	const data = buffer.getChannelData(0);
	let last = 0;
	for (let index = 0; index < length; index += 1) {
		const white = Math.random() * 2 - 1;
		last = (last + 0.02 * white) / 1.02;
		data[index] = last * 3.5;
	}
	return buffer;
}

function createCrackleBuffer(context: AudioContext, seconds: number) {
	const length = Math.floor(context.sampleRate * seconds);
	const buffer = context.createBuffer(1, length, context.sampleRate);
	const data = buffer.getChannelData(0);
	for (let index = 0; index < length; index += 1) {
		data[index] = Math.random() < 0.00045 ? (Math.random() * 2 - 1) * 0.9 : 0;
	}
	return buffer;
}

function startLoop(context: AudioContext, buffer: AudioBuffer) {
	const source = context.createBufferSource();
	source.buffer = buffer;
	source.loop = true;
	source.start();
	return source;
}

function stopSources(sources: AudioBufferSourceNode[]) {
	for (const source of sources) {
		try {
			source.stop();
		} catch {
			/* Source already stopped. */
		}
	}
}

function stopOscillators(oscillators: OscillatorNode[]) {
	for (const oscillator of oscillators) {
		try {
			oscillator.stop();
		} catch {
			/* Oscillator already stopped. */
		}
	}
}

function createRain(context: AudioContext, destination: AudioNode) {
	const hiss = startLoop(context, createNoiseBuffer(context, 6));
	const rumble = startLoop(context, createBrownNoiseBuffer(context, 5));

	const highpass = context.createBiquadFilter();
	highpass.type = 'highpass';
	highpass.frequency.value = 800;

	const lowpass = context.createBiquadFilter();
	lowpass.type = 'lowpass';
	lowpass.frequency.value = 6800;

	const hissGain = context.createGain();
	hissGain.gain.value = 0.2;

	hiss.connect(highpass);
	highpass.connect(lowpass);
	lowpass.connect(hissGain);
	hissGain.connect(destination);

	const rumbleFilter = context.createBiquadFilter();
	rumbleFilter.type = 'lowpass';
	rumbleFilter.frequency.value = 380;

	const rumbleGain = context.createGain();
	rumbleGain.gain.value = 0.18;

	rumble.connect(rumbleFilter);
	rumbleFilter.connect(rumbleGain);
	rumbleGain.connect(destination);

	const timers: ReturnType<typeof setTimeout>[] = [];
	let stopped = false;

	const drop = () => {
		const now = context.currentTime;
		const frequency = 900 + Math.random() * 900;

		const oscillator = context.createOscillator();
		oscillator.type = 'sine';
		oscillator.frequency.setValueAtTime(frequency, now);
		oscillator.frequency.exponentialRampToValueAtTime(frequency * 0.7, now + 0.18);

		const envelope = context.createGain();
		envelope.gain.setValueAtTime(0.0001, now);
		envelope.gain.exponentialRampToValueAtTime(0.012 + Math.random() * 0.01, now + 0.01);
		envelope.gain.exponentialRampToValueAtTime(0.0001, now + 0.35);

		oscillator.connect(envelope);
		envelope.connect(destination);
		oscillator.start(now);
		oscillator.stop(now + 0.4);
	};

	const schedule = () => {
		if (stopped) return;
		drop();
		timers.push(setTimeout(schedule, 500 + Math.random() * 1500));
	};

	schedule();

	return () => {
		stopped = true;
		timers.forEach((timer) => clearTimeout(timer));
		stopSources([hiss, rumble]);
	};
}

function createOcean(context: AudioContext, destination: AudioNode) {
	const source = startLoop(context, createNoiseBuffer(context, 8));

	const highpass = context.createBiquadFilter();
	highpass.type = 'highpass';
	highpass.frequency.value = 120;

	const lowpass = context.createBiquadFilter();
	lowpass.type = 'lowpass';
	lowpass.frequency.value = 900;
	lowpass.Q.value = 0.6;

	const swell = context.createGain();
	swell.gain.value = 0.16;

	source.connect(highpass);
	highpass.connect(lowpass);
	lowpass.connect(swell);
	swell.connect(destination);

	const swellLfo = context.createOscillator();
	swellLfo.frequency.value = 0.07;

	const swellDepth = context.createGain();
	swellDepth.gain.value = 0.11;

	swellLfo.connect(swellDepth);
	swellDepth.connect(swell.gain);
	swellLfo.start();

	const filterLfo = context.createOscillator();
	filterLfo.frequency.value = 0.05;

	const filterDepth = context.createGain();
	filterDepth.gain.value = 260;

	filterLfo.connect(filterDepth);
	filterDepth.connect(lowpass.frequency);
	filterLfo.start();

	return () => {
		stopSources([source]);
		stopOscillators([swellLfo, filterLfo]);
	};
}

function createBrownNoise(context: AudioContext, destination: AudioNode) {
	const source = startLoop(context, createBrownNoiseBuffer(context, 6));

	const bodyFilter = context.createBiquadFilter();
	bodyFilter.type = 'lowpass';
	bodyFilter.frequency.value = 900;

	const bodyGain = context.createGain();
	bodyGain.gain.value = 0.24;

	source.connect(bodyFilter);
	bodyFilter.connect(bodyGain);
	bodyGain.connect(destination);

	const lowFilter = context.createBiquadFilter();
	lowFilter.type = 'lowpass';
	lowFilter.frequency.value = 220;

	const lowGain = context.createGain();
	lowGain.gain.value = 0.16;

	source.connect(lowFilter);
	lowFilter.connect(lowGain);
	lowGain.connect(destination);

	return () => stopSources([source]);
}

function createLofi(context: AudioContext, destination: AudioNode) {
	const sources: AudioBufferSourceNode[] = [];
	const oscillators: OscillatorNode[] = [];
	const timers: ReturnType<typeof setTimeout>[] = [];
	let stopped = false;

	const filter = context.createBiquadFilter();
	filter.type = 'lowpass';
	filter.frequency.value = 1500;
	filter.Q.value = 0.3;

	const padGain = context.createGain();
	padGain.gain.value = 0.5;

	filter.connect(padGain);
	padGain.connect(destination);

	const crackle = startLoop(context, createCrackleBuffer(context, 5));
	const crackleHighpass = context.createBiquadFilter();
	crackleHighpass.type = 'highpass';
	crackleHighpass.frequency.value = 900;

	const crackleGain = context.createGain();
	crackleGain.gain.value = 0.16;

	crackle.connect(crackleHighpass);
	crackleHighpass.connect(crackleGain);
	crackleGain.connect(destination);
	sources.push(crackle);

	const hiss = startLoop(context, createNoiseBuffer(context, 4));
	const hissLowpass = context.createBiquadFilter();
	hissLowpass.type = 'lowpass';
	hissLowpass.frequency.value = 5200;

	const hissGain = context.createGain();
	hissGain.gain.value = 0.012;

	hiss.connect(hissLowpass);
	hissLowpass.connect(hissGain);
	hissGain.connect(destination);
	sources.push(hiss);

	const chords = [
		[53, 57, 60, 64],
		[55, 59, 62, 65],
		[50, 53, 57, 60],
		[57, 60, 64, 67]
	];
	const chordDuration = 7;
	let index = 0;

	const playChord = (notes: number[]) => {
		const now = context.currentTime;

		for (const midi of notes) {
			const oscillator = context.createOscillator();
			oscillator.type = 'triangle';
			oscillator.frequency.value = midiToFrequency(midi);
			oscillator.detune.value = (Math.random() - 0.5) * 10;

			const voice = context.createGain();
			voice.gain.setValueAtTime(0.0001, now);
			voice.gain.exponentialRampToValueAtTime(0.055, now + 0.9);
			voice.gain.setValueAtTime(0.055, now + chordDuration - 1.2);
			voice.gain.exponentialRampToValueAtTime(0.0001, now + chordDuration);

			oscillator.connect(voice);
			voice.connect(filter);
			oscillator.start(now);
			oscillator.stop(now + chordDuration + 0.1);
			oscillators.push(oscillator);
		}

		const bass = context.createOscillator();
		bass.type = 'sine';
		bass.frequency.value = midiToFrequency(notes[0] - 12);

		const bassGain = context.createGain();
		bassGain.gain.setValueAtTime(0.0001, now);
		bassGain.gain.exponentialRampToValueAtTime(0.07, now + 1.4);
		bassGain.gain.setValueAtTime(0.07, now + chordDuration - 1.2);
		bassGain.gain.exponentialRampToValueAtTime(0.0001, now + chordDuration);

		bass.connect(bassGain);
		bassGain.connect(filter);
		bass.start(now);
		bass.stop(now + chordDuration + 0.1);
		oscillators.push(bass);
	};

	const step = () => {
		if (stopped) return;
		playChord(chords[index % chords.length]);
		index += 1;
		timers.push(setTimeout(step, chordDuration * 1000));
	};

	step();

	return () => {
		stopped = true;
		timers.forEach((timer) => clearTimeout(timer));
		stopOscillators(oscillators);
		stopSources(sources);
	};
}

function createPiano(context: AudioContext, destination: AudioNode) {
	const filter = context.createBiquadFilter();
	filter.type = 'lowpass';
	filter.frequency.value = 3200;

	const noteBus = context.createGain();
	noteBus.gain.value = 0.9;
	filter.connect(noteBus);
	noteBus.connect(destination);

	const delay = context.createDelay(1);
	delay.delayTime.value = 0.34;

	const feedback = context.createGain();
	feedback.gain.value = 0.3;

	const wet = context.createGain();
	wet.gain.value = 0.22;

	noteBus.connect(delay);
	delay.connect(feedback);
	feedback.connect(delay);
	delay.connect(wet);
	wet.connect(destination);

	const oscillators: OscillatorNode[] = [];
	const timers: ReturnType<typeof setTimeout>[] = [];
	let stopped = false;

	const playNote = (midi: number, when: number, velocity: number, duration: number) => {
		const frequency = midiToFrequency(midi);

		const envelope = context.createGain();
		envelope.gain.setValueAtTime(0.0001, when);
		envelope.gain.exponentialRampToValueAtTime(velocity, when + 0.012);
		envelope.gain.exponentialRampToValueAtTime(0.0001, when + duration);
		envelope.connect(filter);

		const partials: { ratio: number; type: OscillatorType; level: number }[] = [
			{ ratio: 1, type: 'sine', level: 1 },
			{ ratio: 2, type: 'triangle', level: 0.25 },
			{ ratio: 3, type: 'sine', level: 0.1 }
		];

		for (const partial of partials) {
			const oscillator = context.createOscillator();
			oscillator.type = partial.type;
			oscillator.frequency.value = frequency * partial.ratio;

			const level = context.createGain();
			level.gain.value = partial.level;

			oscillator.connect(level);
			level.connect(envelope);
			oscillator.start(when);
			oscillator.stop(when + duration + 0.05);
			oscillators.push(oscillator);
		}
	};

	const scale = [60, 62, 64, 67, 69, 72, 74, 76, 79, 81];

	const step = () => {
		if (stopped) return;
		const when = context.currentTime + 0.05;
		const midi = scale[Math.floor(Math.random() * scale.length)];

		playNote(midi, when, 0.07 + Math.random() * 0.035, 1.7 + Math.random() * 0.9);

		if (Math.random() < 0.4) {
			playNote(midi - 12, when + 0.03, 0.04, 2.4);
		}

		timers.push(setTimeout(step, 600 + Math.random() * 950));
	};

	step();

	return () => {
		stopped = true;
		timers.forEach((timer) => clearTimeout(timer));
		stopOscillators(oscillators);
	};
}

export function createSoundscape(
	context: AudioContext,
	destination: AudioNode,
	id: BuiltInSoundId
): () => void {
	switch (id) {
		case 'lofi':
			return createLofi(context, destination);
		case 'piano':
			return createPiano(context, destination);
		case 'rain':
			return createRain(context, destination);
		case 'ocean':
			return createOcean(context, destination);
		case 'brown':
			return createBrownNoise(context, destination);
		default:
			return () => {};
	}
}
