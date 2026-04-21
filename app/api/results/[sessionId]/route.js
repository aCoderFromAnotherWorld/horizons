import { getDomainScoresBySession } from "@/lib/db/queries/domainScores.js";
import { getRedFlagsBySession } from "@/lib/db/queries/redFlags.js";
import { getSession, updateSession } from "@/lib/db/queries/sessions.js";
import { aggregateDomainScores } from "@/lib/scoring/domains.js";
import { calculateCombinedScore, getRiskLevel } from "@/lib/scoring/engine.js";
import { detectAndSaveRedFlags } from "@/lib/scoring/redFlags.js";
import { upsertMlPrediction } from "@/lib/db/queries/mlPredictions.js";
import { extractFeatureVector } from "@/lib/ml/featureExtractor.js";
import { callMlService, getConsensusRisk } from "@/lib/ml/mlClient.js";

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
    const { featureNames, featureVector } = extractFeatureVector(sessionId);
    let ml;

    try {
      if (!process.env.ML_SERVICE_URL) {
        throw new Error("ML_SERVICE_URL is not configured");
      }

      const prediction = await callMlService(featureVector);
      const consensusRisk = getConsensusRisk(
        riskLevel,
        prediction.asd_probability,
      );
      ml = upsertMlPrediction({
        sessionId,
        modelVersion: prediction.model_version || "unknown",
        modelType: prediction.model_type || "unknown",
        asdProbability: prediction.asd_probability,
        confidence: prediction.confidence,
        consensusRisk,
        featureVector,
        featureNames,
        shapValues: prediction.shap_values,
        predictedAt: Date.now(),
        inferenceMs: prediction.inference_ms,
        serviceAvailable: true,
      });
    } catch (error) {
      ml = {
        ...upsertMlPrediction({
          sessionId,
          modelVersion: "unavailable",
          modelType: "none",
          asdProbability: 0,
          confidence: 0,
          consensusRisk: riskLevel,
          featureVector,
          featureNames,
          shapValues: null,
          predictedAt: Date.now(),
          inferenceMs: null,
          serviceAvailable: false,
        }),
        error: error.message,
      };
    }

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
      ml,
      recommendation:
        "Please consult a healthcare specialist for a proper evaluation.",
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}
