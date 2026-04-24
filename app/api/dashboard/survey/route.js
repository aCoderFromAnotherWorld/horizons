import { getAuthenticatedUser } from '@/lib/dashboardAuth.js';
import { listSurveys } from '@/lib/db/queries/surveyResponses.js';

export async function GET(request) {
  const user = await getAuthenticatedUser(request);
  if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
  if (user.role !== 'admin') return Response.json({ error: 'Forbidden' }, { status: 403 });

  try {
    const surveys = await listSurveys();
    const total = surveys.length;
    const ratings = surveys.filter((s) => s.rating != null).map((s) => s.rating);
    const averageRating = ratings.length > 0
      ? ratings.reduce((a, b) => a + b, 0) / ratings.length
      : null;
    return Response.json({ surveys, total, averageRating });
  } catch (err) {
    console.error('[GET /api/dashboard/survey]', err);
    return Response.json({ error: 'Failed to fetch surveys' }, { status: 500 });
  }
}
