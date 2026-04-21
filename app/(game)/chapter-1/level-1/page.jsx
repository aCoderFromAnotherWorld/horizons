"use client";

import SafeImage from "@/components/shared/SafeImage";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";

import AnimalGuide from "@/components/game/AnimalGuide";
import AvatarDisplay from "@/components/game/AvatarDisplay";
import BigButton from "@/components/shared/BigButton";
import { Button } from "@/components/ui/button";
import { useTaskTimer } from "@/hooks/useTaskTimer";
import {
  avatarOptions,
  guideAnimals,
  nameCallConfig,
} from "@/lib/gameData/chapter1";
import { getNextNameCallDelayMs, scoreNameResponse } from "@/lib/scoring/chapter1";
import { useAvatarStore } from "@/store/avatarStore";
import { useGameStore } from "@/store/gameStore";

const guide = guideAnimals[0];

export default function Chapter1Level1Page() {
  const router = useRouter();
  const { start, stop } = useTaskTimer();
  const timeoutRef = useRef(null);
  const nextCallRef = useRef(null);
  const callStartedAtRef = useRef(null);
  const completingRef = useRef(false);
  const totalScoreRef = useRef(0);
  const { sessionId, playerAge, playerName, setSession, goToChapter, addScore } =
    useGameStore();
  const avatar = useAvatarStore();
  const [phase, setPhase] = useState("avatar");
  const [currentTrial, setCurrentTrial] = useState(0);
  const [trialResults, setTrialResults] = useState([]);
  const [waitingForNextCall, setWaitingForNextCall] = useState(false);

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

  const logNameTrial = useCallback(
    async (responseTimeMs) => {
      if (completingRef.current) return;
      completingRef.current = true;
      clearTimeout(timeoutRef.current);

      const points = scoreNameResponse(responseTimeMs);
      const nextTotal = totalScoreRef.current + points;
      totalScoreRef.current = nextTotal;
      const activeSessionId = await ensureSession();

      await fetch("/api/response", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId: activeSessionId,
          chapter: 1,
          level: 1,
          taskKey: nameCallConfig.taskKeys[currentTrial],
          startedAt: callStartedAtRef.current,
          responseTimeMs,
          selection: responseTimeMs === null ? "no_response" : "guide",
          isCorrect: responseTimeMs !== null,
          attemptNumber: 1,
          scorePoints: points,
          extraData: {
            avatarData: {
              hair: avatar.hair,
              clothes: avatar.clothes,
              hairColor: avatar.hairColor,
              clothesColor: avatar.clothesColor,
            },
          },
        }),
      });

      setTrialResults((results) => [
        ...results,
        { trial: currentTrial + 1, responseTimeMs, points },
      ]);

      if (currentTrial + 1 >= nameCallConfig.totalCalls) {
        await fetch("/api/score", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            sessionId: activeSessionId,
            chapterKey: "ch1_baseline",
            rawPoints: nextTotal,
          }),
        });
        addScore("ch1_baseline", nextTotal);
        goToChapter(1, 2);
        router.push("/chapter-1/level-2");
        return;
      }

      setWaitingForNextCall(true);
      nextCallRef.current = setTimeout(() => {
        completingRef.current = false;
        setWaitingForNextCall(false);
        setCurrentTrial((trial) => trial + 1);
      }, getNextNameCallDelayMs(true, nameCallConfig.intervalMs));
    },
    [addScore, avatar, currentTrial, ensureSession, goToChapter, router],
  );

  useEffect(() => {
    if (phase !== "name" || waitingForNextCall) return undefined;

    completingRef.current = false;
    callStartedAtRef.current = Date.now();
    start();
    timeoutRef.current = setTimeout(() => {
      void logNameTrial(null);
    }, nameCallConfig.intervalMs);

    return () => clearTimeout(timeoutRef.current);
  }, [currentTrial, logNameTrial, phase, start, waitingForNextCall]);

  useEffect(() => {
    return () => {
      clearTimeout(timeoutRef.current);
      clearTimeout(nextCallRef.current);
    };
  }, []);

  async function startNamePhase() {
    const activeSessionId = await ensureSession();
    const avatarData = {
      hair: avatar.hair,
      clothes: avatar.clothes,
      hairColor: avatar.hairColor,
      clothesColor: avatar.clothesColor,
    };
    await fetch(`/api/session/${activeSessionId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ avatarData }),
    });
    totalScoreRef.current = 0;
    completingRef.current = false;
    clearTimeout(timeoutRef.current);
    clearTimeout(nextCallRef.current);
    setTrialResults([]);
    setCurrentTrial(0);
    setWaitingForNextCall(false);
    setPhase("name");
  }

  function handleGuideClick() {
    if (phase !== "name" || waitingForNextCall) return;
    void logNameTrial(stop());
  }

  if (phase === "name") {
    const callText = waitingForNextCall
      ? "Listen for the next call."
      : playerName
        ? `${playerName}, tap Bunny!`
        : "Tap Bunny!";

    return (
      <section className="flex w-full max-w-5xl flex-col items-center gap-8 px-6 py-10 text-center">
        <div className="rounded-2xl bg-white/90 px-8 py-5 shadow-xl">
          <p className="text-lg font-black uppercase text-indigo-700">
            Name Response
          </p>
          <h1 className="mt-2 text-4xl font-black text-zinc-900">{callText}</h1>
          <p className="mt-2 text-lg font-bold text-zinc-600">
            {waitingForNextCall
              ? "Next call starts soon."
              : `Call ${currentTrial + 1} of ${nameCallConfig.totalCalls}`}
          </p>
        </div>

        <AnimalGuide
          guide={guide}
          state={waitingForNextCall ? "idle" : "speaking"}
          onClick={handleGuideClick}
          className="scale-125"
        />

        <div className="flex min-h-12 gap-3">
          {trialResults.map((result) => (
            <span
              key={result.trial}
              className="rounded-full bg-white/90 px-4 py-2 text-sm font-black text-indigo-900 shadow"
            >
              Call {result.trial}: {result.points} pts
            </span>
          ))}
        </div>
      </section>
    );
  }

  return (
    <section className="grid w-full max-w-6xl gap-8 px-6 py-10 lg:grid-cols-[1fr_320px]">
      <div className="rounded-2xl bg-white/90 p-6 shadow-xl">
        <h1 className="text-4xl font-black text-indigo-900">Create an avatar</h1>
        <p className="mt-2 text-lg font-bold text-zinc-600">
          Pick hair, clothes, and colors.
        </p>

        <CustomizerGroup title="Hair style">
          {avatarOptions.hair.map((image, index) => (
            <ImageOption
              key={image}
              image={image}
              label={`Hair ${index + 1}`}
              selected={avatar.hair === index}
              onClick={() => avatar.setHair(index)}
            />
          ))}
        </CustomizerGroup>

        <CustomizerGroup title="Clothes">
          {avatarOptions.clothes.map((image, index) => (
            <ImageOption
              key={image}
              image={image}
              label={`Clothes ${index + 1}`}
              selected={avatar.clothes === index}
              onClick={() => avatar.setClothes(index)}
            />
          ))}
        </CustomizerGroup>

        <CustomizerGroup title="Hair color">
          {avatarOptions.hairColors.map((color, index) => (
            <ColorOption
              key={color}
              color={color}
              selected={avatar.hairColor === index}
              onClick={() => avatar.setHairColor(index)}
            />
          ))}
        </CustomizerGroup>

        <CustomizerGroup title="Clothes color">
          {avatarOptions.clothesColors.map((color, index) => (
            <ColorOption
              key={color}
              color={color}
              selected={avatar.clothesColor === index}
              onClick={() => avatar.setClothesColor(index)}
            />
          ))}
        </CustomizerGroup>
      </div>

      <aside className="flex flex-col items-center justify-center gap-6 rounded-2xl bg-white/70 p-6 shadow-xl">
        <AvatarDisplay />
        <BigButton className="w-full bg-green-500 text-white hover:bg-green-600" onClick={() => void startNamePhase()}>
          Ready!
        </BigButton>
      </aside>
    </section>
  );
}

function CustomizerGroup({ title, children }) {
  return (
    <div className="mt-6">
      <h2 className="mb-3 text-xl font-black text-zinc-900">{title}</h2>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">{children}</div>
    </div>
  );
}

function ImageOption({ image, label, selected, onClick }) {
  return (
    <Button
      type="button"
      variant="secondary"
      className={`h-28 rounded-2xl bg-white p-2 shadow ${
        selected ? "ring-4 ring-indigo-500" : ""
      }`}
      onClick={onClick}
      aria-label={label}
      aria-pressed={selected}
    >
      <SafeImage src={image} alt="" width={96} height={96} className="h-20 w-20 object-contain" />
    </Button>
  );
}

function ColorOption({ color, selected, onClick }) {
  return (
    <button
      type="button"
      className={`h-16 rounded-2xl shadow ${selected ? "ring-4 ring-indigo-500" : ""}`}
      style={{ backgroundColor: color }}
      onClick={onClick}
      aria-label={`Choose ${color}`}
      aria-pressed={selected}
    >
      {selected ? (
        <span className="text-2xl font-black text-white drop-shadow" aria-hidden="true">
          ✓
        </span>
      ) : null}
    </button>
  );
}
