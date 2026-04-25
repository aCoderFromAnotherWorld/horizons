'use client';

import { useEffect, useRef } from 'react';

const FLUSH_INTERVAL_MS = 500;

/**
 * Attaches a `pointermove` listener when `active` is true.
 * Buffers `{x, y, t}` samples and flushes them to POST /api/game/mouse every 500ms.
 *
 * @param {string|null} sessionId
 * @param {string|null} taskKey
 * @param {boolean}     active
 */
export function useMouseTracker(sessionId, taskKey, active) {
  const buffer = useRef([]);
  const intervalRef = useRef(null);

  useEffect(() => {
    if (!active || !sessionId || !taskKey) return;

    function onPointerMove(e) {
      buffer.current.push({ x: e.clientX, y: e.clientY, t: Date.now() });
    }

    async function flush() {
      if (buffer.current.length === 0) return;
      const batch = buffer.current.splice(0);
      try {
        await fetch('/api/game/mouse', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ sessionId, taskKey, movements: batch }),
        });
      } catch {
        // Non-critical — discard batch on error
      }
    }

    function onPointerMoveStartInterval(e) {
      onPointerMove(e);
      // Start interval only after the first point arrives
      if (!intervalRef.current) {
        intervalRef.current = setInterval(flush, FLUSH_INTERVAL_MS);
      }
    }

    window.addEventListener('pointermove', onPointerMoveStartInterval);

    return () => {
      window.removeEventListener('pointermove', onPointerMoveStartInterval);
      clearInterval(intervalRef.current);
      intervalRef.current = null;
      flush(); // drain remaining buffer
    };
  }, [active, sessionId, taskKey]);
}
