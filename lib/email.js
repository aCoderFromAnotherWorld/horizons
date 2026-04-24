import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

/**
 * Send a contact form notification email to the configured inbox address.
 * @param {{ name?: string, email: string, role?: string, message: string }} param0
 */
export async function sendContactNotification({ name, email, role, message }) {
  const to = process.env.CONTACT_EMAIL;
  if (!to) return;

  await resend.emails.send({
    from: process.env.RESEND_FROM ?? 'noreply@horizons.app',
    to,
    subject: 'New Contact Form Submission — Horizons',
    html: `
      <h2>New Contact Form Submission</h2>
      <table cellpadding="8" style="border-collapse:collapse;font-family:sans-serif;font-size:14px">
        <tr><td><strong>Name</strong></td><td>${name ?? '(not provided)'}</td></tr>
        <tr><td><strong>Email</strong></td><td>${email}</td></tr>
        <tr><td><strong>Role</strong></td><td>${role ?? '(not provided)'}</td></tr>
        <tr><td><strong>Message</strong></td><td style="white-space:pre-wrap">${message}</td></tr>
      </table>
    `,
  });
}
