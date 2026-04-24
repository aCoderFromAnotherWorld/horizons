'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '@/store/gameStore.js';
import { useSoundCue } from '@/hooks/useSoundCue.js';
import SceneCanvas from '@/components/game/SceneCanvas.jsx';
import FeedbackBurst from '@/components/game/FeedbackBurst.jsx';
import PracticeDemo from '@/components/game/PracticeDemo.jsx';
import { PATTERNS, PATTERN_PRACTICE_STEPS } from '@/lib/gameData/chapter4.js';

const CHAPTER_KEY     = 'ch4_routine';
const RED_FLAG_TYPE   = 'rigid_pattern_distress';
const TIMEOUT_MS      = 10000;
const FORCED_ERR_MS   = 1500;  // duration of "forced error" display phase
const INSIST_TAPS     = 2;     // taps during forced-error phase → distress flag

function delayMs(ms) { return new Promise(r => setTimeout(r, ms)); }

export default function Level3Page() {
  const router      = useRouter();
  const sessionId   = useGameStore(s => s.sessionId);
  const addScore    = useGameStore(s => s.addScore);
  const addRedFlag  = useGameStore(s => s.addRedFlag);
  const goToChapter = useGameStore(s => s.goToChapter);
  const { play }    = useSoundCue();

  const [showPractice, setShowPractice] = useState(true);
  const [patternIdx, setPatternIdx]     = useState(0);
  const [phase, setPhase]               = useState('play');  // 'play' | 'forced_error' | 'done'
  const [wrongTaps, setWrongTaps]       = useState(0);       // wrong taps on current pattern
  const [insistTaps, setInsistTaps]     = useState(0);       // taps during forced-error phase
  const [tapped, setTapped]             = useState(false);   // correct answer tapped
  const [feedback, setFeedback]         = useState({ show: false, correct: true });
  const [complete, setComplete]         = useState(false);
  const [patternKey, setPatternKey]     = useState(0);       // force remount

  const timeoutRef      = useRef(null);
  const forcedErrRef    = useRef(null);
  const responsesRef    = useRef([]);
  const totalScoreRef   = useRef(0);
  const distressFlagRef = useRef(false);
  const insistTapsRef   = useRef(0);
  const wrongTapsRef    = useRef(0);
  const startedAtRef    = useRef(null);
  const sessionIdRef    = useRef(sessionId);
  const playRef         = useRef(play);
  const phaseRef        = useRef(phase);

  sessionIdRef.current = sessionId;
  playRef.current      = play;
  phaseRef.current     = phase;

  useEffect(() => { goToChapter(4, 3); }, []);

  // Start timer when a new play phase begins
  useEffect(() => {
    if (showPractice || complete || phase !== 'play') return;
    startedAtRef.current = Date.now();
    insistTapsRef.current = 0;
    wrongTapsRef.current  = 0;
    setWrongTaps(0);
    setInsistTaps(0);
    setTapped(false);

    clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      if (phaseRef.current === 'play') {
        handleTimeout();
      }
    }, TIMEOUT_MS);

    return () => clearTimeout(timeoutRef.current);
  }, [patternIdx, patternKey, showPractice, complete]);

  function handleTimeout() {
    if (tapped) return;
    setTapped(true);
    clearTimeout(timeoutRef.current);

    const pattern = PATTERNS[patternIdx];
    const pts = wrongTapsRef.current + 2; // +2 for timeout
    totalScoreRef.current += pts;
    responsesRef.current.push({
      taskKey:       pattern.taskKey,
      startedAt:     startedAtRef.current,
      responseTimeMs: TIMEOUT_MS,
      isCorrect:     false,
      attemptNumber: 1 + wrongTapsRef.current,
      scorePoints:   pts,
      selection:     { timedOut: true, wrongTaps: wrongTapsRef.current },
    });

    setFeedback({ show: true, correct: false });
    playRef.current('cueWrong');
    setTimeout(() => {
      setFeedback({ show: false, correct: true });
      startForcedError();
    }, 700);
  }

  function startForcedError() {
    setPhase('forced_error');
    phaseRef.current = 'forced_error';
    insistTapsRef.current = 0;
    setInsistTaps(0);

    forcedErrRef.current = setTimeout(() => {
      endForcedError();
    }, FORCED_ERR_MS);
  }

  function endForcedError() {
    clearTimeout(forcedErrRef.current);
    if (insistTapsRef.current >= INSIST_TAPS) {
      distressFlagRef.current = true;
    }
    advancePattern();
  }

  function handleOptionTap(optIdx) {
    if (complete) return;

    if (phaseRef.current === 'forced_error') {
      // Tapping during forced-error phase = insistence
      insistTapsRef.current += 1;
      setInsistTaps(t => t + 1);
      return;
    }

    if (phaseRef.current !== 'play' || tapped) return;

    const pattern = PATTERNS[patternIdx];
    const isCorrect = optIdx === pattern.correctIdx;

    if (isCorrect) {
      clearTimeout(timeoutRef.current);
      setTapped(true);

      const elapsed = startedAtRef.current ? Date.now() - startedAtRef.current : 0;
      const pts     = wrongTapsRef.current; // each wrong tap = +1 pt
      totalScoreRef.current += pts;
      responsesRef.current.push({
        taskKey:       pattern.taskKey,
        startedAt:     startedAtRef.current,
        responseTimeMs: elapsed,
        isCorrect:     true,
        attemptNumber: 1 + wrongTapsRef.current,
        scorePoints:   pts,
        selection:     { optIdx, wrongTaps: wrongTapsRef.current },
      });

      setFeedback({ show: true, correct: true });
      playRef.current('cueCorrect');
      setTimeout(() => {
        setFeedback({ show: false, correct: true });
        startForcedError();
      }, 700);
    } else {
      // Wrong tap
      wrongTapsRef.current += 1;
      setWrongTaps(t => t + 1);
      setFeedback({ show: true, correct: false });
      playRef.current('cueWrong');
      setTimeout(() => setFeedback({ show: false, correct: true }), 500);
    }
  }

  function advancePattern() {
    const next = patternIdx + 1;
    setPhase('play');
    phaseRef.current = 'play';
    if (next < PATTERNS.length) {
      setPatternIdx(next);
      setPatternKey(k => k + 1);
    } else {
      finishLevel();
    }
  }

  async function finishLevel() {
    const redFlagTriggered = distressFlagRef.current;
    if (redFlagTriggered) totalScoreRef.current += 3;

    const sid = sessionIdRef.current;
    if (sid) {
      const fetches = [
        ...responsesRef.current.map(r =>
          fetch('/api/game/response', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ sessionId: sid, chapter: 4, level: 3, ...r }),
          })
        ),
        fetch('/api/game/score', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ sessionId: sid, chapterKey: CHAPTER_KEY, rawPoints: totalScoreRef.current }),
        }),
      ];
      if (redFlagTriggered) {
        fetches.push(
          fetch('/api/game/flag', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              sessionId: sid,
              flagType: RED_FLAG_TYPE,
              description: 'Meltdown + insists on returning to broken pattern',
              severity: 'moderate',
            }),
          })
        );
      }
      await Promise.allSettled(fetches);
      addScore(CHAPTER_KEY, totalScoreRef.current);
      if (redFlagTriggered) addRedFlag(RED_FLAG_TYPE);
    }

    setComplete(true);
    playRef.current('cueChapterComplete');
    await delayMs(1800);
    goToChapter(4, 4);
    router.push('/game/chapter-4/level-4');
  }

  const pattern = PATTERNS[patternIdx];

  return (
    <SceneCanvas chapterNumber={4}>
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
            <PracticeDemo steps={PATTERN_PRACTICE_STEPS} onComplete={() => setShowPractice(false)} />
          </motion.div>
        )}
      </AnimatePresence>

      {!showPractice && pattern && (
        <div className="flex flex-col items-center justify-between min-h-dvh px-4 py-8 gap-6">
          {/* Header */}
          <div className="text-center w-full max-w-sm">
            <motion.h2
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-2xl font-extrabold text-white drop-shadow"
            >
              🔍 Pattern Detective
            </motion.h2>
            <p className="text-white/70 text-sm mt-1">
              Pattern {patternIdx + 1} of {PATTERNS.length} — Type: {pattern.type}
            </p>
          </div>

          {/* Progress bar */}
          <div className="w-full max-w-sm flex items-center gap-2">
            <div className="flex-1 h-2 bg-white/20 rounded-full overflow-hidden">
              <div
                className="h-full bg-white/80 rounded-full transition-all duration-500"
                style={{ width: `${(patternIdx / PATTERNS.length) * 100}%` }}
              />
            </div>
            <span className="text-white/60 text-xs tabular-nums">
              {patternIdx + 1}/{PATTERNS.length}
            </span>
          </div>

          <div className="flex-1 flex flex-col items-center justify-center gap-6 w-full max-w-sm">
            {/* Pattern sequence */}
            <AnimatePresence mode="wait">
              <motion.div
                key={`seq-${patternKey}`}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-2 bg-white/15 rounded-3xl px-5 py-5 border border-white/20 flex-wrap justify-center"
              >
                {pattern.sequence.map((emoji, i) => (
                  <motion.span
                    key={i}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1, transition: { delay: i * 0.1, type: 'spring', stiffness: 350, damping: 22 } }}
                    className="text-4xl leading-none select-none"
                  >
                    {emoji}
                  </motion.span>
                ))}
                {/* Forced-error display: show wrong answer briefly */}
                {phase === 'forced_error' ? (
                  <motion.span
                    key="forced-err"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="text-4xl leading-none select-none opacity-60 line-through"
                  >
                    {pattern.options[(pattern.correctIdx + 1) % pattern.options.length]}
                  </motion.span>
                ) : (
                  <motion.span
                    key="question"
                    animate={{ opacity: [1, 0.4, 1] }}
                    transition={{ duration: 1.2, repeat: Infinity }}
                    className="text-4xl leading-none select-none"
                  >
                    ❓
                  </motion.span>
                )}
              </motion.div>
            </AnimatePresence>

            {phase === 'forced_error' && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-white/70 text-sm text-center"
              >
                Oops! That was wrong… moving on!
              </motion.p>
            )}

            {/* Options grid */}
            <AnimatePresence>
              {phase === 'play' && !tapped && (
                <motion.div
                  key={`opts-${patternKey}`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="grid grid-cols-2 gap-3 w-full"
                >
                  {pattern.options.map((opt, i) => (
                    <motion.button
                      key={opt + i}
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1, transition: { delay: i * 0.07, type: 'spring', stiffness: 320, damping: 22 } }}
                      whileTap={{ scale: 0.88 }}
                      onClick={() => handleOptionTap(i)}
                      className="flex items-center justify-center rounded-2xl bg-white/20 border-2 border-white/25 hover:bg-white/30 hover:border-white/50 transition-all select-none min-h-[80px]"
                    >
                      <span className="text-5xl leading-none">{opt}</span>
                    </motion.button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>

            {/* During forced error — large tap zone that tracks insistence */}
            {phase === 'forced_error' && (
              <motion.button
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                onClick={() => handleOptionTap(-1)}
                className="bg-white/10 border border-white/20 rounded-2xl px-6 py-4 text-white/50 text-sm min-h-[64px] w-full"
              >
                Please wait…
              </motion.button>
            )}
          </div>

          <div />
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
              <div className="text-6xl mb-3">🔍</div>
              <p className="text-2xl font-extrabold text-white">Pattern expert!</p>
              <p className="text-white/70 mt-1">Level 3 complete!</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </SceneCanvas>
  );
}
