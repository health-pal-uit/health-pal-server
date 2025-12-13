import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { AppModule } from '../src/app.module';
import { AuthHelper, TestUser } from './helpers/auth.helper';
import { DatabaseHelper } from './helpers/database.helper';

describe('Contributions (BACKEND_CONTRIB_001 - BACKEND_CONTRIB_080)', () => {
  let app: INestApplication;
  let authHelper: AuthHelper;
  let dbHelper: DatabaseHelper;
  let adminUser: TestUser;
  let regularUser: TestUser;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );
    await app.init();

    authHelper = new AuthHelper(app);
    dbHelper = new DatabaseHelper(app);

    // Ensure test user exists before running tests
    await dbHelper.ensureTestUser();

    adminUser = await authHelper.createTestUser('admin-contrib@example.com', 'admin');
    regularUser = await authHelper.createTestUser('user-contrib@example.com', 'user');
  });

  afterAll(async () => {
    await dbHelper.cleanDatabase();
    await app.close();
  });

  describe('BACKEND_CONTRIB_001 - User submits ingredient contribution with image', () => {
    it('should create contribution with PENDING status', async () => {
      const response = await authHelper
        .authenticatedRequest(regularUser)
        .post('/contribution-ingres')
        .field('name', 'Organic Quinoa')
        .field('kcal_per_100gr', '368')
        .field('protein_per_100gr', '14')
        .field('fat_per_100gr', '6')
        .field('carbs_per_100gr', '64')
        .field('fiber_per_100gr', '7')
        .attach('image', Buffer.from('fake-image'), 'quinoa.jpg')
        .expect(201);

      expect(response.body).toHaveProperty('id');
      expect(response.body.name).toBe('Organic Quinoa');
      expect(response.body.status).toBe('PENDING');
    });
  });

  describe('BACKEND_CONTRIB_013 - User retrieves own contributions only', () => {
    it("should return only user's contributions", async () => {
      const response = await authHelper
        .authenticatedRequest(regularUser)
        .get('/contribution-ingres')
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      // All should belong to current user
      response.body.forEach((contrib: any) => {
        expect(contrib.user_id).toBe(regularUser.id);
      });
    });
  });

  describe('BACKEND_CONTRIB_014 - Admin retrieves all contributions with pagination', () => {
    it('should return all contributions for admin', async () => {
      const response = await authHelper
        .authenticatedRequest(adminUser)
        .get('/contribution-ingres?page=1&limit=10')
        .expect(200);

      // Admin gets paginated response
      expect(response.body).toHaveProperty('data');
      expect(Array.isArray(response.body.data)).toBe(true);
    });
  });

  describe('BACKEND_CONTRIB_015 - Update own PENDING contribution', () => {
    it('should update contribution data', async () => {
      // Create contribution first
      const created = await authHelper
        .authenticatedRequest(regularUser)
        .post('/contribution-ingres')
        .field('name', 'Editable Item')
        .field('kcal_per_100gr', '100')
        .field('protein_per_100gr', '10')
        .field('fat_per_100gr', '5')
        .field('carbs_per_100gr', '10');

      const response = await authHelper
        .authenticatedRequest(regularUser)
        .patch(`/contribution-ingres/${created.body.id}`)
        .send({ kcal_per_100gr: 110 })
        .expect(200);

      expect(response.body.kcal_per_100gr).toBe(110);
    });
  });

  describe('BACKEND_CONTRIB_025 - Admin approves ingredient contribution', () => {
    it('should change status to APPROVED and create ingredient', async () => {
      // Create contribution
      const created = await authHelper
        .authenticatedRequest(regularUser)
        .post('/contribution-ingres')
        .field('name', 'Approvable Item')
        .field('kcal_per_100gr', '150')
        .field('protein_per_100gr', '15')
        .field('fat_per_100gr', '8')
        .field('carbs_per_100gr', '12');

      const response = await authHelper
        .authenticatedRequest(adminUser)
        .patch(`/contribution-ingres/${created.body.id}/approve`)
        .expect(200);

      expect(response.body.status).toBe('APPROVED');
    });
  });

  describe('BACKEND_CONTRIB_030 - Admin rejects ingredient contribution', () => {
    it('should change status to REJECTED with reason', async () => {
      // Create contribution
      const created = await authHelper
        .authenticatedRequest(regularUser)
        .post('/contribution-ingres')
        .field('name', 'Rejectable Item')
        .field('kcal_per_100gr', '100')
        .field('protein_per_100gr', '10')
        .field('fat_per_100gr', '5')
        .field('carbs_per_100gr', '10');

      const response = await authHelper
        .authenticatedRequest(adminUser)
        .patch(`/contribution-ingres/${created.body.id}/reject`)
        .send({ rejection_reason: 'Duplicate entry' })
        .expect(200);

      expect(response.body.status).toBe('REJECTED');
      expect(response.body.rejection_reason).toBe('Duplicate entry');
    });
  });

  describe('BACKEND_CONTRIB_003 - Contribution name required', () => {
    it('should return 400 without name', async () => {
      await authHelper
        .authenticatedRequest(regularUser)
        .post('/contribution-ingres')
        .field('kcal_per_100gr', '100')
        .expect(400);
    });
  });

  describe('BACKEND_CONTRIB_004 - Contribution kcal must be positive', () => {
    it('should return 400 for negative calories', async () => {
      await authHelper
        .authenticatedRequest(regularUser)
        .post('/contribution-ingres')
        .field('name', 'Invalid Item')
        .field('kcal_per_100gr', '-50')
        .expect(400);
    });
  });
});
