import { getDb } from "@/lib/db/index.js";

function parseJson(value) {
  if (!value) return null;
  return JSON.parse(value);
}

function serializeJson(value) {
  if (value === undefined || value === null) return null;
  return JSON.stringify(value);
}

function mapPrediction(row) {
  if (!row) return null;
  return {
    id: row.id,
    sessionId: row.session_id,
    modelVersion: row.model_version,
    modelType: row.model_type,
    asdProbability: row.asd_probability,
    confidence: row.confidence,
    consensusRisk: row.consensus_risk,
    featureVector: parseJson(row.feature_vector),
    featureNames: parseJson(row.feature_names),
    shapValues: parseJson(row.shap_values),
    predictedAt: row.predicted_at,
    inferenceMs: row.inference_ms,
    serviceAvailable: Boolean(row.service_available),
  };
}

/**
 * Inserts or replaces the ML prediction for a session.
 */
export function upsertMlPrediction(data) {
  getDb()
    .query(
      `INSERT INTO ml_predictions (
        session_id, model_version, model_type, asd_probability, confidence,
        consensus_risk, feature_vector, feature_names, shap_values,
        predicted_at, inference_ms, service_available
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(session_id) DO UPDATE SET
        model_version = excluded.model_version,
        model_type = excluded.model_type,
        asd_probability = excluded.asd_probability,
        confidence = excluded.confidence,
        consensus_risk = excluded.consensus_risk,
        feature_vector = excluded.feature_vector,
        feature_names = excluded.feature_names,
        shap_values = excluded.shap_values,
        predicted_at = excluded.predicted_at,
        inference_ms = excluded.inference_ms,
        service_available = excluded.service_available`,
    )
    .run(
      data.sessionId,
      data.modelVersion,
      data.modelType,
      data.asdProbability,
      data.confidence,
      data.consensusRisk,
      serializeJson(data.featureVector),
      serializeJson(data.featureNames),
      serializeJson(data.shapValues),
      data.predictedAt ?? Date.now(),
      data.inferenceMs ?? null,
      data.serviceAvailable === false ? 0 : 1,
    );

  return getMlPredictionBySession(data.sessionId);
}

/**
 * Gets the stored ML prediction for a session.
 */
export function getMlPredictionBySession(sessionId) {
  return mapPrediction(
    getDb()
      .query("SELECT * FROM ml_predictions WHERE session_id = ?")
      .get(sessionId),
  );
}

