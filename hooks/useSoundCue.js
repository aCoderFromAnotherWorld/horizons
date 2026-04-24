'use client';

import { useEffect, useRef, useCallback } from 'react';
import { useSettingsStore } from '@/store/settingsStore.js';

// Volume scale by sensory level (dB offset applied to Tone.js master).
const VOLUME_DB = { low: -12, medium: -6, high: 0 };

/**
 * Lazily loads Tone.js and the cue library on first user gesture, then exposes
 * a `play(cueName)` function that respects the current sensoryLevel.
 *
 * @returns {{ play: (cueName: string, ...args: any[]) => void }}
 */
export function useSoundCue() {
  const sensoryLevel = useSettingsStore((s) => s.sensoryLevel);
  const cuesRef = useRef(null);
  const toneRef = useRef(null);
  const loadingRef = useRef(false);

  useEffect(() => {
    async function load() {
      if (loadingRef.current || cuesRef.current) return;
      loadingRef.current = true;
      try {
        const [Tone, cues] = await Promise.all([
          import('tone'),
          import('@/lib/sound/cues.js'),
        ]);
        toneRef.current = Tone;
        cuesRef.current = cues;
      } catch {
        // Tone.js unavailable (SSR guard or blocked by browser policy)
      } finally {
        loadingRef.current = false;
      }
    }

    // Load on first user interaction to satisfy browser autoplay policy.
    function onGesture() {
      load();
      window.removeEventListener('pointerdown', onGesture);
      window.removeEventListener('keydown', onGesture);
    }

    window.addEventListener('pointerdown', onGesture, { once: true });
    window.addEventListener('keydown', onGesture, { once: true });

    return () => {
      window.removeEventListener('pointerdown', onGesture);
      window.removeEventListener('keydown', onGesture);
    };
  }, []);

  // Apply volume whenever sensory level changes.
  useEffect(() => {
    const Tone = toneRef.current;
    if (!Tone) return;
    try {
      Tone.getDestination().volume.value = VOLUME_DB[sensoryLevel] ?? -6;
    } catch {
      // ignore if Tone context not started
    }
  }, [sensoryLevel]);

  const play = useCallback(
    (cueName, ...args) => {
      if (sensoryLevel === 'low' && cueName !== 'cueCorrect' && cueName !== 'cueWrong') return;
      const cues = cuesRef.current;
      if (!cues || typeof cues[cueName] !== 'function') return;
      try {
        cues[cueName](...args);
      } catch {
        // Swallow synthesis errors — non-critical
      }
    },
    [sensoryLevel]
  );

  return { play };
}
