"use client";

import { motion } from "framer-motion";
import SafeImage from "@/components/shared/SafeImage";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

import BigButton from "@/components/shared/BigButton";
import { pretendPlayAnimations } from "@/lib/gameData/chapter5";
import {
  scorePretendRecognition,
  shouldFlagCompleteAbsencePretendPlay,
} from "@/lib/scoring/chapter5";
import { useGameStore } from "@/store/gameStore";

export default function Chapter5Level1Page() {
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
  const [showOptions, setShowOptions] = useState(false);
  const [locked, setLocked] = useState(false);
  const [literalCount, setLiteralCount] = useState(0);
  const [totalPoints, setTotalPoints] = useState(0);
  const startedAtRef = useRef(Date.now());
  const lockedRef = useRef(false);
  const trial = pretendPlayAnimations[trialIndex];

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

  async function finishLevel(nextLiteralCount, nextTotalPoints, activeSessionId) {
    let finalPoints = nextTotalPoints;
    if (
      shouldFlagCompleteAbsencePretendPlay(
        nextLiteralCount,
        pretendPlayAnimations.length,
      )
    ) {
      finalPoints += 3;
      const flag = {
        flagType: "complete_absence_pretend_play",
        description: "Literal interpretation selected across all pretend-play recognition trials.",
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
        chapterKey: "ch5_pretend",
        rawPoints: finalPoints,
      }),
    });
    addScore("ch5_pretend", finalPoints);
    goToChapter(5, 2);
    router.push("/chapter-5/level-2");
  }

  async function chooseResponse(selectionType, timedOut = false) {
    if (lockedRef.current) return;
    lockedRef.current = true;
    setLocked(true);
    const responseTimeMs = Date.now() - startedAtRef.current;
    const points = scorePretendRecognition(selectionType, timedOut);
    const nextLiteralCount = literalCount + (selectionType === "literal" ? 1 : 0);
    const nextTotalPoints = totalPoints + points;
    setLiteralCount(nextLiteralCount);
    setTotalPoints(nextTotalPoints);
    const activeSessionId = await ensureSession();

    await fetch("/api/response", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        sessionId: activeSessionId,
        chapter: 5,
        level: 1,
        taskKey: `ch5_pretend_recognition_${trial.id}`,
        startedAt: startedAtRef.current,
        responseTimeMs: timedOut ? null : responseTimeMs,
        selection: timedOut ? "timeout" : selectionType,
        isCorrect: selectionType === "pretend",
        attemptNumber: 1,
        scorePoints: points,
        extraData: {
          description: trial.description,
          literalInterpretation: trial.literalInterpretation,
        },
      }),
    });

    setTimeout(async () => {
      if (trialIndex + 1 >= pretendPlayAnimations.length) {
        await finishLevel(nextLiteralCount, nextTotalPoints, activeSessionId);
        return;
      }
      setTrialIndex((index) => index + 1);
      setShowOptions(false);
      lockedRef.current = false;
      setLocked(false);
    }, 700);
  }

  useEffect(() => {
    startedAtRef.current = Date.now();
    lockedRef.current = false;
    setShowOptions(false);
    setLocked(false);
    const optionsTimer = setTimeout(() => setShowOptions(true), 1700);
    const timeoutTimer = setTimeout(() => {
      void chooseResponse("timeout", true);
    }, 12000);
    return () => {
      clearTimeout(optionsTimer);
      clearTimeout(timeoutTimer);
    };
    // chooseResponse intentionally excluded; each trial owns this timer.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [trialIndex]);

  return (
    <section className="mx-auto grid w-full max-w-6xl gap-8 px-6 py-10 lg:grid-cols-[1fr_420px]">
      <motion.div
        key={trial.id}
        className="rounded-2xl bg-white/90 p-8 shadow-xl"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <p className="text-sm font-black uppercase text-pink-700">
          Scene {trialIndex + 1} of {pretendPlayAnimations.length}
        </p>
        <h1 className="mt-3 text-4xl font-black text-zinc-900">
          What is happening?
        </h1>
        <p className="mt-3 text-xl font-bold text-zinc-600">
          {trial.description}
        </p>

        <div className="mt-8 grid min-h-80 place-items-center rounded-2xl bg-pink-100 p-8">
          <motion.div
            className={trial.animationClass}
            animate={{
              rotate: [-6, 7, -4, 5, 0],
              x: [0, 18, -12, 10, 0],
              scale: [1, 1.06, 1],
            }}
            transition={{ duration: 1.6, repeat: Infinity, repeatDelay: 0.4 }}
          >
            <SafeImage
              src={trial.imagePath}
              alt=""
              width={260}
              height={260}
              className="h-64 w-64 object-contain drop-shadow-xl"
            />
          </motion.div>
        </div>
      </motion.div>

      <aside className="flex flex-col justify-center gap-4">
        {showOptions ? (
          <>
            <BigButton
              className="min-h-28 bg-green-500 text-white hover:bg-green-600"
              disabled={locked}
              onClick={() => void chooseResponse("pretend")}
            >
              They're pretending! 🎭
            </BigButton>
            <BigButton
              className="min-h-28 bg-white text-zinc-900 hover:bg-yellow-100"
              disabled={locked}
              onClick={() => void chooseResponse("literal")}
            >
              {trial.literalInterpretation}
            </BigButton>
          </>
        ) : (
          <div className="rounded-2xl bg-white/85 p-6 text-center text-2xl font-black text-zinc-900 shadow-xl">
            Watch first...
          </div>
        )}
      </aside>
    </section>
  );
}
