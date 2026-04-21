"use client";

import { Howl } from "howler";
import { useCallback, useEffect, useMemo, useRef } from "react";

export function useAudio(src, options = {}) {
  const soundRef = useRef(null);
  const optionsRef = useRef(options);
  const optionsKey = useMemo(() => JSON.stringify(options), [options]);
  optionsRef.current = options;

  useEffect(() => {
    if (!src) return undefined;
    soundRef.current = new Howl({
      src: [src],
      preload: true,
      ...optionsRef.current,
    });

    return () => {
      soundRef.current?.unload();
      soundRef.current = null;
    };
  }, [src, optionsKey]);

  const play = useCallback(() => soundRef.current?.play(), []);
  const pause = useCallback(() => soundRef.current?.pause(), []);
  const stop = useCallback(() => soundRef.current?.stop(), []);

  return { play, pause, stop, sound: soundRef.current };
}
