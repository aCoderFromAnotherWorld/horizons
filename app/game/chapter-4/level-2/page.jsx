'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '@/store/gameStore.js';
import { useSoundCue } from '@/hooks/useSoundCue.js';
import SceneCanvas from '@/components/game/SceneCanvas.jsx';
import FeedbackBurst from '@/components/game/FeedbackBurst.jsx';
import { ACTIVITIES, UNEXPECTED_SCENARIOS } from '@/lib/gameData/chapter4.js';

const CHAPTER_KEY    = 'ch4_routine';
const ACTIVITY_ROUNDS = 5;
const SCENE_A_SLOW_MS = 8000;
const SCENE_B_SLOW_MS = 12000;

function delayMs(ms) { return new Promise(r => setTimeout(r, ms)); }

export default function Level2Page() {
  const router      = useRouter();
  const sessionId   = useGameStore(s => s.sessionId);
  const addScore    = useGameStore(s => s.addScore);
  const goToChapter = useGameStore(s => s.goToChapter);
  const { play }    = useSoundCue();

  // scene: 'A' | 'B' | 'complete'
  const [scene, setScene]           = useState('A');
  const [roundIdx, setRoundIdx]     = useState(0);      // 0-4 for scene A
  const [scenarioIdx, setScenarioIdx] = useState(0);    // 0-2 for scene B
  const [showNew, setShowNew]       = useState(false);  // "Try something new!" prompt
  const [selectedActivity, setSelectedActivity] = useState(null);
  const [feedback, setFeedback]     = useState({ show: false, correct: true });
  const [locked, setLocked]         = useState(false);  // prevents double-tap

  const roundStartRef      = useRef(null);
  const scenarioStartRef   = useRef(null);
  const activityHistory    = useRef([]);    // array of activity ids
  const responsesRef       = useRef([]);
  const totalScoreRef      = useRef(0);
  const sessionIdRef       = useRef(sessionId);
  const playRef            = useRef(play);

  sessionIdRef.current = sessionId;
  playRef.current      = play;

  useEffect(() => { goToChapter(4, 2); }, []);

  // Scene A — start timer when round changes
  useEffect(() => {
    if (scene !== 'A' || showNew) return;
    roundStartRef.current = Date.now();
  }, [scene, roundIdx, showNew]);

  // Scene B — start timer when scenario changes
  useEffect(() => {
    if (scene !== 'B') return;
    scenarioStartRef.current = Date.now();
  }, [scene, scenarioIdx]);

  // --- Scene A handlers ---

  function handleActivitySelect(actId) {
    if (locked || showNew) return;
    setLocked(true);
    setSelectedActivity(actId);

    const elapsedMs = roundStartRef.current ? Date.now() - roundStartRef.current : 0;
    const tooSlow   = elapsedMs > SCENE_A_SLOW_MS;
    activityHistory.current.push(actId);

    const pts = tooSlow ? 2 : 0;

    responsesRef.current.push({
      taskKey:       `ch4_l2_activity_${roundIdx + 1}`,
      startedAt:     roundStartRef.current ?? Date.now(),
      responseTimeMs: elapsedMs,
      isCorrect:     !tooSlow,
      attemptNumber: 1,
      scorePoints:   pts,
      selection:     { actId, tooSlow },
    });
    totalScoreRef.current += pts;

    if (pts === 0) playRef.current('cueCorrect');
    setFeedback({ show: true, correct: !tooSlow });

    setTimeout(() => {
      setFeedback({ show: false, correct: true });
      setShowNew(true);
      setLocked(false);
    }, 700);
  }

  function handleTryNew() {
    const next = roundIdx + 1;
    if (next >= ACTIVITY_ROUNDS) {
      // Score same-activity rule: if any activity appears ≥3 times → +3 pts
      const counts = activityHistory.current.reduce((acc, id) => {
        acc[id] = (acc[id] ?? 0) + 1;
        return acc;
      }, {});
      const maxRepeats = Math.max(...Object.values(counts));
      if (maxRepeats >= 3) totalScoreRef.current += 3;
      setShowNew(false);
      setScene('B');
    } else {
      setRoundIdx(next);
      setShowNew(false);
      setSelectedActivity(null);
      roundStartRef.current = Date.now();
    }
  }

  // --- Scene B handlers ---

  const handleScenarioAnswer = useCallback((optType) => {
    if (locked) return;
    setLocked(true);

    const elapsedMs = scenarioStartRef.current ? Date.now() - scenarioStartRef.current : 0;
    const tooSlow   = elapsedMs > SCENE_B_SLOW_MS;

    let pts = 0;
    if (optType === 'flexible') pts = 0;
    else if (optType === 'distress') pts = 2;
    else if (optType === 'rigid')    pts = 3;
    if (tooSlow) pts += 1;

    const isCorrect = optType === 'flexible';
    setFeedback({ show: true, correct: isCorrect });
    playRef.current(isCorrect ? 'cueCorrect' : 'cueWrong');

    const scenario = UNEXPECTED_SCENARIOS[scenarioIdx];
    responsesRef.current.push({
      taskKey:       scenario.taskKey,
      startedAt:     scenarioStartRef.current ?? Date.now(),
      responseTimeMs: elapsedMs,
      isCorrect,
      attemptNumber: 1,
      scorePoints:   pts,
      selection:     { type: optType, tooSlow },
    });
    totalScoreRef.current += pts;

    setTimeout(() => {
      setFeedback({ show: false, correct: true });
      setLocked(false);
      const next = scenarioIdx + 1;
      if (next >= UNEXPECTED_SCENARIOS.length) {
        finishLevel();
      } else {
        setScenarioIdx(next);
        scenarioStartRef.current = Date.now();
      }
    }, 800);
  }, [locked, scenarioIdx]);

  async function finishLevel() {
    setScene('complete');
    playRef.current('cueChapterComplete');

    const sid = sessionIdRef.current;
    if (sid) {
      await Promise.allSettled([
        ...responsesRef.current.map(r =>
          fetch('/api/game/response', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ sessionId: sid, chapter: 4, level: 2, ...r }),
          })
        ),
        fetch('/api/game/score', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ sessionId: sid, chapterKey: CHAPTER_KEY, rawPoints: totalScoreRef.current }),
        }),
      ]);
      addScore(CHAPTER_KEY, totalScoreRef.current);
    }

    await delayMs(1800);
    goToChapter(4, 3);
    router.push('/game/chapter-4/level-3');
  }

  const currentScenario = UNEXPECTED_SCENARIOS[scenarioIdx];

  return (
    <SceneCanvas chapterNumber={4}>
      <FeedbackBurst
        show={feedback.show}
        correct={feedback.correct}
        onComplete={() => setFeedback(f => ({ ...f, show: false }))}
      />

      <div className="flex flex-col items-center justify-between min-h-dvh px-4 py-8 gap-6">
        {/* Header */}
        <div className="text-center w-full max-w-sm">
          <motion.h2
            key={scene}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-2xl font-extrabold text-white drop-shadow"
          >
            {scene === 'A' ? '🎠 Playground Time!' : scene === 'B' ? '🔄 Unexpected Events!' : '🌟 Well done!'}
          </motion.h2>
          {scene === 'A' && (
            <p className="text-white/70 text-sm mt-1">
              Round {roundIdx + 1} of {ACTIVITY_ROUNDS}
            </p>
          )}
        </div>

        <div className="flex-1 flex items-center justify-center w-full max-w-sm">
          <AnimatePresence mode="wait">

            {/* Scene A — activity picker */}
            {scene === 'A' && !showNew && (
              <motion.div
                key={`A-pick-${roundIdx}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="flex flex-col items-center gap-4 w-full"
              >
                <p className="text-white/80 text-base font-semibold text-center">
                  What would you like to do?
                </p>
                <div className="grid grid-cols-3 gap-3 w-full">
                  {ACTIVITIES.map(act => (
                    <motion.button
                      key={act.id}
                      whileTap={{ scale: 0.92 }}
                      onClick={() => handleActivitySelect(act.id)}
                      disabled={locked}
                      className={[
                        'flex flex-col items-center justify-center rounded-2xl p-4 min-h-[80px]',
                        'border-2 transition-all select-none',
                        selectedActivity === act.id
                          ? 'bg-white/40 border-white scale-105 shadow-lg'
                          : 'bg-white/20 border-white/30 hover:bg-white/30',
                        locked && 'pointer-events-none',
                      ].filter(Boolean).join(' ')}
                    >
                      <span className="text-4xl leading-none">{act.emoji}</span>
                      <p className="text-xs text-white/90 font-medium mt-1">{act.label}</p>
                    </motion.button>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Scene A — "Try something new!" prompt */}
            {scene === 'A' && showNew && (
              <motion.div
                key={`A-new-${roundIdx}`}
                initial={{ opacity: 0, scale: 0.85 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col items-center gap-5 bg-white/15 rounded-3xl px-8 py-8 border border-white/20 text-center"
              >
                <motion.span
                  animate={{ rotate: [0, 20, -20, 0] }}
                  transition={{ duration: 0.7, repeat: 2 }}
                  className="text-6xl leading-none"
                >
                  🔄
                </motion.span>
                <p className="text-white font-bold text-xl">Try something new!</p>
                <p className="text-white/70 text-sm">
                  {roundIdx + 1 < ACTIVITY_ROUNDS
                    ? `${ACTIVITY_ROUNDS - roundIdx - 1} more round${ACTIVITY_ROUNDS - roundIdx - 1 !== 1 ? 's' : ''} to go!`
                    : "Last one — let's wrap up!"}
                </p>
                <motion.button
                  whileTap={{ scale: 0.94 }}
                  onClick={handleTryNew}
                  className="bg-white text-emerald-900 font-extrabold text-lg rounded-2xl px-10 py-4 min-h-[64px] shadow-xl"
                >
                  OK! →
                </motion.button>
              </motion.div>
            )}

            {/* Scene B — unexpected scenario */}
            {scene === 'B' && (
              <motion.div
                key={`B-${scenarioIdx}`}
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -30 }}
                className="flex flex-col items-center gap-5 w-full"
              >
                <motion.div
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 0.6 }}
                  className="text-7xl leading-none"
                >
                  {currentScenario.emoji}
                </motion.div>
                <div className="bg-white/15 rounded-2xl px-5 py-4 border border-white/20 text-center">
                  <p className="text-white font-semibold text-base">
                    {currentScenario.description}
                  </p>
                </div>
                <p className="text-white/70 text-sm">What do you do?</p>
                <div className="flex flex-col gap-3 w-full">
                  {currentScenario.options.map((opt, i) => (
                    <motion.button
                      key={opt.type}
                      initial={{ opacity: 0, x: -15 }}
                      animate={{ opacity: 1, x: 0, transition: { delay: 0.1 + i * 0.08 } }}
                      whileTap={{ scale: 0.96 }}
                      onClick={() => handleScenarioAnswer(opt.type)}
                      disabled={locked}
                      className="bg-white/20 border-2 border-white/30 rounded-2xl px-6 py-4 text-white font-semibold text-base min-h-[64px] text-left hover:bg-white/30 transition-all disabled:pointer-events-none"
                    >
                      {opt.label}
                    </motion.button>
                  ))}
                </div>
                <p className="text-white/40 text-xs">
                  Scenario {scenarioIdx + 1} of {UNEXPECTED_SCENARIOS.length}
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div />
      </div>

      {/* Complete overlay */}
      <AnimatePresence>
        {scene === 'complete' && (
          <motion.div
            initial={{ scale: 0.7, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="absolute inset-0 z-30 flex items-center justify-center bg-black/30 backdrop-blur-sm"
          >
            <div className="bg-white/20 rounded-3xl px-10 py-8 text-center border border-white/30 shadow-2xl">
              <div className="text-6xl mb-3">🔄</div>
              <p className="text-2xl font-extrabold text-white">Super flexible!</p>
              <p className="text-white/70 mt-1">Level 2 complete!</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </SceneCanvas>
  );
}
