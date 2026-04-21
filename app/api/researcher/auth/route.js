export async function POST(request) {
  try {
    const { password } = await request.json();
    const expected = process.env.RESEARCHER_PASSWORD || "research123";
    if (password !== expected) {
      return Response.json({ error: "Invalid password" }, { status: 401 });
    }
    return Response.json({ authenticated: true });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 400 });
  }
}
