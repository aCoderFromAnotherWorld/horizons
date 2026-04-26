'use client';

import { useState, useEffect, useLayoutEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '@/store/gameStore.js';
import { useSettingsStore } from '@/store/settingsStore.js';
import { useSoundCue } from '@/hooks/useSoundCue.js';
import SceneCanvas from '@/components/game/SceneCanvas.jsx';
import PracticeDemo from '@/components/game/PracticeDemo.jsx';
import FeedbackBurst from '@/components/game/FeedbackBurst.jsx';
import { GUIDE_TARGETS, LEVEL2_PRACTICE_STEPS } from '@/lib/gameData/chapter1.js';

const GUIDE_POSITION = { x: 50, y: 78 }; // guide sits near bottom-center (%)

/** Score a guide-following trial. */
function scoreGuide(result) {
  if (result === 'correct')  return 0;
  if (result === 'wrong')    return 1; // needs repeated pointing
  if (result === 'guide')    return 2; // tapped guide instead
  return 3; // timeout / ignored
}

function delayMs(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export default function Level2Page() {
  const router = useRouter();
  const sessionId   = useGameStore(s => s.sessionId);
  const addScore    = useGameStore(s => s.addScore);
  const goToChapter = useGameStore(s => s.goToChapter);
  const guideEmoji  = useSettingsStore(s => s.guideEmoji);
  const { play }    = useSoundCue();

  const [showPractice, setShowPractice]   = useState(true);
  const [phase, setPhase]                 = useState('idle');
  const [targetIdx, setTargetIdx]         = useState(0);
  const [guideKey, setGuideKey]           = useState(0);
  const [activeTarget, setActiveTarget]   = useState(null); // null | targetIdx
  const [feedback, setFeedback]           = useState({ show: false, correct: true });
  const [complete, setComplete]           = useState(false);
  const [doneTaskKeys, setDoneTaskKeys]   = useState(new Set());

  const tapResolverRef = useRef(null);
  const responsesRef   = useRef([]);
  const runningRef     = useRef(false);
  const playRef        = useRef(play);
  const sessionIdRef   = useRef(sessionId);

  useLayoutEffect(() => {
    playRef.current      = play;
    sessionIdRef.current = sessionId;
  });

  // Resolves with { type: 'correct' | 'guide' | 'wrong' | 'timeout' }
  function waitForAnyTap(timeoutMs) {
    return new Promise(resolve => {
      const resolver = resolve;
      tapResolverRef.current = resolver;
      const t = setTimeout(() => {
        if (tapResolverRef.current === resolver) {
          tapResolverRef.current = null;
          resolve({ type: 'timeout' });
        }
      }, timeoutMs);
      tapResolverRef._tid = t;
    });
  }

  function resolveTap(type) {
    if (!tapResolverRef.current) return;
    const resolver = tapResolverRef.current;
    tapResolverRef.current = null;
    clearTimeout(tapResolverRef._tid);
    resolver({ type });
  }

  function handleTargetTap() { resolveTap('correct'); }
  function handleGuideTap()  { resolveTap('guide'); }
  function handleWrongTap()  { resolveTap('wrong'); }

  async function runGame() {
    if (runningRef.current) return;
    runningRef.current = true;
    goToChapter(1, 2);

    let totalPoints = 0;

    for (let i = 0; i < GUIDE_TARGETS.length; i++) {
      const target = GUIDE_TARGETS[i];
      setTargetIdx(i);
      setActiveTarget(i);

      // Animate guide "pointing" to this target
      setPhase('pointing');
      setGuideKey(k => k + 1);
      playRef.current('cueGuideSpeak');
      await delayMs(1000); // guide pointing animation plays

      setPhase('waiting');

      let result = 'timeout';
      let pts = 0;

      // First attempt — 8 second window
      const tap1 = await waitForAnyTap(8000);

      if (tap1.type === 'correct') {
        result = 'correct';
        pts = 0;
      } else if (tap1.type === 'guide') {
        result = 'guide';
        pts = 2;
      } else if (tap1.type === 'timeout') {
        result = 'timeout';
        pts = 3;
      } else {
        // Wrong — allow one retry with re-pointing
        pts = 1;
        setPhase('pointing');
        setGuideKey(k => k + 1);
        playRef.current('cueGuideSpeak');
        await delayMs(800);
        setPhase('waiting');

        const tap2 = await waitForAnyTap(5000);
        // Score stays 1 regardless of second attempt outcome
        result = tap2.type === 'correct' ? 'correct' : 'wrong';
        pts = 1;
      }

      totalPoints += pts;

      responsesRef.current.push({
        taskKey:        target.taskKey,
        startedAt:      Date.now(),
        responseTimeMs: null,
        isCorrect:      result === 'correct',
        attemptNumber:  result === 'wrong' ? 2 : 1,
        scorePoints:    pts,
        extraData:      { result },
      });
      setDoneTaskKeys(prev => { const s = new Set(prev); s.add(target.taskKey); return s; });

      // Feedback
      setActiveTarget(null);
      setFeedback({ show: true, correct: pts === 0 });
      if (pts === 0) playRef.current('cueCorrect');
      else if (pts <= 1) playRef.current('cueWrong');
      else playRef.current('cueWrong');

      setPhase('feedback');
      await delayMs(800);
      setFeedback({ show: false, correct: true });
    }

    // Chapter complete
    setPhase('idle');
    playRef.current('cueChapterComplete');
    setComplete(true);

    const sid = sessionIdRef.current;
    if (sid) {
      await Promise.allSettled([
        ...responsesRef.current.map(r =>
          fetch('/api/game/response', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ sessionId: sid, chapter: 1, level: 2, ...r }),
          })
        ),
        fetch('/api/game/score', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ sessionId: sid, chapterKey: 'ch1_baseline', rawPoints: totalPoints }),
        }),
      ]);
      addScore('ch1_baseline', totalPoints);
    }

    await delayMs(2500);
    goToChapter(2, 1);
    router.push('/game/map');
  }

  return (
    <SceneCanvas chapterNumber={1}>
      <FeedbackBurst
        show={feedback.show}
        correct={feedback.correct}
        onComplete={() => setFeedback(f => ({ ...f, show: false }))}
      />

      {/* Practice demo overlay */}
      <AnimatePresence>
        {showPractice && (
          <motion.div
            key="practice"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-20 flex items-center justify-center bg-black/40 backdrop-blur-sm"
          >
            <PracticeDemo
              steps={LEVEL2_PRACTICE_STEPS}
              onComplete={() => {
                setShowPractice(false);
                runGame();
              }}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Game scene */}
      {!showPractice && (
        <div className="relative w-full min-h-full">
          {/* Target emoji objects */}
          {GUIDE_TARGETS.map((target, i) => {
            const isActive = activeTarget === i;
            const isDone   = doneTaskKeys.has(target.taskKey);
            const isCurrent = targetIdx === i && !isDone;

            return (
              <motion.button
                key={target.taskKey}
                className="absolute transform -translate-x-1/2 -translate-y-1/2 select-none focus:outline-none"
                style={{
                  left: `${target.x}%`,
                  top:  `${target.y}%`,
                  fontSize: 64,
                  lineHeight: 1,
                  background: 'none',
                  border: 'none',
                  padding: 8,
                  minWidth: 80,
                  minHeight: 80,
                }}
                animate={
                  isActive
                    ? { scale: [1, 1.15, 1], filter: ['brightness(1)', 'brightness(1.4)', 'brightness(1)'] }
                    : isDone
                    ? { scale: 0.8, opacity: 0.35 }
                    : { scale: 1, opacity: 0.6 }
                }
                transition={isActive ? { duration: 1, repeat: Infinity } : { duration: 0.3 }}
                onClick={isCurrent && phase === 'waiting' ? handleTargetTap : undefined}
                onPointerDown={isCurrent && phase !== 'waiting' ? handleWrongTap : undefined}
                aria-label={`Tap ${target.emoji}`}
              >
                {isDone ? '✅' : target.emoji}
                {isActive && (
                  <motion.div
                    className="absolute inset-0 rounded-full border-4 border-white/70"
                    animate={{ scale: [1, 1.4, 1], opacity: [0.7, 0.1, 0.7] }}
                    transition={{ duration: 1.2, repeat: Infinity }}
                    style={{ top: -8, left: -8, right: -8, bottom: -8 }}
                  />
                )}
              </motion.button>
            );
          })}

          {/* Guide character at bottom */}
          <motion.button
            key={`guide-${guideKey}`}
            className="absolute transform -translate-x-1/2 -translate-y-1/2 select-none focus:outline-none"
            style={{
              left: `${GUIDE_POSITION.x}%`,
              top:  `${GUIDE_POSITION.y}%`,
              fontSize: 72,
              background: 'none',
              border: 'none',
              padding: 0,
              lineHeight: 1,
            }}
            animate={
              phase === 'pointing'
                ? { scale: [1, 1.3, 0.9, 1.15, 1], rotate: [0, -15, 15, -8, 0] }
                : { y: [0, -8, 0] }
            }
            transition={
              phase === 'pointing'
                ? { duration: 0.7, ease: 'easeOut' }
                : { duration: 2.4, repeat: Infinity, ease: 'easeInOut' }
            }
            onClick={phase === 'waiting' ? handleGuideTap : undefined}
            aria-label="Guide character"
          >
            {guideEmoji}
          </motion.button>

          {/* Wrong-tap handler for non-active areas */}
          {phase === 'waiting' &&
            GUIDE_TARGETS.map((target, i) =>
              i !== targetIdx ? (
                <motion.div
                  key={`wrong-${target.taskKey}`}
                  className="absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer"
                  style={{
                    left: `${target.x}%`,
                    top:  `${target.y}%`,
                    width: 80,
                    height: 80,
                    zIndex: 5,
                  }}
                  onClick={handleWrongTap}
                />
              ) : null
            )}
        </div>
      )}

      {/* Chapter complete card */}
      <AnimatePresence>
        {complete && (
          <motion.div
            initial={{ scale: 0.7, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="absolute inset-0 flex items-center justify-center z-30 bg-black/30 backdrop-blur-sm"
          >
            <motion.div
              animate={{ y: [0, -8, 0] }}
              transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
              className="bg-white/20 backdrop-blur-sm rounded-3xl px-10 py-10 text-center border border-white/30 shadow-2xl"
            >
              <div className="text-6xl mb-3">🌟</div>
              <p className="text-3xl font-extrabold text-white drop-shadow mb-1">Great job!</p>
              <p className="text-white/80 text-base">Chapter 1 complete!</p>
              <p className="text-white/60 text-sm mt-2">Heading back to the map…</p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </SceneCanvas>
  );
}
