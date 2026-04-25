'use client';

import { useState, useRef, useEffect , useLayoutEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '@/store/gameStore.js';
import { useSoundCue } from '@/hooks/useSoundCue.js';
import SceneCanvas from '@/components/game/SceneCanvas.jsx';
import FeedbackBurst from '@/components/game/FeedbackBurst.jsx';
import { SCENE_PROMPTS, OBJECT_PALETTE } from '@/lib/gameData/chapter5.js';

const CHAPTER_KEY    = 'ch5_pretend';
const SLOW_SCENE_MS  = 15000;  // >15s before Done → +1 pt
const MAX_SELECTIONS = 5;

function delayMs(ms) { return new Promise(r => setTimeout(r, ms)); }
function now() { return Date.now(); }

/** Serialize selected item IDs to a stable key for comparison */
function selectionKey(ids) {
  return [...ids].sort().join(',');
}

export default function Level2Page() {
  const router      = useRouter();
  const sessionId   = useGameStore(s => s.sessionId);
  const addScore    = useGameStore(s => s.addScore);
  const goToChapter = useGameStore(s => s.goToChapter);
  const { play }    = useSoundCue();

  const [sceneIdx, setSceneIdx]         = useState(0);
  const [selected, setSelected]         = useState(new Set());  // selected object IDs this scene
  const [feedback, setFeedback]         = useState({ show: false, correct: true });
  const [complete, setComplete]         = useState(false);
  const [locked, setLocked]             = useState(false);

  const sceneStartRef   = useRef(null);
  const prevSelectKey   = useRef('');      // selection key of previous scene
  const responsesRef    = useRef([]);
  const sessionIdRef    = useRef(sessionId);
  const playRef         = useRef(play);

  useLayoutEffect(() => {
    sessionIdRef.current = sessionId;
    playRef.current      = play;
  });

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { goToChapter(5, 2); }, []);

  // Reset & start timer on scene change
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setSelected(new Set());
    setLocked(false);
    sceneStartRef.current = now();
  }, [sceneIdx]);

  function toggleObject(objId) {
    if (locked) return;
    setSelected(prev => {
      const next = new Set(prev);
      if (next.has(objId)) {
        next.delete(objId);
      } else if (next.size < MAX_SELECTIONS) {
        next.add(objId);
      }
      return next;
    });
  }

  function handleDone() {
    if (locked) return;
    setLocked(true);

    const elapsed    = sceneStartRef.current ? now() - sceneStartRef.current : 0;
    const tooSlow    = elapsed > SLOW_SCENE_MS;
    const selectedIds = Array.from(selected);
    const key        = selectionKey(selectedIds);

    // Score this scene
    let pts = 0;

    if (selectedIds.length === 0) {
      // No objects selected — treat as timeout
      pts += 3;
    } else {
      // Check if any symbolic objects were selected
      const hasSymbolic = selectedIds.some(id => {
        const obj = OBJECT_PALETTE.find(o => o.id === id);
        return obj?.symbolic === true;
      });
      if (!hasSymbolic) pts += 4; // no symbolic picks
    }

    // Identical selection to previous scene → +2 pts
    if (key !== '' && key === prevSelectKey.current) pts += 2;
    prevSelectKey.current = key;

    if (tooSlow) pts += 1;

    const isCorrect = pts === 0;
    setFeedback({ show: true, correct: isCorrect });
    playRef.current(isCorrect ? 'cueCorrect' : 'cueWrong');

    responsesRef.current.push({
      taskKey:       `ch5_l2_scene_${sceneIdx + 1}`,
      startedAt:     sceneStartRef.current ?? now(),
      responseTimeMs: elapsed,
      isCorrect,
      attemptNumber: 1,
      scorePoints:   pts,
      selection:     { selectedIds, tooSlow, hasSymbolic: selectedIds.some(id => OBJECT_PALETTE.find(o => o.id === id)?.symbolic) },
    });

    setTimeout(() => {
      setFeedback({ show: false, correct: true });
      const next = sceneIdx + 1;
      if (next >= SCENE_PROMPTS.length) {
        finishLevel(responsesRef.current);
      } else {
        setSceneIdx(next);
      }
    }, 800);
  }

  async function finishLevel(responses) {
    const totalScore = responses.reduce((s, r) => s + r.scorePoints, 0);
    setComplete(true);
    playRef.current('cueChapterComplete');

    const sid = sessionIdRef.current;
    if (sid) {
      await Promise.allSettled([
        ...responses.map(r =>
          fetch('/api/game/response', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ sessionId: sid, chapter: 5, level: 2, ...r }),
          })
        ),
        fetch('/api/game/score', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ sessionId: sid, chapterKey: CHAPTER_KEY, rawPoints: totalScore }),
        }),
      ]);
      addScore(CHAPTER_KEY, totalScore);
    }

    await delayMs(1800);
    goToChapter(5, 3);
    router.push('/game/chapter-5/level-3');
  }

  const scene = SCENE_PROMPTS[sceneIdx];

  return (
    <SceneCanvas chapterNumber={5}>
      <FeedbackBurst
        show={feedback.show}
        correct={feedback.correct}
        onComplete={() => setFeedback(f => ({ ...f, show: false }))}
      />

      <div className="flex flex-col items-center justify-between min-h-dvh px-4 py-8 gap-4">
        {/* Header */}
        <div className="text-center w-full max-w-sm">
          <motion.h2
            key={sceneIdx}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-2xl font-extrabold text-white drop-shadow"
          >
            🏠 Create a Pretend World
          </motion.h2>
          <p className="text-white/70 text-sm mt-1">
            Scene {sceneIdx + 1} of {SCENE_PROMPTS.length}
          </p>
        </div>

        {/* Scene prompt */}
        <AnimatePresence mode="wait">
          {scene && (
            <motion.div
              key={`scene-${sceneIdx}`}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="flex flex-col items-center gap-3 bg-white/15 rounded-3xl px-8 py-5 border border-white/20 w-full max-w-sm text-center"
            >
              <span className="text-6xl leading-none">{scene.emoji}</span>
              <p className="text-white font-bold text-xl">{scene.label}</p>
              <p className="text-white/60 text-sm">
                Pick up to {MAX_SELECTIONS} objects for your scene!
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Object palette */}
        <div className="grid grid-cols-5 gap-2 w-full max-w-sm">
          {OBJECT_PALETTE.map((obj, i) => {
            const isSelected = selected.has(obj.id);
            return (
              <motion.button
                key={obj.id}
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1, transition: { delay: i * 0.04, type: 'spring', stiffness: 350, damping: 22 } }}
                whileTap={{ scale: 0.88 }}
                onClick={() => toggleObject(obj.id)}
                disabled={locked || (!isSelected && selected.size >= MAX_SELECTIONS)}
                className={[
                  'flex flex-col items-center justify-center rounded-2xl p-2 min-h-[72px]',
                  'border-2 transition-all select-none',
                  isSelected
                    ? 'bg-white/40 border-white scale-105 shadow-lg ring-2 ring-white/60'
                    : 'bg-white/20 border-white/30 hover:bg-white/30',
                  (locked || (!isSelected && selected.size >= MAX_SELECTIONS)) && 'pointer-events-none opacity-50',
                ].filter(Boolean).join(' ')}
              >
                <span className="text-3xl leading-none">{obj.emoji}</span>
                <p className="text-xs text-white/90 font-medium mt-1 text-center leading-tight">
                  {obj.label}
                </p>
              </motion.button>
            );
          })}
        </div>

        {/* Selection count + Done button */}
        <div className="flex flex-col items-center gap-3 w-full max-w-sm">
          <p className="text-white/60 text-sm">
            {selected.size === 0
              ? 'No objects selected yet'
              : `${selected.size} object${selected.size !== 1 ? 's' : ''} selected`}
          </p>
          <motion.button
            whileTap={{ scale: 0.94 }}
            onClick={handleDone}
            disabled={locked}
            className="bg-white text-purple-900 font-extrabold text-lg rounded-2xl px-10 py-4 min-h-[64px] shadow-xl w-full disabled:pointer-events-none disabled:opacity-60"
          >
            Done! ✅
          </motion.button>
        </div>
      </div>

      {/* Complete overlay */}
      <AnimatePresence>
        {complete && (
          <motion.div
            initial={{ scale: 0.7, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="absolute inset-0 z-30 flex items-center justify-center bg-black/30 backdrop-blur-sm"
          >
            <div className="bg-white/20 rounded-3xl px-10 py-8 text-center border border-white/30 shadow-2xl">
              <div className="text-6xl mb-3">🏠</div>
              <p className="text-2xl font-extrabold text-white">Wonderful worlds!</p>
              <p className="text-white/70 mt-1">Level 2 complete!</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </SceneCanvas>
  );
}
