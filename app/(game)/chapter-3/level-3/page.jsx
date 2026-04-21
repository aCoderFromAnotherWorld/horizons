"use client";

import { motion } from "framer-motion";
import SafeImage from "@/components/shared/SafeImage";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

import BigButton from "@/components/shared/BigButton";
import { discoveryEvents } from "@/lib/gameData/chapter3";
import { scoreDiscoveryEvent } from "@/lib/scoring/chapter3";
import { useGameStore } from "@/store/gameStore";

export default function Chapter3Level3Page() {
  const router = useRouter();
  const { sessionId, playerAge, playerName, setSession, addScore, goToChapter } =
    useGameStore();
  const [eventIndex, setEventIndex] = useState(0);
  const [totalPoints, setTotalPoints] = useState(0);
  const [locked, setLocked] = useState(false);
  const startedAtRef = useRef(Date.now());
  const timeoutRef = useRef(null);
  const event = discoveryEvents[eventIndex];

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

  async function completeEvent(action) {
    if (locked) return;
    setLocked(true);
    clearTimeout(timeoutRef.current);
    const responseTimeMs = Date.now() - startedAtRef.current;
    const points = scoreDiscoveryEvent({
      eventType: event.type,
      action,
      excessiveFactualDetail: action === "factual_detail",
    });
    const nextTotal = totalPoints + points;
    setTotalPoints(nextTotal);
    const activeSessionId = await ensureSession();

    await fetch("/api/response", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        sessionId: activeSessionId,
        chapter: 3,
        level: 3,
        taskKey: `ch3_discovery_${event.id}`,
        startedAt: startedAtRef.current,
        responseTimeMs: action === "timeout" ? null : responseTimeMs,
        selection: action,
        isCorrect: action === "attend" || action === "share",
        attemptNumber: 1,
        scorePoints: points,
        extraData: {
          eventType: event.type,
          object: event.object.id,
          mchat: event.type === "friend_finds" ? "#16" : "#9",
        },
      }),
    });

    setTimeout(async () => {
      if (eventIndex + 1 >= discoveryEvents.length) {
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
        goToChapter(4, 1);
        router.push("/chapter-4");
        return;
      }
      setEventIndex((index) => index + 1);
      setLocked(false);
    }, 700);
  }

  useEffect(() => {
    startedAtRef.current = Date.now();
    if (event.type === "friend_finds") {
      timeoutRef.current = setTimeout(() => {
        void completeEvent("timeout");
      }, 8000);
    }
    return () => clearTimeout(timeoutRef.current);
    // completeEvent intentionally excluded; each event owns a fresh timeout.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [eventIndex]);

  return (
    <section className="scene-viewport relative w-full overflow-hidden">
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: "url('/assets/backgrounds/playground.webp')" }}
      />
      <div className="absolute inset-0 bg-white/15" />

      <div className="ui-panel absolute left-3 right-3 top-3 z-20 rounded-lg px-4 py-3 sm:left-6 sm:right-auto sm:top-6 sm:px-6 sm:py-4">
        <p className="text-sm font-black uppercase text-indigo-700">
          Event {eventIndex + 1} of {discoveryEvents.length}
        </p>
        <h1 className="mt-1 text-xl font-black text-zinc-900 sm:text-3xl">
          {event.type === "friend_finds"
            ? `Friend found the ${event.object.label}.`
            : `You found the ${event.object.label}.`}
        </h1>
      </div>

      <div className="absolute bottom-4 left-4 z-20 rounded-lg bg-white/90 p-3 shadow-xl sm:bottom-10 sm:left-10 sm:p-4">
        <SafeImage
          src="/assets/characters/guides/cat.webp"
          alt="Friend"
          width={160}
          height={160}
          className="h-24 w-24 object-contain sm:h-32 sm:w-32"
        />
        {event.type === "friend_finds" ? (
          <motion.div
            className="absolute -right-10 top-10 rounded-full bg-yellow-300 px-3 py-2 text-3xl shadow-lg sm:-right-14 sm:top-12 sm:px-4 sm:text-4xl"
            animate={{ x: [0, 14, 0] }}
            transition={{ duration: 0.8, repeat: Infinity }}
          >
            👉
          </motion.div>
        ) : null}
      </div>

      {event.type === "friend_finds" ? (
        <motion.div
          className={`pointer-events-none absolute z-20 rounded-full bg-yellow-300 px-5 py-3 text-4xl shadow-xl ${event.object.position}`}
          animate={{ scale: [1, 1.15, 1], rotate: [-8, 4, -8] }}
          transition={{ duration: 0.9, repeat: Infinity }}
          aria-hidden="true"
        >
          👉
        </motion.div>
      ) : null}

      <button
        type="button"
        className={`absolute z-10 grid h-28 w-28 place-items-center rounded-lg bg-white/90 p-3 shadow-xl sm:h-36 sm:w-36 sm:p-4 ${event.object.position}`}
        onClick={() => {
          if (event.type === "friend_finds") void completeEvent("attend");
        }}
      >
        <SafeImage
          src={event.object.imagePath}
          alt={event.object.label}
          width={140}
          height={140}
          className="h-20 w-20 object-contain sm:h-28 sm:w-28"
        />
      </button>

      {event.type === "child_finds" ? (
        <div className="absolute bottom-3 left-3 right-3 z-20 grid gap-3 rounded-lg bg-white/90 p-4 shadow-xl sm:bottom-8 sm:left-auto sm:right-8 sm:w-full sm:max-w-md sm:p-5">
          {event.shareOptions.map((option) => (
            <BigButton
              key={option.text}
              className="bg-primary text-primary-foreground"
              disabled={locked}
              onClick={() => void completeEvent(option.action)}
            >
              {option.text}
            </BigButton>
          ))}
        </div>
      ) : null}
    </section>
  );
}
