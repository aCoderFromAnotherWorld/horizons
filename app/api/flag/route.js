import { addRedFlag } from "@/lib/db/queries/redFlags.js";

export async function POST(request) {
  try {
    const flag = addRedFlag(await request.json());
    return Response.json({ flag }, { status: 201 });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 400 });
  }
}
