'use client';

import { useState, useRef, useEffect , useLayoutEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '@/store/gameStore.js';
import { useSoundCue } from '@/hooks/useSoundCue.js';
import SceneCanvas from '@/components/game/SceneCanvas.jsx';
import FeedbackBurst from '@/components/game/FeedbackBurst.jsx';
import { TOPIC_BOOKS } from '@/lib/gameData/chapter4.js';

const CHAPTER_KEY  = 'ch4_routine';
const TOTAL_ROUNDS = 4;
const SLOW_TRANS_MS = 8000;  // >8s between guide message → Next Book = slow transition

function delayMs(ms) { return new Promise(r => setTimeout(r, ms)); }
function now() { return Date.now(); }

export default function Level4Page() {
  const router      = useRouter();
  const sessionId   = useGameStore(s => s.sessionId);
  const addScore    = useGameStore(s => s.addScore);
  const goToChapter = useGameStore(s => s.goToChapter);
  const { play }    = useSoundCue();

  // phase: 'pick' | 'facts' | 'guide' | 'complete'
  const [phase, setPhase]           = useState('pick');
  const [roundIdx, setRoundIdx]     = useState(0);
  const [selectedTopic, setSelectedTopic] = useState(null);
  const [factIdx, setFactIdx]       = useState(0);
  const [feedback, setFeedback]     = useState({ show: false, correct: true });
  const [visitCounts, setVisitCounts] = useState({});

  const guideShownAtRef    = useRef(null);
  const topicHistoryRef    = useRef([]);       // ordered list of topic IDs selected
  const topicVisitCounts   = useRef({});       // { topicId: count }
  const slideCountsRef     = useRef({});       // { topicId: total slides read }
  const transitionTimesRef = useRef([]);       // ms array from guide → next tap
  const responsesRef       = useRef([]);
  const totalScoreRef      = useRef(0);
  const sessionIdRef       = useRef(sessionId);
  const playRef            = useRef(play);

  useLayoutEffect(() => {
    sessionIdRef.current = sessionId;
    playRef.current      = play;
  });

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { goToChapter(4, 4); }, []);

  function handleTopicSelect(topic) {
    if (phase !== 'pick') return;

    // Track visit
    topicHistoryRef.current.push(topic.id);
    topicVisitCounts.current[topic.id] = (topicVisitCounts.current[topic.id] ?? 0) + 1;
    slideCountsRef.current[topic.id]   = slideCountsRef.current[topic.id] ?? 0;
    setVisitCounts({ ...topicVisitCounts.current });

    setSelectedTopic(topic);
    setFactIdx(0);
    setPhase('facts');
    playRef.current('cueCorrect');
  }

  function handleNextFact() {
    const topic = selectedTopic;
    // Increment slide count
    slideCountsRef.current[topic.id] = (slideCountsRef.current[topic.id] ?? 0) + 1;

    const next = factIdx + 1;
    if (next < topic.facts.length) {
      setFactIdx(next);
    } else {
      // All 5 facts read — show guide message
      guideShownAtRef.current = now();
      setPhase('guide');
    }
  }

  function handleNextBook() {
    const elapsed = guideShownAtRef.current ? now() - guideShownAtRef.current : 0;
    transitionTimesRef.current.push(elapsed);

    responsesRef.current.push({
      taskKey:       `ch4_l4_topic_${roundIdx + 1}`,
      startedAt:     now(),
      responseTimeMs: elapsed,
      isCorrect:     true,
      attemptNumber: 1,
      scorePoints:   0,  // scored at finish
      selection:     { topicId: selectedTopic?.id, round: roundIdx },
    });

    const nextRound = roundIdx + 1;
    if (nextRound >= TOTAL_ROUNDS) {
      finishLevel();
    } else {
      setRoundIdx(nextRound);
      setSelectedTopic(null);
      setFactIdx(0);
      setPhase('pick');
    }
  }

  async function finishLevel() {
    // Calculate scoring
    let pts = 0;

    // Any topic visited ≥3 times → +3 pts
    const maxVisits = Math.max(0, ...Object.values(topicVisitCounts.current));
    if (maxVisits >= 3) pts += 3;

    // Any topic with ≥15 total slides read → +2 pts
    const maxSlides = Math.max(0, ...Object.values(slideCountsRef.current));
    if (maxSlides >= 15) pts += 2;

    // Each slow transition (>8s) → +2 pts
    transitionTimesRef.current.forEach(ms => {
      if (ms > SLOW_TRANS_MS) pts += 2;
    });

    // Topic revisit after different topic (A→B→A pattern) → +2 pts (once)
    const hist = topicHistoryRef.current;
    let hasRevisit = false;
    for (let i = 2; i < hist.length; i++) {
      if (hist[i] === hist[i - 2] && hist[i] !== hist[i - 1]) {
        hasRevisit = true;
        break;
      }
    }
    if (hasRevisit) pts += 2;

    totalScoreRef.current = pts;
    setPhase('complete');
    playRef.current('cueChapterComplete');

    const sid = sessionIdRef.current;
    if (sid) {
      await Promise.allSettled([
        ...responsesRef.current.map(r =>
          fetch('/api/game/response', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ sessionId: sid, chapter: 4, level: 4, ...r }),
          })
        ),
        fetch('/api/game/score', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ sessionId: sid, chapterKey: CHAPTER_KEY, rawPoints: pts }),
        }),
      ]);
      addScore(CHAPTER_KEY, pts);
    }

    await delayMs(1800);
    goToChapter(5, 1);
    router.push('/game/map');
  }

  return (
    <SceneCanvas chapterNumber={4}>
      <FeedbackBurst
        show={feedback.show}
        correct={feedback.correct}
        onComplete={() => setFeedback(f => ({ ...f, show: false }))}
      />

      <div className="flex flex-col items-center justify-between min-h-full px-4 py-8 gap-4">
        {/* Header */}
        <div className="text-center w-full max-w-sm">
          <motion.h2
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-2xl font-extrabold text-white drop-shadow"
          >
            📚 Special Interests
          </motion.h2>
          <p className="text-white/70 text-sm mt-1">
            {phase === 'pick'
              ? `Round ${roundIdx + 1} of ${TOTAL_ROUNDS} — Pick a book!`
              : phase === 'facts'
              ? `Reading about ${selectedTopic?.label}  (${factIdx + 1}/${selectedTopic?.facts.length})`
              : phase === 'guide'
              ? 'Time to try a new book!'
              : 'Chapter 4 complete!'}
          </p>
        </div>

        <div className="flex-1 flex items-center justify-center w-full max-w-sm">
          <AnimatePresence mode="wait">

            {/* Topic picker grid */}
            {phase === 'pick' && (
              <motion.div
                key={`pick-${roundIdx}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="grid grid-cols-4 gap-3 w-full"
              >
                {TOPIC_BOOKS.map(topic => (
                  <motion.button
                    key={topic.id}
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1, transition: { type: 'spring', stiffness: 350, damping: 22 } }}
                    whileTap={{ scale: 0.88 }}
                    onClick={() => handleTopicSelect(topic)}
                    className="flex flex-col items-center justify-center rounded-2xl p-3 bg-white/20 border-2 border-white/30 min-h-[80px] hover:bg-white/30 transition-all select-none"
                  >
                    <span className="text-3xl leading-none">{topic.emoji}</span>
                    <p className="text-xs text-white/90 font-medium mt-1 text-center leading-tight">
                      {topic.label}
                    </p>
                    {visitCounts[topic.id] > 0 && (
                      <span className="text-xs text-yellow-300 font-bold mt-0.5">
                        ×{visitCounts[topic.id]}
                      </span>
                    )}
                  </motion.button>
                ))}
              </motion.div>
            )}

            {/* Fact slides */}
            {phase === 'facts' && selectedTopic && (
              <motion.div
                key={`fact-${selectedTopic.id}-${factIdx}`}
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -30 }}
                className="flex flex-col items-center gap-6 w-full"
              >
                <motion.div
                  animate={{ scale: [1, 1.08, 1] }}
                  transition={{ duration: 0.6 }}
                  className="text-8xl leading-none"
                >
                  {selectedTopic.emoji}
                </motion.div>
                <div className="bg-white/15 rounded-3xl px-6 py-5 border border-white/20 text-center w-full">
                  <p className="text-white font-bold text-lg leading-snug">
                    {selectedTopic.facts[factIdx]}
                  </p>
                </div>
                {/* Fact progress dots */}
                <div className="flex gap-2">
                  {selectedTopic.facts.map((_, i) => (
                    <div
                      key={i}
                      className={[
                        'w-2 h-2 rounded-full transition-all duration-300',
                        i < factIdx ? 'bg-white/80' : i === factIdx ? 'bg-white' : 'bg-white/30',
                      ].join(' ')}
                    />
                  ))}
                </div>
                <motion.button
                  whileTap={{ scale: 0.94 }}
                  onClick={handleNextFact}
                  className="bg-white text-emerald-900 font-extrabold text-lg rounded-2xl px-10 py-4 min-h-[64px] shadow-xl w-full max-w-xs"
                >
                  {factIdx + 1 < selectedTopic.facts.length ? 'Next →' : 'Finished! ✅'}
                </motion.button>
              </motion.div>
            )}

            {/* Guide message */}
            {phase === 'guide' && (
              <motion.div
                key="guide"
                initial={{ opacity: 0, scale: 0.85 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col items-center gap-5 bg-white/15 rounded-3xl px-8 py-8 border border-white/20 text-center"
              >
                <motion.span
                  animate={{ y: [0, -8, 0] }}
                  transition={{ duration: 1.2, repeat: Infinity, ease: 'easeInOut' }}
                  className="text-6xl leading-none"
                >
                  📚
                </motion.span>
                <p className="text-white font-bold text-xl">
                  Try a different book!
                </p>
                <p className="text-white/70 text-sm">
                  {roundIdx + 1 < TOTAL_ROUNDS
                    ? `${TOTAL_ROUNDS - roundIdx - 1} more book${TOTAL_ROUNDS - roundIdx - 1 !== 1 ? 's' : ''} to go!`
                    : 'Last book — almost done!'}
                </p>
                <motion.button
                  whileTap={{ scale: 0.94 }}
                  onClick={handleNextBook}
                  className="bg-white text-emerald-900 font-extrabold text-lg rounded-2xl px-10 py-4 min-h-[64px] shadow-xl w-full max-w-xs"
                >
                  {roundIdx + 1 < TOTAL_ROUNDS ? 'Next Book →' : 'All done! 🎉'}
                </motion.button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

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
              <div className="text-6xl mb-3">📚</div>
              <p className="text-2xl font-extrabold text-white">So many interests!</p>
              <p className="text-white/70 mt-1">Chapter 4 complete!</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </SceneCanvas>
  );
}
