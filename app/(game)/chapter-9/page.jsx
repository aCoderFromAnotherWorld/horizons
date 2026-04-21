"use client";

import { Loader2 } from "lucide-react";
import SafeImage from "@/components/shared/SafeImage";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";

import BigButton from "@/components/shared/BigButton";
import { useGameStore } from "@/store/gameStore";

export default function Chapter9Page() {
  const router = useRouter();
  const { sessionId, playerAge, playerName, setSession, goToChapter } =
    useGameStore();
  const [phase, setPhase] = useState("intro");
  const [tasks, setTasks] = useState([]);
  const [taskIndex, setTaskIndex] = useState(0);
  const [loadingMessage, setLoadingMessage] = useState("");
  const startedAtRef = useRef(Date.now());
  const activeSessionRef = useRef(null);
  const currentTask = tasks[taskIndex];

  async function ensureSession() {
    if (activeSessionRef.current) return activeSessionRef.current;
    if (sessionId) {
      activeSessionRef.current = sessionId;
      return sessionId;
    }
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
    activeSessionRef.current = data.sessionId;
    return data.sessionId;
  }

  async function startReview() {
    setLoadingMessage("Choosing review games...");
    setPhase("loading");
    const activeSessionId = await ensureSession();
    const response = await fetch(
      `/api/chapter9/tasks?sessionId=${encodeURIComponent(activeSessionId)}`,
    );
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || "Could not sample tasks");
    setTasks(data.tasks);
    setTaskIndex(0);
    startedAtRef.current = Date.now();
    setPhase("review");
  }

  async function chooseOption(option) {
    const activeSessionId = await ensureSession();
    const isCorrect = option.id === currentTask.correctOptionId;
    await fetch("/api/response", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        sessionId: activeSessionId,
        chapter: 9,
        level: 1,
        taskKey: currentTask.taskKey,
        startedAt: startedAtRef.current,
        responseTimeMs: Date.now() - startedAtRef.current,
        selection: option.id,
        isCorrect,
        attemptNumber: 1,
        scorePoints: 0,
        extraData: {
          sourceChapter: currentTask.sourceChapter,
          sourceChapterKey: currentTask.chapterKey,
          originalTaskId: currentTask.id,
          consistencyReview: true,
        },
      }),
    });

    if (taskIndex + 1 >= tasks.length) {
      setLoadingMessage("Scoring your journey...");
      setPhase("loading");
      await fetch(`/api/results/${encodeURIComponent(activeSessionId)}`);
      goToChapter(9, 1);
      router.push(`/results?sessionId=${encodeURIComponent(activeSessionId)}`);
      return;
    }

    setTaskIndex((index) => index + 1);
    startedAtRef.current = Date.now();
  }

  if (phase === "intro") {
    return (
      <section className="mx-auto max-w-4xl px-6 py-16 text-center">
        <div className="rounded-2xl bg-white/90 p-10 shadow-xl">
          <p className="text-sm font-black uppercase text-violet-700">
            Final review
          </p>
          <h1 className="mt-4 text-5xl font-black text-zinc-900">
            Almost done! Let's do a quick review!
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-xl font-bold text-zinc-600">
            A few short games help the detective check the patterns one more time.
          </p>
          <BigButton
            className="mt-8 bg-green-500 text-white hover:bg-green-600"
            onClick={() => void startReview()}
          >
            Start review
          </BigButton>
        </div>
      </section>
    );
  }

  if (phase === "loading" || !currentTask) {
    return (
      <section className="grid min-h-[420px] place-items-center px-6">
        <div className="rounded-2xl bg-white/90 p-10 text-center shadow-xl">
          <Loader2 className="mx-auto h-14 w-14 animate-spin text-violet-700" />
          <p className="mt-5 text-2xl font-black text-zinc-900">
            {loadingMessage || "Loading..."}
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="mx-auto grid w-full max-w-6xl gap-8 px-6 py-10 lg:grid-cols-[1fr_420px]">
      <div className="rounded-2xl bg-white/90 p-8 shadow-xl">
        <p className="text-sm font-black uppercase text-violet-700">
          Review {taskIndex + 1} of {tasks.length}
        </p>
        <h1 className="mt-2 text-4xl font-black text-zinc-900">
          {currentTask.prompt}
        </h1>
        <div className="mt-8 grid min-h-80 place-items-center rounded-2xl bg-violet-100 p-8">
          <SafeImage
            src={currentTask.imagePath}
            alt=""
            width={260}
            height={260}
            className="h-64 w-64 object-contain drop-shadow-xl"
          />
        </div>
      </div>

      <aside className="rounded-2xl bg-white/90 p-6 shadow-xl">
        <h2 className="text-3xl font-black text-zinc-900">Choose one</h2>
        <div className="mt-6 grid gap-4">
          {currentTask.options.map((option) => (
            <button
              key={option.id}
              type="button"
              className="grid min-h-24 grid-cols-[72px_1fr] items-center gap-4 rounded-2xl bg-white p-4 text-left shadow-lg transition hover:scale-105"
              onClick={() => void chooseOption(option)}
            >
              <SafeImage
                src={option.imagePath}
                alt=""
                width={72}
                height={72}
                className="h-16 w-16 object-contain"
              />
              <span className="text-lg font-black text-zinc-900">
                {option.label}
              </span>
            </button>
          ))}
        </div>
      </aside>
    </section>
  );
}
