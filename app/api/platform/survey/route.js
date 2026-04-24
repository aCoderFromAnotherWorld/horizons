import { insertSurvey } from '@/lib/db/queries/surveyResponses.js';

export async function POST(request) {
  let body;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const { role, rating, feedback } = body;
  const sessionId = request.nextUrl.searchParams.get('session') ?? body.gameSessionId ?? null;

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
