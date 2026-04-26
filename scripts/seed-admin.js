import auth from '../lib/auth.js';

const email    = process.env.SEED_ADMIN_EMAIL;
const password = process.env.SEED_ADMIN_PASSWORD;
const name     = process.env.SEED_ADMIN_NAME || 'Admin';

if (!email || !password) {
  console.error('SEED_ADMIN_EMAIL and SEED_ADMIN_PASSWORD must be set.');
  process.exit(1);
}

if (password.length < 12) {
  console.error('SEED_ADMIN_PASSWORD must be at least 12 characters.');
  process.exit(1);
}

async function seedAdmin() {
  try {
    const result = await auth.api.createUser({
      body: {
        email,
        password,
        name,
        role: 'admin',
        data: { is_active: true },
      },
    });

    if (!result?.user) {
      console.error('Failed to create admin user. Response:', result);
      process.exit(1);
    }

    console.log(`Admin user created: ${result.user.email}`);
    process.exit(0);
  } catch (err) {
    const message = err?.message || String(err);
    if (
      message.toLowerCase().includes('unique') ||
      message.toLowerCase().includes('already exists') ||
      message.toLowerCase().includes('email already') ||
      message.toLowerCase().includes('user_already_exists')
    ) {
      console.log(`Admin user already exists: ${email}`);
      process.exit(0);
    }
    console.error('Error seeding admin:', message);
    process.exit(1);
  }
}

seedAdmin();
