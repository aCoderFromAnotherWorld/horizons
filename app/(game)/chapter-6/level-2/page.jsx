"use client";

import { motion } from "framer-motion";
import SafeImage from "@/components/shared/SafeImage";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

import BigButton from "@/components/shared/BigButton";
import { visualRooms } from "@/lib/gameData/chapter6";
import { scoreVisualRooms } from "@/lib/scoring/chapter6";
import { useGameStore } from "@/store/gameStore";

export default function Chapter6Level2Page() {
  const router = useRouter();
  const { sessionId, playerAge, playerName, setSession, addScore, goToChapter } =
    useGameStore();
  const [currentRoom, setCurrentRoom] = useState(null);
  const [roomVisits, setRoomVisits] = useState([]);
  const [elapsed, setElapsed] = useState(0);
  const [locked, setLocked] = useState(false);
  const enteredAtRef = useRef(null);

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

  function enterRoom(room) {
    if (locked) return;
    setCurrentRoom(room);
    enteredAtRef.current = Date.now();
    setElapsed(0);
  }

  async function leaveRoom() {
    if (!currentRoom || locked) return;
    setLocked(true);
    const durationMs = Date.now() - enteredAtRef.current;
    const visit = {
      roomId: currentRoom.id,
      roomName: currentRoom.name,
      type: currentRoom.type,
      durationMs,
      leftEarly: durationMs < 3000,
    };
    const nextVisits = [...roomVisits, visit];
    setRoomVisits(nextVisits);
    const activeSessionId = await ensureSession();

    await fetch("/api/response", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        sessionId: activeSessionId,
        chapter: 6,
        level: 2,
        taskKey: `ch6_visual_${currentRoom.id}`,
        startedAt: enteredAtRef.current,
        responseTimeMs: durationMs,
        selection: "leave",
        isCorrect: durationMs >= 3000,
        attemptNumber: 1,
        scorePoints: 0,
        extraData: visit,
      }),
    });

    setCurrentRoom(null);
    setElapsed(0);
    setLocked(false);
  }

  async function finishLevel() {
    if (locked || currentRoom) return;
    setLocked(true);
    const activeSessionId = await ensureSession();
    const score = scoreVisualRooms(roomVisits, visualRooms);

    await fetch("/api/score", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        sessionId: activeSessionId,
        chapterKey: "ch6_sensory",
        rawPoints: score.points,
      }),
    });
    addScore("ch6_sensory", score.points);
    goToChapter(6, 3);
    router.push("/chapter-6/level-3");
  }

  useEffect(() => {
    if (!currentRoom) return undefined;
    const interval = setInterval(() => {
      setElapsed(Math.floor((Date.now() - enteredAtRef.current) / 1000));
    }, 250);
    return () => clearInterval(interval);
  }, [currentRoom]);

  if (currentRoom) {
    return (
      <section
        className="scene-viewport relative grid w-full place-items-center bg-cover bg-center p-4 sm:p-6"
        style={{ backgroundImage: `url(${currentRoom.backgroundImage})` }}
      >
        <div className="absolute inset-0 bg-black/30" />
        <motion.div
          className="relative z-10 w-full max-w-2xl rounded-2xl bg-white/90 p-8 text-center shadow-2xl"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <p className="text-sm font-black uppercase text-emerald-700">
            {currentRoom.type} room
          </p>
          <h1 className="mt-2 text-4xl font-black text-zinc-900">
            {currentRoom.name}
          </h1>
          <p className="mt-4 text-2xl font-bold text-zinc-700">
            Time in room: {elapsed}s
          </p>
          <BigButton
            className="mt-8 bg-pink-600 text-white hover:bg-pink-700"
            disabled={locked}
            onClick={() => void leaveRoom()}
          >
            Leave room
          </BigButton>
        </motion.div>
      </section>
    );
  }

  const visitedIds = new Set(roomVisits.map((visit) => visit.roomId));

  return (
    <section className="mx-auto w-full max-w-6xl px-6 py-10">
      <div className="rounded-2xl bg-white/90 p-6 shadow-xl">
        <p className="text-sm font-black uppercase text-emerald-700">
          Visual Sensitivity
        </p>
        <h1 className="mt-2 text-4xl font-black text-zinc-900">
          Choose a room to visit
        </h1>
        <p className="mt-2 text-lg font-bold text-zinc-600">
          Rooms not visited by the end are counted as avoided.
        </p>

        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {visualRooms.map((room) => (
            <button
              key={room.id}
              type="button"
              className="overflow-hidden rounded-2xl bg-white text-left shadow-xl transition hover:scale-105"
              disabled={locked}
              onClick={() => enterRoom(room)}
            >
              <SafeImage
                src={room.backgroundImage}
                alt=""
                width={360}
                height={220}
                className="h-44 w-full object-cover"
              />
              <div className="p-4">
                <p className="text-xl font-black text-zinc-900">{room.name}</p>
                <p className="mt-1 text-sm font-bold text-zinc-600">
                  {visitedIds.has(room.id) ? "Visited" : "Not visited"}
                </p>
              </div>
            </button>
          ))}
        </div>

        <BigButton
          className="mt-6 w-full bg-emerald-600 text-white hover:bg-emerald-700"
          disabled={locked || currentRoom}
          onClick={() => void finishLevel()}
        >
          Finish rooms
        </BigButton>
      </div>
    </section>
  );
}
