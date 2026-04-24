import { insertRedFlag } from '@/lib/db/queries/redFlags.js';

export async function POST(request) {
  let body;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const { sessionId, flagType, description, severity } = body;

  if (!sessionId) return Response.json({ error: 'sessionId is required' }, { status: 400 });
  if (!flagType)  return Response.json({ error: 'flagType is required' }, { status: 400 });

  try {
    const row = await insertRedFlag({
      sessionId,
      flagType,
      description: description ?? null,
      severity: severity ?? 'moderate',
      recordedAt: Date.now(),
    });
    return Response.json({ id: row.id }, { status: 201 });
  } catch (err) {
    console.error('[POST /api/game/flag]', err);
    return Response.json({ error: 'Failed to insert red flag' }, { status: 500 });
  }
}
