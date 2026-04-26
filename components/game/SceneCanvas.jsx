'use client';

import { motion } from 'framer-motion';
import { getTheme } from '@/lib/visual/themes.js';

const CHAPTER_DECORATIVES = {
  1: [
    { emoji: '💜', x: 5,  y: 8,  dur: 4.2 },
    { emoji: '🌟', x: 88, y: 12, dur: 3.8 },
    { emoji: '✨', x: 92, y: 85, dur: 5.1 },
    { emoji: '⭐', x: 3,  y: 88, dur: 4.6 },
    { emoji: '🌙', x: 50, y: 4,  dur: 3.5 },
  ],
  2: [
    { emoji: '🧡', x: 6,  y: 6,  dur: 4.0 },
    { emoji: '⭐', x: 90, y: 10, dur: 3.6 },
    { emoji: '✨', x: 88, y: 88, dur: 5.0 },
    { emoji: '💫', x: 4,  y: 90, dur: 4.4 },
    { emoji: '🌟', x: 48, y: 5,  dur: 3.9 },
  ],
  3: [
    { emoji: '💙', x: 5,  y: 7,  dur: 4.3 },
    { emoji: '🌟', x: 89, y: 9,  dur: 3.7 },
    { emoji: '✨', x: 91, y: 86, dur: 5.2 },
    { emoji: '⭐', x: 4,  y: 87, dur: 4.5 },
    { emoji: '💫', x: 49, y: 3,  dur: 3.6 },
  ],
  4: [
    { emoji: '💚', x: 6,  y: 8,  dur: 4.1 },
    { emoji: '⭐', x: 87, y: 11, dur: 3.9 },
    { emoji: '✨', x: 90, y: 87, dur: 5.0 },
    { emoji: '🌿', x: 3,  y: 89, dur: 4.7 },
    { emoji: '🌟', x: 51, y: 4,  dur: 3.4 },
  ],
  5: [
    { emoji: '💜', x: 5,  y: 6,  dur: 4.0 },
    { emoji: '🌸', x: 88, y: 10, dur: 3.8 },
    { emoji: '✨', x: 92, y: 88, dur: 5.3 },
    { emoji: '⭐', x: 3,  y: 86, dur: 4.6 },
    { emoji: '🌟', x: 47, y: 5,  dur: 3.5 },
  ],
  6: [
    { emoji: '⭐', x: 5,  y: 7,  dur: 4.2 },
    { emoji: '🌟', x: 89, y: 9,  dur: 3.6 },
    { emoji: '✨', x: 90, y: 87, dur: 5.1 },
    { emoji: '💫', x: 4,  y: 89, dur: 4.5 },
    { emoji: '🎉', x: 50, y: 4,  dur: 3.7 },
  ],
};

/**
 * Full-viewport container with chapter gradient background and floating
 * decorative emoji in the background layer.
 *
 * Props:
 *   chapterNumber — 1-6
 *   children      — game content rendered above decoratives
 */
export default function SceneCanvas({ chapterNumber = 1, children }) {
  const theme = getTheme(chapterNumber);
  const decoratives = CHAPTER_DECORATIVES[chapterNumber] ?? CHAPTER_DECORATIVES[1];

  return (
    <div
      className="relative w-full min-h-full overflow-hidden"
      style={{ background: theme.gradient }}
    >
      {/* Floating background decoratives */}
      {decoratives.map(({ emoji, x, y, dur }, i) => (
        <motion.div
          key={`dec-${i}`}
          className="absolute pointer-events-none select-none"
          style={{ left: `${x}%`, top: `${y}%`, fontSize: 36, opacity: 0.18 }}
          animate={{ y: [0, -16, 0] }}
          transition={{ duration: dur, repeat: Infinity, ease: 'easeInOut', delay: i * 0.4 }}
        >
          {emoji}
        </motion.div>
      ))}

      {/* Page content */}
      <div className="relative z-10 w-full min-h-full">
        {children}
      </div>
    </div>
  );
}
