"use client";

import { DndContext, PointerSensor, TouchSensor, useSensor, useSensors } from "@dnd-kit/core";
import { arrayMove, SortableContext, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { motion } from "framer-motion";
import SafeImage from "@/components/shared/SafeImage";
import { useRouter } from "next/navigation";
import { useMemo, useRef, useState } from "react";

import BigButton from "@/components/shared/BigButton";
import {
  morningRoutineCards,
  routineDisruptionScenarios,
} from "@/lib/gameData/chapter4";
import {
  countSequenceErrors,
  scoreRoutineAttempt,
  scoreDisruptionResponse,
  shuffleRoutineCards,
} from "@/lib/scoring/chapter4";
import { useGameStore } from "@/store/gameStore";

const correctOrder = morningRoutineCards
  .slice()
  .sort((a, b) => a.order - b.order)
  .map((card) => card.id);

export default function Chapter4Level1Page() {
  const router = useRouter();
  const { sessionId, playerAge, playerName, setSession, addScore, goToChapter } =
    useGameStore();
  const [cards, setCards] = useState(() => shuffleRoutineCards(morningRoutineCards));
  const [attempts, setAttempts] = useState(0);
  const [sequencePoints, setSequencePoints] = useState(0);
  const [showDisruption, setShowDisruption] = useState(false);
  const disruptionStartedAtRef = useRef(null);
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 120, tolerance: 8 } }),
  );
  const disruption = routineDisruptionScenarios[0];

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

  function handleDragEnd(event) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    setCards((items) => {
      const oldIndex = items.findIndex((item) => item.id === active.id);
      const newIndex = items.findIndex((item) => item.id === over.id);
      return arrayMove(items, oldIndex, newIndex);
    });
  }

  async function submitOrder() {
    const nextAttempts = attempts + 1;
    const order = cards.map((card) => card.id);
    const errors = countSequenceErrors(order, correctOrder);
    const activeSessionId = await ensureSession();
    const points = scoreRoutineAttempt(errors, nextAttempts);
    setAttempts(nextAttempts);
    setSequencePoints((current) => current + points);

    await fetch("/api/response", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        sessionId: activeSessionId,
        chapter: 4,
        level: 1,
        taskKey: `ch4_routine_attempt_${nextAttempts}`,
        startedAt: Date.now(),
        selection: order,
        isCorrect: errors === 0,
        attemptNumber: nextAttempts,
        scorePoints: points,
        extraData: { errors },
      }),
    });

    if (errors === 0 || nextAttempts >= 3) {
      disruptionStartedAtRef.current = Date.now();
      setShowDisruption(true);
    }
  }

  async function chooseDisruption(option) {
    const activeSessionId = await ensureSession();
    const responseTimeMs = Date.now() - disruptionStartedAtRef.current;
    const points = scoreDisruptionResponse(option.type, responseTimeMs);
    const totalPoints = sequencePoints + points;

    await fetch("/api/response", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        sessionId: activeSessionId,
        chapter: 4,
        level: 1,
        taskKey: `ch4_disruption_${disruption.id}`,
        startedAt: disruptionStartedAtRef.current,
        responseTimeMs,
        selection: option.type,
        isCorrect: option.type === "flexible",
        attemptNumber: 1,
        scorePoints: points,
        extraData: {
          optionText: option.text,
          redFlagCandidate: option.type === "distress",
        },
      }),
    });

    await fetch("/api/score", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        sessionId: activeSessionId,
        chapterKey: "ch4_executive",
        rawPoints: totalPoints,
      }),
    });
    addScore("ch4_executive", totalPoints);
    goToChapter(4, 2);
    router.push("/chapter-4/level-2");
  }

  const orderedLabels = useMemo(() => cards.map((card) => card.label).join(" → "), [cards]);

  return (
    <section className="mx-auto w-full max-w-5xl px-6 py-10">
      <div className="rounded-2xl bg-white/90 p-6 shadow-xl">
        <p className="text-sm font-black uppercase text-indigo-700">
          Attempt {attempts + 1} of 3
        </p>
        <h1 className="mt-2 text-4xl font-black text-zinc-900">
          Put the morning in order
        </h1>
        <p className="mt-2 text-lg font-bold text-zinc-600">
          Drag the cards into the morning order.
        </p>

        <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
          <div className="mt-6 grid gap-5 lg:grid-cols-[260px_1fr]">
            <aside className="rounded-2xl bg-amber-100 p-4 shadow-inner">
              <h2 className="text-xl font-black text-zinc-900">Card pile</h2>
              <div className="mt-3 grid grid-cols-2 gap-3">
                {cards.map((card) => (
                  <div
                    key={card.id}
                    className="grid place-items-center rounded-xl bg-white p-2 shadow"
                  >
                    <SafeImage
                      src={card.imagePath}
                      alt=""
                      width={72}
                      height={72}
                      className="h-14 w-14 object-contain"
                    />
                  </div>
                ))}
              </div>
            </aside>

            <div className="rounded-2xl bg-indigo-50 p-4 shadow-inner">
              <h2 className="text-xl font-black text-zinc-900">Morning order</h2>
              <p className="mt-1 text-sm font-bold text-zinc-600">{orderedLabels}</p>
              <SortableContext items={cards.map((card) => card.id)} strategy={verticalListSortingStrategy}>
                <div className="mt-4 grid gap-3">
                  {cards.map((card) => (
                    <RoutineCard key={card.id} card={card} />
                  ))}
                </div>
              </SortableContext>
            </div>
          </div>
        </DndContext>

        <BigButton className="mt-6 w-full bg-green-500 text-white hover:bg-green-600" onClick={submitOrder}>
          Done!
        </BigButton>
      </div>

      {showDisruption ? (
        <motion.div
          className="fixed inset-0 z-50 grid place-items-center bg-black/40 p-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <motion.div
            className="w-full max-w-2xl rounded-2xl bg-white p-8 shadow-2xl"
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
          >
            <h2 className="text-4xl font-black text-zinc-900">{disruption.story}</h2>
            <div className="mt-6 grid gap-4">
              {disruption.options.map((option) => (
                <BigButton
                  key={option.text}
                  className="bg-indigo-600 text-white hover:bg-indigo-700"
                  onClick={() => void chooseDisruption(option)}
                >
                  {option.text}
                </BigButton>
              ))}
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </section>
  );
}

function RoutineCard({ card }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: card.id });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <button
      ref={setNodeRef}
      type="button"
      style={style}
      className={`flex items-center gap-4 rounded-2xl bg-white p-4 text-left shadow ${
        isDragging ? "opacity-70" : ""
      }`}
      {...attributes}
      {...listeners}
    >
      <SafeImage
        src={card.imagePath}
        alt=""
        width={96}
        height={96}
        className="h-20 w-20 object-contain"
      />
      <span className="text-2xl font-black text-zinc-900">{card.label}</span>
    </button>
  );
}
