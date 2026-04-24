'use client';

import { getSynths } from './synth.js';

let ambientLoop = null;

/** Ascending major triad: C4–E4–G4 */
export async function cueCorrect() {
  const { feedbackSynth, Tone } = await getSynths();
  const now = Tone.now();
  feedbackSynth.triggerAttackRelease('C4', '8n', now);
  feedbackSynth.triggerAttackRelease('E4', '8n', now + 0.12);
  feedbackSynth.triggerAttackRelease('G4', '8n', now + 0.24);
}

/** Soft descending interval: E4 → C4 */
export async function cueWrong() {
  const { feedbackSynth, Tone } = await getSynths();
  const now = Tone.now();
  feedbackSynth.triggerAttackRelease('E4', '8n', now);
  feedbackSynth.triggerAttackRelease('C4', '8n', now + 0.15);
}

/** 6-note fanfare on PluckSynth */
export async function cueChapterComplete() {
  const { melodyPluck, Tone } = await getSynths();
  const notes = ['C4', 'E4', 'G4', 'C5', 'E5', 'G5'];
  const now = Tone.now();
  notes.forEach((note, i) => {
    melodyPluck.triggerAttackRelease(note, '8n', now + i * 0.15);
  });
}

/** Slow descending tone — signals rest */
export async function cueBreak() {
  const { feedbackSynth, Tone } = await getSynths();
  const now = Tone.now();
  feedbackSynth.triggerAttackRelease('G4', '4n', now);
  feedbackSynth.triggerAttackRelease('E4', '4n', now + 0.35);
  feedbackSynth.triggerAttackRelease('C4', '2n', now + 0.7);
}

/** Warm pulse train simulating name being called */
export async function cueGuideSpeak() {
  const { feedbackSynth, Tone } = await getSynths();
  const now = Tone.now();
  const pattern = ['E4', 'G4', 'E4'];
  pattern.forEach((note, i) => {
    feedbackSynth.triggerAttackRelease(note, '8n', now + i * 0.2);
  });
}

/**
 * Chapter-specific ambient drone; loops until stopAmbient() is called.
 * @param {number} chapterNumber — 1-6
 */
export async function startAmbient(chapterNumber) {
  const { ambientDrone, Tone } = await getSynths();
  stopAmbient();

  const noteMap = { 1: 'C3', 2: 'D3', 3: 'E3', 4: 'G3', 5: 'A3', 6: 'B3' };
  const note = noteMap[chapterNumber] ?? 'C3';

  ambientDrone.volume.value = -18;
  ambientLoop = new Tone.Loop((time) => {
    ambientDrone.triggerAttackRelease(note, '2n', time);
  }, '2n');
  ambientLoop.start(0);
  Tone.getTransport().start();
}

/** Fades out ambient drone over 2 seconds. */
export function stopAmbient() {
  if (!ambientLoop) return;
  ambientLoop.stop();
  ambientLoop.dispose();
  ambientLoop = null;
}

/**
 * Synthesizes a sensory test sound by type.
 * @param {'birds'|'fountain'|'laughter'|'vacuum'|'thunder'|'traffic'} type
 */
export async function cueSound(type) {
  const { Tone } = await getSynths();
  const now = Tone.now();

  switch (type) {
    case 'birds': {
      const fm = new Tone.FMSynth({
        harmonicity: 3,
        modulationIndex: 8,
        oscillator: { type: 'sine' },
        envelope: { attack: 0.2, decay: 0.1, sustain: 0.8, release: 0.5 },
        modulation: { type: 'sine' },
        modulationEnvelope: { attack: 0.5, decay: 0.1, sustain: 1, release: 0.5 },
      }).toDestination();
      const tremolo = new Tone.Tremolo({ frequency: 4, depth: 0.6, type: 'sine' }).toDestination().start();
      fm.connect(tremolo);
      fm.triggerAttackRelease('D5', '4n', now);
      fm.triggerAttackRelease('F#5', '4n', now + 0.5);
      setTimeout(() => { fm.dispose(); tremolo.dispose(); }, 2000);
      break;
    }

    case 'fountain': {
      const noise = new Tone.Noise('pink').toDestination();
      const filter = new Tone.Filter(800, 'lowpass').toDestination();
      const reverb = new Tone.Reverb({ decay: 1.5, wet: 0.4 }).toDestination();
      noise.connect(filter);
      filter.connect(reverb);
      noise.start(now);
      noise.stop(now + 2);
      setTimeout(() => { noise.dispose(); filter.dispose(); reverb.dispose(); }, 3000);
      break;
    }

    case 'laughter': {
      const synth = new Tone.Synth({
        oscillator: { type: 'pulse', width: 0.3 },
        envelope: { attack: 0.01, decay: 0.05, sustain: 0.3, release: 0.1 },
      }).toDestination();
      for (let i = 0; i < 3; i++) {
        synth.triggerAttackRelease('280', '16n', now + i * 0.22);
      }
      setTimeout(() => synth.dispose(), 1500);
      break;
    }

    case 'vacuum': {
      const sq = new Tone.Oscillator({ type: 'square', frequency: 120 }).toDestination();
      const noise = new Tone.Noise('white').toDestination();
      const bp = new Tone.Filter({ type: 'bandpass', frequency: 1000, Q: 1 }).toDestination();
      sq.connect(bp);
      noise.connect(bp);
      sq.start(now);
      noise.start(now);
      sq.stop(now + 2);
      noise.stop(now + 2);
      setTimeout(() => { sq.dispose(); noise.dispose(); bp.dispose(); }, 3000);
      break;
    }

    case 'thunder': {
      const noiseSynth = new Tone.NoiseSynth({
        noise: { type: 'white' },
        envelope: { attack: 0, decay: 0.05, sustain: 0.3, release: 1.5 },
      }).toDestination();
      const sub = new Tone.Synth({
        oscillator: { type: 'sine', frequency: 60 },
        envelope: { attack: 0, decay: 0.05, sustain: 0, release: 0.5 },
      }).toDestination();
      noiseSynth.triggerAttackRelease('4n', now);
      sub.triggerAttackRelease('60', '8n', now);
      setTimeout(() => { noiseSynth.dispose(); sub.dispose(); }, 3000);
      break;
    }

    case 'traffic': {
      const noise = new Tone.Noise('pink').toDestination();
      const lfo = new Tone.LFO({ frequency: 0.5, min: 100, max: 400 });
      const filter = new Tone.Filter({ type: 'lowpass' }).toDestination();
      noise.connect(filter);
      lfo.connect(filter.frequency);
      lfo.start(now);
      noise.start(now);
      noise.stop(now + 2);
      lfo.stop(now + 2);
      setTimeout(() => { noise.dispose(); filter.dispose(); lfo.dispose(); }, 3000);
      break;
    }

    default:
      break;
  }
}
