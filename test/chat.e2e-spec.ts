import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { AppModule } from '../src/app.module';
import { AuthHelper, TestUser } from './helpers/auth.helper';
import { DatabaseHelper } from './helpers/database.helper';

describe('Chat & Messaging (BACKEND_CHAT_001 - BACKEND_CHAT_010)', () => {
  let app: INestApplication;
  let authHelper: AuthHelper;
  let dbHelper: DatabaseHelper;
  let user1: TestUser;
  let user2: TestUser;
  let sessionId: string;

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

    user1 = await authHelper.createTestUser('chat-user1@example.com', 'user');
    user2 = await authHelper.createTestUser('chat-user2@example.com', 'user');
  });

  afterAll(async () => {
    await dbHelper.cleanDatabase();
    await app.close();
  });

  describe('BACKEND_CHAT_001 - Create chat session (1-on-1)', () => {
    it('should create session with participants', async () => {
      const response = await authHelper
        .authenticatedRequest(user1)
        .post('/chat-sessions')
        .send({
          participant_ids: [user2.id],
          title: 'Direct Chat',
          is_group: false,
        })
        .expect(201);

      expect(response.body).toHaveProperty('id');
      sessionId = response.body.id;
    });
  });

  describe('BACKEND_CHAT_002 - Create group chat session', () => {
    it('should create group session', async () => {
      const user3 = await authHelper.createTestUser('chat-user3@example.com');

      const response = await authHelper
        .authenticatedRequest(user1)
        .post('/chat-sessions')
        .send({
          participant_ids: [user2.id, user3.id],
          title: 'Fitness Group',
          is_group: true,
        })
        .expect(201);

      expect(response.body.title).toBe('Fitness Group');
      expect(response.body.is_group).toBe(true);
    });
  });

  describe('BACKEND_CHAT_003 - Cannot create session without participants (FAIL)', () => {
    it('should return 400 without participant_ids', async () => {
      await authHelper.authenticatedRequest(user1).post('/chat-sessions').send({}).expect(400);
    });
  });

  describe("BACKEND_CHAT_004 - Retrieve user's chat sessions", () => {
    it('should return sessions for user', async () => {
      const response = await authHelper
        .authenticatedRequest(user1)
        .get('/chat-sessions')
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
    });
  });

  describe('BACKEND_CHAT_005 - Send text message in session', () => {
    it('should create message', async () => {
      const response = await authHelper
        .authenticatedRequest(user1)
        .post('/chat-messages')
        .send({
          chat_session_id: sessionId,
          content: 'Hello!',
          message_type: 'text',
        })
        .expect(201);

      expect(response.body).toHaveProperty('id');
      expect(response.body.content).toBe('Hello!');
    });
  });

  describe('BACKEND_CHAT_006 - Message content required (FAIL)', () => {
    it('should return 400 without content', async () => {
      await authHelper
        .authenticatedRequest(user1)
        .post('/chat-messages')
        .send({
          chat_session_id: sessionId,
          message_type: 'text',
          // content missing
        })
        .expect(400);
    });
  });

  describe('BACKEND_CHAT_007 - Send message with image attachment', () => {
    it('should upload image and create message', async () => {
      const response = await authHelper
        .authenticatedRequest(user1)
        .post('/chat-messages')
        .field('chat_session_id', sessionId)
        .field('content', 'Image message')
        .field('message_type', 'image')
        .attach('image', Buffer.from('fake-image'), 'photo.jpg')
        .expect(201);

      expect(response.body).toHaveProperty('media_url');
    });
  });

  describe('BACKEND_CHAT_008 - Retrieve messages for session', () => {
    it('should return messages with pagination', async () => {
      const response = await authHelper
        .authenticatedRequest(user1)
        .get(`/chat-messages/session/${sessionId}`)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
    });
  });

  describe('BACKEND_CHAT_009 - Messages paginated', () => {
    it('should return paginated messages', async () => {
      const response = await authHelper
        .authenticatedRequest(user1)
        .get(`/chat-messages/session/${sessionId}?page=1&limit=20`)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
    });
  });

  describe('BACKEND_CHAT_010 - Update sent message (edit)', () => {
    it('should edit message content', async () => {
      // Send message first
      const sent = await authHelper.authenticatedRequest(user1).post('/chat-messages').send({
        chat_session_id: sessionId,
        content: 'Original message',
        message_type: 'text',
      });

      const response = await authHelper
        .authenticatedRequest(user1)
        .patch(`/chat-messages/${sent.body.id}`)
        .send({ content: 'Edited message' })
        .expect(200);

      expect(response.body.content).toBe('Edited message');
    });
  });

  // FIXME: Commented out - ChatMessage entity needs @DeleteDateColumn for soft delete
  // describe('BACKEND_CHAT_031 - Delete own message', () => {
  //   it('should soft delete message', async () => {
  //     const sent = await authHelper
  //       .authenticatedRequest(user1)
  //       .post('/chat-messages')
  //       .send({
  //         chat_session_id: sessionId,
  //         content: 'Deletable message',
  //         message_type: 'text',
  //       });

  //     const response = await authHelper
  //       .authenticatedRequest(user1)
  //       .delete(`/chat-messages/${sent.body.id}`)
  //       .expect(200);

  //     expect(response.body).toHaveProperty('id');
  //   });
  // });
});
