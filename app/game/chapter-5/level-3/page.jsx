'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '@/store/gameStore.js';
import { useSoundCue } from '@/hooks/useSoundCue.js';
import SceneCanvas from '@/components/game/SceneCanvas.jsx';
import FeedbackBurst from '@/components/game/FeedbackBurst.jsx';
import DragDropSortable from '@/components/game/DragDropSortable.jsx';
import {
  SENSORY_SOUNDS,
  SOUND_RATINGS,
  TEXTURE_CARDS,
  TEXTURE_ZONES,
} from '@/lib/gameData/chapter5.js';

const CHAPTER_KEY_SENSORY = 'ch5_sensory';
const RED_FLAG_SENSORY    = 'extreme_sensory_distress';
const DISTRESS_THRESHOLD  = 4;
const AVERSIVE_THRESHOLD  = 4;

function delayMs(ms) { return new Promise(r => setTimeout(r, ms)); }

export default function Level3Page() {
  const router      = useRouter();
  const sessionId   = useGameStore(s => s.sessionId);
  const addScore    = useGameStore(s => s.addScore);
  const addRedFlag  = useGameStore(s => s.addRedFlag);
  const goToChapter = useGameStore(s => s.goToChapter);
  // useSoundCue just to keep cue infra warm — cueSound loaded separately
  const { play }    = useSoundCue();

  // phase: 'sound' | 'texture' | 'complete'
  const [phase, setPhase]             = useState('sound');
  const [soundIdx, setSoundIdx]       = useState(0);
  const [soundPlaying, setSoundPlaying] = useState(false);
  const [ratingLocked, setRatingLocked] = useState(false);
  const [placements, setPlacements]   = useState({});       // { cardId: zoneId }
  const [allPlaced, setAllPlaced]     = useState(false);
  const [feedback, setFeedback]       = useState({ show: false, correct: true });
  const [complete, setComplete]       = useState(false);

  // Load cueSound directly — bypasses sensory gating since this IS the sensory test
  const cueSoundFnRef = useRef(null);
  const soundAutoRef  = useRef(null);
  const responsesRef  = useRef([]);
  const soundScoreRef = useRef(0);
  const textureScoreRef = useRef(0);
  const distressingCount = useRef(0);
  const sessionIdRef  = useRef(sessionId);
  const playRef       = useRef(play);

  sessionIdRef.current = sessionId;
  playRef.current      = play;

  useEffect(() => { goToChapter(5, 3); }, []);

  // Load cueSound on mount
  useEffect(() => {
    import('@/lib/sound/cues.js')
      .then(m => { cueSoundFnRef.current = m.cueSound; })
      .catch(() => {});
  }, []);

  // Auto-play sound 500ms after sound index changes
  useEffect(() => {
    if (phase !== 'sound') return;
    setSoundPlaying(false);
    setRatingLocked(false);

    soundAutoRef.current = setTimeout(() => {
      playCurrentSound();
    }, 500);

    return () => clearTimeout(soundAutoRef.current);
  }, [soundIdx, phase]);

  // Check if all textures placed
  useEffect(() => {
    if (phase !== 'texture') return;
    const placed = Object.keys(placements).length;
    setAllPlaced(placed >= TEXTURE_CARDS.length);
  }, [placements, phase]);

  function playCurrentSound() {
    const sound = SENSORY_SOUNDS[soundIdx];
    setSoundPlaying(true);
    try {
      cueSoundFnRef.current?.(sound.cueType);
    } catch {
      // ignore synthesis errors
    }
    // Mark as not-playing after ~2s (cueSound duration)
    setTimeout(() => setSoundPlaying(false), 2200);
  }

  function handleSoundRating(ratingType) {
    if (ratingLocked) return;
    setRatingLocked(true);

    const rating  = SOUND_RATINGS.find(r => r.type === ratingType);
    const pts     = (rating?.baseScore ?? 0) + (rating?.coverBonus ?? 0);
    const isDistressing = rating?.distressing ?? false;
    if (isDistressing) distressingCount.current += 1;

    soundScoreRef.current += pts;

    responsesRef.current.push({
      taskKey:       `ch5_l3_sound_${soundIdx + 1}`,
      startedAt:     Date.now(),
      isCorrect:     !isDistressing,
      attemptNumber: 1,
      scorePoints:   pts,
      selection:     { soundId: SENSORY_SOUNDS[soundIdx].id, ratingType, isDistressing },
    });

    const isPositive = !isDistressing;
    setFeedback({ show: true, correct: isPositive });
    playRef.current(isPositive ? 'cueCorrect' : 'cueWrong');

    setTimeout(() => {
      setFeedback({ show: false, correct: true });
      const next = soundIdx + 1;
      if (next < SENSORY_SOUNDS.length) {
        setSoundIdx(next);
      } else {
        // All sounds rated — apply distress threshold bonus
        if (distressingCount.current >= DISTRESS_THRESHOLD) {
          soundScoreRef.current += 3;
        }
        // Move to texture phase
        setPhase('texture');
      }
    }, 700);
  }

  function handleTextureDrop(itemId, targetId) {
    setPlacements(prev => ({ ...prev, [itemId]: targetId }));
  }

  function handleTextureDone() {
    // Score texture placements
    let pts = 0;
    let aversiveCount = 0;

    Object.entries(placements).forEach(([cardId, zoneId]) => {
      const zone = TEXTURE_ZONES.find(z => z.id === zoneId);
      if (zone) {
        pts += zone.score;
        if (zone.aversive) aversiveCount += 1;
      }
    });

    if (aversiveCount >= AVERSIVE_THRESHOLD) pts += 2;
    textureScoreRef.current = pts;

    // Record texture responses
    Object.entries(placements).forEach(([cardId, zoneId]) => {
      const zone = TEXTURE_ZONES.find(z => z.id === zoneId);
      responsesRef.current.push({
        taskKey:       `ch5_l3_texture_${cardId}`,
        startedAt:     Date.now(),
        isCorrect:     !zone?.aversive,
        attemptNumber: 1,
        scorePoints:   zone?.score ?? 0,
        selection:     { cardId, zoneId, aversive: zone?.aversive ?? false },
      });
    });

    finishLevel();
  }

  async function finishLevel() {
    const totalScore       = soundScoreRef.current + textureScoreRef.current;
    const redFlagTriggered = distressingCount.current >= DISTRESS_THRESHOLD;

    setComplete(true);
    playRef.current('cueChapterComplete');

    const sid = sessionIdRef.current;
    if (sid) {
      const fetches = [
        ...responsesRef.current.map(r =>
          fetch('/api/game/response', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ sessionId: sid, chapter: 5, level: 3, ...r }),
          })
        ),
        fetch('/api/game/score', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ sessionId: sid, chapterKey: CHAPTER_KEY_SENSORY, rawPoints: totalScore }),
        }),
      ];
      if (redFlagTriggered) {
        fetches.push(
          fetch('/api/game/flag', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              sessionId: sid,
              flagType: RED_FLAG_SENSORY,
              description: `${distressingCount.current} of ${SENSORY_SOUNDS.length} sounds rated as distressing`,
              severity: 'moderate',
            }),
          })
        );
      }
      await Promise.allSettled(fetches);
      addScore(CHAPTER_KEY_SENSORY, totalScore);
      if (redFlagTriggered) addRedFlag(RED_FLAG_SENSORY);
    }

    await delayMs(1800);
    goToChapter(6, 1);
    router.push('/game/map');
  }

  // Build unplaced texture items for DragDropSortable
  const unplacedItems = TEXTURE_CARDS.filter(c => !placements[c.id]);

  // Zone placement summary: count per zone
  const zoneSummary = TEXTURE_ZONES.map(zone => ({
    ...zone,
    cards: TEXTURE_CARDS.filter(c => placements[c.id] === zone.id),
  }));

  const currentSound = SENSORY_SOUNDS[soundIdx];

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
            key={phase}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-2xl font-extrabold text-white drop-shadow"
          >
            {phase === 'sound' ? '🎧 Sensory Explorer' : phase === 'texture' ? '👆 Texture Explorer' : '🌟 All done!'}
          </motion.h2>
          <p className="text-white/70 text-sm mt-1">
            {phase === 'sound'
              ? `Sound ${soundIdx + 1} of ${SENSORY_SOUNDS.length} — How does it feel?`
              : phase === 'texture'
              ? `Drag each texture to where you think it belongs! (${Object.keys(placements).length}/${TEXTURE_CARDS.length} placed)`
              : 'Chapter 5 complete!'}
          </p>
        </div>

        <AnimatePresence mode="wait">

          {/* ── Sound Phase ── */}
          {phase === 'sound' && currentSound && (
            <motion.div
              key={`sound-${soundIdx}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="flex flex-col items-center gap-6 w-full max-w-sm"
            >
              {/* Sound emoji + pulse ring */}
              <div className="relative flex items-center justify-center">
                <motion.span
                  animate={soundPlaying ? { scale: [1, 1.2, 1], opacity: [1, 0.7, 1] } : {}}
                  transition={{ duration: 0.8, repeat: soundPlaying ? Infinity : 0 }}
                  className="text-8xl leading-none select-none relative z-10"
                >
                  {currentSound.emoji}
                </motion.span>
                {soundPlaying && (
                  <motion.div
                    className="absolute w-32 h-32 rounded-full border-4 border-white/40"
                    animate={{ scale: [1, 1.5, 2], opacity: [0.6, 0.3, 0] }}
                    transition={{ duration: 1.2, repeat: Infinity }}
                  />
                )}
              </div>

              <p className="text-white/80 font-semibold text-lg text-center">
                {currentSound.label}
              </p>

              {/* Play again button */}
              <motion.button
                whileTap={{ scale: 0.94 }}
                onClick={playCurrentSound}
                disabled={soundPlaying}
                className="bg-white/20 border-2 border-white/40 rounded-2xl px-6 py-3 text-white font-medium text-sm min-h-[48px] hover:bg-white/30 transition-all disabled:opacity-40 disabled:pointer-events-none"
              >
                🔊 Play again
              </motion.button>

              {/* Rating buttons */}
              <div className="grid grid-cols-3 gap-2 w-full">
                {SOUND_RATINGS.map((rating, i) => (
                  <motion.button
                    key={rating.type}
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1, transition: { delay: 0.1 + i * 0.06, type: 'spring', stiffness: 350, damping: 22 } }}
                    whileTap={{ scale: 0.88 }}
                    onClick={() => handleSoundRating(rating.type)}
                    disabled={ratingLocked}
                    className={[
                      'flex flex-col items-center justify-center rounded-2xl p-3 min-h-[72px]',
                      'border-2 transition-all select-none',
                      rating.distressing
                        ? 'bg-red-500/20 border-red-400/40 hover:bg-red-500/30'
                        : 'bg-white/20 border-white/30 hover:bg-white/30',
                      ratingLocked && 'pointer-events-none opacity-60',
                    ].filter(Boolean).join(' ')}
                  >
                    <span className="text-3xl leading-none">{rating.emoji}</span>
                    <p className="text-xs text-white/90 font-medium mt-1 text-center leading-tight">
                      {rating.label}
                    </p>
                  </motion.button>
                ))}
              </div>

              {/* Progress dots */}
              <div className="flex gap-2">
                {SENSORY_SOUNDS.map((_, i) => (
                  <div
                    key={i}
                    className={[
                      'w-2 h-2 rounded-full transition-all',
                      i < soundIdx ? 'bg-white/70' : i === soundIdx ? 'bg-white' : 'bg-white/25',
                    ].join(' ')}
                  />
                ))}
              </div>
            </motion.div>
          )}

          {/* ── Texture Phase ── */}
          {phase === 'texture' && (
            <motion.div
              key="texture"
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center gap-5 w-full max-w-sm"
            >
              <div className="bg-white/15 rounded-2xl px-4 py-3 border border-white/20 text-center w-full">
                <p className="text-white/80 text-sm font-semibold">
                  Drag each texture card to how it makes you feel!
                </p>
              </div>

              {/* DragDropSortable for unplaced cards → zones */}
              <DragDropSortable
                items={unplacedItems}
                targets={TEXTURE_ZONES}
                onDrop={handleTextureDrop}
                disabled={allPlaced}
              />

              {/* Placed summary per zone */}
              {Object.keys(placements).length > 0 && (
                <div className="w-full grid grid-cols-2 gap-2">
                  {zoneSummary.map(zone => (
                    zone.cards.length > 0 && (
                      <div
                        key={zone.id}
                        className="bg-white/10 rounded-xl px-3 py-2 border border-white/15 flex items-center gap-2"
                      >
                        <span className="text-xl">{zone.emoji}</span>
                        <div className="flex flex-wrap gap-1">
                          {zone.cards.map(card => (
                            <span key={card.id} className="text-lg">{card.emoji}</span>
                          ))}
                        </div>
                      </div>
                    )
                  ))}
                </div>
              )}

              {/* Done button — shown when all placed */}
              <AnimatePresence>
                {allPlaced && (
                  <motion.button
                    initial={{ opacity: 0, scale: 0.85 }}
                    animate={{ opacity: 1, scale: 1 }}
                    whileTap={{ scale: 0.94 }}
                    onClick={handleTextureDone}
                    className="bg-white text-purple-900 font-extrabold text-lg rounded-2xl px-10 py-4 min-h-[64px] shadow-xl w-full"
                  >
                    ✅ All done!
                  </motion.button>
                )}
              </AnimatePresence>
            </motion.div>
          )}
        </AnimatePresence>

        <div />
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
              <div className="text-6xl mb-3">🌟</div>
              <p className="text-2xl font-extrabold text-white">Sensory explorer!</p>
              <p className="text-white/70 mt-1">Chapter 5 complete!</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </SceneCanvas>
  );
}
