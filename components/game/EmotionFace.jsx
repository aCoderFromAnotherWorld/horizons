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
      className={`grid aspect-square place-items-center rounded-2xl ${
        EMOTION_COLORS[emotion] || EMOTION_COLORS.neutral
      } ${className}`}
    >
      {!failed ? (
        <SafeImage
          src={imagePath}
          alt={alt}
          width={180}
          height={180}
          className="h-full w-full object-contain p-2"
          onError={() => setFailed(true)}
        />
      ) : (
        <span className={size}>{EMOTION_EMOJIS[emotion] || EMOTION_EMOJIS.neutral}</span>
      )}
    </div>
  );
}
