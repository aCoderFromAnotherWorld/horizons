import { requireAdmin } from '@/lib/dashboardAuth.js';
import { listSurveys } from '@/lib/db/queries/surveyResponses.js';

export async function GET(request) {
  const result = await requireAdmin(request);
  if (result?.error) return Response.json({ error: result.error }, { status: result.status });

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
