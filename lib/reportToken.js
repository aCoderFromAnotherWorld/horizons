import { createHmac, timingSafeEqual } from 'node:crypto';

const SECRET = process.env.REPORT_HMAC_SECRET ?? '';

/**
 * Generate an HMAC-SHA256 hex token for a session report.
 * @param {string} sessionId
 * @param {number} completedAt — epoch ms
 * @returns {string} hex token
 */
export function generateReportToken(sessionId, completedAt) {
  return createHmac('sha256', SECRET)
    .update(`${sessionId}:${completedAt}`)
    .digest('hex');
}

/**
 * Verify a report token using constant-time comparison.
 * @param {string} sessionId
 * @param {number} completedAt
 * @param {string} token
 * @returns {boolean}
 */
export function verifyReportToken(sessionId, completedAt, token) {
  try {
    const expected = generateReportToken(sessionId, completedAt);
    const a = Buffer.from(expected, 'hex');
    const b = Buffer.from(token, 'hex');
    if (a.length !== b.length) return false;
    return timingSafeEqual(a, b);
  } catch {
    return false;
  }
}
