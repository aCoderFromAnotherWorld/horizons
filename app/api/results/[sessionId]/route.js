import { getDomainScoresBySession } from "@/lib/db/queries/domainScores.js";
import { getRedFlagsBySession } from "@/lib/db/queries/redFlags.js";
import { getSession, updateSession } from "@/lib/db/queries/sessions.js";
import { aggregateDomainScores } from "@/lib/scoring/domains.js";
import { calculateCombinedScore, getRiskLevel } from "@/lib/scoring/engine.js";
import { detectAndSaveRedFlags } from "@/lib/scoring/redFlags.js";

async function getSessionId(context) {
  const params = await context.params;
  return params.sessionId;
}

export async function GET(_request, context) {
  try {
    const sessionId = await getSessionId(context);
    const session = getSession(sessionId);
    if (!session) {
      return Response.json({ error: "Session not found" }, { status: 404 });
    }

    const { rawScores } = aggregateDomainScores(sessionId);
    detectAndSaveRedFlags(sessionId);
    const redFlags = getRedFlagsBySession(sessionId);
    const activeRedFlags = redFlags.map((flag) => flag.flagType);
    const combinedScore = calculateCombinedScore(rawScores, activeRedFlags);
    const riskLevel = getRiskLevel(combinedScore);
    const completedSession = updateSession(sessionId, {
      status: "completed",
      completedAt: session.completedAt || Date.now(),
      currentChapter: 9,
      currentLevel: 1,
    });

    return Response.json({
      session: completedSession,
      domainRawScores: rawScores,
      domainScores: getDomainScoresBySession(sessionId),
      combinedScore,
      riskLevel,
      activeRedFlags,
      redFlags,
      recommendation:
        "Please consult a healthcare specialist for a proper evaluation.",
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}
