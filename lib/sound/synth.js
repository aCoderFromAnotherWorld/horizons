'use client';

let cached = null;

/**
 * Lazily creates and caches singleton Tone.js instruments.
 * Must be called after a user gesture (browser autoplay policy).
 * @returns {Promise<{ feedbackSynth, melodyPluck, ambientDrone, noisePlayer, Tone }>}
 */
export async function getSynths() {
  if (cached) return cached;

  const Tone = await import('tone');

  await Tone.start();

  const feedbackSynth = new Tone.Synth({
    oscillator: { type: 'triangle' },
    envelope: { attack: 0.01, decay: 0.1, sustain: 0.1, release: 0.1 },
  }).toDestination();

  const melodyPluck = new Tone.PluckSynth({
    attackNoise: 1,
    dampening: 4000,
    resonance: 0.96,
  }).toDestination();

  const ambientDrone = new Tone.AMSynth({
    harmonicity: 1.5,
    detune: 0,
    oscillator: { type: 'sine' },
    envelope: { attack: 2, decay: 0.1, sustain: 1, release: 2 },
    modulation: { type: 'sine' },
    modulationEnvelope: { attack: 4, decay: 0.5, sustain: 1, release: 4 },
  }).toDestination();

  const noisePlayer = new Tone.NoiseSynth({
    noise: { type: 'white' },
    envelope: { attack: 0.005, decay: 0.1, sustain: 0, release: 0.1 },
  }).toDestination();

  cached = { feedbackSynth, melodyPluck, ambientDrone, noisePlayer, Tone };
  return cached;
}
