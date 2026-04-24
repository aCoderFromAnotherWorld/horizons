import { insertContact } from '@/lib/db/queries/contactSubmissions.js';
import { sendContactNotification } from '@/lib/email.js';

export async function POST(request) {
  let body;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const { name, email, role, message } = body;

  if (!email || typeof email !== 'string' || !email.includes('@')) {
    return Response.json({ error: 'A valid email is required' }, { status: 400 });
  }
  if (!message || typeof message !== 'string') {
    return Response.json({ error: 'message is required' }, { status: 400 });
  }
  if (message.length < 5 || message.length > 2000) {
    return Response.json({ error: 'message must be between 5 and 2000 characters' }, { status: 400 });
  }

  try {
    await insertContact({
      name: name ?? null,
      email,
      role: role ?? null,
      message,
      submittedAt: Date.now(),
    });

    // Non-blocking — don't fail the request if email fails
    sendContactNotification({ name, email, role, message }).catch((err) => {
      console.error('[contact email]', err);
    });

    return Response.json({ ok: true }, { status: 201 });
  } catch (err) {
    console.error('[POST /api/platform/contact]', err);
    return Response.json({ error: 'Failed to submit contact form' }, { status: 500 });
  }
}
