'use client';

import { useState, useRef, useEffect, useCallback , useLayoutEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  DndContext,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  closestCenter,
} from '@dnd-kit/core';
import {
  SortableContext,
  useSortable,
  horizontalListSortingStrategy,
  arrayMove,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useGameStore } from '@/store/gameStore.js';
import { useSoundCue } from '@/hooks/useSoundCue.js';
import SceneCanvas from '@/components/game/SceneCanvas.jsx';
import FeedbackBurst from '@/components/game/FeedbackBurst.jsx';
import { ROUTINE_CARDS, CORRECT_ORDER, DISRUPTION_SCENARIO } from '@/lib/gameData/chapter4.js';

const CHAPTER_KEY = 'ch4_routine';
const MAX_ATTEMPTS = 3;
const DISRUPTION_TIMEOUT_MS = 10000;

// Shuffle: put last 3 cards at front
function getInitialOrder() {
  const ids = ROUTINE_CARDS.map(c => c.id);
  return [...ids.slice(3), ...ids.slice(0, 3)];
}

function countErrors(order) {
  return order.reduce((acc, id, idx) => acc + (id !== CORRECT_ORDER[idx] ? 1 : 0), 0);
}

function SortableCard({ card, disabled }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: card.id });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...(disabled ? {} : listeners)}
      {...(disabled ? {} : attributes)}
      className={[
        'flex flex-col items-center justify-center rounded-2xl p-3',
        'bg-white/20 border-2 border-white/30 select-none touch-none',
        'min-w-[72px] min-h-[72px] cursor-grab active:cursor-grabbing',
        isDragging && 'opacity-30 scale-95',
        disabled && 'pointer-events-none opacity-60 cursor-default',
      ].filter(Boolean).join(' ')}
    >
      <span className="text-4xl leading-none">{card.emoji}</span>
      <p className="text-xs text-white/90 mt-1 font-medium text-center leading-tight max-w-[70px]">
        {card.label}
      </p>
    </div>
  );
}

function delayMs(ms) { return new Promise(r => setTimeout(r, ms)); }
function now() { return Date.now(); }

export default function Level1Page() {
  const router      = useRouter();
  const sessionId   = useGameStore(s => s.sessionId);
  const addScore    = useGameStore(s => s.addScore);
  const goToChapter = useGameStore(s => s.goToChapter);
  const { play }    = useSoundCue();

  const [cardOrder, setCardOrder]       = useState(getInitialOrder);
  const [phase, setPhase]               = useState('sort');   // 'sort' | 'disruption' | 'complete'
  const [attempts, setAttempts]         = useState(0);
  const [sortErrors, setSortErrors]     = useState(0);
  const [feedback, setFeedback]         = useState({ show: false, correct: true });
  const [disruptionAnswered, setDisruptionAnswered] = useState(false);

  const disruptionStartRef  = useRef(null);
  const disruptionTimerRef  = useRef(null);
  const sessionIdRef        = useRef(sessionId);
  const playRef             = useRef(play);
  const responsesRef        = useRef([]);
  const totalScoreRef       = useRef(0);

  useLayoutEffect(() => {
    sessionIdRef.current = sessionId;
    playRef.current      = play;
  });

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { goToChapter(4, 1); }, []);

  // Cleanup disruption timer on unmount
  useEffect(() => () => clearTimeout(disruptionTimerRef.current), []);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(TouchSensor,   { activationConstraint: { delay: 200, tolerance: 8 } }),
  );

  function handleDragEnd({ active, over }) {
    if (!over || active.id === over.id) return;
    setCardOrder(prev => {
      const oldIdx = prev.indexOf(active.id);
      const newIdx = prev.indexOf(over.id);
      return arrayMove(prev, oldIdx, newIdx);
    });
  }

  function handleCheckOrder() {
    const errors = countErrors(cardOrder);
    const attempt = attempts + 1;
    setAttempts(attempt);

    if (errors === 0) {
      // Correct!
      playRef.current('cueCorrect');
      setFeedback({ show: true, correct: true });
      setSortErrors(prev => prev);
      responsesRef.current.push({
        taskKey:       'ch4_l1_sort',
        startedAt:     now(),
        isCorrect:     true,
        attemptNumber: attempt,
        scorePoints:   sortErrors,
        selection:     { order: [...cardOrder], errors: 0 },
      });
      totalScoreRef.current += sortErrors;
      setTimeout(() => {
        setFeedback({ show: false, correct: true });
        enterDisruption();
      }, 900);
    } else if (attempt >= MAX_ATTEMPTS) {
      // Max attempts reached — count remaining errors
      playRef.current('cueWrong');
      setFeedback({ show: true, correct: false });
      const pts = sortErrors + errors + 3; // 3 pts for unable to complete
      responsesRef.current.push({
        taskKey:       'ch4_l1_sort',
        startedAt:     now(),
        isCorrect:     false,
        attemptNumber: attempt,
        scorePoints:   pts,
        selection:     { order: [...cardOrder], errors },
      });
      totalScoreRef.current += pts;
      setTimeout(() => {
        setFeedback({ show: false, correct: true });
        enterDisruption();
      }, 900);
    } else {
      // Wrong but can retry
      playRef.current('cueWrong');
      setFeedback({ show: true, correct: false });
      setSortErrors(prev => prev + errors);
      setTimeout(() => setFeedback({ show: false, correct: true }), 700);
    }
  }

  function enterDisruption() {
    setPhase('disruption');
    disruptionStartRef.current = now();
    disruptionTimerRef.current = setTimeout(() => {
      if (!disruptionAnswered) {
        handleDisruptionAnswer(null); // timeout — add +1 pt
      }
    }, DISRUPTION_TIMEOUT_MS);
  }

  async function finishLevel() {
    setPhase('complete');
    playRef.current('cueChapterComplete');

    const sid = sessionIdRef.current;
    if (sid) {
      await Promise.allSettled([
        ...responsesRef.current.map(r =>
          fetch('/api/game/response', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ sessionId: sid, chapter: 4, level: 1, ...r }),
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
    goToChapter(4, 2);
    router.push('/game/chapter-4/level-2');
  }

  const handleDisruptionAnswer = useCallback((optionType) => {
    clearTimeout(disruptionTimerRef.current);
    if (disruptionAnswered) return;
    setDisruptionAnswered(true);

    const elapsedMs = disruptionStartRef.current ? now() - disruptionStartRef.current : 0;
    const tooSlow   = elapsedMs > DISRUPTION_TIMEOUT_MS;

    let pts = 0;
    if (optionType === 'flexible') pts = 0;
    else if (optionType === 'neutral') pts = 1;
    else if (optionType === 'rigid')   pts = 3;
    else pts = 1; // timeout (null)

    if (tooSlow) pts += 1;

    const isCorrect = optionType === 'flexible';
    setFeedback({ show: true, correct: isCorrect });
    playRef.current(isCorrect ? 'cueCorrect' : 'cueWrong');

    responsesRef.current.push({
      taskKey:       DISRUPTION_SCENARIO.taskKey,
      startedAt:     disruptionStartRef.current,
      responseTimeMs: elapsedMs,
      isCorrect,
      attemptNumber: 1,
      scorePoints:   pts,
      selection:     { type: optionType ?? 'timeout', tooSlow },
    });
    totalScoreRef.current += pts;

    setTimeout(() => {
      setFeedback({ show: false, correct: true });
      finishLevel();
    }, 900);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [disruptionAnswered]);

  const cards = cardOrder.map(id => ROUTINE_CARDS.find(c => c.id === id));

  return (
    <SceneCanvas chapterNumber={4}>
      <FeedbackBurst
        show={feedback.show}
        correct={feedback.correct}
        onComplete={() => setFeedback(f => ({ ...f, show: false }))}
      />

      <div className="flex flex-col items-center justify-between min-h-full px-4 py-8 gap-6">
        {/* Header */}
        <div className="text-center w-full max-w-sm">
          <motion.h2
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-2xl font-extrabold text-white drop-shadow"
          >
            {phase === 'sort' ? '⏰ Morning Routine' : phase === 'disruption' ? '😮 Uh oh!' : '🌟 Well done!'}
          </motion.h2>
          <p className="text-white/70 text-sm mt-1">
            {phase === 'sort'
              ? 'Drag the cards into the correct order!'
              : phase === 'disruption'
              ? DISRUPTION_SCENARIO.text
              : 'Chapter 4, Level 1 complete!'}
          </p>
          {phase === 'sort' && attempts > 0 && attempts < MAX_ATTEMPTS && (
            <p className="text-white/50 text-xs mt-1">
              Try {attempts + 1} of {MAX_ATTEMPTS}
            </p>
          )}
        </div>

        {/* Sort phase */}
        <AnimatePresence mode="wait">
          {phase === 'sort' && (
            <motion.div
              key="sort"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="flex flex-col items-center gap-6 w-full max-w-sm"
            >
              {/* Guide hint */}
              <div className="bg-white/15 rounded-2xl px-4 py-3 text-white/80 text-sm text-center border border-white/20">
                💡 Drag the steps into the right order for a morning routine!
              </div>

              {/* Sortable cards */}
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
              >
                <SortableContext items={cardOrder} strategy={horizontalListSortingStrategy}>
                  <div className="flex flex-wrap justify-center gap-3">
                    {cards.map(card => (
                      <SortableCard key={card.id} card={card} disabled={phase !== 'sort'} />
                    ))}
                  </div>
                </SortableContext>
              </DndContext>

              {/* Check button */}
              <motion.button
                whileTap={{ scale: 0.94 }}
                onClick={handleCheckOrder}
                className="bg-white text-emerald-900 font-extrabold text-lg rounded-2xl px-10 py-4 min-h-[64px] shadow-xl w-full max-w-xs"
              >
                ✅ Check Order!
              </motion.button>
            </motion.div>
          )}

          {/* Disruption phase */}
          {phase === 'disruption' && (
            <motion.div
              key="disruption"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center gap-5 w-full max-w-sm"
            >
              <motion.div
                animate={{ rotate: [0, -5, 5, -5, 5, 0] }}
                transition={{ duration: 0.6, delay: 0.3 }}
                className="text-7xl leading-none"
              >
                {DISRUPTION_SCENARIO.emoji}
              </motion.div>

              <div className="flex flex-col gap-3 w-full">
                {DISRUPTION_SCENARIO.options.map((opt, i) => (
                  <motion.button
                    key={opt.type}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0, transition: { delay: 0.2 + i * 0.1 } }}
                    whileTap={{ scale: 0.96 }}
                    onClick={() => handleDisruptionAnswer(opt.type)}
                    disabled={disruptionAnswered}
                    className="bg-white/20 border-2 border-white/30 rounded-2xl px-6 py-4 text-white font-semibold text-base min-h-[64px] text-left hover:bg-white/30 transition-all disabled:pointer-events-none"
                  >
                    {opt.label}
                  </motion.button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Spacer */}
        <div />
      </div>

      {/* Complete overlay */}
      <AnimatePresence>
        {phase === 'complete' && (
          <motion.div
            initial={{ scale: 0.7, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="absolute inset-0 z-30 flex items-center justify-center bg-black/30 backdrop-blur-sm"
          >
            <div className="bg-white/20 rounded-3xl px-10 py-8 text-center border border-white/30 shadow-2xl">
              <div className="text-6xl mb-3">🎒</div>
              <p className="text-2xl font-extrabold text-white">Morning routine sorted!</p>
              <p className="text-white/70 mt-1">Level 1 complete!</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </SceneCanvas>
  );
}
