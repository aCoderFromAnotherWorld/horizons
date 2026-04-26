'use client';

import { useState, useRef, useEffect, useLayoutEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '@/store/gameStore.js';
import { useSoundCue } from '@/hooks/useSoundCue.js';
import SceneCanvas from '@/components/game/SceneCanvas.jsx';
import PracticeDemo from '@/components/game/PracticeDemo.jsx';
import FeedbackBurst from '@/components/game/FeedbackBurst.jsx';
import { REGULATION_SCENARIOS, L3_PRACTICE_STEPS } from '@/lib/gameData/chapter2.js';

const RESPONSE_TIMEOUT_MS = 15000;

function scoreRegulation(type, slow) {
  const base = type === 'appropriate' ? 0 : type === 'avoidant' ? 2 : 3;
  return base + (slow ? 1 : 0);
}

function delayMs(ms) { return new Promise(r => setTimeout(r, ms)); }
function now() { return Date.now(); }

function seededShuffle(seed, items) {
  let state = 0;
  for (let i = 0; i < seed.length; i++) {
    state = (state * 31 + seed.charCodeAt(i)) >>> 0;
  }

  const next = () => {
    state = (state * 1664525 + 1013904223) >>> 0;
    return state / 0x100000000;
  };

  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(next() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

const OPTION_COLORS = {
  appropriate: { bg: 'rgba(16,185,129,0.25)', border: 'rgba(16,185,129,0.6)', hover: 'rgba(16,185,129,0.4)' },
  avoidant: { bg: 'rgba(245,158,11,0.2)', border: 'rgba(245,158,11,0.5)', hover: 'rgba(245,158,11,0.35)' },
  aggressive: { bg: 'rgba(239,68,68,0.2)', border: 'rgba(239,68,68,0.5)', hover: 'rgba(239,68,68,0.35)' },
};

export default function Level3Page() {
  const router = useRouter();
  const sessionId = useGameStore(s => s.sessionId);
  const addScore = useGameStore(s => s.addScore);
  const goToChapter = useGameStore(s => s.goToChapter);
  const { play } = useSoundCue();

  const [showPractice, setShowPractice] = useState(true);
  const [scenarioIdx, setScenarioIdx] = useState(0);
  const [tapped, setTapped] = useState(false);
  const [feedback, setFeedback] = useState({ show: false, correct: true });
  const [complete, setComplete] = useState(false);

  const responsesRef = useRef([]);
  const sessionIdRef = useRef(sessionId);
  const playRef = useRef(play);
  const startedAtRef = useRef(null);
  const timeoutRef = useRef(null);

  useLayoutEffect(() => {
    sessionIdRef.current = sessionId;
    playRef.current = play;
  });

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { goToChapter(2, 3); }, []);

  function handleTimeout() {
    if (tapped) return;
    handleSelection({ label: 'No response', type: 'avoidant' }, true);
  }

  // Start the 15-second response timer when scenario changes
  useEffect(() => {
    if (showPractice || complete) return;
    startedAtRef.current = Date.now();
    clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      handleTimeout();
    }, RESPONSE_TIMEOUT_MS);
    return () => clearTimeout(timeoutRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scenarioIdx, showPractice, complete]);

  async function handleSelection(option, isSlow = false) {
    clearTimeout(timeoutRef.current);
    if (tapped) return;
    setTapped(true);

    const scenario = REGULATION_SCENARIOS[scenarioIdx];
    const elapsed = now() - startedAtRef.current;
    const slow = isSlow || elapsed > RESPONSE_TIMEOUT_MS;
    const pts = scoreRegulation(option.type, slow);
    const isCorrect = option.type === 'appropriate';

    responsesRef.current.push({
      taskKey: scenario.taskKey,
      startedAt: startedAtRef.current,
      responseTimeMs: elapsed,
      isCorrect,
      scorePoints: pts,
      selection: { type: option.type, slow },
    });

    setFeedback({ show: true, correct: isCorrect });
    if (isCorrect) playRef.current('cueCorrect');
    else playRef.current('cueWrong');

    await delayMs(750);
    setFeedback({ show: false, correct: true });

    const next = scenarioIdx + 1;
    if (next < REGULATION_SCENARIOS.length) {
      setScenarioIdx(next);
      setTapped(false);
    } else {
      await finishLevel();
    }
  }

  async function finishLevel() {
    const totalScore = responsesRef.current.reduce((sum, r) => sum + r.scorePoints, 0);
    console.log('[Ch2 L3] score:', totalScore, responsesRef.current);

    playRef.current('cueChapterComplete');

    const sid = sessionIdRef.current;
    if (sid) {
      await Promise.allSettled([
        ...responsesRef.current.map(r =>
          fetch('/api/game/response', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              sessionId: sid, chapter: 2, level: 3,
              taskKey: r.taskKey, startedAt: r.startedAt,
              responseTimeMs: r.responseTimeMs,
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
    await delayMs(2500);
    goToChapter(3, 1);
    router.push('/game/map');
  }

  const scenario = REGULATION_SCENARIOS[scenarioIdx];
  const displayedOptions = scenario
    ? seededShuffle(`${sessionId ?? 'guest'}:${scenario.taskKey}`, scenario.options)
    : [];

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
            <PracticeDemo steps={L3_PRACTICE_STEPS} onComplete={() => setShowPractice(false)} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Game content */}
      {!showPractice && scenario && (
        <div className="flex flex-col items-center justify-between min-h-full px-4 py-8 gap-6">
          {/* Progress dots */}
          <div className="flex gap-2">
            {REGULATION_SCENARIOS.map((_, i) => (
              <div
                key={i}
                className="w-2.5 h-2.5 rounded-full transition-all"
                style={{
                  backgroundColor: i < scenarioIdx
                    ? 'rgba(255,255,255,0.9)'
                    : i === scenarioIdx
                      ? '#ffffff'
                      : 'rgba(255,255,255,0.25)',
                  transform: i === scenarioIdx ? 'scale(1.3)' : 'scale(1)',
                }}
              />
            ))}
          </div>

          {/* Scenario card */}
          <AnimatePresence mode="wait">
            <motion.div
              key={scenario.taskKey}
              initial={{ x: 40, opacity: 0 }}
              animate={{ x: 0, opacity: 1, transition: { type: 'spring', stiffness: 280, damping: 24 } }}
              exit={{ x: -40, opacity: 0 }}
              className="w-full max-w-sm bg-white/15 rounded-3xl p-8 border border-white/25 text-center"
            >
              <div className="text-6xl mb-4 leading-none">{scenario.emoji}</div>
              <p className="text-white text-lg font-semibold leading-snug">{scenario.description}</p>
            </motion.div>
          </AnimatePresence>

          {/* Response options */}
          <div className="w-full max-w-sm flex flex-col gap-3">
            <p className="text-white/80 text-sm font-semibold text-center mb-1">
              What would you do? 🤔
            </p>
            {displayedOptions.map((opt, i) => {
              const colors = OPTION_COLORS[opt.type];
              return (
                <motion.button
                  key={opt.type}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0, transition: { delay: i * 0.08 } }}
                  whileTap={{ scale: 0.96 }}
                  onClick={() => handleSelection(opt)}
                  disabled={tapped}
                  className="w-full min-h-[64px] rounded-2xl px-4 py-3 text-base font-semibold text-white text-left transition-all select-none disabled:pointer-events-none border-2"
                  style={{
                    backgroundColor: colors.bg,
                    borderColor: colors.border,
                  }}
                >
                  {opt.label}
                </motion.button>
              );
            })}
          </div>
        </div>
      )}

      {/* Chapter complete card */}
      <AnimatePresence>
        {complete && (
          <motion.div
            initial={{ scale: 0.7, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="absolute inset-0 z-30 flex items-center justify-center bg-black/30 backdrop-blur-sm"
          >
            <motion.div
              animate={{ y: [0, -8, 0] }}
              transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
              className="bg-white/20 rounded-3xl px-10 py-10 text-center border border-white/30 shadow-2xl"
            >
              <div className="text-6xl mb-3">🌟</div>
              <p className="text-3xl font-extrabold text-white drop-shadow mb-1">Amazing!</p>
              <p className="text-white/80 text-base">Chapter 2 complete!</p>
              <p className="text-white/60 text-sm mt-1">Heading back to the map…</p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </SceneCanvas>
  );
}
