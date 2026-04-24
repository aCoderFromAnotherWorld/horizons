import { getAuthenticatedUser } from '@/lib/dashboardAuth.js';
import { listAccounts } from '@/lib/db/queries/accounts.js';
import auth from '@/lib/auth.js';

export async function GET(request) {
  const user = await getAuthenticatedUser(request);
  if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
  if (user.role !== 'admin') return Response.json({ error: 'Forbidden' }, { status: 403 });

  try {
    const accounts = await listAccounts();
    return Response.json({ accounts });
  } catch (err) {
    console.error('[GET /api/dashboard/accounts]', err);
    return Response.json({ error: 'Failed to fetch accounts' }, { status: 500 });
  }
}

export async function POST(request) {
  const user = await getAuthenticatedUser(request);
  if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
  if (user.role !== 'admin') return Response.json({ error: 'Forbidden' }, { status: 403 });

  let body;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const { email, password, role = 'researcher' } = body;
  if (!email || !password) {
    return Response.json({ error: 'email and password are required' }, { status: 400 });
  }
  if (!['researcher', 'admin'].includes(role)) {
    return Response.json({ error: 'Invalid role' }, { status: 400 });
  }

  try {
    await auth.api.signUpEmail({
      body: { email, password, name: email, role, is_active: true },
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
