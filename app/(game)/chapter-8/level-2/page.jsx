"use client";

import { motion } from "framer-motion";
import SafeImage from "@/components/shared/SafeImage";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";

import BigButton from "@/components/shared/BigButton";
import { actionById, imitationSequences } from "@/lib/gameData/chapter8";
import {
  detectPerseveration,
  scoreSequenceAttempt,
  summarizeSequentialImitation,
} from "@/lib/scoring/chapter8";
import { useGameStore } from "@/store/gameStore";

export default function Chapter8Level2Page() {
  const router = useRouter();
  const { sessionId, playerAge, playerName, setSession, addScore, goToChapter } =
    useGameStore();
  const [sequenceIndex, setSequenceIndex] = useState(0);
  const [phase, setPhase] = useState("watch");
  const [watchStepIndex, setWatchStepIndex] = useState(0);
  const [selectedSteps, setSelectedSteps] = useState([]);
  const [wrongSelections, setWrongSelections] = useState([]);
  const [sequenceResults, setSequenceResults] = useState([]);
  const [locked, setLocked] = useState(false);
  const startedAtRef = useRef(Date.now());
  const sequence = imitationSequences[sequenceIndex];

  const options = useMemo(() => {
    const ids = [...sequence.steps, ...sequence.distractorOptions];
    return [...new Set(ids)].map((id) => actionById[id]);
  }, [sequence]);

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

  async function finishChapter(nextResults, activeSessionId) {
    const summary = summarizeSequentialImitation(nextResults);

    await fetch("/api/score", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        sessionId: activeSessionId,
        chapterKey: "ch8_imitation",
        rawPoints: summary.points,
      }),
    });
    addScore("ch8_imitation", summary.points);
    goToChapter(9, 1);
    router.push("/chapter-9");
  }

  async function submitSequence(finalSelectedSteps, finalWrongSelections) {
    if (locked) return;
    setLocked(true);
    const activeSessionId = await ensureSession();
    const attemptScore = scoreSequenceAttempt(sequence, finalSelectedSteps);
    const perseveration = detectPerseveration(finalWrongSelections);
    const result = {
      id: sequence.id,
      type: sequence.type,
      selectedSteps: finalSelectedSteps,
      wrongSelections: finalWrongSelections,
      perseveration,
      ...attemptScore,
    };
    const nextResults = [...sequenceResults, result];
    setSequenceResults(nextResults);

    await fetch("/api/response", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        sessionId: activeSessionId,
        chapter: 8,
        level: 2,
        taskKey: `ch8_sequence_${sequence.id}`,
        startedAt: startedAtRef.current,
        responseTimeMs: Date.now() - startedAtRef.current,
        selection: finalSelectedSteps,
        isCorrect: result.isComplete,
        attemptNumber: 1,
        scorePoints: result.points + (perseveration ? 2 : 0),
        extraData: {
          expectedSteps: sequence.steps,
          sequenceType: sequence.type,
          totalErrors: result.totalErrors,
          perseveration,
          wrongSelections: finalWrongSelections,
        },
      }),
    });

    setTimeout(async () => {
      if (sequenceIndex + 1 >= imitationSequences.length) {
        await finishChapter(nextResults, activeSessionId);
        return;
      }
      setSequenceIndex((index) => index + 1);
      setPhase("watch");
      setWatchStepIndex(0);
      setSelectedSteps([]);
      setWrongSelections([]);
      startedAtRef.current = Date.now();
      setLocked(false);
    }, 700);
  }

  function chooseAction(actionId) {
    if (locked || phase !== "try") return;
    const expected = sequence.steps[selectedSteps.length];
    const nextSelectedSteps = [...selectedSteps, actionId];
    const nextWrongSelections =
      actionId === expected ? wrongSelections : [...wrongSelections, actionId];
    setSelectedSteps(nextSelectedSteps);
    setWrongSelections(nextWrongSelections);

    if (nextSelectedSteps.length >= sequence.steps.length) {
      void submitSequence(nextSelectedSteps, nextWrongSelections);
    }
  }

  useEffect(() => {
    if (phase !== "watch") return undefined;
    const interval = setInterval(() => {
      setWatchStepIndex((index) => {
        if (index + 1 >= sequence.steps.length) {
          clearInterval(interval);
          setTimeout(() => {
            setPhase("try");
            startedAtRef.current = Date.now();
          }, 600);
          return index;
        }
        return index + 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [phase, sequence]);

  const watchedAction = actionById[sequence.steps[watchStepIndex]];
  const summary = summarizeSequentialImitation(sequenceResults);

  return (
    <section className="mx-auto grid w-full max-w-6xl gap-8 px-6 py-10 lg:grid-cols-[1fr_360px]">
      <div className="rounded-2xl bg-white/90 p-8 shadow-xl">
        <p className="text-sm font-black uppercase text-indigo-700">
          Sequence {sequenceIndex + 1} of {imitationSequences.length}
        </p>
        <h1 className="mt-2 text-4xl font-black text-zinc-900">
          Watch, then copy
        </h1>
        <p className="mt-2 text-lg font-bold text-zinc-600">
          {phase === "watch" ? "Watch the whole action sequence." : "Now you try!"}
        </p>

        <div className="mt-8 grid min-h-80 place-items-center rounded-2xl bg-indigo-100 p-8">
          {phase === "watch" ? (
            <motion.div
              key={`${sequence.id}-${watchedAction.id}-${watchStepIndex}`}
              animate={{ scale: [1, 1.1, 1], y: [0, -8, 0] }}
              transition={{ duration: 0.8 }}
            >
              <SafeImage
                src={watchedAction.animationPath}
                alt=""
                width={260}
                height={260}
                className="h-64 w-64 object-contain drop-shadow-xl"
              />
            </motion.div>
          ) : (
            <div className="grid w-full gap-4 sm:grid-cols-2">
              {options.map((option) => (
                <button
                  key={option.id}
                  type="button"
                  className="grid min-h-32 place-items-center rounded-2xl bg-white p-4 shadow-xl transition hover:scale-105 disabled:opacity-50"
                  disabled={locked}
                  onClick={() => chooseAction(option.id)}
                >
                  <SafeImage
                    src={option.animationPath}
                    alt=""
                    width={120}
                    height={120}
                    className="h-24 w-24 object-contain"
                  />
                  <span className="mt-2 text-base font-black capitalize text-zinc-800">
                    {option.id.replaceAll("-", " ")}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <aside className="flex flex-col justify-center rounded-2xl bg-white/90 p-6 shadow-xl">
        <h2 className="text-3xl font-black text-zinc-900">Copy notes</h2>
        <p className="mt-3 text-lg font-bold text-zinc-600">
          Type: {sequence.type}
        </p>
        <p className="mt-2 text-lg font-bold text-zinc-600">
          Steps chosen: {selectedSteps.length} of {sequence.steps.length}
        </p>
        <div className="mt-5 min-h-24 rounded-2xl bg-indigo-50 p-4">
          {selectedSteps.length ? (
            <div className="flex flex-wrap gap-2">
              {selectedSteps.map((step, index) => (
                <span
                  key={`${step}-${index}`}
                  className="rounded-full bg-white px-3 py-2 text-sm font-black text-zinc-800 shadow"
                >
                  {step.replaceAll("-", " ")}
                </span>
              ))}
            </div>
          ) : (
            <p className="text-base font-bold text-zinc-600">
              Choices will appear here.
            </p>
          )}
        </div>
        <div className="mt-5 rounded-2xl bg-zinc-100 p-4 text-sm font-black text-zinc-700">
          <p>Completed 3-action: {summary.completedThreeActionCount}</p>
          <p>Perseveration notes: {summary.perseverationCount}</p>
          <p>Points so far: {summary.points}</p>
        </div>
        {phase === "watch" ? null : (
          <BigButton
            className="mt-6 bg-indigo-600 text-white hover:bg-indigo-700"
            disabled={locked || selectedSteps.length === 0}
            onClick={() => void submitSequence(selectedSteps, wrongSelections)}
          >
            Done
          </BigButton>
        )}
      </aside>
    </section>
  );
}
