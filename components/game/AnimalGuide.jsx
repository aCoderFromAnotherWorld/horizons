"use client";

import { motion } from "framer-motion";
import SafeImage from "@/components/shared/SafeImage";

import { cn } from "@/lib/utils";

export default function AnimalGuide({
  guide,
  state = "idle",
  pointing = false,
  onClick,
  className,
  showPointer = false,
  pointerLabel = "Pointing paw",
  onPointerClick,
}) {
  const image = pointing && guide?.pointImage ? guide.pointImage : guide?.image;

  return (
    <div className={cn("relative inline-flex flex-col items-center", className)}>
      <motion.button
        type="button"
        onClick={onClick}
        className="relative rounded-lg bg-white/90 p-3 shadow-xl"
        animate={
          state === "speaking"
            ? { y: [0, -8, 0], scale: [1, 1.04, 1] }
            : state === "react"
              ? { rotate: [0, -6, 6, 0] }
              : { y: [0, -3, 0] }
        }
        transition={{ duration: state === "speaking" ? 0.8 : 2.4, repeat: Infinity }}
        aria-label={`Click ${guide?.name || "guide"}`}
      >
        <SafeImage
          src={image || "/assets/characters/guides/bunny.webp"}
          alt={guide?.name || "Guide"}
          width={180}
          height={220}
          className={cn("h-36 w-28 object-contain sm:h-44 sm:w-36", pointing && "translate-x-2")}
        />
      </motion.button>

      {state === "speaking" ? (
        <motion.div
          className="absolute -top-8 rounded-full bg-white px-4 py-2 text-base font-black text-indigo-900 shadow-lg sm:text-lg"
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
        >
          Hello!
        </motion.div>
      ) : null}

      {showPointer ? (
        <motion.button
          type="button"
          onClick={onPointerClick}
          className="absolute -right-7 top-12 rounded-full bg-yellow-300 px-3 py-2 text-2xl shadow-lg sm:-right-10 sm:top-16 sm:px-4 sm:text-3xl"
          animate={{ x: [0, 12, 0] }}
          transition={{ duration: 0.8, repeat: Infinity }}
          aria-label={pointerLabel}
        >
          👉
        </motion.button>
      ) : null}
    </div>
  );
}
