import { createSession } from '@/lib/db/queries/sessions.js';
import { generateId } from '@/lib/utils.js';

export async function POST(request) {
  let body;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const { playerAge, playerName, guideChoice, sensoryLevel, avatarData } = body;

  if (playerAge === undefined || playerAge === null) {
    return Response.json({ error: 'playerAge is required' }, { status: 400 });
  }
  const age = Number(playerAge);
  if (!Number.isInteger(age) || age < 3 || age > 10) {
    return Response.json({ error: 'playerAge must be an integer between 3 and 10' }, { status: 400 });
  }

  try {
    const row = await createSession({
      id: generateId(),
      playerAge: age,
      playerName: playerName ?? null,
      guideChoice: guideChoice ?? null,
      sensoryLevel: sensoryLevel ?? 'medium',
      startedAt: Date.now(),
      avatarData: avatarData ?? null,
    });
    return Response.json({ sessionId: row.id }, { status: 201 });
  } catch (err) {
    console.error('[POST /api/game/session]', err);
    return Response.json({ error: 'Failed to create session' }, { status: 500 });
  }
}
