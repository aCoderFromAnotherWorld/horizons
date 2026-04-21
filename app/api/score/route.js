import { addChapterScore } from "@/lib/db/queries/scores.js";

export async function POST(request) {
  try {
    const score = addChapterScore(await request.json());
    return Response.json({ score }, { status: 201 });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 400 });
  }
}
