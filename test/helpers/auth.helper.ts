import { INestApplication } from '@nestjs/common';
import request from 'supertest';

export interface TestUser {
  id: string;
  email: string;
  role: 'user' | 'admin';
  token: string;
}

// ========================================
// TOKEN CONFIGURATION - Env vars take priority over hardcoded tokens
// ========================================
// Debug: Log if env tokens are available
if (process.env.TEST_USER_TOKEN) {
  console.log('✅ Using TEST_USER_TOKEN from environment');
} else {
  console.log('⚠️  TEST_USER_TOKEN not found, using hardcoded fallback (may be expired)');
}

if (process.env.TEST_ADMIN_TOKEN) {
  console.log('✅ Using TEST_ADMIN_TOKEN from environment');
} else {
  console.log('⚠️  TEST_ADMIN_TOKEN not found, using hardcoded fallback (may be expired)');
}

// Regular user token - fallback: refreshed Dec 14, 2025 02:40 AM (expires 03:40 AM)
const HARDCODED_USER_TOKEN =
  process.env.TEST_USER_TOKEN ||
  'eyJhbGciOiJIUzI1NiIsImtpZCI6Ii9wV0I4b2lpTi9jMm5iUXoiLCJ0eXAiOiJKV1QifQ.eyJpc3MiOiJodHRwczovL2d5cmFqeG1kcHJreGRmaHBteG9kLnN1cGFiYXNlLmNvL2F1dGgvdjEiLCJzdWIiOiI0ZDQ2ZDI3YS1jOWUzLTQ2NWQtOGU0ZS1hNTE3MTkwNWRhMzkiLCJhdWQiOiJhdXRoZW50aWNhdGVkIiwiZXhwIjoxNzY1NjU4NDUwLCJpYXQiOjE3NjU2NTQ4NTAsImVtYWlsIjoiaGFua2hvbmdnQGdtYWlsLmNvbSIsInBob25lIjoiIiwiYXBwX21ldGFkYXRhIjp7InByb3ZpZGVyIjoiZW1haWwiLCJwcm92aWRlcnMiOlsiZW1haWwiXX0sInVzZXJfbWV0YWRhdGEiOnsiZW1haWwiOiJoYW5raG9uZ2dAZ21haWwuY29tIiwiZW1haWxfdmVyaWZpZWQiOnRydWUsInBob25lX3ZlcmlmaWVkIjpmYWxzZSwic3ViIjoiNGQ0NmQyN2EtYzllMy00NjVkLThlNGUtYTUxNzE5MDVkYTM5In0sInJvbGUiOiJhdXRoZW50aWNhdGVkIiwiYWFsIjoiYWFsMSIsImFtciI6W3sibWV0aG9kIjoicGFzc3dvcmQiLCJ0aW1lc3RhbXAiOjE3NjU2NTQ4NTB9XSwic2Vzc2lvbl9pZCI6IjNhZDEyMWJlLWE4ZWItNDFkOS04YTk2LTViMGYwYjI5NDI5OSIsImlzX2Fub255bW91cyI6ZmFsc2V9.fL7sKXjtUu91d7UfEqINKairTIO0PRY_0II7dTmrWoA';
const HARDCODED_USER_ID = '4d46d27a-c9e3-465d-8e4e-a5171905da39';
const HARDCODED_USER_EMAIL = 'hankhongg@gmail.com';

// Admin user token - fallback: refreshed Dec 14, 2025 02:41 AM (expires 03:41 AM)
const HARDCODED_ADMIN_TOKEN =
  process.env.TEST_ADMIN_TOKEN ||
  'eyJhbGciOiJIUzI1NiIsImtpZCI6Ii9wV0I4b2lpTi9jMm5iUXoiLCJ0eXAiOiJKV1QifQ.eyJpc3MiOiJodHRwczovL2d5cmFqeG1kcHJreGRmaHBteG9kLnN1cGFiYXNlLmNvL2F1dGgvdjEiLCJzdWIiOiJlNTVjMDBjZC0yYjljLTQ2MjctOTZjNC03OTg4NzkxZTBjZjIiLCJhdWQiOiJhdXRoZW50aWNhdGVkIiwiZXhwIjoxNzY1NjU4NDYzLCJpYXQiOjE3NjU2NTQ4NjMsImVtYWlsIjoia2hvbmdodXluaG5nb2NoYW5AZ21haWwuY29tIiwicGhvbmUiOiIiLCJhcHBfbWV0YWRhdGEiOnsicHJvdmlkZXIiOiJlbWFpbCIsInByb3ZpZGVycyI6WyJlbWFpbCJdfSwidXNlcl9tZXRhZGF0YSI6eyJlbWFpbCI6Imtob25naHV5bmhuZ29jaGFuQGdtYWlsLmNvbSIsImVtYWlsX3ZlcmlmaWVkIjp0cnVlLCJwaG9uZV92ZXJpZmllZCI6ZmFsc2UsInN1YiI6ImU1NWMwMGNkLTJiOWMtNDYyNy05NmM0LTc5ODg3OTFlMGNmMiJ9LCJyb2xlIjoiYXV0aGVudGljYXRlZCIsImFhbCI6ImFhbDEiLCJhbXIiOlt7Im1ldGhvZCI6InBhc3N3b3JkIiwidGltZXN0YW1wIjoxNzY1NjU0ODYzfV0sInNlc3Npb25faWQiOiIxZDhmMDE3ZC04NGY1LTQzNTctOWQyNC0zNzUzYzg0MDNiZGMiLCJpc19hbm9ueW1vdXMiOmZhbHNlfQ.jtma2hu2-c-DGC2QcTuG9_LYyCxunhgm7OTy-sYf_8U';
const HARDCODED_ADMIN_ID = 'e55c00cd-2b9c-4627-96c4-7988791e0cf2';
const HARDCODED_ADMIN_EMAIL = 'khonghuynhngochan@gmail.com';

export class AuthHelper {
  private app: INestApplication;

  constructor(app: INestApplication) {
    this.app = app;
  }

  /**
   * Create a test user with authentication
   * If USE_HARDCODED_TOKEN is true, returns the hardcoded token instead of creating a new user
   */
  async createTestUser(email: string, role: 'user' | 'admin' = 'user'): Promise<TestUser> {
    // Use hardcoded tokens based on role
    if (role === 'admin' && HARDCODED_ADMIN_TOKEN) {
      return {
        id: HARDCODED_ADMIN_ID,
        email: HARDCODED_ADMIN_EMAIL,
        role: 'admin',
        token: HARDCODED_ADMIN_TOKEN,
      };
    }

    if (HARDCODED_USER_TOKEN) {
      return {
        id: HARDCODED_USER_ID,
        email: HARDCODED_USER_EMAIL,
        role: 'user',
        token: HARDCODED_USER_TOKEN,
      };
    }
    // First, signup the user
    const signupResponse = await request(this.app.getHttpServer())
      .post('/auth/signup')
      .send({
        email,
        password: 'Test123!@#',
        username: `Test${role}`,
        birth_date: '1990-01-01',
        gender: true,
      });

    if (signupResponse.status !== 201) {
      throw new Error(`Signup failed: ${JSON.stringify(signupResponse.body)}`);
    }

    // Wait a bit for signup to complete
    await new Promise((resolve) => setTimeout(resolve, 500));

    // Try to login (may fail if email not verified)
    const loginResponse = await request(this.app.getHttpServer()).post('/auth/login').send({
      email,
      password: 'Test123!@#',
    });

    if (loginResponse.status !== 200) {
      throw new Error(
        `Login failed after signup: ${loginResponse.status} - ${JSON.stringify(loginResponse.body)}. Email verification might be required.`,
      );
    }

    // Get the user ID from signup response (wrapped in responseHelper)
    const userId = signupResponse.body.data?.user?.id;
    const token = loginResponse.body.data?.token;

    if (!userId || !token) {
      throw new Error(
        `Missing user ID or token. Signup response: ${JSON.stringify(signupResponse.body)}, Login response: ${JSON.stringify(loginResponse.body)}`,
      );
    }

    if (role === 'admin') {
      // Promote to admin (would need admin endpoint or direct DB manipulation)
      // For now, return mock admin token
    }

    return {
      id: userId,
      email,
      role,
      token,
    };
  }

  /**
   * Login existing user
   */
  async login(email: string, password: string): Promise<TestUser> {
    const response = await request(this.app.getHttpServer())
      .post('/auth/login')
      .send({ email, password });

    // Get user info from the database
    const userResponse = await request(this.app.getHttpServer())
      .get('/users/me')
      .set('Authorization', `Bearer ${response.body.data?.token}`);

    return {
      id: userResponse.body.data?.id,
      email: userResponse.body.data?.email,
      role: userResponse.body.data?.role?.name || 'user',
      token: response.body.data?.token,
    };
  }

  /**
   * Get authorization header for requests
   */
  getAuthHeader(user: TestUser): { Authorization: string } {
    return { Authorization: `Bearer ${user.token}` };
  }

  /**
   * Get unauthenticated request instance
   */
  getApp() {
    return request(this.app.getHttpServer());
  }

  /**
   * Make authenticated request
   */
  authenticatedRequest(user: TestUser) {
    return {
      get: (url: string) =>
        request(this.app.getHttpServer()).get(url).set(this.getAuthHeader(user)),
      post: (url: string) =>
        request(this.app.getHttpServer()).post(url).set(this.getAuthHeader(user)),
      patch: (url: string) =>
        request(this.app.getHttpServer()).patch(url).set(this.getAuthHeader(user)),
      delete: (url: string) =>
        request(this.app.getHttpServer()).delete(url).set(this.getAuthHeader(user)),
    };
  }
}
