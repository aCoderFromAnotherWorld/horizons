"use client";

import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

import CameraCapture from "@/components/game/CameraCapture";
import EmotionFace from "@/components/game/EmotionFace";
import FeedbackOverlay from "@/components/game/FeedbackOverlay";
import BigButton from "@/components/shared/BigButton";
import { useAudio } from "@/hooks/useAudio";
import { expressionTrials } from "@/lib/gameData/chapter2";
import { scoreExpressionSelection } from "@/lib/scoring/chapter2";
import { useGameStore } from "@/store/gameStore";

function shuffleArray(items) {
  const copy = [...items];
  for (let index = copy.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [copy[index], copy[swapIndex]] = [copy[swapIndex], copy[index]];
  }
  return copy;
}

function parseOption(path) {
  const file = path.split("/").pop().replace(".webp", "");
  const parts = file.split("-");
  if (parts.includes("neutral")) {
    return { emotion: "neutral", intensity: 2 };
  }
  return {
    emotion: parts[1],
    intensity: Number(parts[2] || 2),
  };
}

export default function Chapter2Level2Page() {
  const router = useRouter();
  const {
    sessionId,
    playerAge,
    playerName,
    cameraEnabled,
    setSession,
    addScore,
    goToChapter,
  } = useGameStore();
  const [trialIndex, setTrialIndex] = useState(0);
  const [totalPoints, setTotalPoints] = useState(0);
  const [feedback, setFeedback] = useState(null);
  const trial = expressionTrials[trialIndex];
  const audioOptions = useMemo(() => ({}), []);
  const shuffledOptions = useMemo(
    () => shuffleArray(trial?.options || []),
    [trial?.id],
  );
  const { play } = useAudio(trial?.voiceAudioPath, audioOptions);

  useEffect(() => {
    play?.();
  }, [play, trialIndex]);

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

  async function chooseOption(optionPath, optionIndex) {
    if (feedback) return;
    const selected = parseOption(optionPath);
    const result = scoreExpressionSelection({
      targetEmotion: trial.emotion,
      targetIntensity: trial.intensity,
      selected,
    });
    const nextTotal = totalPoints + result.points;
    setTotalPoints(nextTotal);
    setFeedback({ correct: result.type === "correct" });

    const activeSessionId = await ensureSession();
    await fetch("/api/response", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        sessionId: activeSessionId,
        chapter: 2,
        level: 2,
        taskKey: trial.id,
        startedAt: Date.now(),
        responseTimeMs: null,
        selection: {
          optionIndex,
          emotion: selected.emotion,
          intensity: selected.intensity,
        },
        isCorrect: result.type === "correct",
        attemptNumber: 1,
        scorePoints: result.points,
        extraData: {
          resultType: result.type,
          targetEmotion: trial.emotion,
          targetIntensity: trial.intensity,
        },
      }),
    });

    setTimeout(async () => {
      if (trialIndex + 1 >= expressionTrials.length) {
        await fetch("/api/score", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            sessionId: activeSessionId,
            chapterKey: "ch2_emotion",
            rawPoints: nextTotal,
          }),
        });
        addScore("ch2_emotion", nextTotal);
        goToChapter(2, 3);
        router.push("/chapter-2/level-3");
        return;
      }
      setTrialIndex((index) => index + 1);
      setFeedback(null);
    }, 3000);
  }

  return (
    <section className="mx-auto flex w-full max-w-5xl flex-col items-center gap-8 px-6 py-10 text-center">
      <CameraCapture
        sessionId={sessionId}
        taskKey={trial.id}
        chapterId={2}
        levelId={2}
        active={cameraEnabled && !feedback}
      />
      <div className="rounded-2xl bg-white/90 px-8 py-6 shadow-xl">
        <p className="text-sm font-black uppercase text-indigo-700">
          Trial {trialIndex + 1} of {expressionTrials.length}
        </p>
        <h1 className="mt-2 text-5xl font-black capitalize text-zinc-900">
          Show {trial.emotion}
        </h1>
        <p className="mt-2 text-lg font-bold text-zinc-600">
          Pick the face that matches.
        </p>
      </div>

      <div className="grid w-full gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {shuffledOptions.map((option, index) => {
          const parsed = parseOption(option);
          return (
            <BigButton
              key={`${option}-${index}`}
              className="min-h-44 bg-white text-zinc-900 hover:bg-yellow-100"
              onClick={() => void chooseOption(option, index)}
            >
              <EmotionFace
                emotion={parsed.emotion}
                intensity={parsed.intensity}
                imagePath={option}
                className="h-32 w-32"
              />
            </BigButton>
          );
        })}
      </div>

      <FeedbackOverlay
        show={Boolean(feedback)}
        correct={feedback?.correct}
        onComplete={() => {}}
      />
    </section>
  );
}
