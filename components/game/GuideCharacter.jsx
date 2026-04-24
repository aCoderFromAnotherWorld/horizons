'use client';

import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSettingsStore } from '@/store/settingsStore.js';
import { floatLoop } from '@/lib/visual/animations.js';

const PHRASES = [
  "You're doing amazing! 🌟",
  "Keep it up, superstar! 💪",
  "You're so smart! 🧠",
  "Awesome job! 🎉",
  "I believe in you! 💖",
  "Way to go! 🚀",
  "You can do it! 🌈",
  "Great thinking! ⭐",
];

/**
 * Animated guide emoji that shows an encouraging speech bubble on tap.
 * Reads the selected guide from settingsStore.
 * Props: size (px, default 56)
 */
export default function GuideCharacter({ size = 56 }) {
  const guideEmoji = useSettingsStore((s) => s.guideEmoji);
  const [phrase, setPhrase] = useState(null);

  const handleTap = useCallback(() => {
    const next = PHRASES[Math.floor(Math.random() * PHRASES.length)];
    setPhrase(next);
    setTimeout(() => setPhrase(null), 3000);
  }, []);

  return (
    <div className="relative flex flex-col items-center">
      {/* Speech bubble */}
      <AnimatePresence>
        {phrase && (
          <motion.div
            key={phrase}
            initial={{ scale: 0.7, opacity: 0, y: 8 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.7, opacity: 0, y: 8 }}
            transition={{ type: 'spring', stiffness: 400, damping: 22 }}
            className="absolute bottom-full mb-2 bg-white rounded-2xl px-3 py-2 shadow-lg max-w-[180px] text-center pointer-events-none z-10"
            style={{ fontSize: 13, color: '#1a1a2e', fontWeight: 600, lineHeight: 1.3 }}
          >
            {phrase}
            {/* bubble tail */}
            <div
              className="absolute left-1/2 -translate-x-1/2 -bottom-2 w-0 h-0"
              style={{
                borderLeft: '8px solid transparent',
                borderRight: '8px solid transparent',
                borderTop: '8px solid white',
              }}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Guide emoji with float animation */}
      <motion.button
        animate={floatLoop.animate}
        whileTap={{ scale: 0.85 }}
        onClick={handleTap}
        className="cursor-pointer select-none focus:outline-none"
        aria-label="Guide character — tap for encouragement"
        style={{ fontSize: size, lineHeight: 1, background: 'none', border: 'none', padding: 4 }}
      >
        {guideEmoji}
      </motion.button>
    </div>
  );
}
