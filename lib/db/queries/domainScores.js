import { getDb } from "@/lib/db/index.js";

function mapDomainScore(row) {
  if (!row) return null;
  return {
    id: row.id,
    sessionId: row.session_id,
    domain: row.domain,
    rawScore: row.raw_score,
    maxScore: row.max_score,
    weightedScore: row.weighted_score,
    riskLevel: row.risk_level,
    calculatedAt: row.calculated_at,
  };
}

/**
 * Inserts or updates a domain score for a session/domain pair.
 */
export function upsertDomainScore(data) {
  getDb()
    .query(
      `INSERT INTO domain_scores (
        session_id, domain, raw_score, max_score, weighted_score, risk_level,
        calculated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(session_id, domain) DO UPDATE SET
        raw_score = excluded.raw_score,
        max_score = excluded.max_score,
        weighted_score = excluded.weighted_score,
        risk_level = excluded.risk_level,
        calculated_at = excluded.calculated_at`,
    )
    .run(
      data.sessionId,
      data.domain,
      data.rawScore ?? null,
      data.maxScore ?? null,
      data.weightedScore ?? null,
      data.riskLevel ?? null,
      data.calculatedAt || Date.now(),
    );
  const row = getDb()
    .query(
      "SELECT * FROM domain_scores WHERE session_id = ? AND domain = ?",
    )
    .get(data.sessionId, data.domain);
  return mapDomainScore(row);
}

/**
 * Gets all domain scores for a session.
 */
export function getDomainScoresBySession(sessionId) {
  return getDb()
    .query("SELECT * FROM domain_scores WHERE session_id = ? ORDER BY domain ASC")
    .all(sessionId)
    .map(mapDomainScore);
}
