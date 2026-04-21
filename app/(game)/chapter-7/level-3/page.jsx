"use client";

import SafeImage from "@/components/shared/SafeImage";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";

import BigButton from "@/components/shared/BigButton";
import { topicBooks } from "@/lib/gameData/chapter7";
import { scoreSpecialInterest } from "@/lib/scoring/chapter7";
import { useGameStore } from "@/store/gameStore";

const NEW_BOOK_PROMPTS = 4;

export default function Chapter7Level3Page() {
  const router = useRouter();
  const { sessionId, playerAge, playerName, setSession, addScore, goToChapter } =
    useGameStore();
  const [activeBook, setActiveBook] = useState(null);
  const [selections, setSelections] = useState([]);
  const [factCountsByTopic, setFactCountsByTopic] = useState({});
  const [factsReadThisVisit, setFactsReadThisVisit] = useState(0);
  const [promptCount, setPromptCount] = useState(0);
  const [promptNewBook, setPromptNewBook] = useState(false);
  const [transitionDelaysMs, setTransitionDelaysMs] = useState([]);
  const [returnToSameCount, setReturnToSameCount] = useState(0);
  const [locked, setLocked] = useState(false);
  const startedAtRef = useRef(Date.now());
  const promptStartedAtRef = useRef(null);
  const lastPromptTopicRef = useRef(null);

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

  function chooseBook(book) {
    if (locked) return;
    if (promptNewBook && promptStartedAtRef.current) {
      setTransitionDelaysMs((current) => [
        ...current,
        Date.now() - promptStartedAtRef.current,
      ]);
      if (book.id === lastPromptTopicRef.current) {
        setReturnToSameCount((count) => count + 1);
      }
    }

    setSelections((current) => [...current, book.id]);
    setActiveBook(book);
    setFactsReadThisVisit(0);
    setPromptNewBook(false);
  }

  function readNextFact() {
    if (!activeBook || locked) return;
    const nextVisitCount = factsReadThisVisit + 1;
    setFactCountsByTopic((current) => ({
      ...current,
      [activeBook.id]: (current[activeBook.id] || 0) + 1,
    }));
    setFactsReadThisVisit(nextVisitCount);

    if (nextVisitCount >= 5) {
      const nextPromptCount = promptCount + 1;
      setPromptCount(nextPromptCount);
      setPromptNewBook(true);
      promptStartedAtRef.current = Date.now();
      lastPromptTopicRef.current = activeBook.id;
      setActiveBook(null);
    }
  }

  async function finishBooks() {
    if (locked) return;
    setLocked(true);
    const activeSessionId = await ensureSession();
    const scoring = scoreSpecialInterest({
      selections,
      factCountsByTopic,
      transitionDelaysMs,
      returnToSameCount,
    });

    await fetch("/api/response", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        sessionId: activeSessionId,
        chapter: 7,
        level: 3,
        taskKey: "ch7_special_interest",
        startedAt: startedAtRef.current,
        responseTimeMs: Date.now() - startedAtRef.current,
        selection: selections,
        isCorrect: scoring.points === 0,
        attemptNumber: 1,
        scorePoints: scoring.points,
        extraData: {
          ...scoring,
          factCountsByTopic,
          transitionDelaysMs,
        },
      }),
    });

    await fetch("/api/score", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        sessionId: activeSessionId,
        chapterKey: "ch7_pattern",
        rawPoints: scoring.points,
      }),
    });
    addScore("ch7_pattern", scoring.points);
    goToChapter(8, 1);
    router.push("/chapter-8");
  }

  const activeFactIndex = activeBook
    ? factCountsByTopic[activeBook.id] || 0
    : 0;
  const canFinish = promptNewBook && promptCount >= NEW_BOOK_PROMPTS;

  return (
    <section className="mx-auto grid w-full max-w-6xl gap-8 px-6 py-10 lg:grid-cols-[1fr_360px]">
      <div className="rounded-2xl bg-white/90 p-8 shadow-xl">
        <p className="text-sm font-black uppercase text-sky-700">
          Topic books
        </p>
        <h1 className="mt-2 text-4xl font-black text-zinc-900">
          Special Interest Library
        </h1>

        {!activeBook ? (
          <>
            <p className="mt-3 text-lg font-bold text-zinc-600">
              {promptNewBook
                ? "Time for a new book!"
                : "Choose a book to start reading."}
            </p>
            <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {topicBooks.map((book) => (
                <button
                  key={book.id}
                  type="button"
                  className="rounded-2xl bg-sky-50 p-4 text-center shadow-xl transition hover:scale-105"
                  disabled={locked}
                  onClick={() => chooseBook(book)}
                >
                  <SafeImage
                    src={book.coverImagePath}
                    alt=""
                    width={150}
                    height={150}
                    className="mx-auto h-28 w-28 object-contain"
                  />
                  <p className="mt-3 text-xl font-black text-zinc-900">
                    {book.topic}
                  </p>
                </button>
              ))}
            </div>
            {canFinish ? (
              <BigButton
                className="mt-6 w-full bg-green-500 text-white hover:bg-green-600"
                disabled={locked}
                onClick={() => void finishBooks()}
              >
                Finish books
              </BigButton>
            ) : null}
          </>
        ) : (
          <div className="mt-8 rounded-2xl bg-sky-100 p-8">
            <div className="grid gap-6 md:grid-cols-[180px_1fr]">
              <SafeImage
                src={activeBook.coverImagePath}
                alt=""
                width={180}
                height={180}
                className="h-44 w-44 object-contain"
              />
              <div>
                <h2 className="text-3xl font-black text-zinc-900">
                  {activeBook.topic}
                </h2>
                <p className="mt-4 text-2xl font-black leading-snug text-zinc-800">
                  {activeBook.facts[activeFactIndex % activeBook.facts.length]}
                </p>
                <BigButton
                  className="mt-6 bg-sky-600 text-white hover:bg-sky-700"
                  disabled={locked}
                  onClick={readNextFact}
                >
                  Next fact
                </BigButton>
              </div>
            </div>
          </div>
        )}
      </div>

      <aside className="flex flex-col justify-center rounded-2xl bg-white/90 p-6 shadow-xl">
        <h2 className="text-3xl font-black text-zinc-900">Reading notes</h2>
        <p className="mt-3 text-lg font-bold text-zinc-600">
          New-book prompts: {promptCount} of {NEW_BOOK_PROMPTS}
        </p>
        <p className="mt-2 text-lg font-bold text-zinc-600">
          Returns to same topic: {returnToSameCount}
        </p>
        <div className="mt-5 space-y-2 rounded-2xl bg-sky-50 p-4">
          {topicBooks.map((book) => (
            <div key={book.id} className="flex justify-between text-sm font-black">
              <span>{book.topic}</span>
              <span>{factCountsByTopic[book.id] || 0} facts</span>
            </div>
          ))}
        </div>
      </aside>
    </section>
  );
}
