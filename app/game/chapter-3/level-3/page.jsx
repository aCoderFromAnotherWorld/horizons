'use client';

import { useState, useRef, useEffect , useLayoutEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '@/store/gameStore.js';
import { useSoundCue } from '@/hooks/useSoundCue.js';
import SceneCanvas from '@/components/game/SceneCanvas.jsx';
import FeedbackBurst from '@/components/game/FeedbackBurst.jsx';
import { DISCOVERY_EVENTS } from '@/lib/gameData/chapter3.js';

function delayMs(ms) { return new Promise(r => setTimeout(r, ms)); }
function now() { return Date.now(); }

// Each event has two sub-phases: friend_finds (attend) then child_finds (share).
// Phase A: friend points at their emoji → child must tap it
// Phase B: child's emoji glows → two buttons Share / Keep

export default function Level3Page() {
  const router      = useRouter();
  const sessionId   = useGameStore(s => s.sessionId);
  const addScore    = useGameStore(s => s.addScore);
  const goToChapter = useGameStore(s => s.goToChapter);
  const { play }    = useSoundCue();

  // eventIdx 0-4, phase 'attend' | 'share'
  const [eventIdx, setEventIdx]   = useState(0);
  const [phase, setPhase]         = useState('attend'); // 'attend' | 'share'
  const [tapped, setTapped]       = useState(false);
  const [feedback, setFeedback]   = useState({ show: false, correct: true });
  const [complete, setComplete]   = useState(false);
  // For attend phase timeout
  const attendTimerRef = useRef(null);
  const responsesRef   = useRef([]);
  const sessionIdRef   = useRef(sessionId);
  const playRef        = useRef(play);
  useLayoutEffect(() => {
    sessionIdRef.current = sessionId;
    playRef.current      = play;
  });

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { goToChapter(3, 3); }, []);

  const event = DISCOVERY_EVENTS[eventIdx];

  function recordAttend(isCorrect, pts) {
    responsesRef.current.push({
      taskKey: event.attendKey,
      startedAt: now(),
      isCorrect,
      attemptNumber: 1,
      scorePoints: pts,
      selection: { action: isCorrect ? 'tapped_target' : 'missed' },
    });
  }

  function handleAttendTimeout() {
    if (tapped) return;
    setTapped(true);
    recordAttend(false, 2);
    setFeedback({ show: true, correct: false });
    playRef.current('cueWrong');
    setTimeout(() => {
      setFeedback({ show: false, correct: true });
      setPhase('share');
      setTapped(false);
    }, 700);
  }

  // Start attend timeout when entering attend phase
  useEffect(() => {
    if (phase !== 'attend' || complete) return;
    if (attendTimerRef.current) clearTimeout(attendTimerRef.current);
    attendTimerRef.current = setTimeout(() => {
      handleAttendTimeout();
    }, 5000);
    return () => clearTimeout(attendTimerRef.current);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [eventIdx, phase, complete]);

  async function handleAttendTap() {
    if (tapped || phase !== 'attend') return;
    clearTimeout(attendTimerRef.current);
    setTapped(true);
    recordAttend(true, 0);
    setFeedback({ show: true, correct: true });
    playRef.current('cueCorrect');
    await delayMs(700);
    setFeedback({ show: false, correct: true });
    setPhase('share');
    setTapped(false);
  }

  async function handleShareChoice(choice) {
    if (tapped || phase !== 'share') return;
    setTapped(true);
    const isShare = choice === 'share';
    const pts = isShare ? 0 : 2;
    responsesRef.current.push({
      taskKey: event.shareKey,
      startedAt: now(),
      isCorrect: isShare,
      attemptNumber: 1,
      scorePoints: pts,
      selection: { choice },
    });
    setFeedback({ show: true, correct: isShare });
    playRef.current(isShare ? 'cueCorrect' : 'cueWrong');
    await delayMs(700);
    setFeedback({ show: false, correct: true });

    const next = eventIdx + 1;
    if (next < DISCOVERY_EVENTS.length) {
      setEventIdx(next);
      setPhase('attend');
      setTapped(false);
    } else {
      await finishLevel();
    }
  }

  async function finishLevel() {
    const totalScore = responsesRef.current.reduce((s, r) => s + r.scorePoints, 0);

    const sid = sessionIdRef.current;
    if (sid) {
      await Promise.allSettled([
        ...responsesRef.current.map(r =>
          fetch('/api/game/response', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              sessionId: sid, chapter: 3, level: 3,
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
    goToChapter(3, 4);
    router.push('/game/chapter-3/level-4');
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
              style={{ width: `${(eventIdx / DISCOVERY_EVENTS.length) * 100}%` }}
            />
          </div>
          <span className="text-white/70 text-xs font-medium tabular-nums">
            {eventIdx + 1}/{DISCOVERY_EVENTS.length}
          </span>
        </div>

        {/* Scene label */}
        <motion.p
          key={`label-${eventIdx}-${phase}`}
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-white/80 text-base font-semibold text-center"
        >
          {phase === 'attend'
            ? `${event?.friendFinds.emoji} Friend found something! Tap it! 👆`
            : `You found ${event?.childFinds.emoji}! What will you do?`}
        </motion.p>

        {/* Play scene */}
        <div className="flex-1 flex flex-col items-center justify-center w-full max-w-sm gap-6">
          {/* Playmat */}
          <div className="relative w-full rounded-3xl bg-white/10 border-2 border-white/25 p-6 flex items-center justify-around min-h-[180px]">
            {/* Friend avatar */}
            <div className="flex flex-col items-center gap-2">
              <motion.div
                animate={{ y: [0, -6, 0] }}
                transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                className="text-5xl select-none"
              >
                👧
              </motion.div>
              <span className="text-xs text-white/60">Friend</span>
            </div>

            {/* Friend's discovery emoji + pointing arrow */}
            <AnimatePresence mode="wait">
              {phase === 'attend' && (
                <motion.div
                  key={`attend-target-${eventIdx}`}
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1, transition: { type: 'spring', stiffness: 350, damping: 22 } }}
                  className="flex flex-col items-center gap-2"
                >
                  {/* Pointing arrow */}
                  <motion.div
                    animate={{ x: [0, -6, 0] }}
                    transition={{ duration: 0.7, repeat: Infinity, ease: 'easeInOut' }}
                    className="text-2xl"
                  >
                    👉
                  </motion.div>
                  {/* Target emoji — tap here */}
                  <motion.button
                    whileTap={{ scale: 0.88 }}
                    onClick={handleAttendTap}
                    disabled={tapped}
                    className="text-6xl leading-none select-none p-3 rounded-2xl border-2 border-white/40 bg-white/15 min-w-[80px] min-h-[80px] flex items-center justify-center disabled:pointer-events-none"
                    style={{
                      boxShadow: '0 0 0 4px rgba(255,255,255,0.25)',
                    }}
                    aria-label={`Tap ${event?.friendFinds.emoji}`}
                  >
                    <motion.span
                      animate={{ scale: [1, 1.1, 1] }}
                      transition={{ duration: 1.2, repeat: Infinity }}
                    >
                      {event?.friendFinds.emoji}
                    </motion.span>
                  </motion.button>
                  <span className="text-xs text-white/70 font-medium">Tap it!</span>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Child's found emoji */}
            <AnimatePresence mode="wait">
              {phase === 'share' && (
                <motion.div
                  key={`child-find-${eventIdx}`}
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1, transition: { type: 'spring', stiffness: 350, damping: 22 } }}
                  className="flex flex-col items-center gap-2"
                >
                  <motion.span
                    animate={{ scale: [1, 1.15, 1], rotate: [0, 5, -5, 0] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                    className="text-6xl leading-none"
                  >
                    {event?.childFinds.emoji}
                  </motion.span>
                  <span className="text-xs text-white/70 font-medium">You found it!</span>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Child avatar */}
            <div className="flex flex-col items-center gap-2">
              <span className="text-5xl select-none">🧒</span>
              <span className="text-xs text-white/60">You</span>
            </div>
          </div>

          {/* Share / Keep buttons */}
          <AnimatePresence mode="wait">
            {phase === 'share' && (
              <motion.div
                key={`share-btns-${eventIdx}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex gap-4 w-full max-w-xs"
              >
                <motion.button
                  whileTap={{ scale: 0.92 }}
                  onClick={() => handleShareChoice('share')}
                  disabled={tapped}
                  className="flex-1 flex flex-col items-center gap-2 bg-green-400/30 border-2 border-green-300/60 rounded-2xl py-5 text-white font-bold text-base min-h-[80px] select-none hover:bg-green-400/40 transition-all disabled:pointer-events-none"
                >
                  <span className="text-3xl">🎁</span>
                  <span>Share!</span>
                </motion.button>
                <motion.button
                  whileTap={{ scale: 0.92 }}
                  onClick={() => handleShareChoice('keep')}
                  disabled={tapped}
                  className="flex-1 flex flex-col items-center gap-2 bg-white/15 border-2 border-white/25 rounded-2xl py-5 text-white font-bold text-base min-h-[80px] select-none hover:bg-white/25 transition-all disabled:pointer-events-none"
                >
                  <span className="text-3xl">🤐</span>
                  <span>Keep</span>
                </motion.button>
              </motion.div>
            )}
          </AnimatePresence>
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
              <div className="text-6xl mb-3">🤝</div>
              <p className="text-2xl font-extrabold text-white">Amazing sharing!</p>
              <p className="text-white/70 mt-1">Level 3 complete!</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </SceneCanvas>
  );
}
