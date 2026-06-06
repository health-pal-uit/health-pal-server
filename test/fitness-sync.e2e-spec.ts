import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { AppModule } from '../src/app.module';
import { AuthHelper, TestUser } from './helpers/auth.helper';
import { DatabaseHelper } from './helpers/database.helper';

describe('Fitness Sync / Health Connect (BACKEND_FSYNC_001 - BACKEND_FSYNC_080)', () => {
  let app: INestApplication;
  let authHelper: AuthHelper;
  let dbHelper: DatabaseHelper;
  let testUser: TestUser;

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
    testUser = await authHelper.createTestUser('fsync-user@example.com', 'user');
  });

  afterAll(async () => {
    await dbHelper.cleanDatabase();
    await app.close();
  });

  // ─── Connection management ────────────────────────────────────────────────

  describe('BACKEND_FSYNC_001 - Get initial sync status', () => {
    it('should return connected: false before connecting', async () => {
      const response = await authHelper
        .authenticatedRequest(testUser)
        .get('/fitness-sync/status')
        .expect(200);

      expect(response.body).toHaveProperty('connected');
      expect(response.body.connected).toBe(false);
    });
  });

  describe('BACKEND_FSYNC_002 - Connect Health Connect', () => {
    it('should mark Health Connect as connected', async () => {
      const response = await authHelper
        .authenticatedRequest(testUser)
        .post('/fitness-sync/connect')
        .expect(201);

      expect(response.body.connected).toBe(true);
    });
  });

  describe('BACKEND_FSYNC_003 - Status shows connected after connecting', () => {
    it('should return connected: true', async () => {
      const response = await authHelper
        .authenticatedRequest(testUser)
        .get('/fitness-sync/status')
        .expect(200);

      expect(response.body.connected).toBe(true);
    });
  });

  // ─── Heart rate sync ──────────────────────────────────────────────────────

  describe('BACKEND_FSYNC_010 - Sync heart rate record', () => {
    it('should write avg and resting heart rate to daily log', async () => {
      const response = await authHelper
        .authenticatedRequest(testUser)
        .post('/fitness-sync/sync')
        .send({
          records: [
            {
              source: 'health_connect',
              record_type: 'heart_rate',
              external_record_id: 'hc:hr:2026-05-20',
              recorded_at: '2026-05-20T23:59:59.000Z',
              avg_heart_rate_bpm: 72,
              min_heart_rate_bpm: 54,
              max_heart_rate_bpm: 145,
            },
          ],
        })
        .expect(201);

      expect(response.body.created).toBe(1);
      expect(response.body.results[0].status).toBe('created');
      expect(response.body.results[0].activity_record_id).toBeNull();
    });
  });

  describe('BACKEND_FSYNC_011 - Duplicate heart rate record is skipped', () => {
    it('should skip record with same external_record_id', async () => {
      const response = await authHelper
        .authenticatedRequest(testUser)
        .post('/fitness-sync/sync')
        .send({
          records: [
            {
              source: 'health_connect',
              record_type: 'heart_rate',
              external_record_id: 'hc:hr:2026-05-20', // same as FSYNC_010
              recorded_at: '2026-05-20T23:59:59.000Z',
              avg_heart_rate_bpm: 80,
            },
          ],
        })
        .expect(201);

      expect(response.body.skipped).toBe(1);
      expect(response.body.results[0].status).toBe('skipped');
      expect(response.body.results[0].reason).toBe('duplicate_external_record');
    });
  });

  // ─── Sleep sync ───────────────────────────────────────────────────────────

  describe('BACKEND_FSYNC_020 - Sync sleep record', () => {
    it('should write sleep duration and quality to daily log', async () => {
      const response = await authHelper
        .authenticatedRequest(testUser)
        .post('/fitness-sync/sync')
        .send({
          records: [
            {
              source: 'health_connect',
              record_type: 'sleep',
              external_record_id: 'hc:sleep:2026-05-20',
              start_time: '2026-05-19T23:00:00.000Z',
              end_time: '2026-05-20T06:30:00.000Z',
              sleep_duration_hours: 7.5,
              sleep_quality: 4,
            },
          ],
        })
        .expect(201);

      expect(response.body.created).toBe(1);
      expect(response.body.results[0].status).toBe('created');
      expect(response.body.results[0].activity_record_id).toBeNull();
    });
  });

  describe('BACKEND_FSYNC_021 - Sleep quality must be 1-5 (FAIL)', () => {
    it('should return 400 for sleep_quality out of range', async () => {
      await authHelper
        .authenticatedRequest(testUser)
        .post('/fitness-sync/sync')
        .send({
          records: [
            {
              source: 'health_connect',
              record_type: 'sleep',
              external_record_id: 'hc:sleep:bad-quality',
              recorded_at: '2026-05-21T06:00:00.000Z',
              sleep_duration_hours: 7,
              sleep_quality: 10, // invalid
            },
          ],
        })
        .expect(400);
    });
  });

  // ─── Steps sync ───────────────────────────────────────────────────────────

  describe('BACKEND_FSYNC_030 - Sync steps record creates ActivityRecord', () => {
    it('should return a non-null activity_record_id', async () => {
      const response = await authHelper
        .authenticatedRequest(testUser)
        .post('/fitness-sync/sync')
        .send({
          records: [
            {
              source: 'health_connect',
              record_type: 'steps',
              external_record_id: 'hc:steps:2026-05-20',
              recorded_at: '2026-05-20T23:59:59.000Z',
              steps_count: 9500,
              active_calories_kcal: 320,
            },
          ],
        })
        .expect(201);

      expect(response.body.created).toBe(1);
      expect(response.body.results[0].activity_record_id).not.toBeNull();
    });
  });

  // ─── Batch sync ───────────────────────────────────────────────────────────

  describe('BACKEND_FSYNC_040 - Batch sync of mixed record types', () => {
    it('should process all record types in one request', async () => {
      const response = await authHelper
        .authenticatedRequest(testUser)
        .post('/fitness-sync/sync')
        .send({
          records: [
            {
              source: 'health_connect',
              record_type: 'heart_rate',
              external_record_id: 'hc:hr:2026-05-21',
              recorded_at: '2026-05-21T23:59:59.000Z',
              avg_heart_rate_bpm: 68,
              min_heart_rate_bpm: 52,
            },
            {
              source: 'health_connect',
              record_type: 'sleep',
              external_record_id: 'hc:sleep:2026-05-21',
              start_time: '2026-05-21T22:30:00.000Z',
              end_time: '2026-05-22T06:00:00.000Z',
              sleep_duration_hours: 7.5,
              sleep_quality: 3,
            },
            {
              source: 'health_connect',
              record_type: 'steps',
              external_record_id: 'hc:steps:2026-05-21',
              recorded_at: '2026-05-21T23:59:59.000Z',
              steps_count: 11200,
            },
          ],
        })
        .expect(201);

      expect(response.body.total).toBe(3);
      expect(response.body.created).toBe(3);
      expect(response.body.skipped).toBe(0);
    });
  });

  // ─── Guard: not connected ─────────────────────────────────────────────────

  describe('BACKEND_FSYNC_050 - Sync fails when Health Connect not connected (FAIL)', () => {
    it('should return 400 if user disconnects then tries to sync', async () => {
      // disconnect first
      await authHelper
        .authenticatedRequest(testUser)
        .delete('/fitness-sync/disconnect')
        .expect(200);

      await authHelper
        .authenticatedRequest(testUser)
        .post('/fitness-sync/sync')
        .send({
          records: [
            {
              source: 'health_connect',
              record_type: 'heart_rate',
              external_record_id: 'hc:hr:after-disconnect',
              recorded_at: '2026-05-22T23:59:59.000Z',
              avg_heart_rate_bpm: 75,
            },
          ],
        })
        .expect(400);
    });
  });

  describe('BACKEND_FSYNC_051 - Disconnect updates status', () => {
    it('should return connected: false', async () => {
      const response = await authHelper
        .authenticatedRequest(testUser)
        .get('/fitness-sync/status')
        .expect(200);

      expect(response.body.connected).toBe(false);
    });
  });

  // ─── Unauthenticated ─────────────────────────────────────────────────────

  describe('BACKEND_FSYNC_060 - Unauthenticated sync returns 401 (FAIL)', () => {
    it('should reject request without token', async () => {
      await authHelper.getApp().post('/fitness-sync/sync').send({ records: [] }).expect(401);
    });
  });

  describe('BACKEND_FSYNC_061 - Unauthenticated connect returns 401 (FAIL)', () => {
    it('should reject request without token', async () => {
      await authHelper.getApp().post('/fitness-sync/connect').expect(401);
    });
  });

  // ─── Validation ──────────────────────────────────────────────────────────

  describe('BACKEND_FSYNC_070 - Invalid record_type returns 400 (FAIL)', () => {
    it('should return 400 for unknown record type', async () => {
      // reconnect first so guard passes
      await authHelper.authenticatedRequest(testUser).post('/fitness-sync/connect');

      await authHelper
        .authenticatedRequest(testUser)
        .post('/fitness-sync/sync')
        .send({
          records: [
            {
              source: 'health_connect',
              record_type: 'blood_pressure', // not in enum
              external_record_id: 'hc:bp:2026-05-20',
              recorded_at: '2026-05-20T12:00:00.000Z',
            },
          ],
        })
        .expect(400);
    });
  });

  describe('BACKEND_FSYNC_080 - Missing external_record_id returns 400 (FAIL)', () => {
    it('should return 400', async () => {
      await authHelper
        .authenticatedRequest(testUser)
        .post('/fitness-sync/sync')
        .send({
          records: [
            {
              source: 'health_connect',
              record_type: 'steps',
              // external_record_id missing
              steps_count: 5000,
            },
          ],
        })
        .expect(400);
    });
  });
});
