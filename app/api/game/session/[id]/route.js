import { getSession, updateSession } from '@/lib/db/queries/sessions.js';

export async function GET(request, { params }) {
  const { id } = await params;

  try {
    const session = await getSession(id);
    if (!session) return Response.json({ error: 'Session not found' }, { status: 404 });
    return Response.json(session);
  } catch (err) {
    console.error('[GET /api/game/session/[id]]', err);
    return Response.json({ error: 'Failed to fetch session' }, { status: 500 });
  }
}

export async function PATCH(request, { params }) {
  const { id } = await params;

  let body;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const allowed = ['currentChapter', 'currentLevel', 'status', 'avatarData', 'breakCount'];
  const updates = {};
  for (const key of allowed) {
    if (body[key] !== undefined) updates[key] = body[key];
  }

  try {
    const session = await getSession(id);
    if (!session) return Response.json({ error: 'Session not found' }, { status: 404 });

    await updateSession(id, updates);
    return Response.json({ ok: true });
  } catch (err) {
    console.error('[PATCH /api/game/session/[id]]', err);
    return Response.json({ error: 'Failed to update session' }, { status: 500 });
  }
}
