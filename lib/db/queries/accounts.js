import sql from '@/lib/db/index.js';

/**
 * List all researcher/admin accounts from the Better Auth user table.
 * @returns {Promise<object[]>}
 */
export async function listAccounts() {
  return sql`SELECT id, name, email, role, is_active, created_at FROM "user" ORDER BY created_at DESC`;
}

/**
 * Create a new researcher account via direct DB insert.
 * Prefer Better Auth's signUp API for hashed passwords; this is for admin seeding.
 * @param {{ id: string, name: string, email: string, passwordHash: string, role?: string }} data
 * @returns {Promise<object>}
 */
export async function createAccount(data) {
  const [row] = await sql`
    INSERT INTO "user" (id, name, email, password, role, is_active, created_at, updated_at, email_verified)
    VALUES (
      ${data.id},
      ${data.name},
      ${data.email},
      ${data.passwordHash},
      ${data.role ?? 'researcher'},
      true,
      NOW(),
      NOW(),
      false
    )
    RETURNING id, name, email, role, is_active
  `;
  return row;
}

/**
 * Update role or is_active for an account.
 * @param {string} id
 * @param {{ role?: string, isActive?: boolean }} updates
 * @returns {Promise<object>}
 */
export async function updateAccount(id, updates) {
  const patch = {};
  if (updates.role !== undefined)     patch.role      = updates.role;
  if (updates.isActive !== undefined) patch.is_active = updates.isActive;

  if (Object.keys(patch).length === 0) {
    const [row] = await sql`SELECT id, name, email, role, is_active FROM "user" WHERE id = ${id}`;
    return row;
  }

  const [row] = await sql`
    UPDATE "user" SET ${sql(patch)} WHERE id = ${id}
    RETURNING id, name, email, role, is_active
  `;
  return row;
}
