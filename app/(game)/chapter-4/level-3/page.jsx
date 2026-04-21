"use client";

import { motion } from "framer-motion";
import SafeImage from "@/components/shared/SafeImage";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

import BigButton from "@/components/shared/BigButton";
import { unexpectedEventScenarios } from "@/lib/gameData/chapter4";
import { scoreUnexpectedResponse } from "@/lib/scoring/chapter4";
import { useGameStore } from "@/store/gameStore";

export default function Chapter4Level3Page() {
  const router = useRouter();
  const { sessionId, playerAge, playerName, setSession, addScore, goToChapter } =
    useGameStore();
  const [scenarioIndex, setScenarioIndex] = useState(0);
  const [elapsed, setElapsed] = useState(0);
  const [locked, setLocked] = useState(false);
  const [totalPoints, setTotalPoints] = useState(0);
  const startedAtRef = useRef(Date.now());
  const scenario = unexpectedEventScenarios[scenarioIndex];
  const progress = Math.min(100, (elapsed / 12) * 100);

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

  async function chooseResponse(responseOption) {
    if (locked) return;
    setLocked(true);
    const responseTimeMs = Date.now() - startedAtRef.current;
    const points = scoreUnexpectedResponse(responseOption.type, responseTimeMs);
    const nextTotal = totalPoints + points;
    setTotalPoints(nextTotal);
    const activeSessionId = await ensureSession();

    await fetch("/api/response", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        sessionId: activeSessionId,
        chapter: 4,
        level: 3,
        taskKey: `ch4_unexpected_${scenario.id}`,
        startedAt: startedAtRef.current,
        responseTimeMs,
        selection: responseOption.type,
        isCorrect: responseOption.type === "flexible",
        attemptNumber: 1,
        scorePoints: points,
        extraData: { optionText: responseOption.text },
      }),
    });

    setTimeout(async () => {
      if (scenarioIndex + 1 >= unexpectedEventScenarios.length) {
        await fetch("/api/score", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            sessionId: activeSessionId,
            chapterKey: "ch4_executive",
            rawPoints: nextTotal,
          }),
        });
        addScore("ch4_executive", nextTotal);
        goToChapter(5, 1);
        router.push("/chapter-5");
        return;
      }
      setScenarioIndex((index) => index + 1);
      setLocked(false);
    }, 700);
  }

  useEffect(() => {
    startedAtRef.current = Date.now();
    setElapsed(0);
    const interval = setInterval(() => {
      setElapsed(Math.floor((Date.now() - startedAtRef.current) / 1000));
    }, 250);
    return () => clearInterval(interval);
  }, [scenarioIndex]);

  return (
    <section className="mx-auto grid w-full max-w-6xl gap-8 px-6 py-10 lg:grid-cols-[1fr_420px]">
      <motion.div
        key={scenario.id}
        className="rounded-2xl bg-white/90 p-8 shadow-xl"
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <p className="text-sm font-black uppercase text-indigo-700">
          Event {scenarioIndex + 1} of {unexpectedEventScenarios.length}
        </p>
        <h1 className="mt-3 text-4xl font-black text-zinc-900">
          {scenario.story}
        </h1>
        <div className="mt-6 grid place-items-center rounded-2xl bg-orange-100 p-6">
          <SafeImage
            src={scenario.imagePath}
            alt=""
            width={280}
            height={220}
            className="h-56 w-72 rounded-xl object-contain"
          />
        </div>
        <div className="mt-6 h-4 overflow-hidden rounded-full bg-zinc-200">
          <motion.div
            className="h-full rounded-full bg-orange-500"
            animate={{ width: `${progress}%` }}
          />
        </div>
        <p className="mt-2 text-sm font-bold text-zinc-600">
          {Math.max(0, 12 - elapsed)} seconds before a slow-response note.
        </p>
      </motion.div>

      <div className="flex flex-col justify-center gap-4">
        {scenario.responses.map((option) => (
          <BigButton
            key={option.text}
            className="bg-indigo-600 text-white hover:bg-indigo-700"
            disabled={locked}
            onClick={() => void chooseResponse(option)}
          >
            {option.text}
          </BigButton>
        ))}
      </div>
    </section>
  );
}
