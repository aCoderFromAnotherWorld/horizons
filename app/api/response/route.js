import { createResponse } from "@/lib/db/queries/responses.js";

export async function POST(request) {
  try {
    const response = createResponse(await request.json());
    return Response.json({ response }, { status: 201 });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 400 });
  }
}
