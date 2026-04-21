"use client";

import { motion } from "framer-motion";
import SafeImage from "@/components/shared/SafeImage";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";

import BigButton from "@/components/shared/BigButton";
import { pretendPlayPrompts } from "@/lib/gameData/chapter5";
import {
  countLiteralSelections,
  countSymbolicSelections,
  scorePretendCreation,
  symbolicSelectionRatio,
} from "@/lib/scoring/chapter5";
import { useGameStore } from "@/store/gameStore";

export default function Chapter5Level2Page() {
  const router = useRouter();
  const { sessionId, playerAge, playerName, setSession, addScore, goToChapter } =
    useGameStore();
  const [promptIndex, setPromptIndex] = useState(0);
  const [elapsed, setElapsed] = useState(0);
  const [selectedObjects, setSelectedObjects] = useState([]);
  const [locked, setLocked] = useState(false);
  const [totalPoints, setTotalPoints] = useState(0);
  const startedAtRef = useRef(Date.now());
  const selectedObjectsRef = useRef([]);
  const lockedRef = useRef(false);
  const prompt = pretendPlayPrompts[promptIndex];
  const progress = Math.min(100, (elapsed / 15) * 100);

  const selectedSummary = useMemo(() => {
    const symbolic = countSymbolicSelections(selectedObjects);
    const literal = countLiteralSelections(selectedObjects);
    return { symbolic, literal, ratio: symbolicSelectionRatio(selectedObjects) };
  }, [selectedObjects]);

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

  function selectObject(object) {
    if (locked) return;
    setSelectedObjects((current) => {
      const next = [...current, object];
      selectedObjectsRef.current = next;
      return next;
    });
  }

  async function submitPlay(timedOut = false) {
    if (lockedRef.current) return;
    lockedRef.current = true;
    setLocked(true);
    const submittedObjects = selectedObjectsRef.current;
    const responseTimeMs = Date.now() - startedAtRef.current;
    const points = scorePretendCreation(submittedObjects, responseTimeMs, timedOut);
    const nextTotal = totalPoints + points;
    setTotalPoints(nextTotal);
    const activeSessionId = await ensureSession();
    const symbolic = countSymbolicSelections(submittedObjects);
    const literal = countLiteralSelections(submittedObjects);

    await fetch("/api/response", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        sessionId: activeSessionId,
        chapter: 5,
        level: 2,
        taskKey: `ch5_create_${prompt.id}`,
        startedAt: startedAtRef.current,
        responseTimeMs: timedOut ? null : responseTimeMs,
        selection: submittedObjects.map((object) => object.name),
        isCorrect: symbolic > 0,
        attemptNumber: 1,
        scorePoints: points,
        extraData: {
          scenario: prompt.scenario,
          symbolicCount: symbolic,
          literalCount: literal,
          symbolicRatio: symbolicSelectionRatio(submittedObjects),
          timedOut,
        },
      }),
    });

    setTimeout(async () => {
      if (promptIndex + 1 >= pretendPlayPrompts.length) {
        await fetch("/api/score", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            sessionId: activeSessionId,
            chapterKey: "ch5_pretend",
            rawPoints: nextTotal,
          }),
        });
        addScore("ch5_pretend", nextTotal);
        goToChapter(6, 1);
        router.push("/chapter-6");
        return;
      }
      setPromptIndex((index) => index + 1);
      selectedObjectsRef.current = [];
      setSelectedObjects([]);
      lockedRef.current = false;
      setLocked(false);
    }, 700);
  }

  useEffect(() => {
    startedAtRef.current = Date.now();
    setElapsed(0);
    const interval = setInterval(() => {
      const nextElapsed = Math.floor((Date.now() - startedAtRef.current) / 1000);
      setElapsed(nextElapsed);
      if (nextElapsed >= 15 && selectedObjectsRef.current.length === 0) {
        void submitPlay(true);
      }
    }, 250);
    return () => clearInterval(interval);
    // submitPlay intentionally excluded; each prompt owns this timer.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [promptIndex]);

  return (
    <section className="mx-auto grid w-full max-w-6xl gap-8 px-6 py-10 lg:grid-cols-[1fr_360px]">
      <div className="rounded-2xl bg-white/90 p-6 shadow-xl">
        <p className="text-sm font-black uppercase text-pink-700">
          Story {promptIndex + 1} of {pretendPlayPrompts.length}
        </p>
        <h1 className="mt-2 text-4xl font-black text-zinc-900">
          {prompt.scenario}
        </h1>
        <p className="mt-2 text-lg font-bold text-zinc-600">
          Tap objects to use them in your pretend play.
        </p>

        <div className="mt-5 h-4 overflow-hidden rounded-full bg-zinc-200">
          <motion.div
            className="h-full rounded-full bg-pink-500"
            animate={{ width: `${progress}%` }}
          />
        </div>
        <p className="mt-2 text-sm font-bold text-zinc-600">
          {Math.max(0, 15 - elapsed)} seconds before a slow-response note.
        </p>

        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {prompt.objects.map((object) => (
            <button
              key={object.name}
              type="button"
              className="rounded-2xl bg-white p-4 text-center shadow-xl transition hover:scale-105"
              disabled={locked}
              onClick={() => selectObject(object)}
            >
              <SafeImage
                src={object.imagePath}
                alt=""
                width={150}
                height={150}
                className="mx-auto h-28 w-28 object-contain"
              />
              <p className="mt-3 text-xl font-black text-zinc-900">
                {object.name}
              </p>
            </button>
          ))}
        </div>
      </div>

      <aside className="flex flex-col justify-center rounded-2xl bg-white/90 p-6 shadow-xl">
        <h2 className="text-3xl font-black text-zinc-900">Your story props</h2>
        <div className="mt-4 min-h-32 rounded-2xl bg-pink-100 p-4">
          {selectedObjects.length ? (
            <div className="flex flex-wrap gap-2">
              {selectedObjects.map((object, index) => (
                <span
                  key={`${object.name}-${index}`}
                  className="rounded-full bg-white px-4 py-2 text-base font-black text-zinc-900 shadow"
                >
                  {object.name}
                </span>
              ))}
            </div>
          ) : (
            <p className="text-lg font-bold text-zinc-600">No objects yet.</p>
          )}
        </div>
        <p className="mt-4 text-base font-bold text-zinc-600">
          Symbolic: {selectedSummary.symbolic} | Literal: {selectedSummary.literal} | Ratio:{" "}
          {selectedSummary.ratio.toFixed(2)}
        </p>
        <BigButton
          className="mt-6 bg-green-500 text-white hover:bg-green-600"
          disabled={locked}
          onClick={() => void submitPlay(false)}
        >
          Use these objects!
        </BigButton>
      </aside>
    </section>
  );
}
