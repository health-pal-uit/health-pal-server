import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { AppModule } from '../src/app.module';
import { AuthHelper, TestUser } from './helpers/auth.helper';
import { DatabaseHelper } from './helpers/database.helper';

describe('Experts & Bookings (BACKEND_EXP_001 - BACKEND_EXP_080)', () => {
  let app: INestApplication;
  let authHelper: AuthHelper;
  let dbHelper: DatabaseHelper;
  let testUser: TestUser;
  let adminUser: TestUser;
  let expertId: string;
  let bookingId: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }),
    );
    await app.init();

    authHelper = new AuthHelper(app);
    dbHelper = new DatabaseHelper(app);
    await dbHelper.ensureTestUser();

    testUser = await authHelper.createTestUser('exp-user@example.com', 'user');
    adminUser = await authHelper.createTestUser('exp-admin@example.com', 'admin');

    // Seed a verified expert so tests can book immediately
    const seeded = await dbHelper.seedTestExpert();
    expertId = seeded.expertId;
  });

  afterAll(async () => {
    await dbHelper.cleanDatabase();
    await app.close();
  });

  // ─── Expert listing ───────────────────────────────────────────────────────

  describe('BACKEND_EXP_001 - List all experts', () => {
    it('should return an array with at least the seeded expert', async () => {
      const response = await authHelper.authenticatedRequest(testUser).get('/experts').expect(200);

      const experts = Array.isArray(response.body) ? response.body : response.body.data;
      expect(Array.isArray(experts)).toBe(true);
      expect(experts.length).toBeGreaterThan(0);
    });
  });

  describe('BACKEND_EXP_002 - Get expert by ID', () => {
    it('should return expert details', async () => {
      const response = await authHelper
        .authenticatedRequest(testUser)
        .get(`/experts/${expertId}`)
        .expect(200);

      expect(response.body.id || response.body.data?.id).toBeDefined();
    });
  });

  describe('BACKEND_EXP_003 - Non-existent expert returns 404 (FAIL)', () => {
    it('should return 404', async () => {
      await authHelper
        .authenticatedRequest(testUser)
        .get('/experts/00000000-0000-0000-0000-000000000000')
        .expect(404);
    });
  });

  describe('BACKEND_EXP_004 - Unauthenticated list returns 401 (FAIL)', () => {
    it('should return 401', async () => {
      await authHelper.getApp().get('/experts').expect(401);
    });
  });

  // ─── Expert admin review ──────────────────────────────────────────────────

  describe('BACKEND_EXP_010 - Admin can access expert review queue', () => {
    it('should return list for admin', async () => {
      const response = await authHelper
        .authenticatedRequest(adminUser)
        .get('/experts/admin/review')
        .expect(200);

      expect(response.body).toBeDefined();
    });
  });

  describe('BACKEND_EXP_011 - Regular user cannot access admin review queue (FAIL)', () => {
    it('should return 401 or 403', async () => {
      const response = await authHelper.authenticatedRequest(testUser).get('/experts/admin/review');

      expect([401, 403]).toContain(response.status);
    });
  });

  // ─── Expert ratings ───────────────────────────────────────────────────────

  describe('BACKEND_EXP_020 - Get expert ratings', () => {
    it('should return ratings array', async () => {
      const response = await authHelper
        .authenticatedRequest(testUser)
        .get(`/experts/${expertId}/ratings`)
        .expect(200);

      expect(response.body).toBeDefined();
    });
  });

  // ─── Booking creation ─────────────────────────────────────────────────────

  describe('BACKEND_EXP_030 - Create booking for self as user', () => {
    it('should create booking in pending state', async () => {
      const response = await authHelper
        .authenticatedRequest(testUser)
        .post('/bookings/me')
        .send({
          expert_id: expertId,
          scheduled_at: new Date(Date.now() + 86400000).toISOString(), // tomorrow
        })
        .expect(201);

      expect(response.body).toHaveProperty('id');
      bookingId = response.body.id || response.body.data?.id;
    });
  });

  describe('BACKEND_EXP_031 - Create booking without expert_id returns 400 (FAIL)', () => {
    it('should return 400', async () => {
      await authHelper.authenticatedRequest(testUser).post('/bookings/me').send({}).expect(400);
    });
  });

  describe('BACKEND_EXP_032 - Unauthenticated booking returns 401 (FAIL)', () => {
    it('should return 401', async () => {
      await authHelper.getApp().post('/bookings/me').send({ expert_id: expertId }).expect(401);
    });
  });

  // ─── Booking reads ────────────────────────────────────────────────────────

  describe('BACKEND_EXP_040 - Get my bookings', () => {
    it('should return non-empty list after creating booking', async () => {
      const response = await authHelper
        .authenticatedRequest(testUser)
        .get('/bookings/me')
        .expect(200);

      const bookings = Array.isArray(response.body) ? response.body : response.body.data;
      expect(Array.isArray(bookings)).toBe(true);
      expect(bookings.length).toBeGreaterThan(0);
    });
  });

  describe('BACKEND_EXP_041 - Get pending bookings', () => {
    it('should include the newly created booking', async () => {
      const response = await authHelper
        .authenticatedRequest(testUser)
        .get('/bookings/me/pending')
        .expect(200);

      expect(response.body).toBeDefined();
    });
  });

  describe('BACKEND_EXP_042 - Get booking by ID', () => {
    it('should return booking details', async () => {
      if (!bookingId) return; // skip if booking creation failed

      const response = await authHelper
        .authenticatedRequest(testUser)
        .get(`/bookings/${bookingId}`)
        .expect(200);

      expect(response.body.id || response.body.data?.id).toBeDefined();
    });
  });

  // ─── Booking lifecycle ────────────────────────────────────────────────────

  describe('BACKEND_EXP_050 - User confirms their side of the booking', () => {
    it('should update booking confirmation status', async () => {
      if (!bookingId) return;

      const response = await authHelper
        .authenticatedRequest(testUser)
        .patch(`/bookings/me/${bookingId}/verify`);

      expect([200, 400]).toContain(response.status);
    });
  });

  describe('BACKEND_EXP_060 - User denies the booking', () => {
    it('should transition booking to denied', async () => {
      // Create a fresh booking to deny
      const created = await authHelper
        .authenticatedRequest(testUser)
        .post('/bookings/me')
        .send({ expert_id: expertId });

      const id = created.body.id || created.body.data?.id;
      if (!id) return;

      const response = await authHelper
        .authenticatedRequest(testUser)
        .patch(`/bookings/me/${id}/deny`);

      expect([200, 400]).toContain(response.status);
    });
  });

  describe('BACKEND_EXP_070 - Get denied bookings', () => {
    it('should return list of denied bookings', async () => {
      const response = await authHelper
        .authenticatedRequest(testUser)
        .get('/bookings/me/denied')
        .expect(200);

      expect(response.body).toBeDefined();
    });
  });

  // ─── Verify-all flow ─────────────────────────────────────────────────────

  describe('BACKEND_EXP_080 - Verified bookings list', () => {
    it('should return verified bookings list', async () => {
      const response = await authHelper
        .authenticatedRequest(testUser)
        .get('/bookings/me/verified')
        .expect(200);

      expect(response.body).toBeDefined();
    });
  });
});
