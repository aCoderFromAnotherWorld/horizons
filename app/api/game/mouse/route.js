import { insertMouseBatch, getMouseBySession } from '@/lib/db/queries/mouseMovements.js';
import { getAuthenticatedUser } from '@/lib/dashboardAuth.js';

export async function GET(request) {
  const user = await getAuthenticatedUser(request);
  if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

  const sessionId = request.nextUrl.searchParams.get('session');
  if (!sessionId) return Response.json({ error: 'session query parameter required' }, { status: 400 });

  try {
    const rows = await getMouseBySession(sessionId);
    return Response.json({ movements: rows.map(r => ({ x: r.x, y: r.y, recorded_at: r.recorded_at, task_key: r.task_key })) });
  } catch (err) {
    console.error('[GET /api/game/mouse]', err);
    return Response.json({ error: 'Failed to fetch mouse movements' }, { status: 500 });
  }
}

export async function POST(request) {
  let body;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const { sessionId, taskKey, movements } = body;

  if (!sessionId)  return Response.json({ error: 'sessionId is required' }, { status: 400 });
  if (!taskKey)    return Response.json({ error: 'taskKey is required' }, { status: 400 });
  if (!Array.isArray(movements)) {
    return Response.json({ error: 'movements must be an array' }, { status: 400 });
  }

  try {
    await insertMouseBatch(sessionId, taskKey, movements);
    return Response.json({ ok: true });
  } catch (err) {
    console.error('[POST /api/game/mouse]', err);
    return Response.json({ error: 'Failed to insert mouse movements' }, { status: 500 });
  }
}
