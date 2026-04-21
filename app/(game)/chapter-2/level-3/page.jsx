"use client";

import { motion } from "framer-motion";
import SafeImage from "@/components/shared/SafeImage";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";

import FeedbackOverlay from "@/components/game/FeedbackOverlay";
import BigButton from "@/components/shared/BigButton";
import { regulationScenarios } from "@/lib/gameData/chapter2";
import { scoreRegulationSelection } from "@/lib/scoring/chapter2";
import { useGameStore } from "@/store/gameStore";

function shuffle(items) {
  const copy = [...items];
  for (let index = copy.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [copy[index], copy[swapIndex]] = [copy[swapIndex], copy[index]];
  }
  return copy;
}

export default function Chapter2Level3Page() {
  const router = useRouter();
  const { sessionId, playerAge, playerName, setSession, addScore, goToChapter } =
    useGameStore();
  const [scenarioIndex, setScenarioIndex] = useState(0);
  const [elapsed, setElapsed] = useState(0);
  const [totalPoints, setTotalPoints] = useState(0);
  const [locked, setLocked] = useState(false);
  const [feedback, setFeedback] = useState(null);
  const [selectedOptionText, setSelectedOptionText] = useState(null);
  const startedAtRef = useRef(Date.now());
  const scenario = regulationScenarios[scenarioIndex];
  const progress = Math.min(100, (elapsed / 15) * 100);

  const optionClasses = useMemo(
    () => ["bg-green-500", "bg-blue-500", "bg-pink-500"],
    [],
  );
  const shuffledOptions = useMemo(() => shuffle(scenario.options), [scenario]);

  useEffect(() => {
    startedAtRef.current = Date.now();
    setElapsed(0);
    setFeedback(null);
    setSelectedOptionText(null);
    const interval = setInterval(() => {
      setElapsed(Math.floor((Date.now() - startedAtRef.current) / 1000));
    }, 250);
    return () => clearInterval(interval);
  }, [scenarioIndex]);

  async function ensureSession() {
    if (sessionId) return sessionId;
    const response = await fetch("/api/session", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ playerAge: playerAge || 6, playerName: playerName || null }),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || "Could not create session");
    setSession(data.sessionId, data.session.playerAge, data.session.playerName);
    return data.sessionId;
  }

  async function chooseOption(option) {
    if (locked) return;
    setLocked(true);
    const decisionTimeMs = Date.now() - startedAtRef.current;
    const isCorrect = option.type === "appropriate";
    const points = scoreRegulationSelection(option.type, decisionTimeMs);
    const nextTotal = totalPoints + points;
    setTotalPoints(nextTotal);
    setSelectedOptionText(option.text);
    setFeedback({ correct: isCorrect });
    const activeSessionId = await ensureSession();

    await fetch("/api/response", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        sessionId: activeSessionId,
        chapter: 2,
        level: 3,
        taskKey: scenario.id,
        startedAt: startedAtRef.current,
        responseTimeMs: decisionTimeMs,
        selection: option.type,
        isCorrect,
        attemptNumber: 1,
        scorePoints: points,
        extraData: {
          optionText: option.text,
          slowDecision: decisionTimeMs > 15000,
        },
      }),
    });

    setTimeout(async () => {
      if (scenarioIndex + 1 >= regulationScenarios.length) {
        await fetch("/api/score", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            sessionId: activeSessionId,
            chapterKey: "ch2_emotion",
            rawPoints: nextTotal,
          }),
        });
        addScore("ch2_emotion", nextTotal);
        goToChapter(3, 1);
        router.push("/chapter-3");
        return;
      }
      setFeedback(null);
      setSelectedOptionText(null);
      setScenarioIndex((index) => index + 1);
      setLocked(false);
    }, 800);
  }

  return (
    <>
      <section className="mx-auto grid w-full max-w-6xl gap-8 px-6 py-10 lg:grid-cols-[1fr_420px]">
        <motion.div
          key={scenario.id}
          className="rounded-2xl bg-white/90 p-8 shadow-xl"
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <p className="text-sm font-black uppercase text-indigo-700">
            Scenario {scenarioIndex + 1} of {regulationScenarios.length}
          </p>
          <h1 className="mt-3 text-4xl font-black text-zinc-900">{scenario.story}</h1>
          <div className="mt-6 grid place-items-center rounded-2xl bg-yellow-100 p-6">
            <SafeImage
              src={scenario.imagePath}
              alt=""
              width={260}
              height={260}
              className="h-56 w-56 object-contain"
            />
          </div>
          <div className="mt-6 h-4 overflow-hidden rounded-full bg-zinc-200">
            <motion.div
              className="h-full rounded-full bg-indigo-500"
              animate={{ width: `${progress}%` }}
            />
          </div>
          <p className="mt-2 text-sm font-bold text-zinc-600">
            Take your time. {Math.max(0, 15 - elapsed)} seconds before a slow-decision note.
          </p>
        </motion.div>

        <div className="flex flex-col justify-center gap-4">
          {shuffledOptions.map((option, index) => {
            const isSelected = selectedOptionText === option.text;
            const isCorrectChoice = feedback?.correct && isSelected;
            const isWrongChoice = feedback && !feedback.correct && isSelected;

            return (
              <BigButton
                key={option.text}
                className={`${optionClasses[index]} min-h-28 border-2 text-white hover:brightness-95 ${
                  isCorrectChoice
                    ? "border-emerald-200 ring-4 ring-emerald-200/80"
                    : isWrongChoice
                      ? "border-rose-200 ring-4 ring-rose-200/80"
                      : "border-transparent"
                }`}
                disabled={locked}
                onClick={() => void chooseOption(option)}
              >
                {option.text}
              </BigButton>
            );
          })}
        </div>
      </section>

      <FeedbackOverlay
        show={Boolean(feedback)}
        correct={feedback?.correct}
        onComplete={() => {}}
      />
    </>
  );
}
