import { requireAdmin } from '@/lib/dashboardAuth.js';
import { listAccounts } from '@/lib/db/queries/accounts.js';
import auth from '@/lib/auth.js';

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
    await auth.api.signUpEmail({
      body: { email, password, name: name || email, role, is_active: true },
    });
    return Response.json({ ok: true });
  } catch (err) {
    const msg = (err?.message || String(err)).toLowerCase();
    if (msg.includes('unique') || msg.includes('already')) {
      return Response.json({ error: 'Email already in use' }, { status: 409 });
    }
    console.error('[POST /api/dashboard/accounts]', err);
    return Response.json({ error: 'Failed to create account' }, { status: 500 });
  }
}
