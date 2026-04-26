import auth, { toNextJsHandler } from '@/lib/auth.js';
import { isRateLimited, recordFailure, clearFailures } from '@/lib/rateLimit.js';

const baseHandler = toNextJsHandler(auth);

function getIp(request) {
  const ip = (
    request.headers.get('x-forwarded-for')?.split(',')[0].trim() ||
    request.headers.get('x-real-ip') ||
    '127.0.0.1'
  );
  if (ip === '::1' || ip === '::ffff:127.0.0.1') return '127.0.0.1';
  return ip;
}

async function postHandler(request) {
  const { pathname } = new URL(request.url);
  const ip = getIp(request);

  if (pathname.endsWith('/sign-in/email') && isRateLimited(ip)) {
    return new Response(
      JSON.stringify({ error: 'Too many failed login attempts. Try again in 15 minutes.' }),
      {
        status: 429,
        headers: { 'Content-Type': 'application/json', 'Retry-After': '900' },
      }
    );
  }

  const response = await baseHandler.POST(request);

  if (pathname.endsWith('/sign-in/email')) {
    if (response.status === 401 || response.status === 403 || response.status === 400) {
      recordFailure(ip);
    } else if (response.ok) {
      clearFailures(ip);
    }
  }

  return response;
}

export const GET = (request) => baseHandler.GET(request);
export const POST = postHandler;
