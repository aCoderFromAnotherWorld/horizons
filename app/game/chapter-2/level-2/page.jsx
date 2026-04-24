'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '@/store/gameStore.js';
import { useSettingsStore } from '@/store/settingsStore.js';
import { useSoundCue } from '@/hooks/useSoundCue.js';
import SceneCanvas from '@/components/game/SceneCanvas.jsx';
import PracticeDemo from '@/components/game/PracticeDemo.jsx';
import FeedbackBurst from '@/components/game/FeedbackBurst.jsx';
import { MIRROR_TRIALS, L2_PRACTICE_STEPS } from '@/lib/gameData/chapter2.js';

/** Score an option based on its type relative to the trial emotion. */
function scoreOption(type) {
  if (type === 'correct')   return 0;
  if (type === 'intensity') return 1;
  if (type === 'neutral')   return 2;
  return 3; // opposite or other
}

/** Return sound cue name for a trial cue string. */
function cueForTrial(cue) {
  if (cue === 'major')     return 'cueCorrect';
  if (cue === 'minor')     return 'cueWrong';
  return 'cueBreak'; // dissonant
}

function delayMs(ms) { return new Promise(r => setTimeout(r, ms)); }

export default function Level2Page() {
  const router = useRouter();
  const sessionId   = useGameStore(s => s.sessionId);
  const addScore    = useGameStore(s => s.addScore);
  const goToChapter = useGameStore(s => s.goToChapter);
  const { play }    = useSoundCue();

  const [showPractice, setShowPractice] = useState(true);
  const [trialIdx, setTrialIdx]         = useState(0);
  const [feedback, setFeedback]         = useState({ show: false, correct: true });
  const [tapped, setTapped]             = useState(false);
  const [complete, setComplete]         = useState(false);
  const [trialKey, setTrialKey]         = useState(0);

  const responsesRef   = useRef([]);
  const runningRef     = useRef(false);
  const sessionIdRef   = useRef(sessionId);
  const playRef        = useRef(play);
  sessionIdRef.current = sessionId;
  playRef.current      = play;

  useEffect(() => { goToChapter(2, 2); }, []);

  // Play mood cue when trial first shows
  useEffect(() => {
    if (showPractice || complete) return;
    const trial = MIRROR_TRIALS[trialIdx];
    if (!trial) return;
    const cueName = cueForTrial(trial.cue);
    const t = setTimeout(() => playRef.current(cueName), 400);
    return () => clearTimeout(t);
  }, [trialIdx, showPractice, complete, trialKey]);

  async function handleOptionTap(option) {
    if (tapped || complete) return;
    setTapped(true);

    const trial = MIRROR_TRIALS[trialIdx];
    const pts   = scoreOption(option.type);
    const isCorrect = option.type === 'correct';

    responsesRef.current.push({
      taskKey:    trial.taskKey,
      startedAt:  Date.now(),
      isCorrect,
      scorePoints: pts,
      selection:  { emoji: option.emoji, type: option.type },
    });

    setFeedback({ show: true, correct: isCorrect });
    if (isCorrect) playRef.current('cueCorrect');
    else playRef.current('cueWrong');

    await delayMs(700);
    setFeedback({ show: false, correct: true });

    const next = trialIdx + 1;
    if (next < MIRROR_TRIALS.length) {
      setTrialIdx(next);
      setTrialKey(k => k + 1);
      setTapped(false);
    } else {
      await finishLevel();
    }
  }

  async function finishLevel() {
    const totalScore = responsesRef.current.reduce((sum, r) => sum + r.scorePoints, 0);
    console.log('[Ch2 L2] score:', totalScore, responsesRef.current.length, 'responses');

    const sid = sessionIdRef.current;
    if (sid) {
      await Promise.allSettled([
        ...responsesRef.current.map(r =>
          fetch('/api/game/response', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              sessionId: sid, chapter: 2, level: 2,
              taskKey: r.taskKey, startedAt: r.startedAt,
              isCorrect: r.isCorrect, attemptNumber: 1,
              scorePoints: r.scorePoints, selection: r.selection,
            }),
          })
        ),
        fetch('/api/game/score', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ sessionId: sid, chapterKey: 'ch2_emotion', rawPoints: totalScore }),
        }),
      ]);
      addScore('ch2_emotion', totalScore);
    }

    setComplete(true);
    await delayMs(1500);
    goToChapter(2, 3);
    router.push('/game/chapter-2/level-3');
  }

  const trial = MIRROR_TRIALS[trialIdx];

  return (
    <SceneCanvas chapterNumber={2}>
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
            <PracticeDemo steps={L2_PRACTICE_STEPS} onComplete={() => setShowPractice(false)} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Game content */}
      {!showPractice && trial && (
        <div className="flex flex-col items-center justify-between min-h-dvh px-4 py-6 gap-4">
          {/* Progress bar */}
          <div className="w-full max-w-sm flex items-center gap-2">
            <div className="flex-1 h-2 bg-white/20 rounded-full overflow-hidden">
              <div
                className="h-full bg-white/80 rounded-full transition-all duration-500"
                style={{ width: `${(trialIdx / MIRROR_TRIALS.length) * 100}%` }}
              />
            </div>
            <span className="text-white/70 text-xs font-medium tabular-nums">
              {trialIdx + 1}/{MIRROR_TRIALS.length}
            </span>
          </div>

          {/* Emotion word display */}
          <AnimatePresence mode="wait">
            <motion.div
              key={`word-${trialKey}`}
              initial={{ scale: 0.7, opacity: 0 }}
              animate={{ scale: 1, opacity: 1, transition: { type: 'spring', stiffness: 300, damping: 22 } }}
              exit={{ scale: 0.7, opacity: 0 }}
              className="flex flex-col items-center gap-3 bg-white/15 rounded-3xl px-10 py-8 border border-white/20"
            >
              <p className="text-white/60 text-sm font-medium uppercase tracking-widest">
                How does this look?
              </p>
              <p className="text-5xl sm:text-6xl font-extrabold text-white drop-shadow-lg">
                {trial.word}
              </p>
              <p className="text-white/50 text-xs">🎵 Listen to the sound cue</p>
            </motion.div>
          </AnimatePresence>

          {/* Emoji option grid — 2×3 */}
          <div className="w-full max-w-sm">
            <p className="text-white/80 text-sm font-semibold text-center mb-3">
              Tap the matching face! 👆
            </p>
            <AnimatePresence mode="wait">
              <motion.div
                key={`options-${trialKey}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="grid grid-cols-3 gap-3"
              >
                {trial.options.map((opt, i) => (
                  <motion.button
                    key={opt.emoji + i}
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1, transition: { delay: i * 0.06, type: 'spring', stiffness: 320, damping: 22 } }}
                    whileTap={{ scale: 0.88 }}
                    onClick={() => handleOptionTap(opt)}
                    disabled={tapped}
                    className="flex items-center justify-center rounded-2xl bg-white/20 border-2 border-white/25 hover:bg-white/30 hover:border-white/50 transition-all select-none min-h-[80px] disabled:pointer-events-none"
                    aria-label={opt.emoji}
                  >
                    <span className="text-5xl leading-none">{opt.emoji}</span>
                  </motion.button>
                ))}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      )}

      {/* Complete overlay */}
      <AnimatePresence>
        {complete && (
          <motion.div
            initial={{ scale: 0.7, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="absolute inset-0 z-30 flex items-center justify-center bg-black/30 backdrop-blur-sm"
          >
            <div className="bg-white/20 rounded-3xl px-10 py-8 text-center border border-white/30 shadow-2xl">
              <div className="text-6xl mb-3">🎭</div>
              <p className="text-2xl font-extrabold text-white">Well done!</p>
              <p className="text-white/70 mt-1">Level 2 complete!</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </SceneCanvas>
  );
}
