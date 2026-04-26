'use client';

import { useState, useEffect, useRef, useCallback, useLayoutEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '@/store/gameStore.js';
import { useSoundCue } from '@/hooks/useSoundCue.js';
import SceneCanvas from '@/components/game/SceneCanvas.jsx';
import DynamicTask from '@/components/game/DynamicTask.jsx';
import VisualSchedule from '@/components/game/VisualSchedule.jsx';
import FeedbackBurst from '@/components/game/FeedbackBurst.jsx';
import ConfettiBlast from '@/components/shared/ConfettiBlast.jsx';

const DOMAIN_INFO = {
  social_communication: {
    emoji: '💬',
    name: 'Social Communication',
    lowDesc: 'Responses were in the typical range.',
    mediumDesc: 'Some differences were noted in social interaction.',
    highDesc: 'Significant differences noted — worth discussing with a specialist.',
    very_highDesc: 'Notable differences observed across social communication tasks.',
  },
  restricted_repetitive: {
    emoji: '🔄',
    name: 'Routines & Patterns',
    lowDesc: 'Flexibility and routine responses were in the typical range.',
    mediumDesc: 'Some preference for routines and patterns was observed.',
    highDesc: 'Strong preference for sameness noted — worth discussing with a specialist.',
    very_highDesc: 'Very strong preference for sameness noted — consulting a specialist is recommended.',
  },
  pretend_play: {
    emoji: '🎭',
    name: 'Pretend Play',
    lowDesc: 'Pretend play responses were in the typical range.',
    mediumDesc: 'Some differences in pretend play were observed.',
    highDesc: 'Limited engagement with pretend play — worth discussing with a specialist.',
    very_highDesc: 'Very limited pretend play observed — consulting a specialist is recommended.',
  },
  sensory_processing: {
    emoji: '🌈',
    name: 'Sensory Processing',
    lowDesc: 'Sensory responses were in the typical range.',
    mediumDesc: 'Some sensory sensitivities were noted.',
    highDesc: 'Heightened sensory sensitivities observed — worth discussing with a specialist.',
    very_highDesc: 'Significant sensory sensitivities observed — consulting a specialist is recommended.',
  },
};

const RISK_CONFIG = {
  low:       { bg: 'bg-emerald-500', textColor: 'text-emerald-900', emoji: '🟢', label: 'Typical Range' },
  medium:    { bg: 'bg-amber-400',   textColor: 'text-amber-900',   emoji: '🟡', label: 'Some Differences' },
  high:      { bg: 'bg-orange-500',  textColor: 'text-orange-900',  emoji: '🟠', label: 'Notable Differences' },
  very_high: { bg: 'bg-red-500',     textColor: 'text-red-900',     emoji: '🔴', label: 'Significant Differences' },
};

const RED_FLAG_DESCRIPTIONS = {
  negative_emotion_recognition_under_50:
    'We noticed some differences in recognising worried or sad feelings — this might be worth exploring with a specialist.',
  complete_absence_pretend_play:
    'Pretend play responses were consistently literal — sharing this with a specialist could be very helpful.',
  extreme_sensory_distress:
    'Several sounds or textures seemed quite distressing — a specialist can help understand sensory needs.',
  rigid_pattern_distress:
    'Disruptions to familiar patterns caused significant distress — a specialist can offer helpful strategies.',
  poor_imitation_all_modalities:
    'Some difficulty imitating actions and expressions was noticed — worth discussing with a specialist.',
};

function delayMs(ms) { return new Promise(r => setTimeout(r, ms)); }
function now() { return Date.now(); }

export default function Chapter6Page() {
  const sessionId       = useGameStore(s => s.sessionId);
  const playerName      = useGameStore(s => s.playerName);
  const breakCount      = useGameStore(s => s.breakCount);
  const addScore        = useGameStore(s => s.addScore);
  const goToChapter     = useGameStore(s => s.goToChapter);
  const setDomainScores = useGameStore(s => s.setDomainScores);
  const { play } = useSoundCue();

  const [phase, setPhase]       = useState('loading');
  // 'loading' | 'intro' | 'playing' | 'submitting' | 'results'
  const [tasks, setTasks]       = useState([]);
  const [taskIndex, setTaskIndex] = useState(0);
  const [feedback, setFeedback] = useState({ show: false, correct: true });
  const [showConfetti, setShowConfetti] = useState(false);
  const [results, setResults]   = useState(null);

  const responsesRef  = useRef([]);
  const sessionIdRef  = useRef(sessionId);

  useLayoutEffect(() => { sessionIdRef.current = sessionId; });

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { goToChapter(6, 1); }, []);

  // Fetch task pool on mount
  useEffect(() => {
    const sid = sessionIdRef.current;
    if (!sid) return;

    fetch(`/api/game/chapter6/tasks?seed=${sid}`)
      .then(r => r.json())
      .then(data => {
        setTasks(data.tasks ?? []);
        setPhase('intro');
      })
      .catch(() => setPhase('intro'));
  }, []);

  // Auto-advance from intro after 3 s
  useEffect(() => {
    if (phase !== 'intro') return;
    const t = setTimeout(() => setPhase('playing'), 3000);
    return () => clearTimeout(t);
  }, [phase]);

  async function finishChapter() {
    setPhase('submitting');
    const sid = sessionIdRef.current;
    if (!sid) return;

    // POST all responses
    await Promise.allSettled(
      responsesRef.current.map(r =>
        fetch('/api/game/response', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ sessionId: sid, ...r }),
        })
      )
    );

    // Record chapter 6 summary score
    const totalPts = responsesRef.current.reduce((s, r) => s + r.scorePoints, 0);
    await fetch('/api/game/score', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sessionId: sid, chapterKey: 'ch6_summary', rawPoints: totalPts }),
    }).catch(() => {});
    addScore('ch6_summary', totalPts);

    // Fetch full results (triggers scoring pipeline)
    try {
      const res  = await fetch(`/api/game/results/${sid}`);
      if (res.ok) {
        const data = await res.json();
        setResults(data);
        if (data.domainScores) {
          const ds = {};
          for (const d of data.domainScores) ds[d.domain] = d;
          setDomainScores(ds);
        }
      }
    } catch {
      // Still show the page even if results fetch fails
    }

    play('cueChapterComplete');
    setShowConfetti(true);
    setPhase('results');
  }

  const handleTaskComplete = useCallback(async (scorePoints, isCorrect, responseTimeMs) => {
    const task = tasks[taskIndex];
    if (!task) return;

    responsesRef.current.push({
      taskKey:       task.key,
      chapter:       6,
      level:         1,
      startedAt:     now() - (responseTimeMs ?? 0),
      responseTimeMs: responseTimeMs ?? 0,
      selection:     { mechanic: task.mechanic },
      isCorrect,
      attemptNumber: 1,
      scorePoints,
    });

    setFeedback({ show: true, correct: isCorrect });
    play(isCorrect ? 'cueCorrect' : 'cueWrong');

    await delayMs(800);
    setFeedback({ show: false, correct: true });

    const next = taskIndex + 1;
    if (next < tasks.length) {
      setTaskIndex(next);
    } else {
      await finishChapter();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [taskIndex, tasks, play]);

  const scheduleItems = tasks.map(t => ({
    emoji: typeof t.emoji === 'string' ? t.emoji[0] : '⭐',
    label: '',
  }));

  // ── Loading ────────────────────────────────────────────────────────────────
  if (phase === 'loading') {
    return (
      <SceneCanvas chapterNumber={6}>
        <div className="flex items-center justify-center min-h-full">
          <motion.span
            animate={{ rotate: 360 }}
            transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
            className="text-7xl"
          >⭐</motion.span>
        </div>
      </SceneCanvas>
    );
  }

  // ── Intro ──────────────────────────────────────────────────────────────────
  if (phase === 'intro') {
    return (
      <SceneCanvas chapterNumber={6}>
        <div className="flex flex-col items-center justify-center min-h-full px-6 text-center gap-6">
          <motion.div
            initial={{ scale: 0, rotate: -20 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
            className="text-8xl select-none"
          >
            🏆
          </motion.div>
          <motion.h1
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1, transition: { delay: 0.3 } }}
            className="text-3xl font-extrabold text-white drop-shadow"
          >
            Grand Finale!
          </motion.h1>
          <motion.p
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1, transition: { delay: 0.5 } }}
            className="text-white/80 text-base leading-relaxed max-w-xs"
          >
            Let&apos;s revisit your favourite challenges — you&apos;re almost there!
          </motion.p>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1, transition: { delay: 0.9 } }}
            className="flex gap-2"
          >
            {['⭐', '🌟', '✨', '💫', '⭐'].map((e, i) => (
              <motion.span
                key={i}
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.2, ease: 'easeInOut' }}
                className="text-3xl select-none"
              >
                {e}
              </motion.span>
            ))}
          </motion.div>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1, transition: { delay: 1.8 } }}
            className="text-white/50 text-sm"
          >
            Starting in a moment…
          </motion.p>
        </div>
      </SceneCanvas>
    );
  }

  // ── Playing / Submitting ────────────────────────────────────────────────────
  if (phase === 'playing' || phase === 'submitting') {
    const currentTask = tasks[taskIndex];

    return (
      <SceneCanvas chapterNumber={6}>
        <FeedbackBurst
          show={feedback.show}
          correct={feedback.correct}
          onComplete={() => setFeedback(f => ({ ...f, show: false }))}
        />

        <div className="flex flex-col min-h-full px-4 py-6 gap-4">
          {/* Header */}
          <div className="text-center shrink-0">
            <h2 className="text-2xl font-extrabold text-white drop-shadow">
              🏆 Grand Finale
            </h2>
            <p className="text-white/70 text-sm mt-1">
              Task {Math.min(taskIndex + 1, tasks.length)} of {tasks.length}
            </p>
          </div>

          {/* Visual schedule */}
          <div className="shrink-0">
            <VisualSchedule tasks={scheduleItems} currentIndex={taskIndex} />
          </div>

          {/* Task area */}
          <div className="flex-1 flex items-center justify-center overflow-hidden">
            <AnimatePresence mode="wait">
              {phase === 'submitting' ? (
                <motion.div
                  key="submitting"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex flex-col items-center gap-4 text-center"
                >
                  <motion.span
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
                    className="text-7xl"
                  >
                    ⭐
                  </motion.span>
                  <p className="text-white font-bold text-xl">Calculating your results…</p>
                  <p className="text-white/60 text-sm">Just a moment!</p>
                </motion.div>
              ) : currentTask ? (
                <DynamicTask
                  key={currentTask.key}
                  task={currentTask}
                  onComplete={handleTaskComplete}
                />
              ) : null}
            </AnimatePresence>
          </div>
        </div>
      </SceneCanvas>
    );
  }

  // ── Results ────────────────────────────────────────────────────────────────
  if (phase === 'results') {
    const name = results?.session?.playerName ?? playerName;
    const firstName = name ? name.split(' ')[0] : null;

    return (
      <SceneCanvas chapterNumber={6}>
        {showConfetti && <ConfettiBlast onDone={() => setShowConfetti(false)} />}

        <div className="flex flex-col items-center px-4 py-8 gap-6 max-w-lg mx-auto pb-16">

          {/* Hero heading */}
          <motion.div
            initial={{ scale: 0.6, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 280, damping: 20 }}
            className="text-center"
          >
            <div className="text-7xl mb-3 select-none">🎉</div>
            <h1 className="text-3xl font-extrabold text-white drop-shadow leading-tight">
              Amazing journey{firstName ? `, ${firstName}` : ''}!
            </h1>
            <p className="text-white/70 mt-2 text-sm">
              You completed all 6 chapters. Here&apos;s what we found.
            </p>
          </motion.div>

          {/* Combined risk badge */}
          {results?.riskLevel && (() => {
            const cfg = RISK_CONFIG[results.riskLevel] ?? RISK_CONFIG.low;
            return (
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1, transition: { delay: 0.15 } }}
                className="flex items-center gap-4 bg-white/15 rounded-2xl px-6 py-4 border border-white/25 w-full"
              >
                <span className="text-4xl select-none">{cfg.emoji}</span>
                <div>
                  <p className="text-white/60 text-xs font-semibold uppercase tracking-wider">
                    Overall Result
                  </p>
                  <p className="text-white font-extrabold text-xl">{cfg.label}</p>
                </div>
              </motion.div>
            );
          })()}

          {/* Domain score cards */}
          {results?.domainScores && (
            <div className="flex flex-col gap-3 w-full">
              {results.domainScores.map((ds, i) => {
                const info = DOMAIN_INFO[ds.domain];
                const cfg  = RISK_CONFIG[ds.riskLevel] ?? RISK_CONFIG.low;
                if (!info) return null;

                const descKey = `${ds.riskLevel}Desc`;
                const desc = info[descKey] ?? info.lowDesc;

                return (
                  <motion.div
                    key={ds.domain}
                    initial={{ x: -24, opacity: 0 }}
                    animate={{ x: 0, opacity: 1, transition: { delay: 0.1 * (i + 2) } }}
                    className="bg-white/15 rounded-2xl p-4 border border-white/20 flex items-start gap-4"
                  >
                    <span className="text-4xl shrink-0 select-none">{info.emoji}</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2 flex-wrap mb-1">
                        <p className="text-white font-bold text-base leading-tight">
                          {info.name}
                        </p>
                        <span
                          className={`${cfg.bg} text-white text-xs font-bold px-2.5 py-1 rounded-full shrink-0`}
                        >
                          {cfg.label}
                        </span>
                      </div>
                      <p className="text-white/65 text-sm leading-snug">{desc}</p>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}

          {/* Red flags */}
          {results?.redFlags?.length > 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1, transition: { delay: 0.55 } }}
              className="w-full bg-amber-500/20 rounded-2xl p-4 border border-amber-400/30"
            >
              <p className="text-amber-200 font-bold text-sm mb-2">📝 Things to explore</p>
              <ul className="space-y-1.5">
                {results.redFlags.map((flag, i) => (
                  <li key={i} className="text-amber-100/80 text-sm leading-snug">
                    •&nbsp;{RED_FLAG_DESCRIPTIONS[flag.flagType] ?? flag.description ?? flag.flagType}
                  </li>
                ))}
              </ul>
            </motion.div>
          )}

          {/* Break count note — only shown when ≥ 3 breaks */}
          {breakCount > 2 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1, transition: { delay: 0.65 } }}
              className="w-full bg-white/10 rounded-2xl px-4 py-3 border border-white/15"
            >
              <p className="text-white/75 text-sm">
                🌟 Thanks for being patient — taking breaks is perfectly okay!
              </p>
            </motion.div>
          )}

          {/* Consistency note — subtle, researcher-facing */}
          {results?.consistencyFlag && (
            <p className="text-white/30 text-xs text-center">
              ℹ️ Some variation between session phases was noted.
            </p>
          )}

          {/* Non-diagnostic disclaimer */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1, transition: { delay: 0.75 } }}
            className="w-full bg-indigo-600/30 border-2 border-indigo-400/40 rounded-2xl p-5 text-center"
          >
            <p className="text-indigo-200 font-bold text-sm mb-2">⚕️ Important Notice</p>
            <p className="text-indigo-100/80 text-xs leading-relaxed">
              This is a <strong className="text-indigo-100">screening tool, not a diagnosis</strong>.
              These results are meant to help start a conversation with a qualified specialist — they
              do not replace a clinical evaluation. Please share these results with a professional.
            </p>
          </motion.div>

          {/* Action buttons */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1, transition: { delay: 0.85 } }}
            className="flex flex-col gap-3 w-full"
          >
            {results?.session?.reportToken && (
              <a
                href={`/report/${results.session.id}?token=${results.session.reportToken}`}
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-center gap-2 bg-white text-indigo-900 font-extrabold text-base rounded-2xl px-6 py-4 min-h-[64px] shadow-xl hover:bg-white/90 transition-all select-none"
              >
                📋 View Caregiver Report
              </a>
            )}
            <a
              href={`/survey?session=${results?.session?.id ?? ''}`}
              className="flex items-center justify-center gap-2 bg-white/20 border-2 border-white/30 text-white font-bold text-base rounded-2xl px-6 py-4 min-h-[64px] hover:bg-white/30 transition-all select-none"
            >
              💬 Share Your Feedback
            </a>
          </motion.div>

        </div>
      </SceneCanvas>
    );
  }

  // Fallback
  return (
    <SceneCanvas chapterNumber={6}>
      <div className="flex items-center justify-center min-h-full">
        <div className="text-7xl animate-pulse">⭐</div>
      </div>
    </SceneCanvas>
  );
}
