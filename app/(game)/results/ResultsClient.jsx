"use client";

import { Loader2 } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

import ConfettiBlast from "@/components/shared/ConfettiBlast";
import BigButton from "@/components/shared/BigButton";
import ThemeToggle from "@/components/shared/ThemeToggle";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useGameStore } from "@/store/gameStore";

const DOMAIN_LABELS = {
  social_communication: "Social communication",
  restricted_repetitive: "Patterns and flexibility",
  sensory_processing: "Sensory processing",
  pretend_play: "Pretend play",
};

function childMedalForRisk(riskLevel) {
  if (riskLevel === "low") return "Gold star helper";
  if (riskLevel === "medium") return "Brave explorer";
  if (riskLevel === "high") return "Careful detective";
  return "Finished the journey";
}

export default function ResultsClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { sessionId: storeSessionId, reset } = useGameStore();
  const sessionId = searchParams.get("sessionId") || storeSessionId;
  const [results, setResults] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!sessionId) {
      setError("No session was found.");
      return;
    }
    let cancelled = false;
    async function loadResults() {
      const response = await fetch(`/api/results/${encodeURIComponent(sessionId)}`);
      const data = await response.json();
      if (cancelled) return;
      if (!response.ok) {
        setError(data.error || "Could not load results.");
        return;
      }
      setResults(data);
    }
    void loadResults();
    return () => {
      cancelled = true;
    };
  }, [sessionId]);

  function playAgain() {
    reset();
    router.push("/");
  }

  if (error) {
    return (
      <section className="responsive-section max-w-3xl text-center">
        <Card>
          <CardHeader>
            <CardTitle>Results unavailable</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-lg font-bold text-muted-foreground">{error}</p>
            <BigButton className="mt-6" onClick={() => router.push("/")}>
              Go home
            </BigButton>
          </CardContent>
        </Card>
      </section>
    );
  }

  if (!results) {
    return (
      <section className="grid min-h-[420px] place-items-center px-6">
        <div className="ui-panel rounded-lg p-10 text-center">
          <Loader2 className="mx-auto h-14 w-14 animate-spin text-primary" />
          <p className="mt-5 text-2xl font-black text-foreground">
            Preparing results...
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="w-full">
      <ConfettiBlast />
      <div className="mx-auto max-w-5xl px-4 py-10 text-center sm:px-6 sm:py-16">
        <div className="mb-4 flex justify-end">
          <ThemeToggle className="rounded-lg bg-card/85" />
        </div>
        <div className="ui-panel rounded-lg p-6 sm:p-10">
          <p className="text-7xl" aria-hidden="true">
            🏅
          </p>
          <h1 className="mt-4 text-4xl font-black text-foreground sm:text-5xl">
            All done! 🎉
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-xl font-black text-primary sm:text-2xl">
            {childMedalForRisk(results.riskLevel)}
          </p>
          <div className="mt-6 flex justify-center gap-2 text-4xl" aria-label="Five stars">
            <span>★</span>
            <span>★</span>
            <span>★</span>
            <span>★</span>
            <span>★</span>
          </div>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <BigButton
              className="bg-primary text-primary-foreground"
              onClick={playAgain}
            >
              Play Again
            </BigButton>
            <BigButton
              className="bg-secondary text-secondary-foreground"
              asChild
            >
              <Link href={`/researcher/session/${results.session.id}`}>
                See Full Report
              </Link>
            </BigButton>
          </div>
        </div>

        <div className="mt-12 grid gap-5 text-left md:grid-cols-2">
          {results.domainScores.map((domain) => (
            <Card key={domain.domain}>
              <CardHeader>
                <CardTitle className="flex items-center justify-between gap-3">
                  <span>{DOMAIN_LABELS[domain.domain] || domain.domain}</span>
                  <Badge>{domain.riskLevel}</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-lg font-bold text-foreground">
                  Raw score: {domain.rawScore} / {domain.maxScore}
                </p>
                <p className="mt-2 text-base font-bold text-muted-foreground">
                  Weighted contribution: {domain.weightedScore}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card className="mt-8 text-left">
          <CardHeader>
            <CardTitle>Recommendation</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-lg font-bold text-foreground">
              {results.recommendation}
            </p>
            <p className="mt-4 text-sm font-bold text-muted-foreground">
              Horizons is a screening aid only, not a diagnostic tool.
            </p>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
