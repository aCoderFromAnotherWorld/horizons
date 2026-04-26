import { getAuthenticatedUser } from '@/lib/dashboardAuth.js';
import { listAllSessions } from '@/lib/db/queries/sessions.js';
import { getDomainScoresBatch } from '@/lib/db/queries/domainScores.js';
import { getScoresBatch } from '@/lib/db/queries/scores.js';
import { calculateCombinedScore, getRiskLevel, getDomainRisk } from '@/lib/scoring/engine.js';
import { DOMAIN_MAX_POINTS, CHAPTER_TO_DOMAIN } from '@/lib/scoring/domains.js';

export async function GET(request) {
  const user = await getAuthenticatedUser(request);
  if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

  const { searchParams } = request.nextUrl;
  const statusFilter = searchParams.get('status');
  const riskFilter   = searchParams.get('risk');
  const search       = searchParams.get('search')?.toLowerCase();

  try {
    let sessions = await listAllSessions();

    if (statusFilter) {
      sessions = sessions.filter((s) => s.status === statusFilter);
    }
    if (search) {
      sessions = sessions.filter(
        (s) =>
          s.id.toLowerCase().includes(search) ||
          (s.player_name ?? '').toLowerCase().includes(search)
      );
    }

    const sessionIds = sessions.map((s) => s.id);

    // Fetch pre-computed domain scores AND raw chapter scores in parallel
    const [allDomainRows, allChapterRows] = sessionIds.length > 0
      ? await Promise.all([
          getDomainScoresBatch(sessionIds),
          getScoresBatch(sessionIds),
        ])
      : [[], []];

    // Index domain scores by session
    const domainBySession = {};
    for (const row of allDomainRows) {
      if (!domainBySession[row.session_id]) domainBySession[row.session_id] = [];
      domainBySession[row.session_id].push(row);
    }

    // Index chapter scores by session
    const chapterBySession = {};
    for (const row of allChapterRows) {
      if (!chapterBySession[row.session_id]) chapterBySession[row.session_id] = [];
      chapterBySession[row.session_id].push(row);
    }

    const results = sessions.map((session) => {
      const domainRows   = domainBySession[session.id] ?? [];
      const chapterRows  = chapterBySession[session.id] ?? [];

      let domainRaw = {};
      let domainScores = [];

      if (domainRows.length > 0) {
        // Completed session: use pre-computed domain scores
        for (const row of domainRows) {
          domainRaw[row.domain] = row.raw_score;
        }
        domainScores = domainRows.map((r) => ({
          domain:   r.domain,
          rawScore: r.raw_score,
          maxScore: r.max_score ?? DOMAIN_MAX_POINTS[r.domain],
          riskLevel: r.risk_level,
        }));
      } else if (chapterRows.length > 0) {
        // In-progress session: compute from chapter scores as best-effort
        for (const row of chapterRows) {
          const domain = CHAPTER_TO_DOMAIN[row.chapter_key];
          if (!domain) continue;
          domainRaw[domain] = (domainRaw[domain] ?? 0) + row.raw_points;
        }
        domainScores = Object.entries(domainRaw).map(([domain, rawScore]) => ({
          domain,
          rawScore,
          maxScore:  DOMAIN_MAX_POINTS[domain],
          riskLevel: getDomainRisk(domain, rawScore),
        }));
      }

      // Return null score when no scoring data exists at all
      const hasScoreData = Object.keys(domainRaw).length > 0;
      const combinedScore = hasScoreData ? calculateCombinedScore(domainRaw, []) : null;
      const riskLevel     = hasScoreData ? getRiskLevel(combinedScore) : null;

      return {
        id:             session.id,
        playerName:     session.player_name,
        playerAge:      session.player_age,
        status:         session.status,
        startedAt:      session.started_at,
        completedAt:    session.completed_at,
        currentChapter: session.current_chapter,
        guideChoice:    session.guide_choice,
        combinedScore,
        riskLevel,
        domainScores,
      };
    });

    const filtered = riskFilter
      ? results.filter((s) => s.riskLevel === riskFilter)
      : results;

    return Response.json(filtered);
  } catch (err) {
    console.error('[GET /api/dashboard/sessions]', err);
    return Response.json({ error: 'Failed to fetch sessions' }, { status: 500 });
  }
}
