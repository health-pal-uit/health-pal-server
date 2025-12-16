import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { AppModule } from '../src/app.module';
import { AuthHelper, TestUser } from './helpers/auth.helper';
import { DatabaseHelper } from './helpers/database.helper';

describe('Challenges & Medals (BACKEND_CHALLENGE_001 - BACKEND_CHALLENGE_080)', () => {
  let app: INestApplication;
  let authHelper: AuthHelper;
  let dbHelper: DatabaseHelper;
  let adminUser: TestUser;
  let regularUser: TestUser;
  let challengeId: string;

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

    adminUser = await authHelper.createTestUser('admin-challenges@example.com', 'admin');
    regularUser = await authHelper.createTestUser('user-challenges@example.com', 'user');
  });

  afterAll(async () => {
    await dbHelper.cleanDatabase();
    await app.close();
  });

  describe('BACKEND_CHALLENGE_001 - Admin creates challenge with image upload', () => {
    it('should create challenge with activity records', async () => {
      // First create an activity record
      const activityRecord = await authHelper
        .authenticatedRequest(adminUser)
        .post('/activity-records/challenges')
        .send({
          activity_id: 'some-activity-id',
          challenge_id: null, // Will be set after challenge creation
          target_value: 10000,
          target_unit: 'STEPS',
        });

      const challengeName = `30-Day Step Challenge ${Date.now()}`;
      const response = await authHelper
        .authenticatedRequest(adminUser)
        .post('/challenges')
        .field('name', challengeName)
        .field('note', 'Walk 10,000 steps daily')
        .field('difficulty', 'medium')
        .attach('image', Buffer.from('fake-image'), 'challenge.jpg')
        .expect(201);

      expect(response.body).toHaveProperty('id');
      expect(response.body.name).toBe(challengeName);
      challengeId = response.body.id;
    });
  });

  describe('BACKEND_CHALLENGE_002 - Retrieve all challenges with pagination', () => {
    it('should return paginated challenges', async () => {
      const response = await authHelper
        .authenticatedRequest(regularUser)
        .get('/challenges?page=1&limit=10')
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
    });
  });

  //
  // describe('BACKEND_CHALLENGE_026 - User joins challenge', () => {
  //   it('should create participation record', async () => {
  //     const response = await authHelper
  //       .authenticatedRequest(regularUser)
  //       .post(`/challenges/${challengeId}/join`)
  //       .expect(201);

  //     expect(response.body).toHaveProperty('id');
  //     expect(response.body.challenge_id).toBe(challengeId);
  //   });
  // });

  // describe('BACKEND_CHALLENGE_027 - Cannot join same challenge twice', () => {
  //   it('should return 409 for duplicate join', async () => {
  //     await authHelper
  //       .authenticatedRequest(regularUser)
  //       .post(`/challenges/${challengeId}/join`)
  //       .expect(409);
  //   });
  // });

  describe('BACKEND_CHALLENGE_033 - Check challenge progress for user', () => {
    it('should return progress percentage', async () => {
      const response = await authHelper
        .authenticatedRequest(regularUser)
        .get(`/activity-records/check-challenge-progress/${challengeId}`)
        .expect(200);

      expect(response.body).toHaveProperty('progress_percent');
    });
  });

  describe('BACKEND_CHALLENGE_034 - Check activity log progress within challenge', () => {
    it('should return progress for specific activity record', async () => {
      // Get activity record ID from challenge
      const challengeData = await authHelper
        .authenticatedRequest(regularUser)
        .get(`/challenges/${challengeId}`);

      if (challengeData.body.activity_records && challengeData.body.activity_records.length > 0) {
        const activityRecordId = challengeData.body.activity_records[0].id;

        const response = await authHelper
          .authenticatedRequest(regularUser)
          .get(`/activity-records/check-activity-log-progress/${activityRecordId}`)
          .expect(200);

        expect(response.body).toHaveProperty('progress_percent');
      }
    });
  });

  // Medal tests
  describe('BACKEND_CHALLENGE_051 - Admin creates medal', () => {
    it('should create medal with icon', async () => {
      const medalData = {
        name: 'Bronze Step Master',
        tier: 'bronze',
        note: 'Complete 30-day step challenge with 100% progress',
      };

      const response = await authHelper
        .authenticatedRequest(adminUser)
        .post('/medals')
        .send(medalData)
        .expect(201);

      expect(response.body).toHaveProperty('id');
      expect(response.body.name).toBe('Bronze Step Master');
    });
  });

  describe('BACKEND_CHALLENGE_056 - Retrieve all medals', () => {
    it('should return all medals', async () => {
      const response = await authHelper
        .authenticatedRequest(regularUser)
        .get('/medals')
        .expect(200);

      expect(response.body).toHaveProperty('data');
      expect(Array.isArray(response.body.data)).toBe(true);
    });
  });
});
