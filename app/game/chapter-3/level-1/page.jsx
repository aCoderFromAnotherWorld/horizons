'use client';

import { useState, useEffect, useRef , useLayoutEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '@/store/gameStore.js';
import { useSettingsStore } from '@/store/settingsStore.js';
import { useSoundCue } from '@/hooks/useSoundCue.js';
import SceneCanvas from '@/components/game/SceneCanvas.jsx';
import FeedbackBurst from '@/components/game/FeedbackBurst.jsx';
import { GREETING_STEPS } from '@/lib/gameData/chapter3.js';

function delayMs(ms) { return new Promise(r => setTimeout(r, ms)); }

// Scoring per step
function scoreStep(stepId, responseMs, tapped) {
  if (stepId === 'knock')       return tapped ? 0 : 3;
  if (stepId === 'wave')        return tapped ? 0 : 2;
  if (stepId === 'eye_contact') {
    if (!tapped) return 2;
    return responseMs > 4000 ? 2 : 0;
  }
  return 0;
}

export default function Level1Page() {
  const router = useRouter();
  const sessionId   = useGameStore(s => s.sessionId);
  const addScore    = useGameStore(s => s.addScore);
  const goToChapter = useGameStore(s => s.goToChapter);
  const guideEmoji  = useSettingsStore(s => s.guideEmoji);
  const { play }    = useSoundCue();

  const [stepIdx, setStepIdx]     = useState(-1); // -1 = intro
  const [doorOpen, setDoorOpen]   = useState(false);
  const [friendOut, setFriendOut] = useState(false);
  const [feedback, setFeedback]   = useState({ show: false, correct: true });
  const [complete, setComplete]   = useState(false);

  const tapResolverRef = useRef(null);
  const responsesRef   = useRef([]);
  const runningRef     = useRef(false);
  const playRef        = useRef(play);
  const sessionIdRef   = useRef(sessionId);
  useLayoutEffect(() => {
    playRef.current      = play;
    sessionIdRef.current = sessionId;
  });

  function waitForTap(timeoutMs) {
    return new Promise(resolve => {
      const resolver = resolve;
      tapResolverRef.current = resolver;
      const t = setTimeout(() => {
        if (tapResolverRef.current === resolver) {
          tapResolverRef.current = null;
          resolve(null);
        }
      }, timeoutMs);
      tapResolverRef._tid = t;
    });
  }

  function handleTap() {
    if (!tapResolverRef.current) return;
    const resolver = tapResolverRef.current;
    tapResolverRef.current = null;
    clearTimeout(tapResolverRef._tid);
    resolver(Date.now());
  }

  useEffect(() => {
    if (runningRef.current) return;
    runningRef.current = true;
    goToChapter(3, 1);

    async function runSequence() {
      await delayMs(1200); // brief intro

      let totalScore = 0;

      for (let i = 0; i < GREETING_STEPS.length; i++) {
        const step = GREETING_STEPS[i];
        setStepIdx(i);
        const startedAt = Date.now();

        const tapTime = await waitForTap(step.timeout);
        const tapped = tapTime !== null;
        const responseMs = tapped ? tapTime - startedAt : step.timeout;
        const pts = scoreStep(step.id, responseMs, tapped);
        totalScore += pts;

        if (i === 0 && tapped) { setDoorOpen(true); await delayMs(600); }
        if (i === 1 && tapped) { setFriendOut(true); }

        responsesRef.current.push({
          taskKey: step.taskKey, startedAt,
          responseTimeMs: tapped ? responseMs : null,
          isCorrect: pts === 0, attemptNumber: 1, scorePoints: pts,
        });

        setFeedback({ show: true, correct: pts === 0 });
        if (pts === 0) playRef.current('cueCorrect');
        else playRef.current('cueWrong');
        await delayMs(700);
        setFeedback({ show: false, correct: true });

        if (i === 0 && !tapped) setDoorOpen(false);
        if (i === 0 && tapped) setFriendOut(false); // friend not yet
        if (i === 1 && !tapped) { /* stay */ }
      }

      // Ensure friend is visible for completion
      setFriendOut(true);
      setComplete(true);
      playRef.current('cueChapterComplete');

      console.log('[Ch3 L1] score:', totalScore, responsesRef.current);

      const sid = sessionIdRef.current;
      if (sid) {
        await Promise.allSettled([
          ...responsesRef.current.map(r =>
            fetch('/api/game/response', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ sessionId: sid, chapter: 3, level: 1, ...r }),
            })
          ),
          fetch('/api/game/score', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ sessionId: sid, chapterKey: 'ch3_social', rawPoints: totalScore }),
          }),
        ]);
        addScore('ch3_social', totalScore);
      }

      await delayMs(2000);
      goToChapter(3, 2);
      router.push('/game/chapter-3/level-2');
    }

    runSequence();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const currentStep = GREETING_STEPS[stepIdx];

  return (
    <SceneCanvas chapterNumber={3}>
      <FeedbackBurst
        show={feedback.show}
        correct={feedback.correct}
        onComplete={() => setFeedback(f => ({ ...f, show: false }))}
      />

      <div className="flex flex-col items-center justify-between min-h-dvh px-6 py-8 gap-4">
        {/* Header */}
        <div className="text-center">
          <motion.p
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-white/80 text-base font-semibold"
          >
            {stepIdx < 0 ? 'Get ready to meet a new friend! 🏠' : currentStep?.action ?? ''}
          </motion.p>
        </div>

        {/* Scene */}
        <div className="flex-1 flex items-center justify-center w-full max-w-sm">
          <div className="flex items-end justify-between w-full px-4">
            {/* Child avatar (left) */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="flex flex-col items-center gap-1"
            >
              <span className="text-6xl leading-none">🧒</span>
              <span className="text-xs text-white/70 font-medium">You</span>
            </motion.div>

            {/* Door + Friend (right) */}
            <div className="flex flex-col items-center gap-2 relative">
              {/* Door frame */}
              <div className="relative w-24 h-36 rounded-t-2xl border-4 border-white/30 bg-white/10 flex items-center justify-center overflow-hidden">
                {/* Door panel — swings open */}
                <AnimatePresence>
                  {!doorOpen && (
                    <motion.div
                      key="door"
                      initial={{ scaleX: 1 }}
                      exit={{ scaleX: 0, originX: 0 }}
                      transition={{ duration: 0.5, ease: 'easeIn' }}
                      className="absolute inset-0 rounded-t-xl"
                      style={{ background: 'linear-gradient(135deg, #67e8f9, #3b82f6)' }}
                    >
                      <div className="absolute right-3 top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-yellow-300" />
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Friend behind door */}
                <AnimatePresence>
                  {(doorOpen || friendOut) && (
                    <motion.div
                      key="friend"
                      initial={{ scale: 0.4, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                      className="text-5xl leading-none select-none relative z-10"
                    >
                      👧
                      {/* Eye-contact highlight ring */}
                      {stepIdx === 2 && (
                        <motion.div
                          className="absolute inset-0 rounded-full border-4 border-white/80"
                          animate={{ scale: [1, 1.2, 1], opacity: [0.8, 0.3, 0.8] }}
                          transition={{ duration: 1.2, repeat: Infinity }}
                          style={{ top: -10, left: -10, right: -10, bottom: -10 }}
                        />
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Door step */}
              <div className="w-28 h-3 rounded-full bg-white/25" />
              <span className="text-xs text-white/70 font-medium">Friend&apos;s door</span>
            </div>
          </div>
        </div>

        {/* Action button */}
        <AnimatePresence mode="wait">
          {stepIdx >= 0 && !complete && (
            <motion.div
              key={stepIdx}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
            >
              {stepIdx === 2 ? (
                /* Eye contact — tap the friend area directly (large invisible button overlay) */
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={handleTap}
                  className="bg-white/20 border-2 border-white/40 rounded-2xl px-8 py-5 text-white font-bold text-lg min-h-[64px] select-none"
                >
                  👀 Look at your friend!
                </motion.button>
              ) : (
                <motion.button
                  whileTap={{ scale: 0.92 }}
                  onClick={handleTap}
                  className="bg-white text-indigo-900 rounded-2xl px-8 py-5 font-extrabold text-lg min-h-[64px] shadow-xl select-none"
                >
                  {currentStep.emoji} {currentStep.action}
                </motion.button>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Complete overlay */}
      <AnimatePresence>
        {complete && (
          <motion.div
            initial={{ scale: 0.7, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="absolute inset-0 z-30 flex items-center justify-center bg-black/30 backdrop-blur-sm"
          >
            <div className="bg-white/20 rounded-3xl px-10 py-8 text-center border border-white/30 shadow-2xl">
              <div className="text-6xl mb-3">👋</div>
              <p className="text-2xl font-extrabold text-white">Great greeting!</p>
              <p className="text-white/70 mt-1">Level 1 complete!</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </SceneCanvas>
  );
}
