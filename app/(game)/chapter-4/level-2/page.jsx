"use client";

import { motion } from "framer-motion";
import SafeImage from "@/components/shared/SafeImage";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";

import { playgroundActivities } from "@/lib/gameData/chapter4";
import { scorePlaygroundChoices } from "@/lib/scoring/chapter4";
import { useGameStore } from "@/store/gameStore";

export default function Chapter4Level2Page() {
  const router = useRouter();
  const { sessionId, playerAge, playerName, setSession, addScore, goToChapter } =
    useGameStore();
  const [round, setRound] = useState(0);
  const [selected, setSelected] = useState(null);
  const [selections, setSelections] = useState([]);
  const [transitionDelays, setTransitionDelays] = useState([]);
  const [locked, setLocked] = useState(false);
  const promptStartedAtRef = useRef(Date.now());

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

  async function chooseActivity(activity) {
    if (locked) return;
    setLocked(true);
    setSelected(activity);
    const delay = Date.now() - promptStartedAtRef.current;
    const nextSelections = [...selections, activity.id];
    const nextDelays = [...transitionDelays, delay];
    setSelections(nextSelections);
    setTransitionDelays(nextDelays);
    const activeSessionId = await ensureSession();

    await fetch("/api/response", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        sessionId: activeSessionId,
        chapter: 4,
        level: 2,
        taskKey: `ch4_playground_${round + 1}`,
        startedAt: promptStartedAtRef.current,
        responseTimeMs: delay,
        selection: activity.id,
        isCorrect: true,
        attemptNumber: 1,
        scorePoints: delay > 8000 ? 2 : 0,
        extraData: { selections: nextSelections },
      }),
    });

    setTimeout(async () => {
      if (round + 1 >= 4) {
        const points = scorePlaygroundChoices(nextSelections, nextDelays);
        await fetch("/api/score", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            sessionId: activeSessionId,
            chapterKey: "ch4_executive",
            rawPoints: points,
          }),
        });
        addScore("ch4_executive", points);
        goToChapter(4, 3);
        router.push("/chapter-4/level-3");
        return;
      }
      setRound((value) => value + 1);
      setSelected(null);
      setLocked(false);
      promptStartedAtRef.current = Date.now();
    }, 3000);
  }

  return (
    <section className="mx-auto w-full max-w-6xl px-6 py-10">
      <div className="rounded-2xl bg-white/90 p-6 shadow-xl">
        <p className="text-sm font-black uppercase text-indigo-700">
          Choice {round + 1} of 4
        </p>
        <h1 className="mt-2 text-4xl font-black text-zinc-900">
          Pick a playground activity
        </h1>
        <p className="mt-2 text-lg font-bold text-zinc-600">
          {round === 0 ? "Choose one to try." : "Great! Try something new!"}
        </p>

        {selected ? (
          <motion.div
            className="mt-6 grid place-items-center rounded-2xl bg-yellow-100 p-8"
            animate={{ scale: [1, 1.06, 1], rotate: [0, 2, -2, 0] }}
            transition={{ duration: 1, repeat: 2 }}
          >
            <SafeImage
              src={selected.imagePath}
              alt={selected.label}
              width={240}
              height={240}
              className="h-56 w-56 object-contain"
            />
            <p className="mt-3 text-3xl font-black text-zinc-900">
              {selected.label}
            </p>
          </motion.div>
        ) : (
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            {playgroundActivities.map((activity) => (
              <button
                key={activity.id}
                type="button"
                className="rounded-2xl bg-white p-4 shadow-xl transition hover:scale-105"
                onClick={() => void chooseActivity(activity)}
              >
                <SafeImage
                  src={activity.imagePath}
                  alt={activity.label}
                  width={180}
                  height={180}
                  className="mx-auto h-32 w-32 object-contain"
                />
                <p className="mt-3 text-xl font-black text-zinc-900">
                  {activity.label}
                </p>
              </button>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
