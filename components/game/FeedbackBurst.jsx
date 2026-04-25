'use client';

import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const BURST_DURATION_MS = 700;

/**
 * Fixed-position visual feedback overlay.
 * Correct: expanding green ring burst + star emoji.
 * Wrong:   gentle amber shake ring.
 * Never shows text — keeps feedback visual and gentle.
 *
 * Props:
 *   show       — boolean: whether to display
 *   correct    — boolean: correct (green) or wrong (amber)
 *   onComplete — callback fired after BURST_DURATION_MS
 */
export default function FeedbackBurst({ show, correct, onComplete }) {
  useEffect(() => {
    if (!show || !onComplete) return;
    const t = setTimeout(onComplete, BURST_DURATION_MS);
    return () => clearTimeout(t);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [show]);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          key="feedback-burst"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: 0.15 } }}
          className="fixed inset-0 z-30 flex items-center justify-center pointer-events-none"
        >
          {correct ? (
            <>
              {/* Expanding green ring */}
              <motion.div
                className="absolute rounded-full border-[6px] border-green-400"
                initial={{ width: 48, height: 48, opacity: 0.9 }}
                animate={{ width: 220, height: 220, opacity: 0 }}
                transition={{ duration: 0.65, ease: 'easeOut' }}
              />
              {/* Second smaller ring for depth */}
              <motion.div
                className="absolute rounded-full border-[4px] border-emerald-300"
                initial={{ width: 32, height: 32, opacity: 0.7 }}
                animate={{ width: 140, height: 140, opacity: 0 }}
                transition={{ duration: 0.5, ease: 'easeOut', delay: 0.06 }}
              />
              {/* Star burst emoji */}
              <motion.span
                className="absolute text-5xl select-none"
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: [0, 1.5, 1.2], opacity: [0, 1, 0] }}
                transition={{ duration: 0.6, ease: 'easeOut' }}
              >
                ⭐
              </motion.span>
            </>
          ) : (
            /* Gentle amber ring — never jarring */
            <motion.div
              className="rounded-full border-[5px] border-amber-400"
              initial={{ width: 80, height: 80, opacity: 0.9 }}
              animate={{
                width: [80, 110, 90, 100, 80],
                height: [80, 110, 90, 100, 80],
                opacity: [0.9, 1, 0.8, 0.6, 0],
              }}
              transition={{ duration: 0.55, ease: 'easeInOut' }}
            />
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
