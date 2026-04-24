'use client';

import { useRef } from 'react';

/**
 * Returns a stable ref whose `.current` exposes `{ start(), stop() }`.
 * `stop()` returns elapsed milliseconds since the last `start()` call.
 */
export function useTaskTimer() {
  const startTime = useRef(null);

  const timer = useRef({
    start() {
      startTime.current = performance.now();
    },
    stop() {
      if (startTime.current === null) return 0;
      const elapsed = Math.round(performance.now() - startTime.current);
      startTime.current = null;
      return elapsed;
    },
  });

  return timer;
}
