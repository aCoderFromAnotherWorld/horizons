import { batchInsertMouseMovements } from "@/lib/db/queries/mouseMovements.js";

export async function POST(request) {
  try {
    const body = await request.json();
    const inserted = batchInsertMouseMovements(
      (body.movements || []).map((movement) => ({
        sessionId: body.sessionId,
        taskKey: body.taskKey,
        x: movement.x,
        y: movement.y,
        recordedAt: movement.recordedAt ?? movement.t,
      })),
    );
    return Response.json({ inserted }, { status: 201 });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 400 });
  }
}
