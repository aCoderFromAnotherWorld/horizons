"use client";

import { motion } from "framer-motion";
import SafeImage from "@/components/shared/SafeImage";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";

import FeedbackOverlay from "@/components/game/FeedbackOverlay";
import { simpleActions } from "@/lib/gameData/chapter8";
import {
  scoreSimpleImitation,
  shouldFlagPoorImitation,
  SIMPLE_ACTION_TIMEOUT_MS,
  summarizeSimpleImitation,
} from "@/lib/scoring/chapter8";
import { useGameStore } from "@/store/gameStore";

export default function Chapter8Level1Page() {
  const router = useRouter();
  const {
    sessionId,
    playerAge,
    playerName,
    setSession,
    addScore,
    addRedFlag,
    goToChapter,
  } = useGameStore();
  const [trialIndex, setTrialIndex] = useState(0);
  const [elapsedMs, setElapsedMs] = useState(0);
  const [responses, setResponses] = useState([]);
  const [locked, setLocked] = useState(false);
  const [feedback, setFeedback] = useState(null);
  const startedAtRef = useRef(Date.now());
  const responsesRef = useRef([]);
  const lockedRef = useRef(false);
  const action = simpleActions[trialIndex];
  const progress = Math.min(100, (elapsedMs / SIMPLE_ACTION_TIMEOUT_MS) * 100);

  async function ensureSession() {
    if (sessionId) return sessionId;
    const response = await fetch("/api/session", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        playerAge: playerAge || 6,
        playerName: playerName || null,
      }),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || "Could not create session");
    setSession(data.sessionId, data.session.playerAge, data.session.playerName);
    return data.sessionId;
  }

  const finishLevel = useCallback(
    async (finalResponses, activeSessionId) => {
      const summary = summarizeSimpleImitation(finalResponses);
      let finalPoints = summary.points;

      if (shouldFlagPoorImitation(summary.totalErrors)) {
        finalPoints += 3;
        const flag = {
          flagType: "poor_imitation_all_modalities",
          description: "Six or more errors across simple imitation tasks.",
          severity: "severe",
        };
        await fetch("/api/flag", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ sessionId: activeSessionId, ...flag }),
        });
        addRedFlag(flag);
      }

      await fetch("/api/score", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId: activeSessionId,
          chapterKey: "ch8_imitation",
          rawPoints: finalPoints,
        }),
      });
      addScore("ch8_imitation", finalPoints);
      goToChapter(8, 2);
      router.push("/chapter-8/level-2");
    },
    [addRedFlag, addScore, goToChapter, router],
  );

  const chooseOption = useCallback(
    async (optionIndex, timedOut = false) => {
      if (lockedRef.current) return;
      lockedRef.current = true;
      setLocked(true);
      const responseTimeMs = Date.now() - startedAtRef.current;
      const isCorrect = !timedOut && optionIndex === action.correctOptionIndex;
      const scorePoints = scoreSimpleImitation({
        category: action.category,
        isCorrect,
        timedOut,
      });
      const activeSessionId = await ensureSession();
      const trialResponse = {
        actionId: action.id,
        category: action.category,
        selectedIndex: optionIndex,
        isCorrect,
        scorePoints,
        timedOut,
      };
      const nextResponses = [...responsesRef.current, trialResponse];
      responsesRef.current = nextResponses;
      setResponses(nextResponses);

      await fetch("/api/response", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId: activeSessionId,
          chapter: 8,
          level: 1,
          taskKey: `ch8_simple_${action.id}`,
          startedAt: startedAtRef.current,
          responseTimeMs: timedOut ? null : responseTimeMs,
          selection: timedOut ? "timeout" : action.options[optionIndex],
          isCorrect,
          attemptNumber: 1,
          scorePoints,
          extraData: {
            actionId: action.id,
            category: action.category,
            timedOut,
          },
        }),
      });

      setFeedback({ correct: isCorrect, activeSessionId, nextResponses });
    },
    [action],
  );

  function handleFeedbackComplete() {
    const { activeSessionId, nextResponses } = feedback;
    setFeedback(null);
    if (trialIndex + 1 >= simpleActions.length) {
      void finishLevel(nextResponses, activeSessionId);
      return;
    }
    setTrialIndex((index) => index + 1);
    lockedRef.current = false;
    setLocked(false);
  }

  useEffect(() => {
    startedAtRef.current = Date.now();
    setElapsedMs(0);
    const interval = setInterval(() => {
      const nextElapsed = Date.now() - startedAtRef.current;
      setElapsedMs(nextElapsed);
      if (nextElapsed >= SIMPLE_ACTION_TIMEOUT_MS) {
        void chooseOption(null, true);
      }
    }, 200);
    return () => clearInterval(interval);
  }, [trialIndex, chooseOption]);

  const summary = summarizeSimpleImitation(responses);

  return (
    <section className="mx-auto grid w-full max-w-6xl gap-8 px-6 py-10 lg:grid-cols-[1fr_380px]">
      <FeedbackOverlay
        show={Boolean(feedback)}
        correct={feedback?.correct}
        onComplete={handleFeedbackComplete}
      />

      <div className="rounded-2xl bg-white/90 p-8 shadow-xl">
        <p className="text-sm font-black uppercase text-cyan-700">
          Action {trialIndex + 1} of {simpleActions.length}
        </p>
        <h1 className="mt-2 text-4xl font-black text-zinc-900">
          Watch and copy
        </h1>

        <div className="mt-6 h-4 overflow-hidden rounded-full bg-zinc-200">
          <motion.div
            className="h-full rounded-full bg-cyan-500"
            animate={{ width: `${progress}%`, opacity: [0.75, 1, 0.75] }}
            transition={{ opacity: { duration: 1, repeat: Infinity } }}
          />
        </div>

        <div className="mt-8 grid min-h-80 place-items-center rounded-2xl bg-cyan-100 p-8">
          <motion.div
            key={action.id}
            animate={{ scale: [1, 1.08, 1], rotate: [-3, 3, 0] }}
            transition={{ duration: 0.9, repeat: 2 }}
          >
            <SafeImage
              src={action.animationPath}
              alt=""
              width={260}
              height={260}
              className="h-64 w-64 object-contain drop-shadow-xl"
            />
          </motion.div>
        </div>
      </div>

      <aside className="rounded-2xl bg-white/90 p-6 shadow-xl">
        <h2 className="text-3xl font-black text-zinc-900">
          What did they do?
        </h2>
        <div className="mt-6 grid grid-cols-2 gap-4">
          {action.options.map((optionPath, index) => (
            <button
              key={optionPath}
              type="button"
              className="grid min-h-32 place-items-center rounded-2xl bg-cyan-50 p-4 shadow-lg transition hover:scale-105 disabled:opacity-50"
              disabled={locked}
              onClick={() => void chooseOption(index, false)}
            >
              <SafeImage
                src={optionPath}
                alt=""
                width={110}
                height={110}
                className="h-24 w-24 object-contain"
              />
            </button>
          ))}
        </div>
        <div className="mt-6 rounded-2xl bg-zinc-100 p-4 text-sm font-black text-zinc-700">
          <p>Total errors: {summary.totalErrors}</p>
          <p>Facial: {summary.facialErrors}</p>
          <p>Body: {summary.bodyErrors}</p>
          <p>Object: {summary.objectErrors}</p>
        </div>
      </aside>
    </section>
  );
}
