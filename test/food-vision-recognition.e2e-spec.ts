/** Isolated HTTP contract test: no AppModule, database, seed job or real auth provider. */
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Test } from '@nestjs/testing';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { GUARDS_METADATA } from '@nestjs/common/constants';
import { createServer } from 'node:http';
import type { Server } from 'node:http';
import type { AddressInfo } from 'node:net';
import request from 'supertest';
import { FoodVisionController } from '../src/food-vision/food-vision.controller';
import { FoodVisionService } from '../src/food-vision/food-vision.service';
import { SupabaseGuard } from '../src/auth/guards/supabase/supabase.guard';
import { ResponseInterceptor } from '../src/helpers/interceptors/response.interceptor';
import { MealsService } from '../src/meals/meals.service';
import { IngredientsService } from '../src/ingredients/ingredients.service';
import { ContributionMealsService } from '../src/contribution_meals/contribution_meals.service';
import { ContributionIngresService } from '../src/contribution_ingres/contribution_ingres.service';

const png = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+a3ioAAAAASUVORK5CYII=',
  'base64',
);
const maxBytes = 10 * 1024 * 1024;
const top = { class_id: 87, label: 'Pho', confidence: 0.8, bbox_xyxy: [0, 0, 1, 1] };
const metadata = (id: string) => ({
  schema_version: '1.0',
  request_id: id,
  model_version: 'healthpal-selected-92-v1',
  model_sha256: 'c282c0654c589feb5fec8c6247e99a0ef92f0eefeabf08c5ce825ff7cfd08579',
  policy_version: 'healthpal-main10-20261110-v1',
  catalogue_version: 'main10-v1',
  image: { width: 1, height: 1, coordinate_space: 'decoded_exif_oriented_image' },
  candidate: top,
  user_confirmation_required: true,
  original_inference_passes: 1,
  brightened_inference_passes: 0,
  processing_ms: 25,
});

describe('Structured food recognition HTTP contract (isolated)', () => {
  let app: INestApplication;
  let ai: Server;
  let config: ConfigService;
  let mode: 'accepted' | 'uncertain' | 'no_detection' | 'unavailable' | 'timeout' | 'bad_body';
  let calls: { path: string; requestId: string; body: string }[];
  const timers = new Set<ReturnType<typeof setTimeout>>();

  beforeAll(async () => {
    ai = createServer((incoming, outgoing) => {
      const chunks: Buffer[] = [];
      incoming.on('data', (chunk: Buffer) => chunks.push(chunk));
      incoming.on('end', () => {
        const body = Buffer.concat(chunks).toString('latin1');
        const id = String(incoming.headers['x-request-id'] ?? 'legacy');
        const path = incoming.url ?? '';
        calls.push({ path, requestId: id, body });
        outgoing.setHeader('Content-Type', 'application/json');
        outgoing.setHeader('Connection', 'close');
        if (path === '/legacy') {
          outgoing.end(JSON.stringify({ labels: ['Pho'] }));
          return;
        }
        if (mode === 'unavailable') {
          outgoing.statusCode = 503;
          outgoing.end(JSON.stringify({ error: { code: 'model_not_ready' } }));
          return;
        }
        if (mode === 'bad_body') {
          outgoing.end(JSON.stringify({ labels: ['Pho'] }));
          return;
        }
        const selected = body.match(/name="policy"\r\n\r\n(P[012])\r\n/)?.[1] ?? 'P1';
        const common = metadata(id);
        let result: unknown;
        if (path === '/v1/compare') {
          result = {
            ...common,
            brightened_inference_passes: 1,
            results: [
              { policy: 'P0', status: 'accepted', reason: 'accepted', suggestion: top },
              { policy: 'P1', status: 'accepted', reason: 'accepted', suggestion: top },
              {
                policy: 'P2',
                status: 'uncertain',
                reason: 'view_label_disagreement',
                suggestion: null,
              },
            ],
          };
        } else if (mode === 'no_detection') {
          result = {
            ...common,
            candidate: null,
            policy: selected,
            status: 'no_detection',
            reason: 'no_candidate',
            suggestion: null,
          };
        } else if (mode === 'uncertain') {
          result = {
            ...common,
            candidate: { ...top, confidence: 0.31 },
            policy: selected,
            status: 'uncertain',
            reason: 'below_threshold',
            suggestion: null,
          };
        } else {
          result = {
            ...common,
            policy: selected,
            status: 'accepted',
            reason: 'accepted',
            suggestion: top,
          };
        }
        if (mode === 'timeout') {
          const timer = setTimeout(() => {
            timers.delete(timer);
            if (!outgoing.destroyed) outgoing.end(JSON.stringify(result));
          }, 250);
          timers.add(timer);
        } else outgoing.end(JSON.stringify(result));
      });
    });
    await new Promise<void>((resolve) => ai.listen(0, '127.0.0.1', resolve));
    const base = `http://127.0.0.1:${(ai.address() as AddressInfo).port}`;
    config = new ConfigService({
      HEALTHPAL_AI_BASE_URL: base,
      HEALTHPAL_AI_TIMEOUT_MS: 10000,
      FOOD_VISION_URL: `${base}/legacy`,
    });
    const module = await Test.createTestingModule({
      controllers: [FoodVisionController],
      providers: [
        FoodVisionService,
        { provide: ConfigService, useValue: config },
        ...[
          MealsService,
          IngredientsService,
          ContributionMealsService,
          ContributionIngresService,
        ].map((provide) => ({ provide, useValue: {} })),
      ],
    })
      .overrideGuard(SupabaseGuard)
      .useValue({
        canActivate: (context) =>
          context.switchToHttp().getRequest().headers['x-test-authorized'] === 'yes',
      })
      .compile();
    app = module.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }),
    );
    app.useGlobalInterceptors(new ResponseInterceptor());
    app.useLogger(false);
    await app.init();
  });

  beforeEach(() => {
    mode = 'accepted';
    calls = [];
    config.set('HEALTHPAL_AI_TIMEOUT_MS', 10000);
  });
  afterEach(() => {
    timers.forEach(clearTimeout);
    timers.clear();
  });
  afterAll(async () => {
    if (app) await app.close();
    if (ai) {
      ai.closeAllConnections();
      await new Promise<void>((resolve) => ai.close(() => resolve()));
    }
  });

  const post = (path = '/food-vision/recognize') =>
    request(app.getHttpServer()).post(path).set('X-Test-Authorized', 'yes');

  it('retains the production Supabase guard on both new methods', () => {
    for (const method of ['recognizeFoodImage', 'compareFoodImage']) {
      expect(
        Reflect.getMetadata(GUARDS_METADATA, FoodVisionController.prototype[method]),
      ).toContain(SupabaseGuard);
    }
  });
  it('rejects an unauthenticated test request before contacting AI', async () => {
    await request(app.getHttpServer())
      .post('/food-vision/recognize')
      .attach('file', png, 'food.png')
      .expect(403);
    expect(calls).toHaveLength(0);
  });
  it('defaults to P1 and preserves the full response inside the existing envelope', async () => {
    const response = await post()
      .set('X-Request-ID', 'nest-test-123')
      .attach('file', png, 'food.png')
      .expect(200);
    expect(response.body).toMatchObject({
      message: 'Success',
      statusCode: 200,
      data: {
        request_id: 'nest-test-123',
        policy: 'P1',
        status: 'accepted',
        candidate: top,
        suggestion: top,
        user_confirmation_required: true,
        model_sha256: metadata('id').model_sha256,
      },
    });
    expect(response.headers['x-request-id']).toBe('nest-test-123');
    expect(calls).toHaveLength(1);
    expect(calls[0].path).toBe('/v1/recognize');
    expect(calls[0].body).toContain('name="policy"\r\n\r\nP1');
  });
  it('allows the requested P2 policy', async () => {
    const response = await post().field('policy', 'P2').attach('file', png, 'food.png').expect(200);
    expect(response.body.data.policy).toBe('P2');
    expect(calls[0].body).toContain('name="policy"\r\n\r\nP2');
  });
  it.each(['uncertain', 'no_detection'] as const)(
    'preserves %s as HTTP 200, without an accepted suggestion',
    async (state) => {
      mode = state;
      const response = await post().attach('file', png, 'food.png').expect(200);
      expect(response.body.data.status).toBe(state);
      expect(response.body.data.suggestion).toBeNull();
      expect(response.body.data.request_id).toBe(response.headers['x-request-id']);
    },
  );
  it('forwards one comparison request and preserves all three different outcomes', async () => {
    const response = await post('/food-vision/compare').attach('file', png, 'food.png').expect(200);
    expect(response.body.data.results.map((r) => [r.policy, r.status])).toEqual([
      ['P0', 'accepted'],
      ['P1', 'accepted'],
      ['P2', 'uncertain'],
    ]);
    expect(calls).toHaveLength(1);
    expect(calls[0].path).toBe('/v1/compare');
    expect(calls[0].body).not.toContain('name="policy"');
  });
  it('keeps the legacy analyze response and HTTP status', async () => {
    const response = await post('/food-vision/analyze').attach('file', png, 'food.png').expect(201);
    expect(response.body.data).toEqual(['Pho']);
    expect(calls[0].path).toBe('/legacy');
  });
  it('rejects P3 before making an upstream request', async () => {
    const response = await post().field('policy', 'P3').attach('file', png, 'food.png').expect(400);
    expect(calls).toHaveLength(0);
    expect(response.body.request_id).toBe(response.headers['x-request-id']);
  });
  it('rejects a client-supplied threshold instead of changing the frozen policy', async () => {
    await post().field('confidence_threshold', '0.1').attach('file', png, 'food.png').expect(400);
    expect(calls).toHaveLength(0);
  });
  it('rejects a missing file with a correlated error', async () => {
    const response = await post().field('policy', 'P1').expect(400);
    expect(calls).toHaveLength(0);
    expect(response.body.request_id).toBe(response.headers['x-request-id']);
  });
  it('rejects bytes that are not an image despite the claimed extension/MIME', async () => {
    await post()
      .attach('file', Buffer.from('not an image'), {
        filename: 'fake.png',
        contentType: 'image/png',
      })
      .expect(400);
    expect(calls).toHaveLength(0);
  });
  it('rejects a GIF as outside the supported formats', async () => {
    await post()
      .attach('file', Buffer.from('GIF89a' + '\0'.repeat(50)), 'image.gif')
      .expect(400);
    expect(calls).toHaveLength(0);
  });
  it('accepts exactly 10 MiB', async () => {
    const bytes = Buffer.alloc(maxBytes);
    png.copy(bytes);
    await post().attach('file', bytes, 'food.png').expect(200);
    expect(calls).toHaveLength(1);
  });
  it('rejects an upload above 10 MiB before AI is contacted', async () => {
    const bytes = Buffer.alloc(maxBytes + 1);
    png.copy(bytes);
    const response = await post().attach('file', bytes, 'food.png').expect(413);
    expect(calls).toHaveLength(0);
    expect(response.body.request_id).toBe(response.headers['x-request-id']);
  });
  it('returns structured 503 when AI reports model unavailability', async () => {
    mode = 'unavailable';
    const response = await post().attach('file', png, 'food.png').expect(503);
    expect(response.body).toMatchObject({ code: 'ai_unavailable', retryable: true });
    expect(response.body.request_id).toBe(response.headers['x-request-id']);
  });
  it('returns 504 for a real outbound timeout, not no_detection', async () => {
    mode = 'timeout';
    config.set('HEALTHPAL_AI_TIMEOUT_MS', 50);
    const response = await post().attach('file', png, 'food.png').expect(504);
    expect(response.body.code).toBe('ai_timeout');
    expect(response.body.data).toBeUndefined();
  });
  it('returns 502 instead of accepting a legacy or malformed upstream payload', async () => {
    mode = 'bad_body';
    const response = await post().attach('file', png, 'food.png').expect(502);
    expect(response.body.code).toBe('ai_invalid_response');
  });
  it('rejects an invalid request ID without contacting AI', async () => {
    const response = await post()
      .set('X-Request-ID', 'invalid id')
      .attach('file', png, 'food.png')
      .expect(400);
    expect(response.body.code).toBe('invalid_request_id');
    expect(calls).toHaveLength(0);
  });
  it('documents the multipart file and allowed policies in Swagger', () => {
    const document = SwaggerModule.createDocument(
      app,
      new DocumentBuilder().addBearerAuth().build(),
    );
    const schema = document.paths['/food-vision/recognize'].post?.requestBody as {
      content: Record<string, { schema: { properties: Record<string, { enum?: string[] }> } }>;
    };
    expect(schema.content['multipart/form-data'].schema.properties.policy.enum).toEqual([
      'P0',
      'P1',
      'P2',
    ]);
    expect(document.paths['/food-vision/compare']).toBeDefined();
  });
});
