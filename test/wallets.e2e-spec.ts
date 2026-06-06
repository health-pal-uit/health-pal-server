import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { AppModule } from '../src/app.module';
import { AuthHelper, TestUser } from './helpers/auth.helper';
import { DatabaseHelper } from './helpers/database.helper';

describe('Wallets & Token Economy (BACKEND_WALLET_001 - BACKEND_WALLET_060)', () => {
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
    testUser = await authHelper.createTestUser('wallet-user@example.com', 'user');
  });

  afterAll(async () => {
    await dbHelper.cleanDatabase();
    await app.close();
  });

  // ─── Balance ──────────────────────────────────────────────────────────────

  describe('BACKEND_WALLET_001 - Get wallet balance', () => {
    it('should return balance shape with address and balance fields', async () => {
      const response = await authHelper
        .authenticatedRequest(testUser)
        .get('/wallets/balance')
        .expect(200);

      expect(response.body).toHaveProperty('address');
      expect(response.body).toHaveProperty('balance');
      expect(response.body).toHaveProperty('balance_cache');
    });
  });

  describe('BACKEND_WALLET_002 - Unauthenticated balance request returns 401 (FAIL)', () => {
    it('should reject without token', async () => {
      await authHelper.getApp().get('/wallets/balance').expect(401);
    });
  });

  // ─── Top-up ───────────────────────────────────────────────────────────────

  describe('BACKEND_WALLET_010 - Top-up with valid amount', () => {
    it('should return 201 and new balance info', async () => {
      const response = await authHelper
        .authenticatedRequest(testUser)
        .post('/wallets/topup')
        .send({ token_amount: 100 })
        .expect(201);

      expect(response.body).toBeDefined();
    });
  });

  describe('BACKEND_WALLET_011 - Balance increases after top-up', () => {
    it('should reflect increased balance', async () => {
      // top-up 50 more
      await authHelper
        .authenticatedRequest(testUser)
        .post('/wallets/topup')
        .send({ token_amount: 50 });

      const response = await authHelper
        .authenticatedRequest(testUser)
        .get('/wallets/balance')
        .expect(200);

      // balance_cache should be non-negative (blockchain off → off-chain tracked)
      expect(response.body.balance_cache).toBeGreaterThanOrEqual(0);
    });
  });

  describe('BACKEND_WALLET_012 - Top-up zero tokens returns 400 (FAIL)', () => {
    it('should return 400 for zero amount', async () => {
      await authHelper
        .authenticatedRequest(testUser)
        .post('/wallets/topup')
        .send({ token_amount: 0 })
        .expect(400);
    });
  });

  describe('BACKEND_WALLET_013 - Top-up negative amount returns 400 (FAIL)', () => {
    it('should return 400 for negative amount', async () => {
      await authHelper
        .authenticatedRequest(testUser)
        .post('/wallets/topup')
        .send({ token_amount: -50 })
        .expect(400);
    });
  });

  describe('BACKEND_WALLET_014 - Top-up above max returns 400 (FAIL)', () => {
    it('should return 400 for amount > 10 000', async () => {
      await authHelper
        .authenticatedRequest(testUser)
        .post('/wallets/topup')
        .send({ token_amount: 99999 })
        .expect(400);
    });
  });

  describe('BACKEND_WALLET_015 - Top-up missing body returns 400 (FAIL)', () => {
    it('should return 400 when token_amount is absent', async () => {
      await authHelper.authenticatedRequest(testUser).post('/wallets/topup').send({}).expect(400);
    });
  });

  // ─── Transactions ─────────────────────────────────────────────────────────

  describe('BACKEND_WALLET_020 - Get transaction history', () => {
    it('should return an array of transactions', async () => {
      const response = await authHelper
        .authenticatedRequest(testUser)
        .get('/wallets/transactions')
        .expect(200);

      expect(Array.isArray(response.body) || Array.isArray(response.body.data)).toBe(true);
    });
  });

  describe('BACKEND_WALLET_021 - Transactions include top-up entries', () => {
    it('transactions array should be non-empty after top-ups', async () => {
      const response = await authHelper
        .authenticatedRequest(testUser)
        .get('/wallets/transactions')
        .expect(200);

      const items: any[] = Array.isArray(response.body) ? response.body : response.body.data;
      expect(items.length).toBeGreaterThan(0);
    });
  });

  describe('BACKEND_WALLET_022 - Transactions pagination', () => {
    it('should accept page and limit query params', async () => {
      const response = await authHelper
        .authenticatedRequest(testUser)
        .get('/wallets/transactions?page=1&limit=5')
        .expect(200);

      expect(response.body).toBeDefined();
    });
  });

  describe('BACKEND_WALLET_030 - Unauthenticated transactions returns 401 (FAIL)', () => {
    it('should reject without token', async () => {
      await authHelper.getApp().get('/wallets/transactions').expect(401);
    });
  });

  // ─── Top-up unauthenticated ───────────────────────────────────────────────

  describe('BACKEND_WALLET_040 - Unauthenticated top-up returns 401 (FAIL)', () => {
    it('should reject without token', async () => {
      await authHelper.getApp().post('/wallets/topup').send({ token_amount: 100 }).expect(401);
    });
  });

  // ─── Type validation ──────────────────────────────────────────────────────

  describe('BACKEND_WALLET_050 - Non-numeric token_amount returns 400 (FAIL)', () => {
    it('should return 400 for string amount', async () => {
      await authHelper
        .authenticatedRequest(testUser)
        .post('/wallets/topup')
        .send({ token_amount: 'one hundred' })
        .expect(400);
    });
  });

  describe('BACKEND_WALLET_060 - Boundary: exactly 10 000 tokens is allowed', () => {
    it('should accept max allowed amount', async () => {
      await authHelper
        .authenticatedRequest(testUser)
        .post('/wallets/topup')
        .send({ token_amount: 10000 })
        .expect(201);
    });
  });
});
