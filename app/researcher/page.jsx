import Link from "next/link";

import DashboardCharts from "@/components/researcher/DashboardCharts";
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
import { listSessions } from "@/lib/db/queries/sessions.js";
import {
  formatDate,
  getSessionResultsSummary,
  RISK_BADGE_CLASSES,
} from "@/lib/researcher";
import { cn } from "@/lib/utils";

export default function ResearcherPage() {
  const sessions = listSessions();
  const rows = sessions.map((session) => ({
    session,
    results: getSessionResultsSummary(session.id),
  }));
  const riskDistribution = rows.reduce(
    (counts, row) => {
      counts[row.results.riskLevel] = (counts[row.results.riskLevel] || 0) + 1;
      return counts;
    },
    { low: 0, medium: 0, high: 0, very_high: 0 },
  );
  const averageScore = rows.length
    ? rows.reduce((sum, row) => sum + row.results.combinedScore, 0) / rows.length
    : 0;

  return (
    <main className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 sm:py-8">
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Total Sessions</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-black text-foreground">{sessions.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Average Score</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-black text-foreground">
              {averageScore.toFixed(1)}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Risk Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <DashboardCharts riskDistribution={riskDistribution} />
          </CardContent>
        </Card>
      </div>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Sessions</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Age</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Combined Score</TableHead>
                <TableHead>Risk Level</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map(({ session, results }) => (
                <TableRow key={session.id}>
                  <TableCell>{formatDate(session.startedAt)}</TableCell>
                  <TableCell>{session.playerName || "Anonymous"}</TableCell>
                  <TableCell>{session.playerAge ?? "N/A"}</TableCell>
                  <TableCell className="capitalize">{session.status}</TableCell>
                  <TableCell>{results.combinedScore.toFixed(1)}</TableCell>
                  <TableCell>
                    <Badge
                      className={cn(
                        RISK_BADGE_CLASSES[results.riskLevel] ||
                          RISK_BADGE_CLASSES.unknown,
                      )}
                    >
                      {results.riskLevel}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Button asChild className="rounded-lg" size="sm">
                      <Link href={`/researcher/session/${session.id}`}>
                        View Details
                      </Link>
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </main>
  );
}
