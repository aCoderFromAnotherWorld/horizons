"use client";

import { motion } from "framer-motion";
import SafeImage from "@/components/shared/SafeImage";
import { useRouter } from "next/navigation";
import { useMemo, useRef, useState } from "react";

import BigButton from "@/components/shared/BigButton";
import { patternSequences } from "@/lib/gameData/chapter7";
import {
  getExpectedPatternItem,
  scorePatternChange,
  shouldFlagRigidPatternDistress,
} from "@/lib/scoring/chapter7";
import { useGameStore } from "@/store/gameStore";

export default function Chapter7Level1Page() {
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
  const [patternIndex, setPatternIndex] = useState(0);
  const [phase, setPhase] = useState("complete");
  const [placedItems, setPlacedItems] = useState([]);
  const [wrongChoiceId, setWrongChoiceId] = useState(null);
  const [distressAtChange, setDistressAtChange] = useState(false);
  const [totalPoints, setTotalPoints] = useState(0);
  const startedAtRef = useRef(Date.now());
  const changeStartedAtRef = useRef(Date.now());
  const lockedRef = useRef(false);
  const pattern = patternSequences[patternIndex];

  const visibleItems = useMemo(() => {
    const shown = pattern.sequence.slice(
      0,
      pattern.sequence.length - pattern.missingCount,
    );
    return [...shown, ...placedItems];
  }, [pattern, placedItems]);

  const displayItems = useMemo(() => {
    if (phase !== "glitch" || !visibleItems.length) return visibleItems;
    const glitched = [...visibleItems];
    glitched[Math.max(0, glitched.length - 2)] = pattern.glitchReplacement;
    return glitched;
  }, [phase, pattern, visibleItems]);

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

  function choosePatternItem(item) {
    if (phase !== "complete" || lockedRef.current) return;
    const expected = getExpectedPatternItem(pattern, placedItems.length);
    if (!expected || item.id !== expected.id) {
      setWrongChoiceId(item.id);
      setTimeout(() => setWrongChoiceId(null), 500);
      return;
    }

    const nextPlaced = [...placedItems, item];
    setPlacedItems(nextPlaced);
    if (nextPlaced.length === pattern.missingCount) {
      setTimeout(() => setPhase("glitch"), 500);
    }
  }

  function reactToGlitch(isDistressed) {
    setDistressAtChange(isDistressed);
    changeStartedAtRef.current = Date.now();
    setPhase("change");
  }

  async function commitPatternDecision({ returnedToFirstPattern, refusedNewPattern }) {
    if (lockedRef.current) return;
    lockedRef.current = true;
    const activeSessionId = await ensureSession();
    const newPatternDelayMs = Date.now() - changeStartedAtRef.current;
    const points = scorePatternChange({
      distressAtChange,
      refusedNewPattern,
      newPatternDelayMs,
      returnedToFirstPattern,
    });
    const nextTotal = totalPoints + points;
    setTotalPoints(nextTotal);
    const flagPayload = {
      distressAtChange,
      returnedToFirstPattern,
    };

    await fetch("/api/response", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        sessionId: activeSessionId,
        chapter: 7,
        level: 1,
        taskKey: `ch7_pattern_${pattern.id}`,
        startedAt: startedAtRef.current,
        responseTimeMs: Date.now() - startedAtRef.current,
        selection: {
          responseType: distressAtChange ? "rigid_distress" : "acceptance",
          returnedToFirstPattern,
          refusedNewPattern,
        },
        isCorrect: !distressAtChange && !returnedToFirstPattern && !refusedNewPattern,
        attemptNumber: 1,
        scorePoints: points,
        extraData: {
          patternType: pattern.id,
          newPatternDelayMs,
          rigidPatternPlusDistress: shouldFlagRigidPatternDistress(flagPayload),
          ...flagPayload,
        },
      }),
    });

    if (shouldFlagRigidPatternDistress(flagPayload)) {
      const flag = {
        flagType: "rigid_pattern_plus_distress_at_change",
        description: "Distress at forced pattern change plus return to first pattern.",
        severity: "severe",
      };
      await fetch("/api/flag", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId: activeSessionId, ...flag }),
      });
      addRedFlag(flag);
    }

    setTimeout(async () => {
      if (patternIndex + 1 >= patternSequences.length) {
        await fetch("/api/score", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            sessionId: activeSessionId,
            chapterKey: "ch7_pattern",
            rawPoints: nextTotal,
          }),
        });
        addScore("ch7_pattern", nextTotal);
        goToChapter(7, 2);
        router.push("/chapter-7/level-2");
        return;
      }

      setPatternIndex((index) => index + 1);
      setPlacedItems([]);
      setWrongChoiceId(null);
      setDistressAtChange(false);
      startedAtRef.current = Date.now();
      lockedRef.current = false;
      setPhase("complete");
    }, 700);
  }

  return (
    <section className="mx-auto grid w-full max-w-6xl gap-8 px-6 py-10 lg:grid-cols-[1fr_360px]">
      <div className="rounded-2xl bg-white/90 p-8 shadow-xl">
        <p className="text-sm font-black uppercase text-violet-700">
          Pattern {patternIndex + 1} of {patternSequences.length}
        </p>
        <h1 className="mt-2 text-4xl font-black text-zinc-900">
          {pattern.label}
        </h1>
        <p className="mt-2 text-lg font-bold text-zinc-600">
          Finish the pattern, then try the new one.
        </p>

        <div className="mt-8 flex min-h-36 flex-wrap items-center gap-4 rounded-2xl bg-violet-100 p-5">
          {displayItems.map((item, index) => (
            <motion.div
              key={`${item.id}-${index}-${phase}`}
              className="grid h-24 w-24 place-items-center rounded-2xl bg-white shadow-lg"
              animate={
                phase === "glitch" && index === Math.max(0, displayItems.length - 2)
                  ? { x: [-5, 5, -5, 0], rotate: [-5, 5, -5, 0] }
                  : {}
              }
            >
              <SafeImage src={item.imagePath} alt="" width={72} height={72} />
            </motion.div>
          ))}
          {Array.from({ length: pattern.missingCount - placedItems.length }).map(
            (_, index) => (
              <div
                key={`empty-${index}`}
                className="grid h-24 w-24 place-items-center rounded-2xl border-4 border-dashed border-violet-300 bg-white/70 text-3xl font-black text-violet-400"
              >
                ?
              </div>
            ),
          )}
        </div>

        {phase === "complete" ? (
          <div className="mt-8 flex flex-wrap gap-4">
            {pattern.options.map((item) => (
              <button
                key={item.id}
                type="button"
                className={`grid h-28 w-28 place-items-center rounded-2xl bg-white p-4 shadow-xl transition hover:scale-105 ${
                  wrongChoiceId === item.id ? "ring-4 ring-red-400" : ""
                }`}
                onClick={() => choosePatternItem(item)}
              >
                <SafeImage src={item.imagePath} alt="" width={76} height={76} />
                <span className="sr-only">{item.label}</span>
              </button>
            ))}
          </div>
        ) : null}

        {phase === "glitch" ? (
          <div className="mt-8 rounded-2xl bg-amber-100 p-5">
            <h2 className="text-2xl font-black text-zinc-900">
              Oops! A wrong piece snuck in!
            </h2>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <BigButton
                className="bg-red-500 text-white hover:bg-red-600"
                onClick={() => reactToGlitch(true)}
              >
                It's wrong, fix it!
              </BigButton>
              <BigButton
                className="bg-green-500 text-white hover:bg-green-600"
                onClick={() => reactToGlitch(false)}
              >
                That's okay
              </BigButton>
            </div>
          </div>
        ) : null}
      </div>

      <aside className="flex flex-col justify-center rounded-2xl bg-white/90 p-6 shadow-xl">
        <h2 className="text-3xl font-black text-zinc-900">Detective notes</h2>
        <p className="mt-3 text-lg font-bold text-zinc-600">
          Points so far: {totalPoints}
        </p>
        {phase === "change" ? (
          <div className="mt-6 grid gap-3">
            <p className="text-lg font-bold text-zinc-700">
              The pattern is changing. What should happen next?
            </p>
            <BigButton
              className="bg-violet-600 text-white hover:bg-violet-700"
              onClick={() =>
                void commitPatternDecision({
                  returnedToFirstPattern: false,
                  refusedNewPattern: false,
                })
              }
            >
              Try the new pattern
            </BigButton>
            <BigButton
              className="bg-amber-500 text-white hover:bg-amber-600"
              onClick={() =>
                void commitPatternDecision({
                  returnedToFirstPattern: true,
                  refusedNewPattern: false,
                })
              }
            >
              Go back to the first pattern
            </BigButton>
            <BigButton
              className="bg-zinc-700 text-white hover:bg-zinc-800"
              onClick={() =>
                void commitPatternDecision({
                  returnedToFirstPattern: false,
                  refusedNewPattern: true,
                })
              }
            >
              I don't want a new pattern
            </BigButton>
          </div>
        ) : (
          <p className="mt-6 text-lg font-bold text-zinc-600">
            Complete the missing spaces to continue.
          </p>
        )}
      </aside>
    </section>
  );
}
