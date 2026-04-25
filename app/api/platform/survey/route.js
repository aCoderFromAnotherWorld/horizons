import { insertSurvey } from '@/lib/db/queries/surveyResponses.js';
import sql from '@/lib/db/index.js';

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function POST(request) {
  let body;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const { role, rating, feedback, website } = body;

  // Honeypot — bots fill this field, humans do not
  if (website) return Response.json({ ok: true }, { status: 201 });

  let sessionId = request.nextUrl.searchParams.get('session') ?? body.gameSessionId ?? null;

  // Validate sessionId format and existence; ignore if invalid to avoid FK violation
  if (sessionId) {
    if (!UUID_RE.test(sessionId)) {
      sessionId = null;
    } else {
      const [row] = await sql`SELECT id FROM game_sessions WHERE id = ${sessionId} LIMIT 1`;
      if (!row) sessionId = null;
    }
  }

  if (rating === undefined || rating === null) {
    return Response.json({ error: 'rating is required' }, { status: 400 });
  }
  const r = Number(rating);
  if (!Number.isInteger(r) || r < 1 || r > 5) {
    return Response.json({ error: 'rating must be an integer between 1 and 5' }, { status: 400 });
  }

  try {
    await insertSurvey({
      gameSessionId: sessionId,
      role: role ?? null,
      rating: r,
      feedback: feedback ?? null,
      submittedAt: Date.now(),
    });
    return Response.json({ ok: true }, { status: 201 });
  } catch (err) {
    console.error('[POST /api/platform/survey]', err);
    return Response.json({ error: 'Failed to submit survey' }, { status: 500 });
  }
}
