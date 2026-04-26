import { requireAdmin } from '@/lib/dashboardAuth.js';
import { listAccounts } from '@/lib/db/queries/accounts.js';
import auth from '@/lib/auth.js';
import sql from '@/lib/db/index.js';

export async function GET(request) {
  const result = await requireAdmin(request);
  if (result?.error) return Response.json({ error: result.error }, { status: result.status });

  try {
    const accounts = await listAccounts();
    return Response.json({ accounts });
  } catch (err) {
    console.error('[GET /api/dashboard/accounts]', err);
    return Response.json({ error: 'Failed to fetch accounts' }, { status: 500 });
  }
}

export async function POST(request) {
  const result = await requireAdmin(request);
  if (result?.error) return Response.json({ error: result.error }, { status: result.status });

  let body;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const { email, password, name, role = 'researcher' } = body;
  if (!email || !password) {
    return Response.json({ error: 'email and password are required' }, { status: 400 });
  }
  if (typeof password !== 'string' || password.length < 8) {
    return Response.json({ error: 'password must be at least 8 characters' }, { status: 400 });
  }
  if (!['researcher', 'admin'].includes(role)) {
    return Response.json({ error: 'Invalid role' }, { status: 400 });
  }

  try {
    const signUpRes = await auth.api.signUpEmail({
      body: { email, password, name: name || email },
      asResponse: true,
    });

    if (!signUpRes.ok) {
      const cloned = signUpRes.clone();
      let errBody = {};
      try { errBody = await cloned.json(); } catch {}
      const msg = (errBody?.message || '').toLowerCase();
      const isConflict =
        signUpRes.status === 422 ||
        msg.includes('already exist') ||
        msg.includes('already in use') ||
        msg.includes('unique');
      return Response.json(
        { error: isConflict ? 'Email already in use' : (errBody?.message || 'Failed to create account') },
        { status: isConflict ? 409 : 500 }
      );
    }

    if (role !== 'researcher') {
      await sql`UPDATE "user" SET role = ${role} WHERE email = ${email.toLowerCase()}`;
    }

    return Response.json({ ok: true });
  } catch (err) {
    const msg = (err?.message || String(err)).toLowerCase();
    if (msg.includes('unique') || msg.includes('already') || msg.includes('user_already_exists')) {
      return Response.json({ error: 'Email already in use' }, { status: 409 });
    }
    console.error('[POST /api/dashboard/accounts]', err);
    return Response.json({ error: 'Failed to create account' }, { status: 500 });
  }
}
