import { toNextJsHandler } from '@/lib/auth.js';
import auth from '@/lib/auth.js';
import sql from '@/lib/db/index.js';

// Use the same HTTP handler as the catch-all auth route so sign-up goes through
// the identical code path as sign-in. Calling auth.api.signUpEmail() directly
// (server-side JS API) can diverge from the HTTP handler and cause credential
// mismatches, leading to "invalid password" on the first login after signup.
const { POST: authPost } = toNextJsHandler(auth);

export async function POST(request) {
  let body;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: 'Invalid request body.' }, { status: 400 });
  }

  const { email, password, name, role = 'researcher' } = body;

  if (!email || typeof email !== 'string') {
    return Response.json({ error: 'Email is required.' }, { status: 400 });
  }
  if (!password || typeof password !== 'string' || password.length < 8) {
    return Response.json({ error: 'Password must be at least 8 characters.' }, { status: 400 });
  }
  if (!['researcher', 'admin'].includes(role)) {
    return Response.json({ error: 'Invalid role.' }, { status: 400 });
  }

  // Build a synthetic request to Better Auth's sign-up HTTP endpoint.
  // Include the Origin header so Better Auth's origin validation passes —
  // without it the request is treated as untrusted and rejected.
  const signUpUrl = new URL('/api/auth/sign-up/email', request.url);
  const signUpRequest = new Request(signUpUrl.toString(), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Origin': new URL(request.url).origin,
    },
    body: JSON.stringify({ email, password, name: name || email }),
  });

  let signUpRes;
  try {
    signUpRes = await authPost(signUpRequest);
  } catch (err) {
    console.error('[register] sign-up error:', err);
    return Response.json({ error: 'Registration failed.' }, { status: 500 });
  }

  if (!signUpRes.ok) {
    const cloned = signUpRes.clone();
    let errBody = {};
    try { errBody = await cloned.json(); } catch {}
    const msg = (errBody?.message || errBody?.error || '').toLowerCase();
    const isConflict =
      signUpRes.status === 422 ||
      msg.includes('already exist') ||
      msg.includes('already in use') ||
      msg.includes('unique');
    return Response.json(
      { error: isConflict ? 'An account with this email already exists.' : (errBody?.message || 'Registration failed.') },
      { status: isConflict ? 409 : signUpRes.status }
    );
  }

  if (role === 'admin') {
    try {
      await sql`UPDATE "user" SET role = 'admin' WHERE email = ${email.toLowerCase()}`;
    } catch (err) {
      console.error('[register] role update error:', err);
    }
  }

  return signUpRes;
}
