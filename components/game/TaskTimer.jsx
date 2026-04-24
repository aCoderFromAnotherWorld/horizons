'use client';

import { forwardRef, useImperativeHandle, useRef } from 'react';

/**
 * Headless timer component.
 * Exposes `{ start(), stop() }` via ref.
 * `stop()` returns elapsed milliseconds since the last `start()` call.
 * Renders null.
 */
const TaskTimer = forwardRef(function TaskTimer(_props, ref) {
  const startTime = useRef(null);

  useImperativeHandle(ref, () => ({
    start() {
      startTime.current = performance.now();
    },
    stop() {
      if (startTime.current === null) return 0;
      const elapsed = Math.round(performance.now() - startTime.current);
      startTime.current = null;
      return elapsed;
    },
  }));

  return null;
});

export default TaskTimer;
