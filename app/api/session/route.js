import { createSession, listSessions } from "@/lib/db/queries/sessions.js";

export function GET() {
  try {
    return Response.json({ sessions: listSessions() });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const session = createSession(body);
    return Response.json({ sessionId: session.id, session }, { status: 201 });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 400 });
  }
}
