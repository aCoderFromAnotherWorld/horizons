'use client';

import { useState, useRef, useEffect , useLayoutEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '@/store/gameStore.js';
import { useSoundCue } from '@/hooks/useSoundCue.js';
import SceneCanvas from '@/components/game/SceneCanvas.jsx';
import FeedbackBurst from '@/components/game/FeedbackBurst.jsx';
import PracticeDemo from '@/components/game/PracticeDemo.jsx';
import { PRETEND_CLIPS, L1_PRACTICE_STEPS } from '@/lib/gameData/chapter5.js';

const CHAPTER_KEY   = 'ch5_pretend';
const RED_FLAG_TYPE = 'complete_absence_pretend_play';
const TIMEOUT_MS    = 8000;
const FRAME_DELAY   = 800;  // ms between each animation frame

function delayMs(ms) { return new Promise(r => setTimeout(r, ms)); }
function now() { return Date.now(); }

export default function Level1Page() {
  const router      = useRouter();
  const sessionId   = useGameStore(s => s.sessionId);
  const addScore    = useGameStore(s => s.addScore);
  const addRedFlag  = useGameStore(s => s.addRedFlag);
  const goToChapter = useGameStore(s => s.goToChapter);
  const { play }    = useSoundCue();

  const [showPractice, setShowPractice] = useState(true);
  const [clipIdx, setClipIdx]           = useState(0);
  const [frameIdx, setFrameIdx]         = useState(0);   // which animation frame is showing
  const [animDone, setAnimDone]         = useState(false); // all frames shown
  const [answered, setAnswered]         = useState(false);
  const [feedback, setFeedback]         = useState({ show: false, correct: true });
  const [complete, setComplete]         = useState(false);
  const [clipKey, setClipKey]           = useState(0);

  const timeoutRef   = useRef(null);
  const animRef      = useRef(null);
  const startedAtRef = useRef(null);
  const responsesRef = useRef([]);
  const missedPretendCount = useRef(0);
  const sessionIdRef = useRef(sessionId);
  const playRef      = useRef(play);

  useLayoutEffect(() => {
    sessionIdRef.current = sessionId;
    playRef.current      = play;
  });

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { goToChapter(5, 1); }, []);

  // Run frame animation for current clip
  useEffect(() => {
    if (showPractice || complete || animDone) return;

    // eslint-disable-next-line react-hooks/set-state-in-effect
    setFrameIdx(0);
    setAnimDone(false);

    const clip = PRETEND_CLIPS[clipIdx];
    let frame = 0;

    function showNextFrame() {
      frame += 1;
      if (frame < clip.frames.length) {
        setFrameIdx(frame);
        animRef.current = setTimeout(showNextFrame, FRAME_DELAY);
      } else {
        // All frames shown — reveal answer buttons + start timeout
        setAnimDone(true);
        startedAtRef.current = now();
        timeoutRef.current = setTimeout(() => {
          handleAnswer(null); // timeout
        }, TIMEOUT_MS);
      }
    }

    animRef.current = setTimeout(showNextFrame, FRAME_DELAY);

    return () => {
      clearTimeout(animRef.current);
      clearTimeout(timeoutRef.current);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clipIdx, clipKey, showPractice, complete]);

  function handleAnswer(type) {
    if (answered) return;
    clearTimeout(timeoutRef.current);
    clearTimeout(animRef.current);
    setAnswered(true);

    const elapsed  = startedAtRef.current ? now() - startedAtRef.current : TIMEOUT_MS;
    const clip = PRETEND_CLIPS[clipIdx];
    const timedOut = type === null;
    const selectedType = type ?? 'timeout';
    const expectedType = clip.expectedType ?? 'pretend';
    const isCorrect = selectedType === expectedType;

    let pts = 0;
    if (timedOut)  pts = 1;
    else if (!isCorrect) pts = 2;

    if (expectedType === 'pretend' && selectedType === 'real') {
      missedPretendCount.current += 1;
    }

    responsesRef.current.push({
      taskKey:       clip.taskKey,
      startedAt:     startedAtRef.current ?? now(),
      responseTimeMs: timedOut ? null : elapsed,
      isCorrect,
      attemptNumber: 1,
      scorePoints:   pts,
      selection:     { type: selectedType, timedOut },
      extraData:     { expectedType },
    });

    setFeedback({ show: true, correct: isCorrect });
    playRef.current(isCorrect ? 'cueCorrect' : 'cueWrong');

    setTimeout(() => {
      setFeedback({ show: false, correct: true });
      advanceClip();
    }, 800);
  }

  function advanceClip() {
    const next = clipIdx + 1;
    if (next < PRETEND_CLIPS.length) {
      setClipIdx(next);
      setClipKey(k => k + 1);
      setAnimDone(false);
      setAnswered(false);
      setFrameIdx(0);
    } else {
      finishLevel();
    }
  }

  async function finishLevel() {
    const pretendClipCount = PRETEND_CLIPS.filter((clip) => (clip.expectedType ?? 'pretend') === 'pretend').length;
    const redFlagTriggered = pretendClipCount > 0 && missedPretendCount.current >= pretendClipCount;
    const totalScore = responsesRef.current.reduce((s, r) => s + r.scorePoints, 0)
      + (redFlagTriggered ? 3 : 0);

    const sid = sessionIdRef.current;
    if (sid) {
      const fetches = [
        ...responsesRef.current.map(r =>
          fetch('/api/game/response', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ sessionId: sid, chapter: 5, level: 1, ...r }),
          })
        ),
        fetch('/api/game/score', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ sessionId: sid, chapterKey: CHAPTER_KEY, rawPoints: totalScore }),
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
              description: 'All pretend play items were interpreted as real',
              severity: 'moderate',
            }),
          })
        );
      }
      await Promise.allSettled(fetches);
      addScore(CHAPTER_KEY, totalScore);
      if (redFlagTriggered) addRedFlag(RED_FLAG_TYPE);
    }

    setComplete(true);
    playRef.current('cueChapterComplete');
    await delayMs(1800);
    goToChapter(5, 2);
    router.push('/game/chapter-5/level-2');
  }

  const clip = PRETEND_CLIPS[clipIdx];

  return (
    <SceneCanvas chapterNumber={5}>
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
            <PracticeDemo steps={L1_PRACTICE_STEPS} onComplete={() => setShowPractice(false)} />
          </motion.div>
        )}
      </AnimatePresence>

      {!showPractice && clip && (
        <div className="flex flex-col items-center justify-between min-h-full px-4 py-8 gap-6">
          {/* Header */}
          <div className="text-center w-full max-w-sm">
            <motion.h2
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-2xl font-extrabold text-white drop-shadow"
            >
              🎭 Pretend or Real?
            </motion.h2>
            <p className="text-white/60 text-sm mt-1">
              {clipIdx + 1} of {PRETEND_CLIPS.length}
            </p>
          </div>

          {/* Progress bar */}
          <div className="w-full max-w-sm">
            <div className="h-2 bg-white/20 rounded-full overflow-hidden">
              <div
                className="h-full bg-white/80 rounded-full transition-all duration-500"
                style={{ width: `${(clipIdx / PRETEND_CLIPS.length) * 100}%` }}
              />
            </div>
          </div>

          <div className="flex-1 flex flex-col items-center justify-center gap-8 w-full max-w-sm">
            {/* Animation display */}
            <AnimatePresence mode="wait">
              <motion.div
                key={`clip-${clipKey}-frame-${frameIdx}`}
                initial={{ scale: 0.6, opacity: 0 }}
                animate={{ scale: 1, opacity: 1, transition: { type: 'spring', stiffness: 360, damping: 24 } }}
                exit={{ scale: 0.6, opacity: 0, transition: { duration: 0.15 } }}
                className="flex flex-col items-center gap-4 bg-white/15 rounded-3xl px-10 py-10 border border-white/20 min-w-[200px]"
              >
                <span className="text-8xl leading-none select-none">
                  {clip.frames[frameIdx]}
                </span>
                {animDone && (
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-white/80 text-sm font-semibold text-center"
                  >
                    {clip.description}
                  </motion.p>
                )}
                {!animDone && (
                  <motion.div
                    animate={{ opacity: [0.4, 1, 0.4] }}
                    transition={{ duration: 1, repeat: Infinity }}
                    className="text-white/50 text-sm"
                  >
                    Watch carefully…
                  </motion.div>
                )}
              </motion.div>
            </AnimatePresence>

            {/* Answer buttons — shown only after animation */}
            <AnimatePresence>
              {animDone && !answered && (
                <motion.div
                  key={`btns-${clipKey}`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="flex flex-col gap-3 w-full"
                >
                  <motion.button
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1, transition: { delay: 0.1 } }}
                    whileTap={{ scale: 0.94 }}
                    onClick={() => handleAnswer('pretend')}
                    className="bg-white/25 border-2 border-white/50 rounded-2xl px-6 py-5 text-white font-bold text-lg min-h-[72px] hover:bg-white/35 transition-all select-none"
                  >
                    🎭 They&apos;re pretending!
                  </motion.button>
                  <motion.button
                    initial={{ x: 20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1, transition: { delay: 0.2 } }}
                    whileTap={{ scale: 0.94 }}
                    onClick={() => handleAnswer('real')}
                    className="bg-white/15 border-2 border-white/25 rounded-2xl px-6 py-5 text-white/90 font-semibold text-base min-h-[72px] hover:bg-white/25 transition-all select-none"
                  >
                    {clip.literalLabel}
                  </motion.button>
                </motion.div>
              )}
            </AnimatePresence>
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
              <div className="text-6xl mb-3">🎭</div>
              <p className="text-2xl font-extrabold text-white">Pretend play pro!</p>
              <p className="text-white/70 mt-1">Level 1 complete!</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </SceneCanvas>
  );
}
