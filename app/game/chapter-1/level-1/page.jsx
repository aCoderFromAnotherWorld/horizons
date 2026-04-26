'use client';

import { useState, useEffect, useLayoutEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '@/store/gameStore.js';
import { useSettingsStore } from '@/store/settingsStore.js';
import { useSoundCue } from '@/hooks/useSoundCue.js';
import TaskTimer from '@/components/game/TaskTimer.jsx';
import SceneCanvas from '@/components/game/SceneCanvas.jsx';
import FeedbackBurst from '@/components/game/FeedbackBurst.jsx';
import { NAME_RESPONSE_TRIALS } from '@/lib/gameData/chapter1.js';

/** Score a name-response trial based on response time and whether tapped at all. */
function scoreNameTrial(responseMs) {
  if (responseMs < 2000) return 0;
  if (responseMs <= 5000) return 1;
  return 2;
}

function delayMs(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export default function Level1Page() {
  const router = useRouter();
  const sessionId      = useGameStore(s => s.sessionId);
  const playerName     = useGameStore(s => s.playerName);
  const addScore       = useGameStore(s => s.addScore);
  const goToChapter    = useGameStore(s => s.goToChapter);
  const guideEmoji     = useSettingsStore(s => s.guideEmoji);
  const { play }       = useSoundCue();

  const [phase, setPhase]         = useState('intro');
  const [trialIdx, setTrialIdx]   = useState(0);
  const [guideKey, setGuideKey]   = useState(0);
  const [feedback, setFeedback]   = useState({ show: false, correct: true });
  const [statusText, setStatusText] = useState('');

  const timerRef       = useRef(null);
  const tapResolverRef = useRef(null);
  const responsesRef   = useRef([]);
  const runningRef     = useRef(false);
  const playRef        = useRef(play);
  const sessionIdRef   = useRef(sessionId);

  // Keep refs current after each render (avoids stale closures in async sequence)
  useLayoutEffect(() => {
    playRef.current      = play;
    sessionIdRef.current = sessionId;
  });

  function waitForTapOrTimeout(timeoutMs) {
    return new Promise(resolve => {
      const resolver = resolve;
      tapResolverRef.current = resolver;
      const t = setTimeout(() => {
        if (tapResolverRef.current === resolver) {
          tapResolverRef.current = null;
          timerRef.current?.stop();
          resolve(null); // null = timeout/no tap
        }
      }, timeoutMs);
      // Store timeout id so we can clear on early tap
      tapResolverRef._timeoutId = t;
    });
  }

  function handleGuideTap() {
    if (!tapResolverRef.current) return;
    const ms = timerRef.current?.stop() ?? 0;
    const resolver = tapResolverRef.current;
    tapResolverRef.current = null;
    clearTimeout(tapResolverRef._timeoutId);
    resolver(ms);
  }

  useEffect(() => {
    if (runningRef.current) return;
    runningRef.current = true;
    goToChapter(1, 1);

    async function runSequence() {
      // 2-second intro pause
      setStatusText('Get ready! 👀');
      await delayMs(2000);

      let totalPoints = 0;

      for (let i = 0; i < NAME_RESPONSE_TRIALS.length; i++) {
        const trial = NAME_RESPONSE_TRIALS[i];
        setTrialIdx(i);

        // --- Calling phase ---
        setPhase('calling');
        setGuideKey(k => k + 1); // re-key → fresh bounce animation
        setStatusText(playerName ? `${playerName}… 👋` : 'Hey there! 👋');
        playRef.current('cueGuideSpeak');

        const startedAt = Date.now();
        await delayMs(300); // tiny pause before accepting taps
        timerRef.current?.start();
        setPhase('waiting');
        setStatusText('Tap the guide! 👆');

        // --- Waiting for tap (max 8 seconds) ---
        const responseMs = await waitForTapOrTimeout(8000);
        const tapped = responseMs !== null;
        const pts = tapped ? scoreNameTrial(responseMs) : 2;
        totalPoints += pts;


        responsesRef.current.push({
          taskKey:        trial.taskKey,
          startedAt,
          responseTimeMs: tapped ? responseMs : null,
          isCorrect:      pts === 0,
          attemptNumber:  1,
          scorePoints:    pts,
        });

        // --- Feedback ---
        setFeedback({ show: true, correct: pts <= 1 });
        if (pts <= 1) playRef.current('cueCorrect');
        else playRef.current('cueWrong');
        setPhase('feedback');
        await delayMs(750);
        setFeedback({ show: false, correct: true });

        // --- Inter-trial pause (skip after last trial) ---
        if (i < NAME_RESPONSE_TRIALS.length - 1) {
          setPhase('pause');
          setStatusText('');
          await delayMs(trial.delay);
        }
      }

      // --- Complete: persist and navigate ---
      setPhase('complete');
      setStatusText('Amazing! 🌟');

      const sid = sessionIdRef.current;
      if (sid) {
        await Promise.allSettled([
          ...responsesRef.current.map(r =>
            fetch('/api/game/response', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ sessionId: sid, chapter: 1, level: 1, ...r }),
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

      await delayMs(1200);
      goToChapter(1, 2);
      router.push('/game/chapter-1/level-2');
    }

    runSequence();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const trialNum = trialIdx + 1;

  return (
    <SceneCanvas chapterNumber={1}>
      <TaskTimer ref={timerRef} />
      <FeedbackBurst
        show={feedback.show}
        correct={feedback.correct}
        onComplete={() => setFeedback(f => ({ ...f, show: false }))}
      />

      <div className="flex flex-col items-center justify-center min-h-full px-6 py-8 gap-6">

        {/* Trial counter */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex gap-2"
        >
          {NAME_RESPONSE_TRIALS.map((_, i) => (
            <div
              key={i}
              className="w-3 h-3 rounded-full transition-all duration-300"
              style={{
                backgroundColor: i < trialIdx
                  ? 'rgba(255,255,255,0.9)'
                  : i === trialIdx
                  ? '#ffffff'
                  : 'rgba(255,255,255,0.25)',
                transform: i === trialIdx ? 'scale(1.3)' : 'scale(1)',
              }}
            />
          ))}
        </motion.div>

        {/* Status label */}
        <AnimatePresence mode="wait">
          {statusText && (
            <motion.p
              key={statusText}
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="text-white/80 text-lg font-semibold text-center"
            >
              {statusText}
            </motion.p>
          )}
        </AnimatePresence>

        {/* Guide character — main tap target */}
        <AnimatePresence mode="wait">
          <motion.button
            key={`guide-${guideKey}`}
            initial={{ scale: 0.6, opacity: 0 }}
            animate={
              phase === 'calling'
                ? { scale: [0.9, 1.25, 0.95, 1.1, 1], opacity: 1 }
                : { scale: 1, opacity: 1, y: [0, -10, 0] }
            }
            transition={
              phase === 'calling'
                ? { duration: 0.6, ease: 'easeOut' }
                : { duration: 2.4, repeat: Infinity, ease: 'easeInOut' }
            }
            onClick={handleGuideTap}
            disabled={phase !== 'waiting'}
            className="text-[120px] leading-none select-none focus:outline-none cursor-pointer disabled:cursor-default"
            style={{ background: 'none', border: 'none', padding: 0, lineHeight: 1 }}
            aria-label="Tap the guide!"
          >
            {guideEmoji}
          </motion.button>
        </AnimatePresence>

        {/* Pulsing tap-hint ring (only when waiting) */}
        <AnimatePresence>
          {phase === 'waiting' && (
            <motion.div
              key="tap-ring"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: [1, 1.15, 1], opacity: [0.6, 0.3, 0.6] }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1.5, repeat: Infinity }}
              className="absolute pointer-events-none rounded-full border-4 border-white/50"
              style={{ width: 160, height: 160 }}
            />
          )}
        </AnimatePresence>

        {/* Chapter complete card */}
        <AnimatePresence>
          {phase === 'complete' && (
            <motion.div
              initial={{ scale: 0.7, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="absolute inset-0 flex items-center justify-center z-20"
            >
              <div className="bg-white/20 backdrop-blur-sm rounded-3xl px-10 py-8 text-center border border-white/30 shadow-xl">
                <div className="text-6xl mb-3">🌟</div>
                <p className="text-2xl font-extrabold text-white drop-shadow">Amazing!</p>
                <p className="text-white/80 mt-1">Level 1 complete!</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </SceneCanvas>
  );
}
