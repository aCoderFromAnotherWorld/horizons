import { getSession, updateSession } from '@/lib/db/queries/sessions.js';
import { getScoresBySession } from '@/lib/db/queries/scores.js';
import { getRedFlagsBySession } from '@/lib/db/queries/redFlags.js';
import { getResponsesBySession } from '@/lib/db/queries/responses.js';
import { upsertDomainScore } from '@/lib/db/queries/domainScores.js';
import { CHAPTER_TO_DOMAIN, DOMAIN_MAX_POINTS, DOMAIN_WEIGHTS } from '@/lib/scoring/domains.js';
import {
  calculateCombinedScore,
  getRiskLevel,
  getDomainRisk,
  checkConsistency,
} from '@/lib/scoring/engine.js';
import { detectRedFlags } from '@/lib/scoring/redFlags.js';
import { generateReportToken } from '@/lib/reportToken.js';

export async function GET(request, { params }) {
  const { sessionId } = await params;

  try {
    const session = await getSession(sessionId);
    if (!session) return Response.json({ error: 'Session not found' }, { status: 404 });

    // 1. Aggregate chapter scores → domain raw scores
    const chapterScores = await getScoresBySession(sessionId);
    const domainRaw = {};
    for (const row of chapterScores) {
      const domain = CHAPTER_TO_DOMAIN[row.chapter_key];
      if (!domain) continue;
      domainRaw[domain] = (domainRaw[domain] ?? 0) + row.raw_points;
    }

    // 2. Load active red flags from the red_flags table + re-derive from responses
    const [redFlagRows, allResponses] = await Promise.all([
      getRedFlagsBySession(sessionId),
      getResponsesBySession(sessionId),
    ]);
    const derivedFlags = detectRedFlags({ taskResponses: allResponses, redFlags: redFlagRows });
    const activeRedFlags = derivedFlags;

    // 3. Calculate combined score and risk
    const combinedScore = calculateCombinedScore(domainRaw, activeRedFlags);
    const riskLevel = getRiskLevel(combinedScore);

    // 4. Build per-domain result + upsert to domain_scores
    const now = Date.now();
    const domains = ['social_communication', 'restricted_repetitive', 'pretend_play', 'sensory_processing'];
    const domainScores = await Promise.all(
      domains.map(async (domain) => {
        const rawScore     = domainRaw[domain] ?? 0;
        const maxScore     = DOMAIN_MAX_POINTS[domain];
        // weightedScore = normalized domain contribution to combinedScore.
        const normalizedScore = maxScore ? (rawScore / maxScore) * 100 : 0;
        const weightedScore = Math.round(normalizedScore * (DOMAIN_WEIGHTS[domain] ?? 0) * 10) / 10;
        const domainRiskLevel = getDomainRisk(domain, rawScore);

        await upsertDomainScore({
          sessionId,
          domain,
          rawScore,
          maxScore,
          weightedScore,
          riskLevel: domainRiskLevel,
          calculatedAt: now,
        });

        return { domain, rawScore, maxScore, weightedScore, riskLevel: domainRiskLevel };
      })
    );

    // 5. Consistency check: compare ch6 vs original task performance
    const ch6Responses  = allResponses.filter((r) => r.chapter === 6);
    const origResponses = allResponses.filter((r) => r.chapter >= 1 && r.chapter <= 5);
    const consistencyFlag = checkConsistency(ch6Responses, origResponses);

    // 6. Generate report token and mark session completed
    const completedAt = session.completed_at ?? now;
    const reportToken = generateReportToken(sessionId, completedAt);

    await updateSession(sessionId, {
      status: 'completed',
      completedAt: session.completed_at ?? now,
      reportToken,
    });

    // 7. Build and return full result object
    const breakCount = session.break_count ?? 0;

    return Response.json({
      session: {
        id: session.id,
        playerAge: session.player_age,
        playerName: session.player_name,
        startedAt: session.started_at,
        completedAt: completedAt,
        status: 'completed',
        avatarData: session.avatar_data,
        reportToken,
      },
      domainScores,
      combinedScore,
      riskLevel,
      redFlags: redFlagRows.map((r) => ({
        flagType: r.flag_type,
        description: r.description,
        severity: r.severity,
      })),
      chapterScores: chapterScores.map((r) => ({
        chapterKey: r.chapter_key,
        rawPoints: r.raw_points,
      })),
      consistencyFlag,
      breakCount,
    });
  } catch (err) {
    console.error('[GET /api/game/results/[sessionId]]', err);
    return Response.json({ error: 'Failed to compute results' }, { status: 500 });
  }
}
