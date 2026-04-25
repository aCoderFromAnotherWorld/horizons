import sql from '@/lib/db/index.js';

/**
 * Upsert a domain score (insert or update on session_id + domain conflict).
 * @param {{ sessionId: string, domain: string, rawScore: number, maxScore: number, weightedScore: number, riskLevel: string, calculatedAt: number }} data
 * @returns {Promise<object>}
 */
export async function upsertDomainScore(data) {
  const [row] = await sql`
    INSERT INTO domain_scores (session_id, domain, raw_score, max_score, weighted_score, risk_level, calculated_at)
    VALUES (
      ${data.sessionId},
      ${data.domain},
      ${data.rawScore},
      ${data.maxScore},
      ${data.weightedScore},
      ${data.riskLevel},
      ${data.calculatedAt}
    )
    ON CONFLICT (session_id, domain) DO UPDATE SET
      raw_score      = EXCLUDED.raw_score,
      max_score      = EXCLUDED.max_score,
      weighted_score = EXCLUDED.weighted_score,
      risk_level     = EXCLUDED.risk_level,
      calculated_at  = EXCLUDED.calculated_at
    RETURNING *
  `;
  return row;
}

/**
 * Get all domain scores for a session.
 * @param {string} sessionId
 * @returns {Promise<object[]>}
 */
export async function getDomainScoresBySession(sessionId) {
  return sql`
    SELECT * FROM domain_scores WHERE session_id = ${sessionId}
  `;
}

/**
 * Get domain scores for multiple sessions in a single query.
 * @param {string[]} sessionIds
 * @returns {Promise<object[]>}
 */
export async function getDomainScoresBatch(sessionIds) {
  return sql`
    SELECT * FROM domain_scores WHERE session_id = ANY(${sessionIds})
  `;
}
