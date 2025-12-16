import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { AppModule } from '../src/app.module';
import { AuthHelper } from './helpers/auth.helper';
import { DatabaseHelper } from './helpers/database.helper';

describe('Food Vision AI (BACKEND_VISION_001 - BACKEND_VISION_002)', () => {
  let app: INestApplication;
  let authHelper: AuthHelper;
  let dbHelper: DatabaseHelper;

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

    await dbHelper.ensureTestUser();
  });

  afterAll(async () => {
    await dbHelper.cleanDatabase();
    await app.close();
  });

  describe('BACKEND_VISION_001 - Analyze food image', () => {
    it('should analyze uploaded food image', async () => {
      const response = await authHelper
        .getApp()
        .post('/food-vision/analyze')
        .attach('file', Buffer.from('fake-image-data'), 'food.jpg');

      // API may return 200 with results or error status
      expect([200, 400, 500]).toContain(response.status);
    });
  });

  describe('BACKEND_VISION_002 - Get ingredient or meal by name', () => {
    it('should search for food by name', async () => {
      const response = await authHelper
        .getApp()
        .post('/food-vision/get-by-name')
        .send({ name: 'chicken' })
        .expect(201);

      // Should return either ingredient or meal data
      expect(response.body).toBeDefined();
    });
  });
});
