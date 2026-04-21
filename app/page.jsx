"use client";

import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import SceneBackground from "@/components/game/SceneBackground";
import BigButton from "@/components/shared/BigButton";
import ThemeToggle from "@/components/shared/ThemeToggle";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Toaster } from "@/components/ui/toaster";
import { toast } from "@/components/ui/use-toast";
import { AGE_OPTIONS, startOnboardingSession } from "@/lib/onboarding";
import { useGameStore } from "@/store/gameStore";

export default function Home() {
  const router = useRouter();
  const { sessionId, currentChapter, currentLevel, setSession } = useGameStore();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [playerName, setPlayerName] = useState("");
  const [playerAge, setPlayerAge] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!sessionId) return;
    toast({
      title: "Active journey found",
      description: `Continue from Chapter ${currentChapter}, Level ${currentLevel}.`,
    });
  }, [sessionId, currentChapter, currentLevel]);

  async function startSession() {
    if (!playerAge || isSubmitting) return;

    setIsSubmitting(true);
    try {
      const data = await startOnboardingSession({ playerAge, playerName });
      setSession(data.sessionId, data.session.playerAge, data.session.playerName);
      router.push(data.route);
    } catch (error) {
      toast({
        title: "Could not start",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <SceneBackground
      src="/assets/backgrounds/main-menu.webp"
      alt="Colorful space background"
      fallbackClassName="from-emerald-50 via-teal-50 to-sky-100"
      overlayClassName="bg-[linear-gradient(135deg,rgb(247_251_245/0.92),rgb(236_253_245/0.72),rgb(240_249_255/0.78))] dark:bg-black/30"
      priority
    >
      <main className="relative flex min-h-dvh flex-col items-center justify-center gap-8 overflow-hidden px-4 py-8 pb-[calc(2rem+env(safe-area-inset-bottom))] pt-[calc(2rem+env(safe-area-inset-top))] font-game text-center sm:gap-10 sm:px-6 sm:py-12">
        <div className="absolute right-4 top-4 z-30 sm:right-6 sm:top-6">
          <ThemeToggle className="rounded-lg bg-card/85 backdrop-blur" />
        </div>
        {[0, 1, 2, 3, 4].map((item) => (
          <motion.div
            key={item}
            className="absolute h-10 w-10 rounded-full bg-emerald-200/35 shadow-lg sm:h-12 sm:w-12"
            style={{
              left: `${12 + item * 18}%`,
              top: `${14 + (item % 3) * 18}%`,
            }}
            animate={{ y: [0, -24, 0], rotate: [0, 15, -10, 0] }}
            transition={{
              duration: 4 + item,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        ))}

        <motion.div
          className="ui-panel max-w-4xl space-y-5 rounded-lg px-6 py-8 sm:px-10 sm:py-10"
          initial={{ opacity: 0, scale: 0.92 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-5xl font-black tracking-normal text-foreground drop-shadow-sm sm:text-7xl lg:text-8xl">
            HORIZONS
          </h1>
          <p className="text-xl font-bold text-muted-foreground sm:text-2xl">
            Ready for today&apos;s adventure?
          </p>
        </motion.div>

        <div className="flex flex-col items-center gap-4">
          <BigButton
            className="min-h-20 bg-primary px-12 text-2xl text-primary-foreground sm:px-16 sm:text-3xl"
            onClick={() => setDialogOpen(true)}
          >
            Play
          </BigButton>
          {sessionId ? (
            <Button
              className="rounded-lg bg-card/90 text-foreground backdrop-blur hover:bg-secondary"
              onClick={() => router.push(`/chapter-${currentChapter}`)}
            >
              Continue
            </Button>
          ) : null}
        </div>

        <Button
          variant="outline"
          className="static rounded-lg bg-card/80 text-foreground backdrop-blur hover:bg-secondary sm:absolute sm:bottom-5 sm:right-5"
          onClick={() => router.push("/researcher")}
        >
          Researcher Dashboard
        </Button>

        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent className="max-w-2xl rounded-lg border border-border bg-card p-5 shadow-2xl sm:p-8">
            <DialogHeader>
              <DialogTitle className="text-3xl font-black text-foreground">
                Who is playing?
              </DialogTitle>
              <DialogDescription className="text-base text-muted-foreground">
                Choose an age so the adventure starts in the right place.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-6">
              <label className="block space-y-2 text-left">
                <span className="text-sm font-bold text-zinc-700">
                  First name, optional
                </span>
                <input
                  value={playerName}
                  onChange={(event) => setPlayerName(event.target.value)}
                  className="h-14 w-full rounded-lg border border-input px-4 text-xl font-semibold outline-none focus:border-ring focus:ring-4 focus:ring-primary/15"
                  placeholder="Name"
                  maxLength={32}
                />
              </label>

              <div className="space-y-3">
                <p className="text-left text-sm font-bold text-muted-foreground">Age</p>
                <div className="grid grid-cols-4 gap-3">
                  {AGE_OPTIONS.map((age) => (
                    <button
                      key={age}
                      type="button"
                      onClick={() => setPlayerAge(age)}
                      aria-pressed={playerAge === age}
                      aria-label={`Choose age ${age === 10 ? "10 or older" : age}`}
                      className={`aspect-square rounded-full text-2xl font-black shadow-md transition ${
                        playerAge === age
                          ? "bg-primary text-primary-foreground ring-4 ring-primary/20"
                          : "bg-secondary text-secondary-foreground hover:brightness-95"
                      }`}
                    >
                      <span>{age === 10 ? "10+" : age}</span>
                      {playerAge === age ? (
                        <span className="ml-1 text-base" aria-hidden="true">
                          ✓
                        </span>
                      ) : null}
                    </button>
                  ))}
                </div>
              </div>

              <BigButton
                className="w-full bg-primary text-2xl text-primary-foreground disabled:opacity-50"
                disabled={!playerAge || isSubmitting}
                onClick={startSession}
              >
                {isSubmitting ? "Starting..." : "Let's Play!"}
              </BigButton>
            </div>
          </DialogContent>
        </Dialog>
      </main>
      <Toaster />
    </SceneBackground>
  );
}
