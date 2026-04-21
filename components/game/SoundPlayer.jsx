"use client";

import { Howl } from "howler";
import { useEffect, useRef } from "react";

export default function SoundPlayer({ src, autoplay = false, onEnd }) {
  const soundRef = useRef(null);

  useEffect(() => {
    if (!src) return undefined;

    const sound = new Howl({
      src: [src],
      html5: true,
      preload: true,
      onend: onEnd,
    });
    soundRef.current = sound;
    if (autoplay) sound.play();

    return () => {
      sound.stop();
      sound.unload();
      soundRef.current = null;
    };
  }, [autoplay, onEnd, src]);

  return null;
}
