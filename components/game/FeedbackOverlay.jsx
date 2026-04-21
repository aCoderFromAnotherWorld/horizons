"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect } from "react";

export default function FeedbackOverlay({ show, correct, onComplete }) {
  useEffect(() => {
    if (!show) return undefined;
    const timeout = setTimeout(() => {
      onComplete?.();
    }, 800);
    return () => clearTimeout(timeout);
  }, [show, onComplete]);

  return (
    <AnimatePresence>
      {show ? (
        <motion.div
          className="fixed inset-0 z-[80] grid place-items-center bg-black/20"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          aria-live="polite"
        >
          <motion.div
            className={`text-8xl drop-shadow-xl ${correct ? "text-emerald-500" : "text-rose-500"}`}
            initial={{ scale: 0.3, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.6, opacity: 0 }}
            transition={{ type: "spring", stiffness: 320, damping: 18 }}
          >
            {correct ? "✓" : "✕"}
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
