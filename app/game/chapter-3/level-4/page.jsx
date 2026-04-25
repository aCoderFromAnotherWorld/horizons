'use client';

import { useState, useRef, useEffect , useLayoutEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '@/store/gameStore.js';
import { useSoundCue } from '@/hooks/useSoundCue.js';
import SceneCanvas from '@/components/game/SceneCanvas.jsx';
import FeedbackBurst from '@/components/game/FeedbackBurst.jsx';
import PracticeDemo from '@/components/game/PracticeDemo.jsx';
import { IMITATION_ACTIONS, ANIM_VARIANTS, L4_PRACTICE_STEPS } from '@/lib/gameData/chapter3.js';

const TIMEOUT_MS = 8000;
const RED_FLAG_TYPE = 'poor_imitation_all_modalities';
const ERROR_THRESHOLD = 5;

// Score by modality: facial error = 2pts, body/object error = 1pt, timeout = 2pts
function scoreImitation(isCorrect, modality, timedOut) {
  if (isCorrect) return 0;
  if (timedOut)  return 2;
  return modality === 'facial' ? 2 : 1;
}

function delayMs(ms) { return new Promise(r => setTimeout(r, ms)); }
function now() { return Date.now(); }

export default function Level4Page() {
  const router      = useRouter();
  const sessionId   = useGameStore(s => s.sessionId);
  const addScore    = useGameStore(s => s.addScore);
  const addRedFlag  = useGameStore(s => s.addRedFlag);
  const goToChapter = useGameStore(s => s.goToChapter);
  const { play }    = useSoundCue();

  const [showPractice, setShowPractice] = useState(true);
  const [trialIdx, setTrialIdx]         = useState(0);
  const [tapped, setTapped]             = useState(false);
  const [animating, setAnimating]       = useState(true); // action clip playing
  const [feedback, setFeedback]         = useState({ show: false, correct: true });
  const [complete, setComplete]         = useState(false);
  const [trialKey, setTrialKey]         = useState(0);

  const timeoutRef     = useRef(null);
  const responsesRef   = useRef([]);
  const sessionIdRef   = useRef(sessionId);
  const playRef        = useRef(play);
  useLayoutEffect(() => {
    sessionIdRef.current = sessionId;
    playRef.current      = play;
  });

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { goToChapter(3, 4); }, []);

  function startTimeout() {
    clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      handleTimeout();
    }, TIMEOUT_MS);
  }

  function handleTimeout() {
    if (tapped) return;
    setTapped(true);
    const action = IMITATION_ACTIONS[trialIdx];
    recordResponse(action, false, true);
    setFeedback({ show: true, correct: false });
    playRef.current('cueWrong');
    setTimeout(() => {
      setFeedback({ show: false, correct: true });
      advanceTrial();
    }, 800);
  }

  // Start action animation, then show options after clip finishes
  useEffect(() => {
    if (showPractice || complete) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setAnimating(true);
    setTapped(false);
    const animEnd = setTimeout(() => {
      setAnimating(false);
      startTimeout();
    }, 2200);
    return () => {
      clearTimeout(animEnd);
      clearTimeout(timeoutRef.current);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [trialIdx, trialKey, showPractice, complete]);

  function recordResponse(action, isCorrect, timedOut) {
    const pts = scoreImitation(isCorrect, action.modality, timedOut);
    responsesRef.current.push({
      taskKey:     action.taskKey,
      startedAt:   now(),
      isCorrect,
      attemptNumber: 1,
      scorePoints: pts,
      modality:    action.modality,
      selection:   { timedOut },
    });
  }

  async function handleOptionTap(optionIdx) {
    if (tapped || animating || complete) return;
    clearTimeout(timeoutRef.current);
    setTapped(true);

    const action    = IMITATION_ACTIONS[trialIdx];
    const isCorrect = optionIdx === action.correctIndex;
    recordResponse(action, isCorrect, false);

    setFeedback({ show: true, correct: isCorrect });
    playRef.current(isCorrect ? 'cueCorrect' : 'cueWrong');
    await delayMs(700);
    setFeedback({ show: false, correct: true });
    advanceTrial();
  }

  function advanceTrial() {
    const next = trialIdx + 1;
    if (next < IMITATION_ACTIONS.length) {
      setTrialIdx(next);
      setTrialKey(k => k + 1);
    } else {
      finishLevel();
    }
  }

  async function finishLevel() {
    const totalScore = responsesRef.current.reduce((s, r) => s + r.scorePoints, 0);
    const errorCount = responsesRef.current.filter(r => !r.isCorrect).length;
    const redFlagTriggered = errorCount >= ERROR_THRESHOLD;

    const sid = sessionIdRef.current;
    const tasks = responsesRef.current.map(r =>
      fetch('/api/game/response', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId: sid, chapter: 3, level: 4,
          taskKey: r.taskKey, startedAt: r.startedAt,
          isCorrect: r.isCorrect, attemptNumber: 1,
          scorePoints: r.scorePoints,
          selection: { ...r.selection, modality: r.modality },
        }),
      })
    );

    // +3 pts for ≥5 total errors
    const finalScore = redFlagTriggered ? totalScore + 3 : totalScore;

    const scoreFetch = fetch('/api/game/score', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sessionId: sid, chapterKey: 'ch3_social', rawPoints: finalScore }),
    });

    const flagFetch = redFlagTriggered
      ? fetch('/api/game/flag', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            sessionId: sid,
            flagType: RED_FLAG_TYPE,
            description: `${errorCount} imitation errors across modalities`,
            severity: 'moderate',
          }),
        })
      : null;

    if (sid) {
      await Promise.allSettled([...tasks, scoreFetch, flagFetch].filter(Boolean));
      addScore('ch3_social', finalScore);
      if (redFlagTriggered) addRedFlag(RED_FLAG_TYPE);
    }

    setComplete(true);
    await delayMs(2000);
    goToChapter(3, 5);
    router.push('/game/map');
  }

  const action = IMITATION_ACTIONS[trialIdx];
  const animProps = action ? ANIM_VARIANTS[action.animType] : null;

  return (
    <SceneCanvas chapterNumber={3}>
      <FeedbackBurst
        show={feedback.show}
        correct={feedback.correct}
        onComplete={() => setFeedback(f => ({ ...f, show: false }))}
      />

      {/* Practice overlay */}
      <AnimatePresence>
        {showPractice && (
          <motion.div
            key="practice"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-20 flex items-center justify-center bg-black/40 backdrop-blur-sm"
          >
            <PracticeDemo steps={L4_PRACTICE_STEPS} onComplete={() => setShowPractice(false)} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Game content */}
      {!showPractice && action && (
        <div className="flex flex-col items-center justify-between min-h-dvh px-4 py-6 gap-4">
          {/* Progress */}
          <div className="w-full max-w-sm flex items-center gap-2">
            <div className="flex-1 h-2 bg-white/20 rounded-full overflow-hidden">
              <div
                className="h-full bg-white/80 rounded-full transition-all duration-500"
                style={{ width: `${(trialIdx / IMITATION_ACTIONS.length) * 100}%` }}
              />
            </div>
            <span className="text-white/70 text-xs font-medium tabular-nums">
              {trialIdx + 1}/{IMITATION_ACTIONS.length}
            </span>
          </div>

          {/* Action clip */}
          <div className="flex-1 flex flex-col items-center justify-center gap-6 w-full max-w-sm">
            <AnimatePresence mode="wait">
              <motion.div
                key={`clip-${trialKey}`}
                initial={{ scale: 0.6, opacity: 0 }}
                animate={{ scale: 1, opacity: 1, transition: { type: 'spring', stiffness: 300, damping: 22 } }}
                className="flex flex-col items-center gap-4 bg-white/15 rounded-3xl px-12 py-10 border border-white/25"
              >
                <p className="text-white/70 text-sm font-semibold uppercase tracking-wider">
                  {animating ? 'Watch carefully! 👀' : 'Which action was that? 👆'}
                </p>

                {/* Animated emoji action */}
                {animating ? (
                  <motion.span
                    className="text-8xl leading-none select-none"
                    {...(animProps ?? {})}
                  >
                    {action.emoji}
                  </motion.span>
                ) : (
                  <span className="text-8xl leading-none select-none">{action.emoji}</span>
                )}

                <p className="text-white font-bold text-lg">{action.label}</p>
              </motion.div>
            </AnimatePresence>

            {/* Option grid — shown after animation */}
            <AnimatePresence>
              {!animating && (
                <motion.div
                  key={`opts-${trialKey}`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="grid grid-cols-2 gap-3 w-full max-w-xs"
                >
                  {action.options.map((opt, i) => (
                    <motion.button
                      key={opt + i}
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1, transition: { delay: i * 0.07, type: 'spring', stiffness: 320, damping: 22 } }}
                      whileTap={{ scale: 0.88 }}
                      onClick={() => handleOptionTap(i)}
                      disabled={tapped}
                      className="flex items-center justify-center rounded-2xl bg-white/20 border-2 border-white/25 hover:bg-white/30 hover:border-white/50 transition-all select-none min-h-[80px] disabled:pointer-events-none"
                      aria-label={opt}
                    >
                      <span className="text-5xl leading-none">{opt}</span>
                    </motion.button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      )}

      <AnimatePresence>
        {complete && (
          <motion.div
            initial={{ scale: 0.7, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="absolute inset-0 z-30 flex items-center justify-center bg-black/30 backdrop-blur-sm"
          >
            <div className="bg-white/20 rounded-3xl px-10 py-8 text-center border border-white/30 shadow-2xl">
              <div className="text-6xl mb-3">🐱</div>
              <p className="text-2xl font-extrabold text-white">Copy Cat Champion!</p>
              <p className="text-white/70 mt-1">Chapter 3 complete!</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </SceneCanvas>
  );
}
