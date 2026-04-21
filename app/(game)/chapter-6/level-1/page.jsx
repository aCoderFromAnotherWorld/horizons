"use client";

import { motion } from "framer-motion";
import SafeImage from "@/components/shared/SafeImage";
import { useRouter } from "next/navigation";
import { useCallback, useState } from "react";

import SoundPlayer from "@/components/game/SoundPlayer";
import BigButton from "@/components/shared/BigButton";
import { sensorySounds } from "@/lib/gameData/chapter6";
import {
  isDistressingSoundRating,
  scoreSoundRating,
  scoreSoundSummary,
  shouldFlagExtremeSoundSensitivity,
} from "@/lib/scoring/chapter6";
import { useGameStore } from "@/store/gameStore";

const ratingOptions = [
  { id: "happy", label: "😊", text: "Happy" },
  { id: "neutral", label: "😐", text: "Neutral" },
  { id: "worried", label: "😟", text: "Worried" },
  { id: "upset", label: "😢", text: "Upset" },
  { id: "cover_ears", label: "🙉", text: "Cover ears" },
  { id: "leave", label: "🚫", text: "Leave" },
];

export default function Chapter6Level1Page() {
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
  const [soundIndex, setSoundIndex] = useState(0);
  const [startedAt, setStartedAt] = useState(Date.now());
  const [isPlaying, setIsPlaying] = useState(false);
  const [hasPlayed, setHasPlayed] = useState(false);
  const [locked, setLocked] = useState(false);
  const [summary, setSummary] = useState({
    points: 0,
    distressCount: 0,
    coverEarsCount: 0,
    leaveCount: 0,
  });
  const sound = sensorySounds[soundIndex];

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

  const handleSoundEnd = useCallback(() => {
    setIsPlaying(false);
  }, []);

  function playCurrentSound() {
    setStartedAt(Date.now());
    setHasPlayed(true);
    setIsPlaying(true);
  }

  async function finishLevel(nextSummary, activeSessionId) {
    const summaryPoints = scoreSoundSummary(nextSummary);
    const finalPoints = nextSummary.points + summaryPoints;

    if (shouldFlagExtremeSoundSensitivity(nextSummary.distressCount)) {
      const flag = {
        flagType: "extreme_sensory_4plus_distressing_sounds",
        description: "Distressing rating selected for four or more sound trials.",
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
        chapterKey: "ch6_sensory",
        rawPoints: finalPoints,
      }),
    });
    addScore("ch6_sensory", finalPoints);
    goToChapter(6, 2);
    router.push("/chapter-6/level-2");
  }

  async function chooseRating(rating) {
    if (locked || !hasPlayed) return;
    setLocked(true);
    setIsPlaying(false);
    const responseTimeMs = Date.now() - startedAt;
    const points = scoreSoundRating(rating, sound.category);
    const nextSummary = {
      points: summary.points + points,
      distressCount:
        summary.distressCount + (isDistressingSoundRating(rating) ? 1 : 0),
      coverEarsCount:
        summary.coverEarsCount + (rating === "cover_ears" ? 1 : 0),
      leaveCount: summary.leaveCount + (rating === "leave" ? 1 : 0),
    };
    setSummary(nextSummary);
    const activeSessionId = await ensureSession();

    await fetch("/api/response", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        sessionId: activeSessionId,
        chapter: 6,
        level: 1,
        taskKey: `ch6_sound_${sound.id}`,
        startedAt,
        responseTimeMs,
        selection: rating,
        isCorrect: !isDistressingSoundRating(rating),
        attemptNumber: 1,
        scorePoints: points,
        extraData: {
          soundName: sound.name,
          category: sound.category,
          distressCount: nextSummary.distressCount,
        },
      }),
    });

    setTimeout(async () => {
      if (soundIndex + 1 >= sensorySounds.length) {
        await finishLevel(nextSummary, activeSessionId);
        return;
      }
      setSoundIndex((index) => index + 1);
      setStartedAt(Date.now());
      setHasPlayed(false);
      setLocked(false);
    }, 700);
  }

  return (
    <section className="mx-auto grid w-full max-w-6xl gap-8 px-6 py-10 lg:grid-cols-[1fr_480px]">
      {isPlaying ? (
        <SoundPlayer
          key={sound.audioPath}
          src={sound.audioPath}
          autoplay
          onEnd={handleSoundEnd}
        />
      ) : null}

      <motion.div
        key={sound.id}
        className="rounded-2xl bg-white/90 p-8 shadow-xl"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <p className="text-sm font-black uppercase text-emerald-700">
          Sound {soundIndex + 1} of {sensorySounds.length}
        </p>
        <h1 className="mt-2 text-4xl font-black text-zinc-900">
          {sound.name}
        </h1>
        <div className="mt-8 grid min-h-80 place-items-center rounded-2xl bg-emerald-100 p-8">
          <motion.div
            animate={isPlaying ? { scale: [1, 1.08, 1], rotate: [-2, 2, -2] } : {}}
            transition={{ duration: 0.8, repeat: Infinity }}
          >
            <SafeImage
              src={sound.animatedSourceImage}
              alt=""
              width={280}
              height={280}
              className="h-64 w-64 object-contain drop-shadow-xl"
            />
          </motion.div>
        </div>
        <BigButton
          className="mt-6 w-full bg-emerald-600 text-white hover:bg-emerald-700"
          disabled={locked}
          onClick={playCurrentSound}
        >
          Play sound
        </BigButton>
      </motion.div>

      <aside className="flex flex-col justify-center rounded-2xl bg-white/90 p-6 shadow-xl">
        <h2 className="text-3xl font-black text-zinc-900">How did it feel?</h2>
        <div className="mt-6 grid grid-cols-3 gap-3 sm:grid-cols-6">
          {ratingOptions.map((option) => (
            <button
              key={option.id}
              type="button"
              className="rounded-2xl bg-white p-4 text-center shadow-lg transition hover:scale-105 disabled:opacity-50"
              disabled={locked || !hasPlayed}
              onClick={() => void chooseRating(option.id)}
            >
              <span className="block text-4xl">{option.label}</span>
              <span className="mt-2 block text-sm font-black text-zinc-800">
                {option.text}
              </span>
            </button>
          ))}
        </div>
        <p className="mt-6 text-lg font-bold text-zinc-600">
          {hasPlayed
            ? `Distressing sounds so far: ${summary.distressCount}`
            : "Play the sound before choosing."}
        </p>
      </aside>
    </section>
  );
}
