import { getSession } from "@/lib/db/queries/sessions.js";
import { sampleTasksForChapter9 } from "@/lib/gameData/chapter9.js";

export async function GET(request) {
  try {
    const sessionId = new URL(request.url).searchParams.get("sessionId");
    if (!sessionId) {
      return Response.json({ error: "sessionId is required" }, { status: 400 });
    }
    if (!getSession(sessionId)) {
      return Response.json({ error: "Session not found" }, { status: 404 });
    }
    return Response.json({ tasks: sampleTasksForChapter9(sessionId) });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}
