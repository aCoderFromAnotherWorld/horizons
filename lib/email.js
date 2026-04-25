import { Resend } from 'resend';

let _resend = null;
function getResend() {
  if (!_resend) _resend = new Resend(process.env.RESEND_API_KEY);
  return _resend;
}

function esc(str) {
  if (str == null) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/**
 * Send a contact form notification email to the configured inbox address.
 * @param {{ name?: string, email: string, role?: string, message: string }} param0
 */
export async function sendContactNotification({ name, email, role, message }) {
  const to = process.env.CONTACT_EMAIL;
  if (!to) {
    console.warn('[email] CONTACT_EMAIL not set — skipping notification');
    return;
  }
  if (!process.env.RESEND_API_KEY) {
    console.warn('[email] RESEND_API_KEY not set — skipping notification');
    return;
  }

  await getResend().emails.send({
    from: process.env.RESEND_FROM ?? 'noreply@horizons.app',
    to,
    subject: 'New Contact Form Submission — Horizons',
    html: `
      <h2 style="font-family:sans-serif">New Contact Form Submission</h2>
      <table cellpadding="8" style="border-collapse:collapse;font-family:sans-serif;font-size:14px">
        <tr><td><strong>Name</strong></td><td>${esc(name) || '(not provided)'}</td></tr>
        <tr><td><strong>Email</strong></td><td>${esc(email)}</td></tr>
        <tr><td><strong>Role</strong></td><td>${esc(role) || '(not provided)'}</td></tr>
        <tr><td><strong>Message</strong></td><td style="white-space:pre-wrap;max-width:480px">${esc(message)}</td></tr>
      </table>
    `,
  });
}
