'use client';

import { motion } from 'framer-motion';
import { useGameStore } from '@/store/gameStore.js';
import { CHAPTER_THEMES } from '@/lib/visual/themes.js';

const CHAPTER_LEVELS = { 1: 2, 2: 3, 3: 4, 4: 4, 5: 3, 6: 1 };
const CHAPTERS = [1, 2, 3, 4, 5, 6];

export default function ProgressBar() {
  const currentChapter = useGameStore((s) => s.currentChapter);
  const currentLevel   = useGameStore((s) => s.currentLevel);

  const levelCount = CHAPTER_LEVELS[currentChapter] ?? 1;

  return (
    <div className="flex flex-col gap-1 px-4 pt-2 pb-1 bg-black/20 backdrop-blur-sm">
      {/* Chapter dots */}
      <div className="flex items-center justify-center gap-2">
        {CHAPTERS.map((ch) => {
          const theme = CHAPTER_THEMES[`ch${ch}`];
          const completed = ch < currentChapter;
          const active    = ch === currentChapter;
          return (
            <div key={ch} className="flex flex-col items-center gap-0.5">
              <motion.div
                animate={active ? { scale: [1, 1.2, 1] } : {}}
                transition={{ duration: 1.2, repeat: Infinity, ease: 'easeInOut' }}
                className="relative flex items-center justify-center rounded-full text-base"
                style={{
                  width: 28,
                  height: 28,
                  backgroundColor: completed || active ? theme.primary : 'rgba(255,255,255,0.15)',
                  opacity: !completed && !active ? 0.4 : 1,
                  boxShadow: active ? `0 0 8px ${theme.primary}99` : 'none',
                }}
              >
                <span style={{ fontSize: 14 }}>
                  {completed ? '✅' : theme.emoji}
                </span>
              </motion.div>
            </div>
          );
        })}
      </div>

      {/* Level dots for current chapter */}
      <div className="flex items-center justify-center gap-1.5">
        {Array.from({ length: levelCount }, (_, i) => i + 1).map((lv) => {
          const done   = lv < currentLevel;
          const active = lv === currentLevel;
          return (
            <motion.div
              key={lv}
              animate={active ? { opacity: [1, 0.5, 1] } : {}}
              transition={{ duration: 1, repeat: Infinity, ease: 'easeInOut' }}
              className="rounded-full"
              style={{
                width: active ? 10 : 7,
                height: active ? 10 : 7,
                backgroundColor: done
                  ? 'rgba(255,255,255,0.9)'
                  : active
                  ? '#ffffff'
                  : 'rgba(255,255,255,0.3)',
              }}
            />
          );
        })}
      </div>
    </div>
  );
}
