import { HttpException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios, { AxiosError, AxiosHeaders } from 'axios';
import FormData from 'form-data';
import { FoodVisionService } from './food-vision.service';
import { FoodRecognitionPolicy } from './dto/recognize-food.dto';
import type { MealsService } from 'src/meals/meals.service';
import type { IngredientsService } from 'src/ingredients/ingredients.service';
import type { ContributionMealsService } from 'src/contribution_meals/contribution_meals.service';
import type { ContributionIngresService } from 'src/contribution_ingres/contribution_ingres.service';

const requestId = 'food-unit-123';
const top = { class_id: 87, label: 'Pho', confidence: 0.8, bbox_xyxy: [0, 0, 64, 48] };
const image = {
  buffer: Buffer.from('unit-image'),
  originalname: 'food.png',
  mimetype: 'image/png',
} as Express.Multer.File;
const metadata = () => ({
  schema_version: '1.0',
  request_id: requestId,
  model_version: 'healthpal-selected-92-v1',
  model_sha256: 'c'.repeat(64),
  policy_version: 'healthpal-main10-20261110-v1',
  catalogue_version: 'main10-v1',
  image: { width: 64, height: 48, coordinate_space: 'decoded_exif_oriented_image' },
  candidate: top,
  user_confirmation_required: true,
  original_inference_passes: 1,
  brightened_inference_passes: 0,
  processing_ms: 25,
});
const recognized = (policy = FoodRecognitionPolicy.P1) => ({
  ...metadata(),
  policy,
  status: 'accepted',
  reason: 'accepted',
  suggestion: top,
});
const compared = () => ({
  ...metadata(),
  brightened_inference_passes: 1,
  results: Object.values(FoodRecognitionPolicy).map((policy) => ({
    policy,
    status: 'accepted',
    reason: 'accepted',
    suggestion: top,
  })),
});
const response = (data: unknown, status = 200) => ({
  data,
  status,
  statusText: 'OK',
  headers: {},
  config: { headers: new AxiosHeaders() },
});

describe('FoodVisionService recognition adapter', () => {
  let service: FoodVisionService;
  let config: ConfigService;
  let post: jest.SpiedFunction<typeof axios.post>;
  beforeEach(() => {
    config = new ConfigService({
      FOOD_VISION_URL: 'http://legacy.test/analyze',
      HEALTHPAL_AI_BASE_URL: 'http://127.0.0.1:8001',
    });
    service = new FoodVisionService(
      config,
      {} as MealsService,
      {} as IngredientsService,
      {} as ContributionMealsService,
      {} as ContributionIngresService,
    );
    post = jest.spyOn(axios, 'post');
  });
  afterEach(() => jest.restoreAllMocks());

  it('keeps the legacy labels-only call and URL unchanged', async () => {
    post.mockResolvedValue(response({ labels: ['Pho', 'Egg'] }));
    await expect(service.analyzeFoodImage(image)).resolves.toEqual(['Pho', 'Egg']);
    expect(post.mock.calls[0][0]).toBe('http://legacy.test/analyze');
    expect(post.mock.calls[0][2]?.timeout).toBeUndefined();
  });
  it('forwards multipart policy, trace ID and the approved timeout, preserving the full result', async () => {
    const result = recognized(FoodRecognitionPolicy.P2);
    post.mockResolvedValue(response(result));
    await expect(
      service.recognizeFoodImage(image, FoodRecognitionPolicy.P2, requestId),
    ).resolves.toBe(result);
    const [url, body, options] = post.mock.calls[0];
    expect(url).toBe('http://127.0.0.1:8001/v1/recognize');
    expect((body as FormData).getBuffer().toString()).toContain('name="policy"\r\n\r\nP2');
    expect(options).toMatchObject({
      timeout: 10000,
      maxRedirects: 0,
      headers: { 'X-Request-ID': requestId },
    });
  });
  it.each([
    { ...recognized(), status: 'uncertain', reason: 'below_threshold', suggestion: null },
    {
      ...recognized(),
      status: 'no_detection',
      reason: 'no_candidate',
      candidate: null,
      suggestion: null,
    },
  ])('preserves a valid $status as a successful structured result', async (result) => {
    post.mockResolvedValue(response(result));
    await expect(
      service.recognizeFoodImage(image, FoodRecognitionPolicy.P1, requestId),
    ).resolves.toBe(result);
  });
  it('calls compare once instead of three separate recognition calls', async () => {
    const result = compared();
    post.mockResolvedValue(response(result));
    await expect(service.compareFoodImage(image, requestId)).resolves.toBe(result);
    expect(post).toHaveBeenCalledTimes(1);
    expect(post.mock.calls[0][0]).toBe('http://127.0.0.1:8001/v1/compare');
    expect((post.mock.calls[0][1] as FormData).getBuffer().toString()).not.toContain(
      'name="policy"',
    );
  });
  it.each([
    { labels: ['Pho'] },
    { ...recognized(), request_id: 'different-request' },
    { ...recognized(), policy: FoodRecognitionPolicy.P0 },
    { ...recognized(), candidate: { ...top, bbox_xyxy: [0, 0] } },
    { ...recognized(), user_confirmation_required: false },
    { ...recognized(), suggestion: null },
    { ...recognized(), statusCode: 200, message: 'bypass envelope' },
  ])('rejects an invalid, uncorrelated or incompatible upstream body', async (result) => {
    post.mockResolvedValue(response(result));
    try {
      await service.recognizeFoodImage(image, FoodRecognitionPolicy.P1, requestId);
      throw new Error('Expected rejection');
    } catch (error) {
      expect(error).toBeInstanceOf(HttpException);
      expect((error as HttpException).getStatus()).toBe(502);
      expect((error as HttpException).getResponse()).toMatchObject({
        code: 'ai_invalid_response',
        request_id: requestId,
      });
    }
  });
  it('rejects a comparison missing a unique policy outcome', async () => {
    const result = compared();
    result.results[2].policy = FoodRecognitionPolicy.P1;
    post.mockResolvedValue(response(result));
    await expect(service.compareFoodImage(image, requestId)).rejects.toMatchObject({ status: 502 });
  });
  it.each([
    ['ECONNABORTED', 504, 'ai_timeout'],
    ['ETIMEDOUT', 504, 'ai_timeout'],
    ['ECONNREFUSED', 503, 'ai_unavailable'],
  ])('maps transport %s to a safe structured failure', async (code, status, expectedCode) => {
    post.mockRejectedValue(new AxiosError('private upstream address and stack', code as string));
    try {
      await service.recognizeFoodImage(image, FoodRecognitionPolicy.P1, requestId);
      throw new Error('Expected rejection');
    } catch (error) {
      expect((error as HttpException).getStatus()).toBe(status);
      expect((error as HttpException).getResponse()).toMatchObject({
        code: expectedCode,
        request_id: requestId,
        retryable: true,
      });
      expect(JSON.stringify((error as HttpException).getResponse())).not.toContain(
        'private upstream',
      );
    }
  });
  it.each([
    [400, 400],
    [413, 413],
    [415, 415],
    [422, 400],
    [503, 503],
    [500, 502],
  ])('maps upstream HTTP %i to %i', async (upstream, expected) => {
    post.mockRejectedValue(
      new AxiosError('private detail', undefined, undefined, undefined, response({}, upstream)),
    );
    await expect(
      service.recognizeFoodImage(image, FoodRecognitionPolicy.P1, requestId),
    ).rejects.toMatchObject({ status: expected });
  });
  it('rejects invalid configuration without sending an image', async () => {
    config.set('HEALTHPAL_AI_TIMEOUT_MS', 'not-a-number');
    await expect(
      service.recognizeFoodImage(image, FoodRecognitionPolicy.P1, requestId),
    ).rejects.toMatchObject({ status: 503 });
    expect(post).not.toHaveBeenCalled();
  });
});
