"use client";

import { DndContext, PointerSensor, TouchSensor, useDraggable, useDroppable, useSensor, useSensors } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import SafeImage from "@/components/shared/SafeImage";
import { useRouter } from "next/navigation";
import { useState } from "react";

import BigButton from "@/components/shared/BigButton";
import { textureCards } from "@/lib/gameData/chapter6";
import {
  scoreTextureRating,
  scoreTextureSummary,
} from "@/lib/scoring/chapter6";
import { useGameStore } from "@/store/gameStore";

const zones = [
  { id: "love", label: "❤️ Love", className: "bg-green-100" },
  { id: "okay", label: "👍 Okay", className: "bg-blue-100" },
  { id: "dont_like", label: "👎 Don't Like", className: "bg-yellow-100" },
  { id: "wont_try", label: "✋ Won't Try", className: "bg-pink-100" },
];

export default function Chapter6Level3Page() {
  const router = useRouter();
  const { sessionId, playerAge, playerName, setSession, addScore, goToChapter } =
    useGameStore();
  const [assignments, setAssignments] = useState([]);
  const [locked, setLocked] = useState(false);
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 120, tolerance: 8 } }),
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

  async function handleDragEnd(event) {
    const { active, over } = event;
    if (!over || locked) return;
    const texture = textureCards.find((card) => card.id === active.id);
    const rating = over.id;
    if (!texture || !zones.some((zone) => zone.id === rating)) return;

    const assignment = {
      textureId: texture.id,
      textureName: texture.name,
      category: texture.category,
      rating,
    };
    const nextAssignments = [
      ...assignments.filter((item) => item.textureId !== texture.id),
      assignment,
    ];
    setAssignments(nextAssignments);
    const activeSessionId = await ensureSession();
    const points = scoreTextureRating(rating);

    await fetch("/api/response", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        sessionId: activeSessionId,
        chapter: 6,
        level: 3,
        taskKey: `ch6_texture_${texture.id}`,
        startedAt: Date.now(),
        responseTimeMs: null,
        selection: rating,
        isCorrect: rating === "love" || rating === "okay",
        attemptNumber: 1,
        scorePoints: points,
        extraData: assignment,
      }),
    });
  }

  async function finishLevel() {
    if (locked) return;
    setLocked(true);
    const activeSessionId = await ensureSession();
    const perItemPoints = assignments.reduce(
      (total, assignment) => total + scoreTextureRating(assignment.rating),
      0,
    );
    const summary = scoreTextureSummary(assignments, textureCards);
    const totalPoints = perItemPoints + summary.points;

    await fetch("/api/score", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        sessionId: activeSessionId,
        chapterKey: "ch6_sensory",
        rawPoints: totalPoints,
      }),
    });
    addScore("ch6_sensory", totalPoints);
    goToChapter(7, 1);
    router.push("/chapter-7");
  }

  const assignedTextureIds = new Set(assignments.map((item) => item.textureId));

  return (
    <section className="mx-auto w-full max-w-7xl px-6 py-10">
      <div className="rounded-2xl bg-white/90 p-6 shadow-xl">
        <p className="text-sm font-black uppercase text-emerald-700">
          Texture Preferences
        </p>
        <h1 className="mt-2 text-4xl font-black text-zinc-900">
          Drag each texture to how it feels
        </h1>

        <DndContext sensors={sensors} onDragEnd={(event) => void handleDragEnd(event)}>
          <div className="mt-6 grid gap-6 lg:grid-cols-[360px_1fr]">
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
              {textureCards.map((texture) => (
                <TextureCard
                  key={texture.id}
                  texture={texture}
                  assigned={assignedTextureIds.has(texture.id)}
                />
              ))}
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              {zones.map((zone) => (
                <DropZone
                  key={zone.id}
                  zone={zone}
                  assignments={assignments.filter(
                    (assignment) => assignment.rating === zone.id,
                  )}
                />
              ))}
            </div>
          </div>
        </DndContext>

        <BigButton
          className="mt-6 w-full bg-emerald-600 text-white hover:bg-emerald-700"
          disabled={locked || assignments.length < textureCards.length}
          onClick={() => void finishLevel()}
        >
          Finish textures
        </BigButton>
      </div>
    </section>
  );
}

function TextureCard({ texture, assigned }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({ id: texture.id });
  const style = {
    transform: CSS.Translate.toString(transform),
  };

  return (
    <button
      ref={setNodeRef}
      type="button"
      style={style}
      className={`flex items-center gap-3 rounded-2xl bg-white p-3 text-left shadow-lg ${
        isDragging ? "opacity-70" : ""
      } ${assigned ? "ring-4 ring-emerald-300" : ""}`}
      {...listeners}
      {...attributes}
    >
      <SafeImage
        src={texture.imagePath}
        alt=""
        width={96}
        height={96}
        className="h-20 w-20 object-contain"
      />
      <div>
        <p className="text-xl font-black text-zinc-900">{texture.name}</p>
        <p className="text-sm font-bold text-zinc-600">{texture.category}</p>
      </div>
    </button>
  );
}

function DropZone({ zone, assignments }) {
  const { isOver, setNodeRef } = useDroppable({ id: zone.id });

  return (
    <div
      ref={setNodeRef}
      className={`min-h-64 rounded-2xl p-5 shadow-inner ${zone.className} ${
        isOver ? "ring-4 ring-emerald-500" : ""
      }`}
    >
      <h2 className="text-3xl font-black text-zinc-900">{zone.label}</h2>
      <div className="mt-4 flex flex-wrap gap-2">
        {assignments.length ? (
          assignments.map((assignment) => (
            <span
              key={assignment.textureId}
              className="rounded-full bg-white px-4 py-2 text-base font-black text-zinc-900 shadow"
            >
              {assignment.textureName}
            </span>
          ))
        ) : (
          <p className="text-lg font-bold text-zinc-600">Drop textures here.</p>
        )}
      </div>
    </div>
  );
}
