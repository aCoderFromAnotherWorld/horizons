import sql from '@/lib/db/index.js';

/**
 * Insert a contact form submission.
 * @param {{ name?: string, email: string, role?: string, message: string, submittedAt: number }} data
 * @returns {Promise<object>}
 */
export async function insertContact(data) {
  const [row] = await sql`
    INSERT INTO contact_submissions (name, email, role, message, submitted_at)
    VALUES (${data.name ?? null}, ${data.email}, ${data.role ?? null}, ${data.message}, ${data.submittedAt})
    RETURNING id
  `;
  return row;
}

/**
 * List all contact submissions, newest first.
 * @param {{ status?: string }} [filters]
 * @returns {Promise<object[]>}
 */
export async function listContacts(filters = {}) {
  if (filters.status) {
    return sql`SELECT * FROM contact_submissions WHERE status = ${filters.status} ORDER BY submitted_at DESC`;
  }
  return sql`SELECT * FROM contact_submissions ORDER BY submitted_at DESC`;
}

/**
 * Update the status of a contact submission.
 * @param {number} id
 * @param {string} status - 'new' | 'read' | 'archived'
 * @returns {Promise<object>}
 */
export async function updateContactStatus(id, status) {
  const [row] = await sql`
    UPDATE contact_submissions SET status = ${status} WHERE id = ${id} RETURNING *
  `;
  return row;
}
