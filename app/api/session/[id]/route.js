import {
  deleteSession,
  getSession,
  updateSession,
} from "@/lib/db/queries/sessions.js";

async function getId(context) {
  const params = await context.params;
  return params.id;
}

export async function GET(_request, context) {
  try {
    const session = getSession(await getId(context));
    if (!session) {
      return Response.json({ error: "Session not found" }, { status: 404 });
    }
    return Response.json({ session });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}

export async function PATCH(request, context) {
  try {
    const id = await getId(context);
    if (!getSession(id)) {
      return Response.json({ error: "Session not found" }, { status: 404 });
    }
    const session = updateSession(id, await request.json());
    return Response.json({ session });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 400 });
  }
}

export async function DELETE(_request, context) {
  try {
    const id = await getId(context);
    const changes = deleteSession(id);
    if (!changes) {
      return Response.json({ error: "Session not found" }, { status: 404 });
    }
    return Response.json({ deleted: true });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}
