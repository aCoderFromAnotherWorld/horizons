'use client';

import { useState, useRef, useEffect, useLayoutEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '@/store/gameStore.js';
import { useSettingsStore } from '@/store/settingsStore.js';
import { useSoundCue } from '@/hooks/useSoundCue.js';
import SceneCanvas from '@/components/game/SceneCanvas.jsx';
import PracticeDemo from '@/components/game/PracticeDemo.jsx';
import DragDropSortable from '@/components/game/DragDropSortable.jsx';
import FeedbackBurst from '@/components/game/FeedbackBurst.jsx';
import {
  FACE_CARDS,
  SCENARIO_CARDS,
  EMOTION_BUCKETS,
  L1_PRACTICE_STEPS,
} from '@/lib/gameData/chapter2.js';

function now() { return Date.now(); }

const FACE_BATCHES = [
  FACE_CARDS.slice(0, 3),
  FACE_CARDS.slice(3, 6),
  FACE_CARDS.slice(6, 9),
  FACE_CARDS.slice(9, 12),
];
const TOTAL_ITEMS = FACE_CARDS.length + SCENARIO_CARDS.length; // 20

function scoreLevelOne(responses) {
  const total   = responses.length;
  const correct = responses.filter(r => r.isCorrect).length;
  const accuracy = total > 0 ? correct / total : 0;

  let score = accuracy > 0.90 ? 0 : accuracy >= 0.70 ? 1 : accuracy >= 0.50 ? 2 : 3;

  const negResponses = responses.filter(r => r.emotion === 'sad' || r.emotion === 'scared');
  const negCorrect   = negResponses.filter(r => r.isCorrect).length;
  const negAccuracy  = negResponses.length > 0 ? negCorrect / negResponses.length : 1;
  if (negAccuracy < 0.80) score += 2;

  const fearSadConfuse = responses.filter(r =>
    (r.emotion === 'scared' && r.selectedEmotion === 'sad') ||
    (r.emotion === 'sad'    && r.selectedEmotion === 'scared')
  );
  if (negResponses.length > 0 && fearSadConfuse.length / negResponses.length > 0.25) score += 2;

  return { score, redFlag: negAccuracy < 0.5 };
}

function delayMs(ms) { return new Promise(r => setTimeout(r, ms)); }

export default function Level1Page() {
  const router = useRouter();
  const sessionId   = useGameStore(s => s.sessionId);
  const addScore    = useGameStore(s => s.addScore);
  const addRedFlag  = useGameStore(s => s.addRedFlag);
  const goToChapter = useGameStore(s => s.goToChapter);
  const { play }    = useSoundCue();

  const [showPractice, setShowPractice] = useState(true);
  const [phase, setPhase]               = useState('face');   // 'face' | 'scenario'
  const [batchIdx, setBatchIdx]         = useState(0);
  const [scenarioIdx, setScenarioIdx]   = useState(0);
  const [sortedIds, setSortedIds]       = useState(new Set());
  const [feedback, setFeedback]         = useState({ show: false, correct: true });
  const [complete, setComplete]         = useState(false);
  const [dropDisabled, setDropDisabled] = useState(false);

  const sortedRef      = useRef(new Set());
  const responsesRef   = useRef([]);
  const sessionIdRef   = useRef(sessionId);
  const playRef        = useRef(play);

  useLayoutEffect(() => {
    sessionIdRef.current = sessionId;
    playRef.current      = play;
  });

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { goToChapter(2, 1); }, []);

  async function handleDrop(itemId, targetId) {
    if (dropDisabled) return;
    setDropDisabled(true);

    const isScenario = itemId.startsWith('ch2_l1_scenario');
    const card = isScenario
      ? SCENARIO_CARDS.find(c => c.taskKey === itemId)
      : FACE_CARDS.find(c => c.taskKey === itemId);
    if (!card) { setDropDisabled(false); return; }

    const correctEmotion = isScenario ? card.correctEmotion : card.emotion;
    const isCorrect = targetId === correctEmotion;

    responsesRef.current.push({
      taskKey:       itemId,
      isCorrect,
      emotion:       correctEmotion,
      selectedEmotion: targetId,
      scorePoints:   isCorrect ? 0 : 1,
      startedAt:     now(),
    });

    setFeedback({ show: true, correct: isCorrect });
    if (isCorrect) playRef.current('cueCorrect');
    else playRef.current('cueWrong');

    sortedRef.current.add(itemId);
    setSortedIds(new Set(sortedRef.current));

    await delayMs(650);
    setFeedback({ show: false, correct: true });

    // Advance logic
    if (!isScenario) {
      const batch = FACE_BATCHES[batchIdx];
      const batchDone = batch.every(c => sortedRef.current.has(c.taskKey));
      if (batchDone) {
        if (batchIdx < FACE_BATCHES.length - 1) setBatchIdx(b => b + 1);
        else setPhase('scenario');
      }
    } else {
      const nextIdx = scenarioIdx + 1;
      if (nextIdx < SCENARIO_CARDS.length) {
        setScenarioIdx(nextIdx);
      } else {
        await finishLevel();
        return;
      }
    }
    setDropDisabled(false);
  }

  async function finishLevel() {
    const { score, redFlag } = scoreLevelOne(responsesRef.current);

    const sid = sessionIdRef.current;
    if (sid) {
      const posts = [
        ...responsesRef.current.map(r =>
          fetch('/api/game/response', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              sessionId: sid, chapter: 2, level: 1,
              taskKey: r.taskKey,
              startedAt: r.startedAt,
              isCorrect: r.isCorrect,
              attemptNumber: 1,
              scorePoints: r.scorePoints,
              selection: { emotion: r.selectedEmotion },
              extraData: { correctEmotion: r.emotion },
            }),
          })
        ),
        fetch('/api/game/score', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ sessionId: sid, chapterKey: 'ch2_emotion', rawPoints: score }),
        }),
      ];

      if (redFlag) {
        posts.push(
          fetch('/api/game/flag', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              sessionId: sid,
              flagType: 'negative_emotion_recognition_under_50',
              severity: 'moderate',
            }),
          })
        );
        addRedFlag('negative_emotion_recognition_under_50');
      }

      await Promise.allSettled(posts);
      addScore('ch2_emotion', score);
    }

    setComplete(true);
    await delayMs(1500);
    goToChapter(2, 2);
    router.push('/game/chapter-2/level-2');
  }

  // Build current draggable items
  const currentItems = phase === 'face'
    ? FACE_BATCHES[batchIdx]
        .filter(c => !sortedIds.has(c.taskKey))
        .map(c => ({ id: c.taskKey, emoji: c.emoji }))
    : [SCENARIO_CARDS[scenarioIdx]].map(c => ({
        id: c.taskKey,
        emoji: c.emoji,
        label: c.description,
      }));

  const progressCount = sortedIds.size;

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
            <PracticeDemo steps={L1_PRACTICE_STEPS} onComplete={() => setShowPractice(false)} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Game scene */}
      {!showPractice && (
        <div className="flex flex-col items-center min-h-full px-4 py-6 gap-4">
          {/* Progress header */}
          <div className="w-full max-w-lg flex items-center justify-between">
            <p className="text-white/80 text-sm font-semibold">
              {phase === 'face'
                ? `Faces — batch ${batchIdx + 1} of ${FACE_BATCHES.length}`
                : `Scenes — ${scenarioIdx + 1} of ${SCENARIO_CARDS.length}`}
            </p>
            <div className="flex gap-1">
              {Array.from({ length: TOTAL_ITEMS }, (_, i) => (
                <div
                  key={i}
                  className="w-2 h-2 rounded-full transition-all"
                  style={{ backgroundColor: i < progressCount ? 'rgba(255,255,255,0.9)' : 'rgba(255,255,255,0.25)' }}
                />
              ))}
            </div>
          </div>

          {/* Instruction */}
          <AnimatePresence mode="wait">
            <motion.p
              key={phase + batchIdx + scenarioIdx}
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="text-white font-bold text-lg text-center"
            >
              {phase === 'face' ? 'Drag the face to the matching feeling! 😊' : 'What feeling does this show? Drag it! 🤔'}
            </motion.p>
          </AnimatePresence>

          {/* Drag + drop */}
          <div className="w-full max-w-lg flex-1 flex flex-col justify-center gap-4">
            <AnimatePresence mode="wait">
              {currentItems.length > 0 && (
                <motion.div
                  key={phase + batchIdx + scenarioIdx}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                >
                  <DragDropSortable
                    items={currentItems}
                    targets={EMOTION_BUCKETS}
                    onDrop={handleDrop}
                    disabled={dropDisabled || complete}
                  />
                </motion.div>
              )}
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
              <div className="text-6xl mb-3">🌟</div>
              <p className="text-2xl font-extrabold text-white">Great matching!</p>
              <p className="text-white/70 mt-1">Level 1 complete!</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </SceneCanvas>
  );
}
