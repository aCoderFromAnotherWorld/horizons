"use client";

import SafeImage from "@/components/shared/SafeImage";
import { useState } from "react";

const EMOTION_EMOJIS = {
  happy: "😊",
  sad: "😢",
  angry: "😠",
  scared: "😨",
  neutral: "😐",
};

const EMOTION_COLORS = {
  happy: "bg-yellow-200",
  sad: "bg-blue-200",
  angry: "bg-red-200",
  scared: "bg-purple-200",
  neutral: "bg-zinc-200",
};

export default function EmotionFace({
  emotion = "neutral",
  intensity = 2,
  imagePath,
  alt = "",
  className = "",
}) {
  const [failed, setFailed] = useState(!imagePath);
  const size = intensity === 3 ? "text-7xl" : intensity === 1 ? "text-5xl" : "text-6xl";

  return (
    <div
      className={`grid aspect-[5/7] place-items-center overflow-hidden rounded-2xl p-3 bg-green-300 ${className}`}
    >
      {!failed ? (
        <div className="relative h-full w-full">
          <SafeImage
            src={imagePath}
            alt={alt}
            fill
            className="object-contain object-center"
            onError={() => setFailed(true)}
          />
        </div>
      ) : (
        <span className={size}>{EMOTION_EMOJIS[emotion] || EMOTION_EMOJIS.neutral}</span>
      )}
    </div>
  );
}
