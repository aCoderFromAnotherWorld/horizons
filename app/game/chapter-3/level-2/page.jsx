'use client';

import { useState, useRef, useEffect , useLayoutEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '@/store/gameStore.js';
import { useSoundCue } from '@/hooks/useSoundCue.js';
import SceneCanvas from '@/components/game/SceneCanvas.jsx';
import FeedbackBurst from '@/components/game/FeedbackBurst.jsx';
import { CONVO_EXCHANGES, TOM_PROBE } from '@/lib/gameData/chapter3.js';

function delayMs(ms) { return new Promise(r => setTimeout(r, ms)); }
function now() { return Date.now(); }

/**
 * Score a conversation response.
 * Returns { pts, isCorrect }
 */
function scoreConvo(type) {
  if (type === 'appropriate') return { pts: 0, isCorrect: true };
  if (type === 'literal')     return { pts: 2, isCorrect: false };
  if (type === 'off_topic')   return { pts: 3, isCorrect: false };
  return { pts: 1, isCorrect: false };
}

function scoreTom(type) {
  if (type === 'tom_correct') return { pts: 0, isCorrect: true };
  return { pts: 2, isCorrect: false };
}

export default function Level2Page() {
  const router       = useRouter();
  const sessionId    = useGameStore(s => s.sessionId);
  const addScore     = useGameStore(s => s.addScore);
  const goToChapter  = useGameStore(s => s.goToChapter);
  const { play }     = useSoundCue();

  const [exchIdx, setExchIdx]       = useState(0);
  const [tapped, setTapped]         = useState(false);
  const [feedback, setFeedback]     = useState({ show: false, correct: true });
  const [complete, setComplete]     = useState(false);
  // For ToM probe: show story panels one at a time
  const [tomPhase, setTomPhase]     = useState(0); // 0=story 1=question
  const [tomPanelIdx, setTomPanelIdx] = useState(0);

  const responsesRef   = useRef([]);
  const sessionIdRef   = useRef(sessionId);
  const playRef        = useRef(play);
  useLayoutEffect(() => {
    sessionIdRef.current = sessionId;
    playRef.current      = play;
  });

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { goToChapter(3, 2); }, []);

  const exchange = CONVO_EXCHANGES[exchIdx];
  const isTom    = exchange?.isTom === true;

  async function handleOptionTap(option) {
    if (tapped || complete) return;
    setTapped(true);

    let pts, isCorrect;
    if (isTom) {
      ({ pts, isCorrect } = scoreTom(option.type));
    } else {
      ({ pts, isCorrect } = scoreConvo(option.type));
    }

    responsesRef.current.push({
      taskKey:     exchange.taskKey,
      startedAt:   now(),
      isCorrect,
      attemptNumber: 1,
      scorePoints: pts,
      selection:   { text: option.text, type: option.type },
    });

    setFeedback({ show: true, correct: isCorrect });
    playRef.current(isCorrect ? 'cueCorrect' : 'cueWrong');
    await delayMs(700);
    setFeedback({ show: false, correct: true });

    const next = exchIdx + 1;
    if (next < CONVO_EXCHANGES.length) {
      setExchIdx(next);
      setTomPhase(0);
      setTomPanelIdx(0);
      setTapped(false);
    } else {
      await finishLevel();
    }
  }

  async function finishLevel() {
    // Count how many were factual/literal (not appropriate or tom)
    const literalCount = responsesRef.current.filter(r => r.selection?.type === 'literal').length;
    let totalScore = responsesRef.current.reduce((s, r) => s + r.scorePoints, 0);
    // +5 if ≥5/6 non-ToM exchanges were factual (overly literal)
    const nonTomResponses = responsesRef.current.filter(r => r.taskKey !== 'ch3_l2_tom');
    if (nonTomResponses.filter(r => r.selection?.type === 'literal').length >= 5) {
      totalScore += 5;
    }

    const sid = sessionIdRef.current;
    if (sid) {
      await Promise.allSettled([
        ...responsesRef.current.map(r =>
          fetch('/api/game/response', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              sessionId: sid, chapter: 3, level: 2,
              taskKey: r.taskKey, startedAt: r.startedAt,
              isCorrect: r.isCorrect, attemptNumber: 1,
              scorePoints: r.scorePoints, selection: r.selection,
            }),
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

    setComplete(true);
    await delayMs(1800);
    goToChapter(3, 3);
    router.push('/game/chapter-3/level-3');
  }

  // --- ToM story render ---
  function renderTomStory() {
    if (tomPhase === 0) {
      const panel = TOM_PROBE.setup[tomPanelIdx];
      const isLast = tomPanelIdx >= TOM_PROBE.setup.length - 1;
      return (
        <div className="flex flex-col items-center gap-6 w-full max-w-sm">
          <p className="text-white/80 text-sm font-semibold uppercase tracking-wider">Watch the story</p>
          <AnimatePresence mode="wait">
            <motion.div
              key={tomPanelIdx}
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -40 }}
              transition={{ duration: 0.3 }}
              className="bg-white/15 rounded-3xl px-8 py-8 border border-white/25 text-center min-h-[100px] flex items-center justify-center"
            >
              <p className="text-white text-xl font-bold leading-relaxed">{panel}</p>
            </motion.div>
          </AnimatePresence>
          <div className="flex gap-1.5">
            {TOM_PROBE.setup.map((_, i) => (
              <div
                key={i}
                className="w-2 h-2 rounded-full transition-all duration-300"
                style={{ backgroundColor: i === tomPanelIdx ? 'white' : 'rgba(255,255,255,0.3)' }}
              />
            ))}
          </div>
          <motion.button
            whileTap={{ scale: 0.94 }}
            onClick={() => {
              if (isLast) setTomPhase(1);
              else setTomPanelIdx(i => i + 1);
            }}
            className="bg-white text-indigo-900 font-extrabold text-lg rounded-2xl px-8 py-4 min-h-[64px] shadow-xl select-none"
          >
            {isLast ? 'Now answer! 🤔' : 'Next →'}
          </motion.button>
        </div>
      );
    }

    // tomPhase === 1 → show question
    return (
      <div className="flex flex-col items-center gap-6 w-full max-w-sm">
        <div className="bg-white/15 rounded-3xl px-8 py-6 border border-white/25 text-center">
          <p className="text-white text-xl font-bold leading-relaxed">{TOM_PROBE.question}</p>
        </div>
        <div className="flex flex-col gap-3 w-full">
          {exchange.options.map((opt, i) => (
            <motion.button
              key={opt.text + i}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0, transition: { delay: i * 0.1 } }}
              whileTap={{ scale: 0.95 }}
              // eslint-disable-next-line react-hooks/refs
              onClick={() => handleOptionTap(opt)}
              disabled={tapped}
              className="w-full flex items-center gap-3 bg-white/20 border-2 border-white/30 rounded-2xl px-5 py-4 text-white font-semibold text-lg min-h-[64px] select-none hover:bg-white/30 transition-all disabled:pointer-events-none"
            >
              <span className="text-3xl">{opt.emoji}</span>
              <span>{opt.text}</span>
            </motion.button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <SceneCanvas chapterNumber={3}>
      <FeedbackBurst
        show={feedback.show}
        correct={feedback.correct}
        onComplete={() => setFeedback(f => ({ ...f, show: false }))}
      />

      <div className="flex flex-col items-center justify-between min-h-dvh px-4 py-6 gap-4">
        {/* Progress */}
        <div className="w-full max-w-sm flex items-center gap-2">
          <div className="flex-1 h-2 bg-white/20 rounded-full overflow-hidden">
            <div
              className="h-full bg-white/80 rounded-full transition-all duration-500"
              style={{ width: `${(exchIdx / CONVO_EXCHANGES.length) * 100}%` }}
            />
          </div>
          <span className="text-white/70 text-xs font-medium tabular-nums">
            {exchIdx + 1}/{CONVO_EXCHANGES.length}
          </span>
        </div>

        {/* Chat area */}
        <div className="flex-1 flex flex-col items-center justify-center w-full max-w-sm gap-5">
          {/* Friend speech bubble */}
          <AnimatePresence mode="wait">
            {!isTom && (
              <motion.div
                key={`bubble-${exchIdx}`}
                initial={{ opacity: 0, y: -16, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0 }}
                className="flex items-start gap-3 w-full"
              >
                <div className="flex flex-col items-center gap-1 shrink-0">
                  <span className="text-4xl">{exchange?.friendEmoji}</span>
                  <span className="text-xs text-white/60">Friend</span>
                </div>
                <div className="bg-white/20 border border-white/30 rounded-2xl rounded-tl-none px-5 py-4 flex-1">
                  <p className="text-white font-semibold text-base leading-snug">{exchange?.friendText}</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* ToM probe special UI */}
          {isTom ? renderTomStory() : (
            /* Normal response options */
            <div className="flex flex-col gap-3 w-full">
              <p className="text-white/80 text-sm font-semibold text-center">What do you say? 💬</p>
              <AnimatePresence mode="wait">
                <motion.div
                  key={`opts-${exchIdx}`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex flex-col gap-3"
                >
                  {exchange?.options.map((opt, i) => (
                    <motion.button
                      key={opt.text + i}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0, transition: { delay: i * 0.09 } }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleOptionTap(opt)}
                      disabled={tapped}
                      className="flex items-center gap-3 bg-white/20 border-2 border-white/30 rounded-2xl px-5 py-4 text-white font-semibold text-base min-h-[64px] select-none hover:bg-white/30 transition-all disabled:pointer-events-none text-left"
                    >
                      <span className="text-3xl shrink-0">{opt.emoji}</span>
                      <span>{opt.text}</span>
                    </motion.button>
                  ))}
                </motion.div>
              </AnimatePresence>
            </div>
          )}
        </div>
      </div>

      <AnimatePresence>
        {complete && (
          <motion.div
            initial={{ scale: 0.7, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="absolute inset-0 z-30 flex items-center justify-center bg-black/30 backdrop-blur-sm"
          >
            <div className="bg-white/20 rounded-3xl px-10 py-8 text-center border border-white/30 shadow-2xl">
              <div className="text-6xl mb-3">💬</div>
              <p className="text-2xl font-extrabold text-white">Great chatting!</p>
              <p className="text-white/70 mt-1">Level 2 complete!</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </SceneCanvas>
  );
}
