'use client';

import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useGameStore } from '@/store/gameStore.js';
import { CHAPTER_THEMES } from '@/lib/visual/themes.js';

const CHAPTERS = [
  { num: 1, levels: 2,  emoji: '🏡', firstUrl: '/game/chapter-1/level-1' },
  { num: 2, levels: 3,  emoji: '🎭', firstUrl: '/game/chapter-2/level-1' },
  { num: 3, levels: 4,  emoji: '🤝', firstUrl: '/game/chapter-3/level-1' },
  { num: 4, levels: 4,  emoji: '🔄', firstUrl: '/game/chapter-4/level-1' },
  { num: 5, levels: 3,  emoji: '🎨', firstUrl: '/game/chapter-5/level-1' },
  { num: 6, levels: 1,  emoji: '⭐', firstUrl: '/game/chapter-6' },
];

const container = {
  animate: {
    transition: { staggerChildren: 0.1, delayChildren: 0.1 },
  },
};

const islandVariant = {
  initial: { scale: 0, opacity: 0 },
  animate: {
    scale: 1,
    opacity: 1,
    transition: { type: 'spring', stiffness: 350, damping: 22 },
  },
};

export default function MapPage() {
  const router         = useRouter();
  const currentChapter = useGameStore((s) => s.currentChapter);
  const currentLevel   = useGameStore((s) => s.currentLevel);
  const playerName     = useGameStore((s) => s.playerName);

  function handleChapterTap(ch) {
    // Only allow entering the current chapter; completed and locked chapters are non-interactive.
    if (ch.num !== currentChapter) return;

    const url = ch.num === 6
      ? '/game/chapter-6'
      : `/game/chapter-${ch.num}/level-${currentLevel}`;
    router.push(url);
  }

  return (
    <div className="min-h-full flex flex-col items-center px-4 py-6">
      {/* Header */}
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1, transition: { duration: 0.5, ease: 'easeOut' } }}
        className="text-center mb-6"
      >
        <h1 className="text-3xl font-extrabold text-white drop-shadow mb-1">
          🗺️ Adventure Map
        </h1>
        {playerName && (
          <p className="text-white/75 text-base">
            Choose your next adventure, <span className="font-bold text-white">{playerName}</span>!
          </p>
        )}
        {!playerName && (
          <p className="text-white/75 text-base">Choose your next adventure!</p>
        )}
      </motion.div>

      {/* Island grid */}
      <motion.div
        variants={container}
        initial="initial"
        animate="animate"
        className="grid grid-cols-2 sm:grid-cols-3 gap-5 w-full max-w-lg"
      >
        {CHAPTERS.map((ch) => {
          const theme     = CHAPTER_THEMES[`ch${ch.num}`];
          const completed = ch.num < currentChapter;
          const active    = ch.num === currentChapter;
          const locked    = ch.num > currentChapter;

          return (
            <motion.div
              key={ch.num}
              variants={islandVariant}
              className="relative"
            >
              {/* Pulsing ring for current chapter */}
              {active && (
                <motion.div
                  animate={{ scale: [1, 1.12, 1], opacity: [0.6, 0.2, 0.6] }}
                  transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                  className="absolute inset-0 rounded-3xl pointer-events-none"
                  style={{ backgroundColor: theme.primary, zIndex: 0 }}
                />
              )}

              <motion.button
                whileHover={!locked && !completed ? { scale: 1.05, y: -3 } : {}}
                whileTap={!locked && !completed ? { scale: 0.95 } : {}}
                onClick={() => handleChapterTap(ch)}
                disabled={locked || completed}
                className="relative z-10 w-full flex flex-col items-center gap-2 rounded-3xl p-4 min-h-[140px] justify-center select-none transition-all"
                style={{
                  background: locked
                    ? 'rgba(255,255,255,0.08)'
                    : completed
                    ? `linear-gradient(135deg, ${theme.secondary}cc, ${theme.primary}cc)`
                    : `linear-gradient(135deg, ${theme.secondary}, ${theme.primary})`,
                  border: active
                    ? `3px solid white`
                    : completed
                    ? `2px solid ${theme.secondary}80`
                    : `2px solid rgba(255,255,255,0.15)`,
                  opacity: locked ? 0.45 : 1,
                  boxShadow: active
                    ? `0 8px 32px ${theme.primary}66`
                    : completed
                    ? `0 4px 16px ${theme.primary}44`
                    : 'none',
                  cursor: locked ? 'not-allowed' : 'pointer',
                }}
              >
                {/* Lock overlay */}
                {locked && (
                  <div className="absolute inset-0 rounded-3xl flex items-center justify-center z-20">
                    <span className="text-4xl opacity-70">🔒</span>
                  </div>
                )}

                {/* Completed tick */}
                {completed && (
                  <div className="absolute top-2 right-2 text-xl z-20">✅</div>
                )}

                <span className="text-5xl leading-none">{ch.emoji}</span>
                <div className="text-center">
                  <p className="text-xs font-bold text-white/60 uppercase tracking-wider mb-0.5">
                    Chapter {ch.num}
                  </p>
                  <p className="text-sm font-bold text-white leading-tight">
                    {theme.name}
                  </p>
                </div>

                {/* Level dots */}
                {!locked && (
                  <div className="flex gap-1 mt-1">
                    {Array.from({ length: ch.levels }, (_, i) => {
                      const lvDone = completed || (active && i + 1 < currentLevel);
                      const lvActive = active && i + 1 === currentLevel;
                      return (
                        <div
                          key={i}
                          className="rounded-full"
                          style={{
                            width: lvActive ? 10 : 7,
                            height: lvActive ? 10 : 7,
                            backgroundColor: lvDone
                              ? 'rgba(255,255,255,0.9)'
                              : lvActive
                              ? '#ffffff'
                              : 'rgba(255,255,255,0.3)',
                          }}
                        />
                      );
                    })}
                  </div>
                )}
              </motion.button>
            </motion.div>
          );
        })}
      </motion.div>

      {/* Decorative footer text */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1, transition: { delay: 0.8 } }}
        className="mt-8 text-white/70 text-xs text-center"
      >
        🌟 Complete each chapter to unlock the next adventure!
      </motion.p>
    </div>
  );
}
