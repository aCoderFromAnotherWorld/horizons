"use client";

import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import FeedbackOverlay from "@/components/game/FeedbackOverlay";
import CameraCapture from "@/components/game/CameraCapture";
import SafeImage from "@/components/shared/SafeImage";
import BigButton from "@/components/shared/BigButton";
import { Button } from "@/components/ui/button";
import { useTaskTimer } from "@/hooks/useTaskTimer";
import { guideAnimals, guideTargetObjects } from "@/lib/gameData/chapter1";
import { scoreGuideFollowing } from "@/lib/scoring/chapter1";
import { useGameStore } from "@/store/gameStore";

const guide = guideAnimals[0];
const ANSWER_LIMIT_SECONDS = 10;
const OBJECT_RING_RADIUS_PERCENT = 36;
const HINT_SECONDS = 5;

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function shuffle(items) {
  const copy = [...items];
  for (let index = copy.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [copy[index], copy[swapIndex]] = [copy[swapIndex], copy[index]];
  }
  return copy;
}

function getObjectAngle(index, total) {
  return (360 / total) * index;
}

function getObjectIndexFromAngle(angle, total) {
  const stepAngle = 360 / total;
  const normalizedAngle = ((angle % 360) + 360) % 360;
  return Math.round(normalizedAngle / stepAngle) % total;
}

function getObjectPosition(index, total) {
  const angle = getObjectAngle(index, total);
  const radians = ((angle - 90) * Math.PI) / 180;

  return {
    left: `${50 + Math.cos(radians) * OBJECT_RING_RADIUS_PERCENT}%`,
    top: `${50 + Math.sin(radians) * OBJECT_RING_RADIUS_PERCENT}%`,
  };
}

export default function Chapter1Level2Page() {
  const router = useRouter();
  const { start, stop, reset } = useTaskTimer();
  const {
    sessionId,
    playerAge,
    playerName,
    cameraEnabled,
    setSession,
    goToChapter,
    addScore,
  } = useGameStore();
  const trialOrder = useMemo(
    () => shuffle(guideTargetObjects.map((_, index) => index)),
    [],
  );
  const answerTimeoutRef = useRef(null);
  const countdownIntervalRef = useRef(null);
  const pointerStopRef = useRef(null);
  const nextTrialRef = useRef(null);
  const highlightIntervalRef = useRef(null);
  const currentAngleRef = useRef(0);
  const answerStartedAtRef = useRef(null);
  const totalScoreRef = useRef(0);
  const isCompletingRef = useRef(false);
  const [currentTrial, setCurrentTrial] = useState(0);
  const [promptUsed, setPromptUsed] = useState(false);
  const [message, setMessage] = useState(
    "Watch Bunny's paw spin to a surprise object.",
  );
  const [countdown, setCountdown] = useState(ANSWER_LIMIT_SECONDS);
  const [pointerAngle, setPointerAngle] = useState(0);
  const [spinDuration, setSpinDuration] = useState(2.2);
  const [trialState, setTrialState] = useState("spinning");
  const [feedback, setFeedback] = useState(null);
  const [selectedObjectId, setSelectedObjectId] = useState(null);
  const [highlightedObjectIndex, setHighlightedObjectIndex] = useState(null);
  const [hintLabel, setHintLabel] = useState(null);

  const objectCount = guideTargetObjects.length;
  const target = guideTargetObjects[trialOrder[currentTrial]];
  const targetIndex = trialOrder[currentTrial];
  const objectPositions = useMemo(
    () => guideTargetObjects.map((_, index) => getObjectPosition(index, objectCount)),
    [objectCount],
  );

  const clearTrialTimers = useCallback(() => {
    clearTimeout(answerTimeoutRef.current);
    clearTimeout(pointerStopRef.current);
    clearTimeout(nextTrialRef.current);
    clearInterval(highlightIntervalRef.current);
    clearInterval(countdownIntervalRef.current);
  }, []);

  const ensureSession = useCallback(async () => {
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
  }, [playerAge, playerName, sessionId, setSession]);

  const advanceToNextStep = useCallback(
    async (activeSessionId) => {
      if (currentTrial + 1 >= guideTargetObjects.length) {
        await fetch("/api/score", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            sessionId: activeSessionId,
            chapterKey: "ch1_baseline",
            rawPoints: totalScoreRef.current,
          }),
        });
        addScore("ch1_baseline", totalScoreRef.current);
        goToChapter(2, 1);
        router.push("/chapter-2");
        return;
      }

      isCompletingRef.current = false;
      setCurrentTrial((trial) => trial + 1);
    },
    [addScore, currentTrial, goToChapter, router],
  );

  const completeTrial = useCallback(
    async (selectedId, timedOut = false) => {
      if (isCompletingRef.current || !target) return;

      isCompletingRef.current = true;
      clearTrialTimers();

      const isCorrect = !timedOut && selectedId === target.id;
      const points = scoreGuideFollowing({
        clickedTarget: isCorrect,
        clickedPointer: false,
        promptUsed,
      });
      const responseTimeMs = stop() || (timedOut ? ANSWER_LIMIT_SECONDS * 1000 : 0);
      const selection = timedOut ? "timeout" : selectedId;

      totalScoreRef.current += points;
      setSelectedObjectId(selectedId);
      setFeedback({ correct: isCorrect });
      setTrialState("feedback");
      setCountdown(0);

      const activeSessionId = await ensureSession();

      await fetch("/api/response", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId: activeSessionId,
          chapter: 1,
          level: 2,
          taskKey: `ch1_guide_${currentTrial + 1}`,
          startedAt: answerStartedAtRef.current || Date.now(),
          responseTimeMs,
          selection,
          isCorrect,
          attemptNumber: promptUsed ? 2 : 1,
          scorePoints: points,
          extraData: {
            targetObject: target.id,
            promptUsed,
            timedOut,
          },
        }),
      });

      if (isCorrect) {
        setMessage(`${target.label}! Great spotting.`);
      } else if (timedOut) {
        setMessage(`Time is up. Bunny was pointing to the ${target.label}.`);
      } else {
        setMessage(`Not quite. Bunny was pointing to the ${target.label}.`);
      }

      nextTrialRef.current = setTimeout(() => {
        setFeedback(null);
        setSelectedObjectId(null);
        setPromptUsed(false);
        void advanceToNextStep(activeSessionId);
      }, 1200);
    },
    [
      advanceToNextStep,
      clearTrialTimers,
      currentTrial,
      ensureSession,
      promptUsed,
      stop,
      target,
    ],
  );

  const beginAnswerPhase = useCallback(() => {
    answerStartedAtRef.current = Date.now();
    setTrialState("answering");
    setCountdown(ANSWER_LIMIT_SECONDS);
    setMessage("Bunny is pointing now. Tap the matching object name below.");
    start();

    countdownIntervalRef.current = setInterval(() => {
      setCountdown((seconds) => (seconds > 0 ? seconds - 1 : 0));
    }, 1000);

    answerTimeoutRef.current = setTimeout(() => {
      void completeTrial(null, true);
    }, ANSWER_LIMIT_SECONDS * 1000);
  }, [completeTrial, start]);

  const startTrial = useCallback(() => {
    if (!target) return;

    clearTrialTimers();
    reset();
    isCompletingRef.current = false;
    answerStartedAtRef.current = null;
    setPromptUsed(false);
    setFeedback(null);
    setSelectedObjectId(null);
    setHighlightedObjectIndex(null);
    setHintLabel(null);
    setTrialState("spinning");
    setCountdown(ANSWER_LIMIT_SECONDS);
    setMessage("Watch Bunny's paw spin to a surprise object.");

    const spinMs = randomInt(2000, 3600);
    const extraTurns = randomInt(2, 4) * 360;
    const currentAngle = ((currentAngleRef.current % 360) + 360) % 360;
    const targetAngle = getObjectAngle(trialOrder[currentTrial], objectCount);
    const clockwiseDelta = (targetAngle - currentAngle + 360) % 360;
    const nextAngle = currentAngleRef.current + extraTurns + clockwiseDelta;
    const stepAngle = 360 / objectCount;
    const totalHighlightSteps = Math.max(
      1,
      Math.round((extraTurns + clockwiseDelta) / stepAngle),
    );
    const highlightStepMs = spinMs / totalHighlightSteps;
    const initialHighlightIndex = getObjectIndexFromAngle(currentAngle, objectCount);

    currentAngleRef.current = nextAngle;
    setSpinDuration(spinMs / 1000);
    setPointerAngle(nextAngle);
    setHighlightedObjectIndex(initialHighlightIndex);

    let highlightIndex = initialHighlightIndex;
    let completedHighlightSteps = 0;
    highlightIntervalRef.current = setInterval(() => {
      completedHighlightSteps += 1;
      highlightIndex = (highlightIndex + 1) % objectCount;
      setHighlightedObjectIndex(highlightIndex);

      if (completedHighlightSteps >= totalHighlightSteps) {
        clearInterval(highlightIntervalRef.current);
      }
    }, highlightStepMs);

    pointerStopRef.current = setTimeout(() => {
      clearInterval(highlightIntervalRef.current);
      setHighlightedObjectIndex(trialOrder[currentTrial]);
      beginAnswerPhase();
    }, spinMs + 20);
  }, [
    beginAnswerPhase,
    clearTrialTimers,
    currentTrial,
    objectCount,
    reset,
    target,
    trialOrder,
  ]);

  useEffect(() => {
    startTrial();
    return () => clearTrialTimers();
  }, [clearTrialTimers, startTrial]);

  useEffect(() => {
    return () => clearTrialTimers();
  }, [clearTrialTimers]);

  function showHint() {
    if (trialState !== "answering" || !target) return;
    clearTimeout(answerTimeoutRef.current);
    clearInterval(countdownIntervalRef.current);
    setPromptUsed(true);
    setTrialState("hint");
    setCountdown(HINT_SECONDS);
    setHighlightedObjectIndex(targetIndex);
    setHintLabel(target.label);
    setMessage(`Hint: Bunny is pointing to the ${target.label}. Watch it glow.`);

    countdownIntervalRef.current = setInterval(() => {
      setCountdown((seconds) => (seconds > 0 ? seconds - 1 : 0));
    }, 1000);

    nextTrialRef.current = setTimeout(() => {
      clearInterval(countdownIntervalRef.current);
      startTrial();
      setPromptUsed(true);
    }, HINT_SECONDS * 1000);
  }

  function selectAnswer(objectId) {
    if (trialState !== "answering") return;
    void completeTrial(objectId);
  }

  return (
    <section className="scene-viewport relative flex h-full min-h-0 w-full flex-col overflow-hidden">
      <CameraCapture
        sessionId={sessionId}
        taskKey={`ch1_guide_${currentTrial + 1}`}
        chapterId={1}
        levelId={2}
        active={cameraEnabled && trialState !== "feedback"}
      />
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage:
            "url('/assets/backgrounds/chapter-1-living-room.webp')",
        }}
      />
      <div className="absolute inset-0 bg-white/12" />

      <div className="relative z-10 flex min-h-0 flex-1 flex-col px-4 pb-3 pt-3 sm:px-6 sm:pb-4 sm:pt-4">
        <div className="ui-panel mx-auto flex w-full max-w-6xl flex-wrap items-center justify-between gap-3 rounded-[28px] px-5 py-4 sm:px-6">
          <div>
            <p className="text-sm font-black uppercase tracking-[0.2em] text-emerald-700">
              Trial {currentTrial + 1} of {guideTargetObjects.length}
            </p>
            <h1 className="mt-1 text-xl font-black text-zinc-900 sm:text-3xl">
              Following The Guide
            </h1>
            <p className="mt-1 text-sm font-bold text-zinc-600 sm:text-base">
              {message}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="rounded-full bg-amber-100 px-4 py-3 text-center shadow-sm">
              <p className="text-xs font-black uppercase tracking-[0.2em] text-amber-700">
                Time Left
              </p>
              <p className="text-2xl font-black text-amber-900">{countdown}s</p>
            </div>
            <div className="flex min-w-32 flex-col items-center gap-1">
              <Button
                className="rounded-full px-5"
                variant="secondary"
                onClick={showHint}
                disabled={trialState !== "answering"}
              >
                {trialState === "hint" ? "Showing hint" : "Hear a hint"}
              </Button>
              {hintLabel ? (
                <p
                  className="text-sm font-black text-amber-800"
                  aria-live="polite"
                >
                  {hintLabel}
                </p>
              ) : null}
            </div>
          </div>
        </div>

        <div className="relative mx-auto mt-3 flex min-h-0 w-full max-w-6xl flex-1 flex-col justify-between gap-3 lg:mt-4">
          <div className="ui-stage relative flex min-h-0 flex-1 items-center justify-center overflow-hidden rounded-[36px] border border-white/60 bg-[radial-gradient(circle_at_center,_rgb(254_249_195/_0.55),_transparent_32%),linear-gradient(180deg,_rgb(255_255_255/_0.32),_rgb(255_255_255/_0.12))] p-3 shadow-2xl sm:p-6">
            <div className="relative aspect-square w-full max-w-[540px] max-h-[40vh] sm:max-h-[44vh] lg:max-h-[48vh]">
              <motion.div
                className="absolute inset-0 z-10"
                animate={{ rotate: pointerAngle }}
                transition={{ duration: spinDuration, ease: [0.22, 1, 0.36, 1] }}
              >
                <div className="absolute left-1/2 top-[16%] -translate-x-1/2 rounded-full bg-yellow-300/95 px-4 py-2 text-4xl shadow-xl sm:text-5xl">
                  👆
                </div>
              </motion.div>

              {guideTargetObjects.map((object, index) => (
                <div
                  key={object.id}
                  className="absolute z-20 -translate-x-1/2 -translate-y-1/2"
                  style={objectPositions[index]}
                >
                  <motion.div
                    className={`relative rounded-[28px] bg-white/90 p-3 shadow-xl ring-4 sm:p-4 ${
                      highlightedObjectIndex === index
                        ? "ring-amber-300"
                        : "ring-white/55"
                    }`}
                    animate={
                      highlightedObjectIndex === index
                        ? {
                            boxShadow: [
                              "0 0 0 6px rgb(251 191 36 / 0.45), 0 0 24px rgb(251 191 36 / 0.6)",
                              "0 0 0 10px rgb(250 204 21 / 0.65), 0 0 42px rgb(245 158 11 / 0.85)",
                              "0 0 0 6px rgb(251 191 36 / 0.45), 0 0 24px rgb(251 191 36 / 0.6)",
                            ],
                            scale: [1, 1.08, 1],
                          }
                        : {
                            boxShadow: "0 12px 28px rgb(15 23 42 / 0.18)",
                            scale: 1,
                          }
                    }
                    transition={
                      highlightedObjectIndex === index
                        ? { duration: 0.8, repeat: Infinity, ease: "easeInOut" }
                        : { duration: 0.2 }
                    }
                  >
                    {highlightedObjectIndex === index ? (
                      <motion.div
                        className="pointer-events-none absolute -inset-3 rounded-[34px] border-[6px] border-amber-300/85"
                        animate={{ opacity: [0.7, 1, 0.7] }}
                        transition={{
                          duration: 0.8,
                          repeat: Infinity,
                          ease: "easeInOut",
                        }}
                      />
                    ) : null}
                    <SafeImage
                      src={object.image}
                      alt={object.label}
                      width={128}
                      height={128}
                      className="h-18 w-18 object-contain sm:h-24 sm:w-24"
                    />
                  </motion.div>
                </div>
              ))}

              <div className="absolute left-1/2 top-1/2 z-30 -translate-x-1/2 -translate-y-1/2">
                <div className="relative rounded-[38px] bg-white/92 px-5 py-4 shadow-2xl ring-8 ring-emerald-100/80 sm:px-8 sm:py-6">
                  <div className="absolute inset-0 rounded-[38px] bg-[radial-gradient(circle_at_top,_rgb(74_222_128/_0.18),_transparent_55%)]" />
                  <SafeImage
                    src={guide.pointImage || guide.image}
                    alt={guide.name}
                    width={240}
                    height={280}
                    className="relative z-10 h-32 w-24 object-contain sm:h-44 sm:w-32"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="ui-panel rounded-[32px] px-4 py-5 sm:px-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-sm font-black uppercase tracking-[0.18em] text-sky-700">
                  Choose The Object Name
                </p>
                <p className="mt-1 text-sm font-bold text-zinc-600 sm:text-base">
                  Bunny stops first, then you have 10 seconds to answer.
                </p>
              </div>
              {feedback ? (
                <div
                  className={`rounded-full px-4 py-2 text-sm font-black shadow-sm ${
                    feedback.correct
                      ? "bg-emerald-100 text-emerald-700"
                      : "bg-rose-100 text-rose-700"
                  }`}
                >
                  {feedback.correct ? "✓ Correct" : "✕ Not this one"}
                </div>
              ) : null}
            </div>

            <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
              {guideTargetObjects.map((object) => {
                const isSelected = selectedObjectId === object.id;
                const isCorrectChoice = feedback?.correct && isSelected;
                const isWrongChoice = feedback && !feedback.correct && isSelected;

                return (
                  <BigButton
                    key={object.id}
                    className={`min-h-18 justify-between rounded-[24px] border-2 px-5 text-left text-lg font-black ${
                      isCorrectChoice
                        ? "border-emerald-300 bg-emerald-100 text-emerald-900"
                        : isWrongChoice
                          ? "border-rose-300 bg-rose-100 text-rose-900"
                          : "border-white/60 bg-white text-zinc-900 hover:bg-sky-50"
                    }`}
                    onClick={() => selectAnswer(object.id)}
                    disabled={trialState !== "answering"}
                  >
                    <span>{object.label}</span>
                    <span aria-hidden="true">
                      {isCorrectChoice ? "✓" : isWrongChoice ? "✕" : ""}
                    </span>
                  </BigButton>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      <FeedbackOverlay
        show={Boolean(feedback)}
        correct={feedback?.correct}
        onComplete={() => {}}
      />
    </section>
  );
}
