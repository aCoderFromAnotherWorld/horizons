import auth from '@/lib/auth.js';

export async function POST(request) {
  let body;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: 'Invalid request body.' }, { status: 400 });
  }

  const { email, password, name } = body;

  if (!email || typeof email !== 'string') {
    return Response.json({ error: 'Email is required.' }, { status: 400 });
  }
  if (!password || typeof password !== 'string' || password.length < 8) {
    return Response.json({ error: 'Password must be at least 8 characters.' }, { status: 400 });
  }
  // Public registration always creates researcher accounts; admin accounts require the admin panel.
  const role = 'researcher';

  let signUpRes;
  try {
    signUpRes = await auth.api.signUpEmail({
      body: { email, password, name: name || email },
      asResponse: true,
    });
  } catch (err) {
    console.error('[register] signUpEmail error:', err);
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

  return signUpRes;
}
