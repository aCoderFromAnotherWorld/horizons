"use client";

import { motion } from "framer-motion";
import SafeImage from "@/components/shared/SafeImage";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

import CameraCapture from "@/components/game/CameraCapture";
import BigButton from "@/components/shared/BigButton";
import { greetingSteps } from "@/lib/gameData/chapter3";
import { scoreGreetingStep } from "@/lib/scoring/chapter3";
import { useGameStore } from "@/store/gameStore";

export default function Chapter3Level1Page() {
  const router = useRouter();
  const {
    sessionId,
    playerAge,
    playerName,
    cameraEnabled,
    setSession,
    addScore,
    goToChapter,
  } = useGameStore();
  const [stepIndex, setStepIndex] = useState(0);
  const [totalPoints, setTotalPoints] = useState(0);
  const [locked, setLocked] = useState(false);
  const lockedRef = useRef(false);
  const startedAtRef = useRef(Date.now());
  const timeoutRef = useRef(null);
  const step = greetingSteps[stepIndex];

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

  async function completeStep(completed) {
    if (lockedRef.current) return;
    lockedRef.current = true;
    setLocked(true);
    clearTimeout(timeoutRef.current);
    const responseTimeMs = Date.now() - startedAtRef.current;
    const points = scoreGreetingStep(step.id, responseTimeMs, completed);
    const nextTotal = totalPoints + points;
    setTotalPoints(nextTotal);
    const activeSessionId = await ensureSession();

    await fetch("/api/response", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        sessionId: activeSessionId,
        chapter: 3,
        level: 1,
        taskKey: `ch3_greeting_${step.id}`,
        startedAt: startedAtRef.current,
        responseTimeMs: completed ? responseTimeMs : null,
        selection: completed ? step.id : "timeout",
        isCorrect: completed,
        attemptNumber: 1,
        scorePoints: points,
        extraData: { mchat: "#11" },
      }),
    });

    setTimeout(async () => {
      if (stepIndex + 1 >= greetingSteps.length) {
        await fetch("/api/score", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            sessionId: activeSessionId,
            chapterKey: "ch3_social",
            rawPoints: nextTotal,
          }),
        });
        addScore("ch3_social", nextTotal);
        goToChapter(3, 2);
        router.push("/chapter-3/level-2");
        return;
      }
      setStepIndex((index) => index + 1);
      lockedRef.current = false;
      setLocked(false);
    }, 700);
  }

  useEffect(() => {
    startedAtRef.current = Date.now();
    timeoutRef.current = setTimeout(() => {
      void completeStep(false);
    }, step.timeoutMs);
    return () => clearTimeout(timeoutRef.current);
    // completeStep intentionally excluded; each step owns a fresh timeout.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stepIndex]);

  return (
    <section className="scene-viewport relative w-full overflow-hidden">
      <CameraCapture
        sessionId={sessionId}
        taskKey={`ch3_greeting_${step.id}`}
        chapterId={3}
        levelId={1}
        active={cameraEnabled && !locked}
      />
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage:
            "url('/assets/backgrounds/friends-house-exterior.webp')",
        }}
      />
      <div className="absolute inset-0 bg-indigo-950/10" />

      <div className="ui-panel absolute left-3 right-3 top-3 z-20 rounded-lg px-4 py-3 sm:left-6 sm:right-auto sm:top-6 sm:px-6 sm:py-4">
        <p className="text-sm font-black uppercase text-indigo-700">
          Step {stepIndex + 1} of {greetingSteps.length}
        </p>
        <h1 className="mt-1 text-2xl font-black text-zinc-900 sm:text-3xl">{step.label}</h1>
        <p className="mt-1 text-base font-bold text-zinc-600 sm:text-lg">{step.prompt}</p>
      </div>

      <div className="absolute inset-0 z-10 grid place-items-center">
        {step.id === "knock" ? (
          <motion.button
            type="button"
            className="h-60 w-40 rounded-t-3xl bg-orange-700 shadow-2xl sm:h-72 sm:w-48"
            whileTap={{ scale: 0.95 }}
            disabled={locked}
            onClick={() => void completeStep(true)}
          >
            <span className="mx-auto block h-12 w-12 rounded-full bg-yellow-300" />
          </motion.button>
        ) : (
          <motion.div
            className="flex max-w-[calc(100vw-2rem)] flex-col items-center gap-5 rounded-lg bg-white/85 p-5 shadow-2xl sm:p-8"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
          >
            {step.id === "wave_smile" ? (
              <>
                <SafeImage
                  src="/assets/characters/guides/cat.webp"
                  alt="Friend"
                  width={220}
                  height={220}
                  className="h-36 w-36 object-contain sm:h-48 sm:w-48"
                />
                <div className="flex flex-wrap justify-center gap-3 sm:gap-4">
                  <BigButton
                    className="bg-green-500 text-white hover:bg-green-600"
                    disabled={locked}
                    onClick={() => void completeStep(true)}
                  >
                    Wave
                  </BigButton>
                  <BigButton
                    className="bg-yellow-400 text-zinc-900 hover:bg-yellow-300"
                    disabled={locked}
                    onClick={() => void completeStep(true)}
                  >
                    Smile
                  </BigButton>
                </div>
              </>
            ) : (
              <motion.button
                type="button"
                className="rounded-lg bg-blue-100 p-4 shadow-xl ring-4 ring-blue-300"
                whileTap={{ scale: 0.96 }}
                disabled={locked}
                onClick={() => void completeStep(true)}
              >
                <SafeImage
                  src="/assets/characters/guides/cat.webp"
                  alt="Friend face"
                  width={220}
                  height={220}
                  className="h-36 w-36 object-contain sm:h-48 sm:w-48"
                />
                <span className="mt-2 block text-xl font-black text-blue-900">
                  Tap friend's face
                </span>
              </motion.button>
            )}
          </motion.div>
        )}
      </div>
    </section>
  );
}
