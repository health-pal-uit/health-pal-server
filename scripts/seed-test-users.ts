#!/usr/bin/env ts-node
/**
 * Script to ensure test users exist in Supabase for CI/CD
 *
 * This script creates the two required test users if they don't exist:
 * 1. Regular test user (hankhongg@gmail.com)
 * 2. Admin test user (khonghuynhngochan@gmail.com)
 *
 * Usage:
 *   npm run seed-test-users
 *   or
 *   ts-node scripts/seed-test-users.ts
 */

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('❌ Missing required environment variables:');
  if (!SUPABASE_URL) console.error('  - SUPABASE_URL');
  if (!SUPABASE_SERVICE_ROLE_KEY)
    console.error('  - SUPABASE_SERVICE_ROLE_KEY (needed for admin operations)');
  process.exit(1);
}

// Test user credentials from environment
const TEST_USER = {
  email: process.env.TEST_USER_EMAIL || 'hankhongg@gmail.com',
  password: process.env.TEST_USER_PASSWORD,
};

const TEST_ADMIN = {
  email: process.env.TEST_ADMIN_EMAIL || 'khonghuynhngochan@gmail.com',
  password: process.env.TEST_ADMIN_PASSWORD,
};

if (!TEST_USER.password || !TEST_ADMIN.password) {
  console.error('❌ Missing required environment variables:');
  if (!TEST_USER.password) console.error('  - TEST_USER_PASSWORD');
  if (!TEST_ADMIN.password) console.error('  - TEST_ADMIN_PASSWORD');
  process.exit(1);
}

interface CreateUserPayload {
  email: string;
  password: string;
  email_confirm: boolean;
  user_metadata?: Record<string, any>;
}

async function createUserIfNotExists(
  email: string,
  password: string,
  isAdmin = false,
): Promise<void> {
  console.log(`\n📝 Checking if user ${email} exists...`);

  // Check if user exists using service role key
  const listResponse = await fetch(`${SUPABASE_URL}/auth/v1/admin/users`, {
    method: 'GET',
    headers: {
      apikey: SUPABASE_SERVICE_ROLE_KEY!,
      Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
    },
  });

  if (!listResponse.ok) {
    throw new Error(`Failed to list users: ${listResponse.status} - ${await listResponse.text()}`);
  }

  const { users } = await listResponse.json();
  const existingUser = users.find((u: any) => u.email === email);

  if (existingUser) {
    console.log(`✅ User ${email} already exists (ID: ${existingUser.id})`);

    // Update password if needed
    console.log(`🔄 Updating password for ${email}...`);
    const updateResponse = await fetch(`${SUPABASE_URL}/auth/v1/admin/users/${existingUser.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        apikey: SUPABASE_SERVICE_ROLE_KEY!,
        Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
      },
      body: JSON.stringify({
        password,
      }),
    });

    if (!updateResponse.ok) {
      console.warn(`⚠️  Failed to update password: ${await updateResponse.text()}`);
    } else {
      console.log(`✅ Password updated for ${email}`);
    }

    return;
  }

  // Create new user
  console.log(`🆕 Creating user ${email}...`);
  const payload: CreateUserPayload = {
    email,
    password,
    email_confirm: true, // Auto-confirm email
    user_metadata: {
      email,
      email_verified: true,
      phone_verified: false,
    },
  };

  const createResponse = await fetch(`${SUPABASE_URL}/auth/v1/admin/users`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      apikey: SUPABASE_SERVICE_ROLE_KEY!,
      Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
    },
    body: JSON.stringify(payload),
  });

  if (!createResponse.ok) {
    const error = await createResponse.text();
    throw new Error(`Failed to create user ${email}: ${createResponse.status} - ${error}`);
  }

  const createdUser = await createResponse.json();
  console.log(`✅ User ${email} created successfully (ID: ${createdUser.id})`);

  // Note: Setting admin role would typically be done through your app's API
  // or directly in the database after user creation
  if (isAdmin) {
    console.log(`ℹ️  Note: You may need to manually set admin role for ${email} in your database`);
  }
}

async function seedTestUsers() {
  console.log('🌱 Seeding test users for CI/CD...\n');
  console.log(`Target: ${SUPABASE_URL}`);

  try {
    await createUserIfNotExists(TEST_USER.email, TEST_USER.password!, false);
    await createUserIfNotExists(TEST_ADMIN.email, TEST_ADMIN.password!, true);

    console.log('\n✨ Test users seeded successfully!');
    console.log('\n📋 Summary:');
    console.log(`   Regular User: ${TEST_USER.email}`);
    console.log(`   Admin User:   ${TEST_ADMIN.email}`);
    console.log('\n💡 You can now run: npm run refresh-tokens');
  } catch (error: any) {
    console.error('\n❌ Error seeding test users:', error.message);
    process.exit(1);
  }
}

// Run the script
seedTestUsers();
