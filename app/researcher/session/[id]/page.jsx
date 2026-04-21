import Link from "next/link";
import { notFound } from "next/navigation";

import MouseHeatmap from "@/components/researcher/MouseHeatmap";
import { DomainBarChart, ResponseTimeChart } from "@/components/researcher/SessionCharts";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getMovementsBySession } from "@/lib/db/queries/mouseMovements.js";
import { getResponsesBySession } from "@/lib/db/queries/responses.js";
import { getSession } from "@/lib/db/queries/sessions.js";
import {
  formatDate,
  formatDuration,
  getSessionResultsSummary,
  RISK_BADGE_CLASSES,
  summarizeChapterScores,
} from "@/lib/researcher";
import { cn } from "@/lib/utils";

function gaugeRotation(score) {
  return Math.min(180, Math.max(0, (score / 100) * 180));
}

export default async function ResearcherSessionPage({ params }) {
  const { id } = await params;
  const session = getSession(id);
  if (!session) notFound();

  const results = getSessionResultsSummary(id);
  const responses = getResponsesBySession(id);
  const movements = getMovementsBySession(id);
  const chapterScores = summarizeChapterScores(id);
  const rotation = gaugeRotation(results.combinedScore);

  return (
    <main className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 sm:py-8">
      <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <Link className="text-sm font-bold text-primary" href="/researcher">
            Back to dashboard
          </Link>
          <h2 className="mt-2 break-all text-2xl font-black text-foreground sm:text-3xl">
            Session {session.id}
          </h2>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row">
          <Button asChild className="rounded-lg" variant="outline">
            <a href={`/researcher/export?sessionId=${session.id}&format=json`}>
              Export JSON
            </a>
          </Button>
          <Button asChild className="rounded-lg" variant="outline">
            <a href={`/researcher/export?sessionId=${session.id}&format=csv`}>
              Export CSV
            </a>
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader>
            <CardTitle>Date</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="font-bold text-muted-foreground">{formatDate(session.startedAt)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Age</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-black">{session.playerAge ?? "N/A"}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Duration</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-black">
              {formatDuration(session.startedAt, session.completedAt)}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Risk</CardTitle>
          </CardHeader>
          <CardContent>
            <Badge
              className={cn(
                "text-base",
                RISK_BADGE_CLASSES[results.riskLevel] ||
                  RISK_BADGE_CLASSES.unknown,
              )}
            >
              {results.riskLevel}
            </Badge>
          </CardContent>
        </Card>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_360px]">
        <Card>
          <CardHeader>
            <CardTitle>Domain Score Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            <DomainBarChart domainScores={results.domainScores} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Combined Score</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="relative mx-auto h-36 w-64 overflow-hidden sm:h-40 sm:w-72">
              <div className="absolute bottom-0 h-64 w-64 rounded-full border-[24px] border-muted sm:h-72 sm:w-72 sm:border-[28px]" />
              <div className="absolute bottom-0 left-0 h-64 w-64 rounded-full border-[24px] border-primary border-b-transparent border-l-transparent border-r-transparent sm:h-72 sm:w-72 sm:border-[28px]" />
              <div
                className="absolute bottom-0 left-1/2 h-2 w-28 origin-left rounded-full bg-foreground sm:w-32"
                style={{ transform: `rotate(${rotation + 180}deg)` }}
              />
            </div>
            <p className="text-center text-4xl font-black text-foreground">
              {results.combinedScore.toFixed(1)}
            </p>
          </CardContent>
        </Card>
      </div>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Red Flags</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3">
          {results.redFlags.length ? (
            results.redFlags.map((flag) => (
              <Alert
                key={flag.id}
                className={cn(
                  flag.severity === "severe"
                    ? "border-red-300 bg-red-50"
                    : "border-amber-300 bg-amber-50",
                )}
              >
                <AlertTitle>{flag.flagType}</AlertTitle>
                <AlertDescription>{flag.description}</AlertDescription>
              </Alert>
            ))
          ) : (
            <p className="font-bold text-muted-foreground">No red flags recorded.</p>
          )}
        </CardContent>
      </Card>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Chapter Scores</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Chapter</TableHead>
                  <TableHead>Raw Points</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {chapterScores.map((score) => (
                  <TableRow key={score.chapterKey}>
                    <TableCell>{score.label}</TableCell>
                    <TableCell>{score.rawPoints}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Response Time Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponseTimeChart responses={responses} />
          </CardContent>
        </Card>
      </div>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Mouse Movement Heatmap</CardTitle>
        </CardHeader>
        <CardContent>
          <MouseHeatmap movements={movements} />
        </CardContent>
      </Card>
    </main>
  );
}
