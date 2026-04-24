import { getAuthenticatedUser } from '@/lib/dashboardAuth.js';
import { listAllSessions } from '@/lib/db/queries/sessions.js';
import { getDomainScoresBySession } from '@/lib/db/queries/domainScores.js';
import { calculateCombinedScore, getRiskLevel } from '@/lib/scoring/engine.js';
import { DOMAIN_MAX_POINTS } from '@/lib/scoring/domains.js';

export async function GET(request) {
  const user = await getAuthenticatedUser(request);
  if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

  const { searchParams } = request.nextUrl;
  const statusFilter = searchParams.get('status');
  const riskFilter   = searchParams.get('risk');
  const search       = searchParams.get('search')?.toLowerCase();

  try {
    let sessions = await listAllSessions();

    // Apply status filter in SQL would be ideal, but listAllSessions returns all.
    // Filter in JS since dataset is small for this use case.
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

    // Attach domain scores + computed combined risk to each session
    const results = await Promise.all(
      sessions.map(async (session) => {
        const domainRows = await getDomainScoresBySession(session.id);
        const domainRaw = {};
        for (const row of domainRows) {
          domainRaw[row.domain] = row.raw_score;
        }
        const combinedScore = calculateCombinedScore(domainRaw, []);
        const riskLevel = getRiskLevel(combinedScore);

        return {
          id: session.id,
          playerName: session.player_name,
          playerAge: session.player_age,
          status: session.status,
          startedAt: session.started_at,
          completedAt: session.completed_at,
          currentChapter: session.current_chapter,
          guideChoice: session.guide_choice,
          combinedScore,
          riskLevel,
          domainScores: domainRows.map((r) => ({
            domain: r.domain,
            rawScore: r.raw_score,
            maxScore: r.max_score ?? DOMAIN_MAX_POINTS[r.domain],
            riskLevel: r.risk_level,
          })),
        };
      })
    );

    // Apply risk filter after computing
    const filtered = riskFilter
      ? results.filter((s) => s.riskLevel === riskFilter)
      : results;

    return Response.json(filtered);
  } catch (err) {
    console.error('[GET /api/dashboard/sessions]', err);
    return Response.json({ error: 'Failed to fetch sessions' }, { status: 500 });
  }
}
