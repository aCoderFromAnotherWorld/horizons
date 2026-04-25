'use client';

import { useState, useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '@/store/gameStore.js';
import { useSettingsStore } from '@/store/settingsStore.js';
import { getTheme } from '@/lib/visual/themes.js';
import { getAnimations } from '@/lib/visual/animations.js';
import ProgressBar from '@/components/game/ProgressBar.jsx';
import GuideCharacter from '@/components/game/GuideCharacter.jsx';

// Pages within (game) that don't show the full shell UI
const SHELL_EXCLUDED = ['/game/start'];

export default function GameLayout({ children }) {
  const pathname     = usePathname();
  const currentChapter = useGameStore((s) => s.currentChapter);
  const incrementBreak = useGameStore((s) => s.incrementBreak);
  const sessionId      = useGameStore((s) => s.sessionId);
  const breakCount     = useGameStore((s) => s.breakCount);
  const sensoryLevel   = useSettingsStore((s) => s.sensoryLevel);

  const theme      = getTheme(currentChapter);
  const animations = getAnimations(sensoryLevel);
  const showShell  = !SHELL_EXCLUDED.includes(pathname);

  const [onBreak, setOnBreak]         = useState(false);
  const [breakProgress, setBreakProgress] = useState(100);
  const breakTimerRef = useRef(null);
  const progressRef   = useRef(null);

  function startBreak() {
    incrementBreak();
    // Persist break count to DB (non-blocking)
    const newCount = breakCount + 1;
    if (sessionId) {
      fetch(`/api/game/session/${sessionId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ breakCount: newCount }),
      }).catch(() => {});
    }
    setOnBreak(true);
    setBreakProgress(100);

    // Animate progress bar from 100→0 over 10s
    const startTime = Date.now();
    progressRef.current = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const remaining = Math.max(0, 100 - (elapsed / 10000) * 100);
      setBreakProgress(remaining);
      if (remaining === 0) endBreak();
    }, 100);
  }

  function endBreak() {
    clearInterval(progressRef.current);
    setOnBreak(false);
    setBreakProgress(100);
  }

  // Ambient sound: start after first user gesture, stop on unmount / chapter change
  useEffect(() => {
    let started = false;
    let startAmbientFn, stopAmbientFn;

    async function loadAndStart() {
      if (started) return;
      started = true;
      try {
        const cues = await import('@/lib/sound/cues.js');
        startAmbientFn = cues.startAmbient;
        stopAmbientFn  = cues.stopAmbient;
        await cues.startAmbient(currentChapter);
      } catch {
        // Tone.js may be unavailable or blocked
      }
    }

    function onGesture() {
      loadAndStart();
      window.removeEventListener('pointerdown', onGesture);
    }
    window.addEventListener('pointerdown', onGesture, { once: true });

    return () => {
      window.removeEventListener('pointerdown', onGesture);
      if (stopAmbientFn) stopAmbientFn();
    };
  }, [currentChapter]);

  // Cleanup break timer on unmount
  useEffect(() => () => clearInterval(progressRef.current), []);

  return (
    <div
      className="relative flex flex-col min-h-dvh overflow-hidden"
      style={{ background: theme.gradient }}
    >
      {/* Top bar: progress (only on chapter pages) */}
      {showShell && (
        <div className="relative z-10 shrink-0">
          <ProgressBar />
        </div>
      )}

      {/* Main content — animated on route change */}
      <div className="flex-1 relative z-0 overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.div
            key={pathname}
            initial={animations.pageTransition.initial}
            animate={animations.pageTransition.animate}
            exit={animations.pageTransition.exit}
            className="absolute inset-0 overflow-y-auto"
          >
            {children}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Bottom bar: guide + break button (only on chapter pages) */}
      {showShell && (
        <div className="relative z-10 shrink-0 flex items-center justify-between px-4 py-3 bg-black/20 backdrop-blur-sm">
          <GuideCharacter size={48} />
          <motion.button
            whileTap={{ scale: 0.92 }}
            onClick={startBreak}
            className="flex items-center gap-2 bg-white/20 hover:bg-white/30 active:bg-white/40 text-white font-bold rounded-2xl px-4 py-3 min-h-[56px] min-w-[56px] text-sm transition-colors select-none"
          >
            <span className="text-xl">🛑</span>
            <span>Break</span>
          </motion.button>
        </div>
      )}

      {/* Break overlay */}
      <AnimatePresence>
        {onBreak && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-indigo-900/85 backdrop-blur-md"
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 300, damping: 24 }}
              className="flex flex-col items-center gap-6 text-center px-8"
            >
              {/* Breathing circle */}
              <motion.div
                animate={{ scale: [1, 1.25, 1] }}
                transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                className="w-28 h-28 rounded-full bg-white/20 flex items-center justify-center"
              >
                <motion.div
                  animate={{ scale: [1, 1.3, 1] }}
                  transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
                  className="w-20 h-20 rounded-full bg-white/30 flex items-center justify-center"
                >
                  <span className="text-4xl">🌬️</span>
                </motion.div>
              </motion.div>

              <p className="text-2xl font-bold text-white drop-shadow">Take a deep breath 🌟</p>
              <p className="text-base text-white/80">Breathe in… breathe out… you&apos;re doing great!</p>

              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={endBreak}
                className="bg-white text-indigo-900 font-bold text-lg rounded-2xl px-8 py-4 min-h-[64px] shadow-lg"
              >
                I&apos;m ready! 👍
              </motion.button>

              {/* Progress bar (not a number — just visual) */}
              <div className="w-48 h-1.5 bg-white/20 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-white/70 rounded-full"
                  style={{ width: `${breakProgress}%` }}
                  transition={{ duration: 0.1 }}
                />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
