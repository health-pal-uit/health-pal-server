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

function isTokenExpired(token: string): boolean {
  try {
    const payload = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
    return Date.now() / 1000 > payload.exp - 30;
  } catch {
    return true;
  }
}

export class AuthHelper {
  private app: INestApplication;

  constructor(app: INestApplication) {
    this.app = app;
  }

  /**
   * Create a test user with authentication.
   * Uses fresh token from env if set; falls back to hardcoded token if still valid;
   * otherwise auto-logins using TEST_USER_PASSWORD / TEST_ADMIN_PASSWORD from env.
   */
  async createTestUser(email: string, role: 'user' | 'admin' = 'user'): Promise<TestUser> {
    if (role === 'admin' && HARDCODED_ADMIN_TOKEN && !isTokenExpired(HARDCODED_ADMIN_TOKEN)) {
      return {
        id: HARDCODED_ADMIN_ID,
        email: HARDCODED_ADMIN_EMAIL,
        role: 'admin',
        token: HARDCODED_ADMIN_TOKEN,
      };
    }

    if (role !== 'admin' && HARDCODED_USER_TOKEN && !isTokenExpired(HARDCODED_USER_TOKEN)) {
      return {
        id: HARDCODED_USER_ID,
        email: HARDCODED_USER_EMAIL,
        role: 'user',
        token: HARDCODED_USER_TOKEN,
      };
    }

    // Hardcoded token is expired — try auto-login via password
    const loginEmail =
      role === 'admin'
        ? process.env.TEST_ADMIN_EMAIL || HARDCODED_ADMIN_EMAIL
        : process.env.TEST_USER_EMAIL || HARDCODED_USER_EMAIL;
    const loginPassword =
      role === 'admin' ? process.env.TEST_ADMIN_PASSWORD : process.env.TEST_USER_PASSWORD;

    if (!loginPassword) {
      throw new Error(
        `Hardcoded JWT for role '${role}' is expired. ` +
          `Set TEST_${role.toUpperCase()}_PASSWORD in .env.test to auto-login, ` +
          `or set TEST_${role.toUpperCase()}_TOKEN to a fresh Supabase token.`,
      );
    }

    const loginResponse = await request(this.app.getHttpServer())
      .post('/auth/login')
      .send({ email: loginEmail, password: loginPassword });

    if (loginResponse.status !== 200) {
      throw new Error(
        `Auto-login failed for ${role} (${loginEmail}): ` +
          `${loginResponse.status} - ${JSON.stringify(loginResponse.body)}`,
      );
    }

    const token = loginResponse.body.data?.token;
    if (!token) throw new Error(`No token in auto-login response for ${role}`);

    return {
      id: role === 'admin' ? HARDCODED_ADMIN_ID : HARDCODED_USER_ID,
      email: loginEmail,
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
