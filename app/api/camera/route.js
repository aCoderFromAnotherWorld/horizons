import { saveCameraFrame } from "@/lib/db/queries/cameraFrames.js";
import { getSession } from "@/lib/db/queries/sessions.js";

function validateCameraFrame(body) {
  if (!body?.sessionId) throw new Error("sessionId is required");
  if (!body?.taskKey) throw new Error("taskKey is required");
  if (!getSession(body.sessionId)) throw new Error("Session not found");
}

export async function POST(request) {
  try {
    const body = await request.json();
    validateCameraFrame(body);
    const frame = saveCameraFrame(body);
    return Response.json({ saved: true, frame }, { status: 201 });
  } catch (error) {
    return Response.json(
      {
        saved: false,
        error: error.message,
      },
      { status: 200 },
    );
  }
}
