import { requireAdmin } from '@/lib/dashboardAuth.js';
import { listContacts } from '@/lib/db/queries/contactSubmissions.js';

const VALID_STATUSES = new Set(['new', 'read', 'archived']);

export async function GET(request) {
  const result = await requireAdmin(request);
  if (result?.error) return Response.json({ error: result.error }, { status: result.status });
  const user = result;

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
