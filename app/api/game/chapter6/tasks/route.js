import { sampleTasks } from '@/lib/gameData/chapter6.js';

export async function GET(request) {
  const seed = request.nextUrl.searchParams.get('seed');
  if (!seed) {
    return Response.json({ error: 'seed query parameter is required' }, { status: 400 });
  }

  const tasks = sampleTasks(seed);
  return Response.json({ tasks });
}
