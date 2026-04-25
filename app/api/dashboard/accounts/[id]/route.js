import { requireAdmin } from '@/lib/dashboardAuth.js';
import { updateAccount } from '@/lib/db/queries/accounts.js';

export async function PATCH(request, { params }) {
  const result = await requireAdmin(request);
  if (result?.error) return Response.json({ error: result.error }, { status: result.status });
  const user = result;

  const { id } = await params;

  let body;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const { isActive, role } = body;
  if (role !== undefined && !['researcher', 'admin'].includes(role)) {
    return Response.json({ error: 'Invalid role' }, { status: 400 });
  }

  // Prevent admins from demoting or deactivating themselves
  if (id === user.id && (role === 'researcher' || isActive === false)) {
    return Response.json({ error: 'You cannot demote or deactivate your own account' }, { status: 400 });
  }

  try {
    const account = await updateAccount(id, { isActive, role });
    if (!account) return Response.json({ error: 'Account not found' }, { status: 404 });
    return Response.json({ ok: true, account });
  } catch (err) {
    console.error('[PATCH /api/dashboard/accounts/[id]]', err);
    return Response.json({ error: 'Failed to update account' }, { status: 500 });
  }
}
