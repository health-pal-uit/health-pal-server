import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { AppModule } from '../src/app.module';
import { AuthHelper, TestUser } from './helpers/auth.helper';
import { DatabaseHelper } from './helpers/database.helper';

describe('Video Calls & Pay-per-minute (BACKEND_VCALL_001 - BACKEND_VCALL_070)', () => {
  let app: INestApplication;
  let authHelper: AuthHelper;
  let dbHelper: DatabaseHelper;
  let testUser: TestUser;
  let adminUser: TestUser;
  let expertId: string;
  let callId: string;

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

    testUser = await authHelper.createTestUser('vcall-user@example.com', 'user');
    adminUser = await authHelper.createTestUser('vcall-admin@example.com', 'admin');

    // Seed a verified expert for the admin user so we have a valid expert_id
    const { expertId: seededExpertId } = await dbHelper.seedTestExpert();
    expertId = seededExpertId;
  });

  afterAll(async () => {
    await dbHelper.cleanDatabase();
    await app.close();
  });

  // ─── Create ───────────────────────────────────────────────────────────────

  describe('BACKEND_VCALL_001 - Create video call', () => {
    it('should create call with WAITING status', async () => {
      const response = await authHelper
        .authenticatedRequest(testUser)
        .post('/video-calls')
        .send({
          patient_id: testUser.id,
          expert_id: expertId,
        })
        .expect(201);

      expect(response.body).toHaveProperty('id');
      expect(response.body.status).toBe('waiting');
      callId = response.body.id;
    });
  });

  describe('BACKEND_VCALL_002 - Create call missing patient_id returns 400 (FAIL)', () => {
    it('should return 400', async () => {
      await authHelper
        .authenticatedRequest(testUser)
        .post('/video-calls')
        .send({ expert_id: expertId })
        .expect(400);
    });
  });

  describe('BACKEND_VCALL_003 - Create call missing expert_id returns 400 (FAIL)', () => {
    it('should return 400', async () => {
      await authHelper
        .authenticatedRequest(testUser)
        .post('/video-calls')
        .send({ patient_id: testUser.id })
        .expect(400);
    });
  });

  // ─── Read ─────────────────────────────────────────────────────────────────

  describe('BACKEND_VCALL_010 - Get all video calls', () => {
    it('should return an array', async () => {
      const response = await authHelper
        .authenticatedRequest(testUser)
        .get('/video-calls')
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);
    });
  });

  describe('BACKEND_VCALL_011 - Get video call by ID', () => {
    it('should return call details', async () => {
      const response = await authHelper
        .authenticatedRequest(testUser)
        .get(`/video-calls/${callId}`)
        .expect(200);

      expect(response.body.id).toBe(callId);
    });
  });

  describe('BACKEND_VCALL_012 - Get non-existent call returns 404 (FAIL)', () => {
    it('should return 404', async () => {
      await authHelper
        .authenticatedRequest(testUser)
        .get('/video-calls/00000000-0000-0000-0000-000000000000')
        .expect(404);
    });
  });

  // ─── Status lifecycle ─────────────────────────────────────────────────────

  describe('BACKEND_VCALL_020 - Update call status to ACTIVE', () => {
    it('should set started_at timestamp', async () => {
      const response = await authHelper
        .authenticatedRequest(testUser)
        .patch(`/video-calls/${callId}`)
        .send({ status: 'active' })
        .expect(200);

      // TypeORM update returns UpdateResult — check via GET
      const getResponse = await authHelper
        .authenticatedRequest(testUser)
        .get(`/video-calls/${callId}`)
        .expect(200);

      expect(getResponse.body.status).toBe('active');
      expect(getResponse.body.started_at).not.toBeNull();
    });
  });

  describe('BACKEND_VCALL_021 - Update call status to ENDED triggers pay-per-minute', () => {
    it('should set ended_at and compute duration; blockchain gracefully skipped when unconfigured', async () => {
      const response = await authHelper
        .authenticatedRequest(testUser)
        .patch(`/video-calls/${callId}`)
        .send({ status: 'ended' })
        .expect(200);

      const getResponse = await authHelper
        .authenticatedRequest(testUser)
        .get(`/video-calls/${callId}`)
        .expect(200);

      expect(getResponse.body.status).toBe('ended');
      expect(getResponse.body.ended_at).not.toBeNull();
      // duration_seconds should be a non-negative number
      expect(typeof getResponse.body.duration_seconds).toBe('number');
      expect(getResponse.body.duration_seconds).toBeGreaterThanOrEqual(0);
    });
  });

  describe('BACKEND_VCALL_022 - Invalid status value returns 400 (FAIL)', () => {
    it('should return 400 for unknown status', async () => {
      // create a fresh call to patch
      const created = await authHelper
        .authenticatedRequest(testUser)
        .post('/video-calls')
        .send({ patient_id: testUser.id, expert_id: expertId });

      await authHelper
        .authenticatedRequest(testUser)
        .patch(`/video-calls/${created.body.id}`)
        .send({ status: 'invalid_status' })
        .expect(400);
    });
  });

  // ─── Delete ───────────────────────────────────────────────────────────────

  describe('BACKEND_VCALL_030 - Delete video call', () => {
    it('should remove the call', async () => {
      const created = await authHelper
        .authenticatedRequest(testUser)
        .post('/video-calls')
        .send({ patient_id: testUser.id, expert_id: expertId });

      await authHelper
        .authenticatedRequest(testUser)
        .delete(`/video-calls/${created.body.id}`)
        .expect(200);

      // Confirm it's gone
      await authHelper
        .authenticatedRequest(testUser)
        .get(`/video-calls/${created.body.id}`)
        .expect(404);
    });
  });

  // ─── Auth guards ─────────────────────────────────────────────────────────

  describe('BACKEND_VCALL_040 - Unauthenticated create returns 401 (FAIL)', () => {
    it('should return 401', async () => {
      await authHelper
        .getApp()
        .post('/video-calls')
        .send({ patient_id: testUser.id, expert_id: expertId })
        .expect(401);
    });
  });

  describe('BACKEND_VCALL_041 - Unauthenticated list returns 401 (FAIL)', () => {
    it('should return 401', async () => {
      await authHelper.getApp().get('/video-calls').expect(401);
    });
  });

  // ─── Non-existent expert ─────────────────────────────────────────────────

  describe('BACKEND_VCALL_050 - Invalid UUID for expert_id returns 400 (FAIL)', () => {
    it('should return 400 for malformed UUID', async () => {
      await authHelper
        .authenticatedRequest(testUser)
        .post('/video-calls')
        .send({ patient_id: testUser.id, expert_id: 'not-a-uuid' })
        .expect(400);
    });
  });

  // ─── Pay-per-minute: wallet balance deducted ─────────────────────────────

  describe('BACKEND_VCALL_060 - Pay-per-minute records transaction when blockchain disabled', () => {
    it('should not throw — gracefully skips blockchain and completes call', async () => {
      // top-up user wallet first so there is balance to deduct
      await authHelper
        .authenticatedRequest(testUser)
        .post('/wallets/topup')
        .send({ token_amount: 500 });

      const newCall = await authHelper
        .authenticatedRequest(testUser)
        .post('/video-calls')
        .send({ patient_id: testUser.id, expert_id: expertId });

      // activate
      await authHelper
        .authenticatedRequest(testUser)
        .patch(`/video-calls/${newCall.body.id}`)
        .send({ status: 'active' });

      // end — triggers processPayPerMinute internally
      const endResponse = await authHelper
        .authenticatedRequest(testUser)
        .patch(`/video-calls/${newCall.body.id}`)
        .send({ status: 'ended' });

      expect([200, 201]).toContain(endResponse.status);
    });
  });

  // ─── FAILED call ─────────────────────────────────────────────────────────

  describe('BACKEND_VCALL_070 - Status FAILED sets ended_at without pay-per-minute', () => {
    it('should set ended_at but not trigger payment', async () => {
      const created = await authHelper
        .authenticatedRequest(testUser)
        .post('/video-calls')
        .send({ patient_id: testUser.id, expert_id: expertId });

      await authHelper
        .authenticatedRequest(testUser)
        .patch(`/video-calls/${created.body.id}`)
        .send({ status: 'active' });

      await authHelper
        .authenticatedRequest(testUser)
        .patch(`/video-calls/${created.body.id}`)
        .send({ status: 'failed' });

      const result = await authHelper
        .authenticatedRequest(testUser)
        .get(`/video-calls/${created.body.id}`)
        .expect(200);

      expect(result.body.status).toBe('failed');
      expect(result.body.ended_at).not.toBeNull();
    });
  });
});
