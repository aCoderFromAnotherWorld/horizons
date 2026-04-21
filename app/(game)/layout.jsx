"use client";

import { Home } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import ThemeToggle from "@/components/shared/ThemeToggle";

const CHAPTER_TITLES = {
  1: "Welcome to My World",
  2: "Emotion Island",
  3: "Friend's House Visit",
  4: "Daily Routines Village",
  5: "Pretend Play Theater",
  6: "Sensory Garden",
  7: "Pattern Detective",
  8: "Copy Cat Challenge",
  9: "Assessment Summary",
};

const CHAPTER_ACCENTS = {
  1: "rgb(251 191 36 / 0.18)",
  2: "rgb(20 184 166 / 0.18)",
  3: "rgb(56 189 248 / 0.18)",
  4: "rgb(245 158 11 / 0.16)",
  5: "rgb(236 72 153 / 0.14)",
  6: "rgb(16 185 129 / 0.2)",
  7: "rgb(99 102 241 / 0.16)",
  8: "rgb(14 165 233 / 0.16)",
  9: "rgb(52 211 153 / 0.2)",
};

function getChapterFromPath(pathname) {
  if (pathname.includes("/results")) return 9;
  const match = pathname.match(/chapter-(\d+)/);
  return match ? Number(match[1]) : 1;
}

export default function GameLayout({ children }) {
  const router = useRouter();
  const pathname = usePathname();
  const chapter = getChapterFromPath(pathname);
  const isResults = pathname.includes("/results");
  const progress = Math.min(100, Math.max(0, (chapter / 9) * 100));

  return (
    <div
      className="game-page font-game"
      style={{
        background:
          `radial-gradient(circle at 20% 0%, ${CHAPTER_ACCENTS[chapter] || CHAPTER_ACCENTS[1]}, transparent 28rem), radial-gradient(circle at 90% 12%, rgb(125 211 252 / 0.12), transparent 32rem), linear-gradient(135deg, var(--background), var(--game-bg))`,
      }}
    >
      <header className="sticky top-0 z-40 border-b border-border bg-card/82 px-3 py-3 backdrop-blur-xl sm:px-4">
        <div className="mx-auto flex max-w-6xl items-center gap-3 sm:gap-4">
          <Button
            variant="ghost"
            size="icon"
            className="shrink-0 rounded-lg"
            onClick={() => router.push("/")}
            aria-label="Go home"
          >
            <Home className="h-5 w-5" />
          </Button>
          <div className="min-w-0 flex-1">
            <div className="grid gap-1 sm:flex sm:items-center sm:justify-between sm:gap-3">
              <h1 className="truncate text-base font-black text-foreground sm:text-xl">
                {isResults ? "Assessment Results" : CHAPTER_TITLES[chapter] || "Horizons"}
              </h1>
              <span className="text-xs font-bold text-muted-foreground sm:text-sm">
                {isResults ? "Complete" : `Chapter ${chapter} of 9`}
              </span>
            </div>
            <Progress value={progress} className="mt-2 h-2 bg-muted sm:h-3" />
          </div>
          <ThemeToggle className="shrink-0 rounded-lg" showLabel={false} />
        </div>
      </header>
      <main className="flex min-h-[calc(100dvh-76px)] items-center justify-center overflow-x-hidden">
        {children}
      </main>
    </div>
  );
}
