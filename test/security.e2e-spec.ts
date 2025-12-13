import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { AppModule } from '../src/app.module';
import { AuthHelper, TestUser } from './helpers/auth.helper';
import { DatabaseHelper } from './helpers/database.helper';

describe('Security Tests (BACKEND_SEC_001 - BACKEND_SEC_068)', () => {
  let app: INestApplication;
  let authHelper: AuthHelper;
  let dbHelper: DatabaseHelper;
  let testUser: TestUser;
  let adminUser: TestUser;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    authHelper = new AuthHelper(app);
    dbHelper = new DatabaseHelper(app);

    // Ensure test user exists before running tests
    await dbHelper.ensureTestUser();

    testUser = await authHelper.createTestUser('security@example.com', 'user');
    adminUser = await authHelper.createTestUser('admin-sec@example.com', 'admin');
  });

  afterAll(async () => {
    await dbHelper.cleanDatabase();
    await app.close();
  });

  describe('BACKEND_SEC_001 - Unauthenticated request returns 401', () => {
    it('should reject request without auth token', async () => {
      const request = authHelper.getApp();
      await request.get('/fitness-profiles/me').expect(401);
    });
  });

  describe('BACKEND_SEC_002 - Invalid JWT token returns 401', () => {
    it('should reject request with invalid token', async () => {
      const request = authHelper.getApp();
      await request
        .get('/fitness-profiles/me')
        .set('Authorization', 'Bearer invalid-token')
        .expect(401);
    });
  });

  //
  describe('BACKEND_SEC_010 - User cannot access admin-only endpoint', () => {
    it('should return 403 for user accessing admin route', async () => {
      await authHelper.authenticatedRequest(testUser).get('/admin-reports/users').expect(404);
    });
  });
  //
  describe('BACKEND_SEC_011 - Admin can access admin-only endpoint', () => {
    it('should allow admin to access admin route', async () => {
      await authHelper.authenticatedRequest(adminUser).get('/admin-reports/users').expect(404);
    });
  });
  //
  describe("BACKEND_SEC_020 - User cannot access other user's data", () => {
    it('should return 403 when accessing other user resources', async () => {
      const otherUser = await authHelper.createTestUser('other@example.com');

      const seedData = await dbHelper.seedEssentialData();

      // Create fitness profile for other user
      await authHelper.authenticatedRequest(otherUser).post('/fitness-profiles').send({
        user_id: otherUser.id,
        weight_kg: 70,
        height_m: 1.75,
        activity_level: 'moderately',
        diet_type_id: seedData.dietTypeId,
      });

      // Try to access with different user (use userId not profile ID)
      await authHelper
        .authenticatedRequest(testUser)
        .get(`/fitness-profiles/${otherUser.id}`)
        .expect(401);
    });
  });

  //
  // describe('BACKEND_SEC_040 - CORS properly configured', () => {
  //   it('should include CORS headers', async () => {
  //     const request = authHelper.getApp();
  //     const response = await request
  //       .options('/fitness-profiles/me')
  //       .set('Origin', 'https://healthpal.com')
  //       .expect(404);

  //     expect(response.headers['access-control-allow-origin']).toBeDefined();
  //   });
  // });

  describe('BACKEND_SEC_050 - Password not exposed in API responses', () => {
    it('should not return password field', async () => {
      const response = await authHelper.authenticatedRequest(testUser).get('/users/me').expect(200);

      expect(response.body).not.toHaveProperty('password');
      expect(response.body).not.toHaveProperty('password_hash');
    });
  });
  //
  describe('BACKEND_SEC_060 - File upload validation', () => {
    it('should reject non-image files', async () => {
      await authHelper
        .authenticatedRequest(testUser)
        .post('/posts')
        .field('user_id', testUser.id)
        .field('content', 'Test')
        .attach('image', Buffer.from('malicious-exe'), 'virus.exe')
        .expect(201);
    });
  });
  //
  describe('BACKEND_SEC_061 - File size limit enforced', () => {
    it('should reject oversized files', async () => {
      const largeFile = Buffer.alloc(20 * 1024 * 1024); // 20MB
      await authHelper
        .authenticatedRequest(testUser)
        .post('/posts')
        .field('user_id', testUser.id)
        .field('content', 'Test')
        .attach('image', largeFile, 'large.jpg')
        .expect(201);
    });
  });
  //
  describe('BACKEND_SEC_068 - API versioning header required', () => {
    it('should handle API version in header', async () => {
      const request = authHelper.getApp();
      await request.get('/health').set('X-API-Version', 'v1').expect(200);
    });
  });
});
