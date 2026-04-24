import { getAuthenticatedUser } from '@/lib/dashboardAuth.js';
import { updateContactStatus } from '@/lib/db/queries/contactSubmissions.js';

const VALID_STATUSES = new Set(['new', 'read', 'archived']);

export async function PATCH(request, { params }) {
  const user = await getAuthenticatedUser(request);
  if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
  if (user.role !== 'admin') return Response.json({ error: 'Forbidden' }, { status: 403 });

  const { id } = await params;

  let body;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const { status } = body;
  if (!status || !VALID_STATUSES.has(status)) {
    return Response.json({ error: 'status must be one of: new, read, archived' }, { status: 400 });
  }

  try {
    const contact = await updateContactStatus(Number(id), status);
    if (!contact) return Response.json({ error: 'Contact not found' }, { status: 404 });
    return Response.json({ ok: true, contact });
  } catch (err) {
    console.error('[PATCH /api/dashboard/contact/[id]]', err);
    return Response.json({ error: 'Failed to update contact' }, { status: 500 });
  }
}
