import { insertScore } from '@/lib/db/queries/scores.js';

export async function POST(request) {
  let body;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const { sessionId, chapterKey, rawPoints } = body;

  if (!sessionId)  return Response.json({ error: 'sessionId is required' }, { status: 400 });
  if (!chapterKey) return Response.json({ error: 'chapterKey is required' }, { status: 400 });
  if (rawPoints === undefined || rawPoints === null) {
    return Response.json({ error: 'rawPoints is required' }, { status: 400 });
  }

  try {
    await insertScore({
      sessionId,
      chapterKey,
      rawPoints: Number(rawPoints),
      recordedAt: Date.now(),
    });
    return Response.json({ ok: true }, { status: 201 });
  } catch (err) {
    console.error('[POST /api/game/score]', err);
    return Response.json({ error: 'Failed to insert score' }, { status: 500 });
  }
}
