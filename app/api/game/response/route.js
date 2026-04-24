import { insertResponse } from '@/lib/db/queries/responses.js';

export async function POST(request) {
  let body;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const { sessionId, chapter, level, taskKey, startedAt } = body;

  if (!sessionId)  return Response.json({ error: 'sessionId is required' }, { status: 400 });
  if (!chapter)    return Response.json({ error: 'chapter is required' }, { status: 400 });
  if (!level)      return Response.json({ error: 'level is required' }, { status: 400 });
  if (!taskKey)    return Response.json({ error: 'taskKey is required' }, { status: 400 });
  if (startedAt === undefined || startedAt === null) {
    return Response.json({ error: 'startedAt is required' }, { status: 400 });
  }

  try {
    const row = await insertResponse({
      sessionId,
      chapter: Number(chapter),
      level: Number(level),
      taskKey,
      startedAt: Number(startedAt),
      responseTimeMs: body.responseTimeMs !== undefined ? Number(body.responseTimeMs) : null,
      selection: body.selection,
      isCorrect: Boolean(body.isCorrect),
      attemptNumber: body.attemptNumber !== undefined ? Number(body.attemptNumber) : 1,
      scorePoints: body.scorePoints !== undefined ? Number(body.scorePoints) : 0,
      extraData: body.extraData,
    });
    return Response.json({ id: row.id }, { status: 201 });
  } catch (err) {
    console.error('[POST /api/game/response]', err);
    return Response.json({ error: 'Failed to insert response' }, { status: 500 });
  }
}
