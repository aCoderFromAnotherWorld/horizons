import { getAuthenticatedUser } from '@/lib/dashboardAuth.js';
import { listContacts } from '@/lib/db/queries/contactSubmissions.js';

const VALID_STATUSES = new Set(['new', 'read', 'archived']);

export async function GET(request) {
  const user = await getAuthenticatedUser(request);
  if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
  if (user.role !== 'admin') return Response.json({ error: 'Forbidden' }, { status: 403 });

  const { searchParams } = request.nextUrl;
  const status = searchParams.get('status');

  if (status && !VALID_STATUSES.has(status)) {
    return Response.json({ error: 'Invalid status filter' }, { status: 400 });
  }

  try {
    const contacts = await listContacts(status ? { status } : {});
    return Response.json(contacts);
  } catch (err) {
    console.error('[GET /api/dashboard/contact]', err);
    return Response.json({ error: 'Failed to fetch contacts' }, { status: 500 });
  }
}
