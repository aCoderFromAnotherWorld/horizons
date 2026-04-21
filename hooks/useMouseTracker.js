"use client";

import { useEffect } from "react";

export function useMouseTracker(sessionId, taskKey, active = true) {
  useEffect(() => {
    if (!active || !sessionId || !taskKey) return undefined;

    const buffer = [];
    let lastRecordedAt = 0;
    let flushInFlight = false;
    const handler = (event) => {
      const now = Date.now();
      if (now - lastRecordedAt < 100) return;
      lastRecordedAt = now;
      buffer.push({ x: event.clientX, y: event.clientY, t: now });
    };

    const flushBuffer = async () => {
      if (flushInFlight || buffer.length === 0) return;
      flushInFlight = true;
      const batch = buffer.splice(0, buffer.length);
      try {
        await fetch("/api/mouse", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ sessionId, taskKey, movements: batch }),
        });
      } catch {
        buffer.unshift(...batch);
      } finally {
        flushInFlight = false;
      }
    };

    window.addEventListener("mousemove", handler);
    window.addEventListener("pagehide", flushBuffer);
    const flush = setInterval(flushBuffer, 500);

    return () => {
      window.removeEventListener("mousemove", handler);
      window.removeEventListener("pagehide", flushBuffer);
      clearInterval(flush);
      void flushBuffer();
    };
  }, [sessionId, taskKey, active]);
}
