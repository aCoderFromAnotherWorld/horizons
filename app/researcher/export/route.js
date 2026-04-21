import { getDomainScoresBySession } from "@/lib/db/queries/domainScores.js";
import { getMovementsBySession } from "@/lib/db/queries/mouseMovements.js";
import { getRedFlagsBySession } from "@/lib/db/queries/redFlags.js";
import { getResponsesBySession } from "@/lib/db/queries/responses.js";
import { getScoresBySession } from "@/lib/db/queries/scores.js";
import { getSession, listSessions } from "@/lib/db/queries/sessions.js";
import {
  buildTrainingRows,
  getTrainingDataQuality,
  parseLabelMap,
  trainingRowsToCsv,
} from "@/lib/ml/trainingExport.js";
import { getSessionResultsSummary } from "@/lib/researcher.js";

function csvEscape(value) {
  if (value === null || value === undefined) return "";
  const stringValue =
    typeof value === "object" ? JSON.stringify(value) : String(value);
  return `"${stringValue.replaceAll('"', '""')}"`;
}

function csvForResponses(responses) {
  const headers = [
    "id",
    "sessionId",
    "chapter",
    "level",
    "taskKey",
    "startedAt",
    "responseTimeMs",
    "selection",
    "isCorrect",
    "attemptNumber",
    "scorePoints",
    "extraData",
  ];
  const rows = responses.map((response) =>
    headers.map((header) => csvEscape(response[header])).join(","),
  );
  return [headers.join(","), ...rows].join("\n");
}

export async function GET(request) {
  try {
    const url = new URL(request.url);
    const sessionId = url.searchParams.get("sessionId");
    const format = url.searchParams.get("format") || "json";
    if (format === "training-csv" || format === "training-quality") {
      const labelBySessionId = parseLabelMap(url.searchParams.get("labels"));
      const rows = buildTrainingRows({
        sessions: listSessions(),
        labelBySessionId,
      });

      if (!rows.length) {
        return Response.json(
          { error: "No labeled sessions found for training export" },
          { status: 400 },
        );
      }

      if (format === "training-quality") {
        return Response.json(getTrainingDataQuality(rows));
      }

      return new Response(trainingRowsToCsv(rows), {
        headers: {
          "Content-Type": "text/csv; charset=utf-8",
          "Content-Disposition": 'attachment; filename="horizons-training.csv"',
        },
      });
    }

    if (!sessionId) {
      return Response.json({ error: "sessionId is required" }, { status: 400 });
    }

    const session = getSession(sessionId);
    if (!session) {
      return Response.json({ error: "Session not found" }, { status: 404 });
    }

    const responses = getResponsesBySession(sessionId);
    const payload = {
      session,
      results: getSessionResultsSummary(sessionId),
      responses,
      scores: getScoresBySession(sessionId),
      redFlags: getRedFlagsBySession(sessionId),
      domainScores: getDomainScoresBySession(sessionId),
      mouseMovements: getMovementsBySession(sessionId),
    };

    if (format === "csv") {
      return new Response(csvForResponses(responses), {
        headers: {
          "Content-Type": "text/csv; charset=utf-8",
          "Content-Disposition": `attachment; filename="horizons-${sessionId}-responses.csv"`,
        },
      });
    }

    if (format !== "json") {
      return Response.json({ error: "Unsupported format" }, { status: 400 });
    }

    return new Response(JSON.stringify(payload, null, 2), {
      headers: {
        "Content-Type": "application/json; charset=utf-8",
        "Content-Disposition": `attachment; filename="horizons-${sessionId}.json"`,
      },
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}
