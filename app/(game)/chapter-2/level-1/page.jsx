"use client";

import { useDraggable, useDroppable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import SafeImage from "@/components/shared/SafeImage";
import { useRouter } from "next/navigation";
import { useMemo, useRef, useState } from "react";

import DragDropSortable from "@/components/game/DragDropSortable";
import EmotionFace from "@/components/game/EmotionFace";
import {
  faceCards,
  scenarioCards,
} from "@/lib/gameData/chapter2";
import {
  calcEmotionMatchingPoints,
  isFearSadConfusion,
  isNegativeEmotion,
  shouldTriggerNegativeEmotionFlag,
} from "@/lib/scoring/chapter2";
import { calcGameAccuracy } from "@/lib/scoring/engine";
import { useGameStore } from "@/store/gameStore";

const FLOWER_BEDS = [
  { emotion: "happy", label: "Happy", className: "bg-yellow-200" },
  { emotion: "sad", label: "Sad", className: "bg-blue-200" },
  { emotion: "angry", label: "Angry", className: "bg-red-200" },
  { emotion: "scared", label: "Scared", className: "bg-purple-200" },
];

function getCardEmotion(card) {
  return card.emotion || card.correctEmotion;
}

export default function Chapter2Level1Page() {
  const router = useRouter();
  const { sessionId, playerAge, playerName, setSession, addScore, goToChapter } =
    useGameStore();
  const [phase, setPhase] = useState("faces");
  const [remainingIds, setRemainingIds] = useState(faceCards.map((card) => card.id));
  const [stats, setStats] = useState({
    totalMoves: 0,
    correctDrops: 0,
    negativeTotal: 0,
    negativeCorrect: 0,
    fearSadConfusions: 0,
  });
  const scorePostedRef = useRef(false);

  const cards = phase === "faces" ? faceCards : scenarioCards;
  const currentCards = useMemo(
    () => cards.filter((card) => remainingIds.includes(card.id)),
    [cards, remainingIds],
  );

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

  async function finishLevel(nextStats) {
    if (scorePostedRef.current) return;
    scorePostedRef.current = true;
    const activeSessionId = await ensureSession();
    const accuracy = calcGameAccuracy(nextStats.correctDrops, nextStats.totalMoves);
    const negativeAccuracy = nextStats.negativeTotal
      ? nextStats.negativeCorrect / nextStats.negativeTotal
      : 1;
    const points = calcEmotionMatchingPoints({
      accuracy,
      negativeAccuracy,
      fearSadConfusions: nextStats.fearSadConfusions,
      totalMoves: nextStats.totalMoves,
    });

    if (
      shouldTriggerNegativeEmotionFlag(
        nextStats.negativeCorrect,
        nextStats.negativeTotal,
      )
    ) {
      await fetch("/api/flag", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId: activeSessionId,
          flagType: "negative_emotion_recognition_under_50",
          description: "Negative emotion recognition accuracy under 50%.",
          severity: "moderate",
        }),
      });
    }

    await fetch("/api/score", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        sessionId: activeSessionId,
        chapterKey: "ch2_emotion",
        rawPoints: points,
      }),
    });
    addScore("ch2_emotion", points);
    goToChapter(2, 2);
    router.push("/chapter-2/level-2");
  }

  async function logDrop(card, selectedEmotion, isCorrect, points, activeSessionId) {
    await fetch("/api/response", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        sessionId: activeSessionId,
        chapter: 2,
        level: 1,
        taskKey: card.id,
        startedAt: Date.now(),
        responseTimeMs: null,
        selection: selectedEmotion,
        isCorrect,
        attemptNumber: 1,
        scorePoints: points,
        extraData: {
          phase,
          correctEmotion: getCardEmotion(card),
        },
      }),
    });
  }

  async function handleDragEnd(event) {
    const selectedEmotion = event.over?.id;
    const card = cards.find((item) => item.id === event.active.id);
    if (!selectedEmotion || !card) return;

    const correctEmotion = getCardEmotion(card);
    const isCorrect = selectedEmotion === correctEmotion;
    const negative = isNegativeEmotion(correctEmotion);
    const confusion = isFearSadConfusion(correctEmotion, selectedEmotion);
    const activeSessionId = await ensureSession();

    const nextStats = {
      totalMoves: stats.totalMoves + 1,
      correctDrops: stats.correctDrops + (isCorrect ? 1 : 0),
      negativeTotal: stats.negativeTotal + (negative ? 1 : 0),
      negativeCorrect: stats.negativeCorrect + (negative && isCorrect ? 1 : 0),
      fearSadConfusions: stats.fearSadConfusions + (confusion ? 1 : 0),
    };
    const cardPoints = isCorrect ? 0 : confusion ? 2 : 1;
    await logDrop(card, selectedEmotion, isCorrect, cardPoints, activeSessionId);
    setStats(nextStats);

    if (isCorrect) {
      const nextRemaining = remainingIds.filter((id) => id !== card.id);
      setRemainingIds(nextRemaining);
      if (nextRemaining.length === 0 && phase === "faces") {
        setPhase("scenarios");
        setRemainingIds(scenarioCards.map((scenario) => scenario.id));
      } else if (nextRemaining.length === 0) {
        await finishLevel(nextStats);
      }
    }
  }

  const accuracy = calcGameAccuracy(stats.correctDrops, stats.totalMoves);

  return (
    <section className="grid w-full max-w-7xl gap-6 px-6 py-8 lg:grid-cols-[1fr_360px]">
      <div className="rounded-2xl bg-white/90 p-6 shadow-xl">
        <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-sm font-black uppercase text-indigo-700">
              {phase === "faces" ? "Face Cards" : "Story Cards"}
            </p>
            <h1 className="text-4xl font-black text-zinc-900">
              Emotion Matching Garden
            </h1>
          </div>
          <p className="rounded-full bg-indigo-100 px-4 py-2 text-sm font-black text-indigo-900">
            Accuracy {Math.round(accuracy * 100)}%
          </p>
        </div>

        <DragDropSortable onDragEnd={handleDragEnd}>
          <div className="grid gap-6 lg:grid-cols-2">
            <div className="grid grid-cols-2 gap-4">
              {FLOWER_BEDS.map((bed) => (
                <FlowerBed key={bed.emotion} bed={bed} />
              ))}
            </div>
            <div className="grid grid-cols-2 gap-4">
              {currentCards.map((card) => (
                <EmotionCard key={card.id} card={card} />
              ))}
            </div>
          </div>
        </DragDropSortable>
      </div>

      <aside className="rounded-2xl bg-white/80 p-6 shadow-xl">
        <h2 className="text-2xl font-black text-zinc-900">Garden Notes</h2>
        <dl className="mt-4 space-y-3 text-lg font-bold text-zinc-700">
          <div className="flex justify-between">
            <dt>Moves</dt>
            <dd>{stats.totalMoves}</dd>
          </div>
          <div className="flex justify-between">
            <dt>Correct</dt>
            <dd>{stats.correctDrops}</dd>
          </div>
          <div className="flex justify-between">
            <dt>Sad/Scared mix-ups</dt>
            <dd>{stats.fearSadConfusions}</dd>
          </div>
        </dl>
      </aside>
    </section>
  );
}

function FlowerBed({ bed }) {
  const { setNodeRef, isOver } = useDroppable({ id: bed.emotion });
  return (
    <div
      ref={setNodeRef}
      className={`grid min-h-40 place-items-center rounded-2xl p-4 text-2xl font-black text-zinc-900 shadow-inner ${
        bed.className
      } ${isOver ? "ring-4 ring-white" : ""}`}
    >
      {bed.label}
    </div>
  );
}

function EmotionCard({ card }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: card.id,
  });
  const style = { transform: CSS.Translate.toString(transform) };
  const emotion = getCardEmotion(card);

  return (
    <button
      ref={setNodeRef}
      type="button"
      style={style}
      className={`rounded-2xl bg-white p-3 text-left shadow-xl ${
        isDragging ? "opacity-60" : ""
      }`}
      {...listeners}
      {...attributes}
    >
      {card.imagePath.includes("/emotions/") ? (
        <EmotionFace
          emotion={emotion}
          imagePath={card.imagePath}
          alt={card.altText || card.description}
          className="h-32 w-full"
        />
      ) : (
        <SafeImage
          src={card.imagePath}
          alt=""
          width={160}
          height={160}
          className="mx-auto h-28 w-28 object-contain"
        />
      )}
      <p className="mt-2 text-center text-sm font-bold text-zinc-700">
        {card.description || card.altText}
      </p>
    </button>
  );
}
