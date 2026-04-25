import { getAuthenticatedUser, requireAdmin } from '@/lib/dashboardAuth.js';
import { getSession, deleteSession } from '@/lib/db/queries/sessions.js';
import { getResponsesBySession } from '@/lib/db/queries/responses.js';
import { getScoresBySession } from '@/lib/db/queries/scores.js';
import { getRedFlagsBySession } from '@/lib/db/queries/redFlags.js';
import { getDomainScoresBySession } from '@/lib/db/queries/domainScores.js';

export async function GET(request, { params }) {
  const user = await getAuthenticatedUser(request);
  if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await params;

  try {
    const session = await getSession(id);
    if (!session) return Response.json({ error: 'Session not found' }, { status: 404 });

    const [taskResponses, chapterScores, redFlags, domainScores] = await Promise.all([
      getResponsesBySession(id),
      getScoresBySession(id),
      getRedFlagsBySession(id),
      getDomainScoresBySession(id),
    ]);

    return Response.json({ session, taskResponses, chapterScores, redFlags, domainScores });
  } catch (err) {
    console.error('[GET /api/dashboard/sessions/[id]]', err);
    return Response.json({ error: 'Failed to fetch session' }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  const user = await requireAdmin(request);
  if (user?.error) return Response.json({ error: user.error }, { status: user.status });

  const { id } = await params;

  try {
    await deleteSession(id);
    return Response.json({ ok: true });
  } catch (err) {
    console.error('[DELETE /api/dashboard/sessions/[id]]', err);
    return Response.json({ error: 'Failed to delete session' }, { status: 500 });
  }
}
