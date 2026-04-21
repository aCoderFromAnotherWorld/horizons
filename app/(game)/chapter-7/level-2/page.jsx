"use client";

import { motion } from "framer-motion";
import SafeImage from "@/components/shared/SafeImage";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";

import BigButton from "@/components/shared/BigButton";
import { freePlayObjects } from "@/lib/gameData/chapter7";
import { analyzeFreePlayInteractions } from "@/lib/scoring/chapter7";
import { useGameStore } from "@/store/gameStore";

const DISRUPTION_DELAY_MS = 120000;
const objectPositions = [
  "left-[8%] top-[12%]",
  "left-[28%] top-[10%]",
  "left-[48%] top-[14%]",
  "left-[70%] top-[12%]",
  "right-[8%] top-[34%]",
  "left-[12%] top-[44%]",
  "left-[34%] bottom-[18%]",
  "left-[54%] bottom-[16%]",
  "right-[18%] bottom-[22%]",
  "right-[36%] top-[48%]",
];

function shuffledPositions() {
  const next = [...objectPositions];
  for (let index = next.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [next[index], next[swapIndex]] = [next[swapIndex], next[index]];
  }
  return next;
}

export default function Chapter7Level2Page() {
  const router = useRouter();
  const { sessionId, playerAge, playerName, setSession, addScore, goToChapter } =
    useGameStore();
  const [interactions, setInteractions] = useState([]);
  const [positions, setPositions] = useState(objectPositions);
  const [secondsLeft, setSecondsLeft] = useState(
    Math.ceil(DISRUPTION_DELAY_MS / 1000),
  );
  const [disrupted, setDisrupted] = useState(false);
  const [locked, setLocked] = useState(false);
  const startedAtRef = useRef(Date.now());
  const interactionsRef = useRef([]);

  const positionedObjects = useMemo(
    () =>
      freePlayObjects.map((object, index) => ({
        ...object,
        position: positions[index] || objectPositions[index],
      })),
    [positions],
  );

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
    setInteractions((current) => {
      const next = [
        ...current,
        {
          objectId: object.id,
          objectType: object.type,
          lineOrder: object.lineOrder,
          recordedAt: Date.now(),
        },
      ];
      interactionsRef.current = next;
      return next;
    });
  }

  async function finishFreePlay(distressAtDisruption) {
    if (locked) return;
    setLocked(true);
    const activeSessionId = await ensureSession();
    const analysis = analyzeFreePlayInteractions({
      interactions: interactionsRef.current,
      objects: freePlayObjects,
      distressAtDisruption,
    });

    await fetch("/api/response", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        sessionId: activeSessionId,
        chapter: 7,
        level: 2,
        taskKey: "ch7_free_play",
        startedAt: startedAtRef.current,
        responseTimeMs: Date.now() - startedAtRef.current,
        selection: interactionsRef.current.map((interaction) => interaction.objectId),
        isCorrect: !analysis.sameObjectRepeated && !analysis.liningUpDetected,
        attemptNumber: 1,
        scorePoints: analysis.points,
        extraData: {
          ...analysis,
          distressAtDisruption,
          interactionCount: interactionsRef.current.length,
        },
      }),
    });

    await fetch("/api/score", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        sessionId: activeSessionId,
        chapterKey: "ch7_pattern",
        rawPoints: analysis.points,
      }),
    });
    addScore("ch7_pattern", analysis.points);
    goToChapter(7, 3);
    router.push("/chapter-7/level-3");
  }

  useEffect(() => {
    const timeout = setTimeout(() => {
      setDisrupted(true);
      setPositions(shuffledPositions());
    }, DISRUPTION_DELAY_MS);
    const interval = setInterval(() => {
      setSecondsLeft(
        Math.max(0, Math.ceil((DISRUPTION_DELAY_MS - (Date.now() - startedAtRef.current)) / 1000)),
      );
    }, 1000);
    return () => {
      clearTimeout(timeout);
      clearInterval(interval);
    };
  }, []);

  return (
    <section className="mx-auto grid w-full max-w-6xl gap-8 px-6 py-10 lg:grid-cols-[1fr_360px]">
      <div className="relative min-h-[560px] overflow-hidden rounded-2xl bg-emerald-100 p-6 shadow-xl">
        <h1 className="text-4xl font-black text-zinc-900">Free Play</h1>
        <p className="mt-2 max-w-2xl text-lg font-bold text-zinc-600">
          Tap the toys however you want. The detective watches for repeated
          actions and lining-up patterns.
        </p>

        {positionedObjects.map((object) => (
          <motion.button
            key={object.id}
            type="button"
            className={`absolute grid h-24 w-24 place-items-center rounded-2xl bg-white p-3 shadow-xl transition hover:scale-105 ${object.position}`}
            animate={disrupted ? { rotate: [0, -8, 8, 0] } : {}}
            onClick={() => selectObject(object)}
          >
            <SafeImage
              src={object.imagePath}
              alt=""
              width={70}
              height={70}
              className="h-16 w-16 object-contain"
            />
            <span className="sr-only">{object.label}</span>
          </motion.button>
        ))}
      </div>

      <aside className="flex flex-col justify-center rounded-2xl bg-white/90 p-6 shadow-xl">
        <h2 className="text-3xl font-black text-zinc-900">Play notes</h2>
        <p className="mt-3 text-lg font-bold text-zinc-600">
          Interactions: {interactions.length}
        </p>
        <p className="mt-2 text-lg font-bold text-zinc-600">
          Toy move in: {secondsLeft}s
        </p>

        <div className="mt-5 max-h-40 overflow-auto rounded-2xl bg-emerald-50 p-3">
          {interactions.slice(-8).map((interaction, index) => (
            <span
              key={`${interaction.objectId}-${interaction.recordedAt}-${index}`}
              className="mr-2 inline-block rounded-full bg-white px-3 py-1 text-sm font-black text-zinc-700 shadow"
            >
              {interaction.objectId}
            </span>
          ))}
        </div>

        {disrupted ? (
          <div className="mt-6 grid gap-3">
            <p className="text-lg font-bold text-zinc-700">
              The guide moved the toys around.
            </p>
            <BigButton
              className="bg-red-500 text-white hover:bg-red-600"
              disabled={locked}
              onClick={() => void finishFreePlay(true)}
            >
              Put them back now!
            </BigButton>
            <BigButton
              className="bg-green-500 text-white hover:bg-green-600"
              disabled={locked}
              onClick={() => void finishFreePlay(false)}
            >
              I can keep playing
            </BigButton>
          </div>
        ) : (
          <p className="mt-6 text-base font-bold text-zinc-600">
            A small change will happen after two minutes.
          </p>
        )}
      </aside>
    </section>
  );
}
