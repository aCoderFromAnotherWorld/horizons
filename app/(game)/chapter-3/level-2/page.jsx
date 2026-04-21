"use client";

import { motion } from "framer-motion";
import SafeImage from "@/components/shared/SafeImage";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

import BigButton from "@/components/shared/BigButton";
import { conversationExchanges } from "@/lib/gameData/chapter3";
import {
  factualPatternPenalty,
  scoreConversationOption,
} from "@/lib/scoring/chapter3";
import { useGameStore } from "@/store/gameStore";

export default function Chapter3Level2Page() {
  const router = useRouter();
  const { sessionId, playerAge, playerName, setSession, addScore, goToChapter } =
    useGameStore();
  const [exchangeIndex, setExchangeIndex] = useState(0);
  const [elapsed, setElapsed] = useState(0);
  const [locked, setLocked] = useState(false);
  const lockedRef = useRef(false);
  const [counts, setCounts] = useState({ factual: 0, social: 0, points: 0 });
  const startedAtRef = useRef(Date.now());
  const exchange = conversationExchanges[exchangeIndex];
  const progress = Math.min(100, (elapsed / 10) * 100);

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

  async function finishLevel(nextCounts, activeSessionId) {
    const patternPenalty = factualPatternPenalty(
      nextCounts.factual,
      conversationExchanges.length,
    );
    const totalPoints = nextCounts.points + patternPenalty;
    if (patternPenalty) {
      await fetch("/api/response", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId: activeSessionId,
          chapter: 3,
          level: 2,
          taskKey: "ch3_conversation_factual_pattern",
          startedAt: Date.now(),
          responseTimeMs: null,
          selection: "factual_pattern",
          isCorrect: false,
          attemptNumber: 1,
          scorePoints: patternPenalty,
          extraData: { factualCount: nextCounts.factual },
        }),
      });
    }
    await fetch("/api/score", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        sessionId: activeSessionId,
        chapterKey: "ch3_social",
        rawPoints: totalPoints,
      }),
    });
    addScore("ch3_social", totalPoints);
    goToChapter(3, 3);
    router.push("/chapter-3/level-3");
  }

  async function chooseOption(option, timedOut = false) {
    if (lockedRef.current) return;
    lockedRef.current = true;
    setLocked(true);
    const responseTimeMs = Date.now() - startedAtRef.current;
    const points = scoreConversationOption(option?.type, timedOut);
    const nextCounts = {
      factual: counts.factual + (option?.type === "factual" ? 1 : 0),
      social: counts.social + (option?.type === "social" ? 1 : 0),
      points: counts.points + points,
    };
    setCounts(nextCounts);
    const activeSessionId = await ensureSession();

    await fetch("/api/response", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        sessionId: activeSessionId,
        chapter: 3,
        level: 2,
        taskKey: `ch3_conversation_${exchange.id}`,
        startedAt: startedAtRef.current,
        responseTimeMs: timedOut ? null : responseTimeMs,
        selection: option?.type || "timeout",
        isCorrect: option?.type === "social",
        attemptNumber: 1,
        scorePoints: points,
        extraData: {
          optionText: option?.text || null,
          friendSays: exchange.friendSays,
        },
      }),
    });

    setTimeout(async () => {
      if (exchangeIndex + 1 >= conversationExchanges.length) {
        await finishLevel(nextCounts, activeSessionId);
        return;
      }
      setExchangeIndex((index) => index + 1);
      lockedRef.current = false;
      setLocked(false);
    }, 600);
  }

  useEffect(() => {
    startedAtRef.current = Date.now();
    lockedRef.current = false;
    setElapsed(0);
    const interval = setInterval(() => {
      const nextElapsed = Math.floor((Date.now() - startedAtRef.current) / 1000);
      setElapsed(nextElapsed);
      if (nextElapsed >= 10) {
        void chooseOption(null, true);
      }
    }, 250);
    return () => clearInterval(interval);
    // chooseOption intentionally excluded; each exchange owns a fresh timer.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [exchangeIndex]);

  return (
    <section className="mx-auto grid w-full max-w-6xl gap-8 px-6 py-10 lg:grid-cols-[380px_1fr]">
      <aside className="flex flex-col items-center justify-center rounded-2xl bg-white/85 p-6 shadow-xl">
        <SafeImage
          src="/assets/characters/guides/cat.webp"
          alt="Friend"
          width={260}
          height={260}
          className="h-56 w-56 object-contain"
        />
        <div className="mt-4 rounded-2xl bg-indigo-600 px-6 py-4 text-xl font-black text-white">
          {exchange.friendSays}
        </div>
      </aside>

      <div className="rounded-2xl bg-white/90 p-6 shadow-xl">
        <p className="text-sm font-black uppercase text-indigo-700">
          Exchange {exchangeIndex + 1} of {conversationExchanges.length}
        </p>
        <h1 className="mt-2 text-4xl font-black text-zinc-900">
          What would you say?
        </h1>
        <div className="mt-5 h-4 overflow-hidden rounded-full bg-zinc-200">
          <motion.div
            className="h-full rounded-full bg-indigo-500"
            animate={{ width: `${progress}%` }}
          />
        </div>

        <div className="mt-8 grid gap-4">
          {exchange.options.map((option) => (
            <BigButton
              key={option.text}
              className="justify-start bg-white text-left text-zinc-900 hover:bg-yellow-100"
              disabled={locked}
              onClick={() => void chooseOption(option)}
            >
              {option.text}
            </BigButton>
          ))}
        </div>
      </div>
    </section>
  );
}
