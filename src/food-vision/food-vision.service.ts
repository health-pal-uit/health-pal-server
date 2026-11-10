import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import FormData from 'form-data';
import { IngredientsService } from 'src/ingredients/ingredients.service';
import { MealsService } from 'src/meals/meals.service';
import { ContributionMealsService } from 'src/contribution_meals/contribution_meals.service';
import { ContributionIngresService } from 'src/contribution_ingres/contribution_ingres.service';
import { FoodRecognitionPolicy } from './dto/recognize-food.dto';
import {
  isFoodComparisonResponse,
  isFoodRecognitionResponse,
} from './types/recognition-response.type';
import type {
  FoodComparisonResponse,
  FoodRecognitionResponse,
} from './types/recognition-response.type';

@Injectable()
export class FoodVisionService {
  private readonly logger = new Logger(FoodVisionService.name);

  constructor(
    private readonly config: ConfigService,
    private readonly mealsService: MealsService,
    private readonly ingredientsService: IngredientsService,
    private readonly contributionMealsService: ContributionMealsService,
    private readonly contributionIngresService: ContributionIngresService,
  ) {
    this.food_url = this.config.get<string>('FOOD_VISION_URL')!;
  }
  food_url: string;

  async analyzeFoodImage(image: Express.Multer.File) {
    const formData = new FormData();
    formData.append('file', image.buffer, {
      filename: image.originalname,
      contentType: image.mimetype,
    });
    const response = await axios.post(this.food_url, formData, {
      headers: {
        ...formData.getHeaders(),
      },
    });
    return response.data.labels;
  }

  async recognizeFoodImage(
    image: Express.Multer.File,
    policy: FoodRecognitionPolicy,
    requestId: string,
  ): Promise<FoodRecognitionResponse> {
    const data = await this.requestRecognition('recognize', image, requestId, policy);
    if (
      !isFoodRecognitionResponse(data) ||
      data.policy !== policy ||
      data.request_id !== requestId
    ) {
      throw this.recognitionError(
        HttpStatus.BAD_GATEWAY,
        'ai_invalid_response',
        'Recognition returned an invalid response.',
        requestId,
        true,
      );
    }
    return data;
  }

  async compareFoodImage(
    image: Express.Multer.File,
    requestId: string,
  ): Promise<FoodComparisonResponse> {
    const data = await this.requestRecognition('compare', image, requestId);
    if (!isFoodComparisonResponse(data) || data.request_id !== requestId) {
      throw this.recognitionError(
        HttpStatus.BAD_GATEWAY,
        'ai_invalid_response',
        'Recognition returned an invalid response.',
        requestId,
        true,
      );
    }
    return data;
  }

  private async requestRecognition(
    endpoint: 'recognize' | 'compare',
    image: Express.Multer.File,
    requestId: string,
    policy?: FoodRecognitionPolicy,
  ): Promise<unknown> {
    const base = this.config.get<string>('HEALTHPAL_AI_BASE_URL') ?? 'http://127.0.0.1:8001';
    const timeout = Number(this.config.get<string | number>('HEALTHPAL_AI_TIMEOUT_MS') ?? 10000);
    try {
      const url = new URL(base);
      if (
        !['http:', 'https:'].includes(url.protocol) ||
        url.username ||
        url.password ||
        url.search ||
        url.hash ||
        !Number.isSafeInteger(timeout) ||
        timeout <= 0
      )
        throw new Error('Invalid AI configuration');
    } catch {
      throw this.recognitionError(
        HttpStatus.SERVICE_UNAVAILABLE,
        'ai_configuration_error',
        'Recognition is not configured correctly.',
        requestId,
        false,
      );
    }

    const form = new FormData();
    form.append('file', image.buffer, {
      filename: image.originalname,
      contentType: image.mimetype,
    });
    if (policy !== undefined) form.append('policy', policy);
    const started = Date.now();
    try {
      const response = await axios.post<unknown>(
        `${base.replace(/\/+$/, '')}/v1/${endpoint}`,
        form,
        {
          headers: { ...form.getHeaders(), 'X-Request-ID': requestId },
          timeout,
          maxRedirects: 0,
          maxBodyLength: 10 * 1024 * 1024 + 64 * 1024,
          maxContentLength: 1024 * 1024,
        },
      );
      this.logger.log(
        JSON.stringify({
          event: 'food_recognition',
          request_id: requestId,
          endpoint,
          upstream_status: response.status,
          elapsed_ms: Date.now() - started,
        }),
      );
      return response.data;
    } catch (error: unknown) {
      const upstream = axios.isAxiosError(error) ? error.response?.status : undefined;
      const code = axios.isAxiosError(error) ? error.code : undefined;
      this.logger.warn(
        JSON.stringify({
          event: 'food_recognition_failed',
          request_id: requestId,
          endpoint,
          upstream_status: upstream,
          transport_code: code,
          elapsed_ms: Date.now() - started,
        }),
      );
      if (code === 'ECONNABORTED' || code === 'ETIMEDOUT') {
        throw this.recognitionError(
          HttpStatus.GATEWAY_TIMEOUT,
          'ai_timeout',
          'Recognition timed out. Retry or select food manually.',
          requestId,
          true,
        );
      }
      if (upstream === 400 || upstream === 422) {
        throw this.recognitionError(
          HttpStatus.BAD_REQUEST,
          'invalid_image',
          'The AI service could not process this image.',
          requestId,
          false,
        );
      }
      if (upstream === 413) {
        throw this.recognitionError(
          HttpStatus.PAYLOAD_TOO_LARGE,
          'image_too_large',
          'The image exceeds the recognition limits.',
          requestId,
          false,
        );
      }
      if (upstream === 415) {
        throw this.recognitionError(
          HttpStatus.UNSUPPORTED_MEDIA_TYPE,
          'unsupported_image',
          'Use a JPEG, PNG or WebP image.',
          requestId,
          false,
        );
      }
      if (upstream === 503 || (axios.isAxiosError(error) && !error.response)) {
        throw this.recognitionError(
          HttpStatus.SERVICE_UNAVAILABLE,
          'ai_unavailable',
          'Recognition is unavailable. Retry or select food manually.',
          requestId,
          true,
        );
      }
      throw this.recognitionError(
        HttpStatus.BAD_GATEWAY,
        'ai_upstream_error',
        'Recognition could not complete. Retry or select food manually.',
        requestId,
        true,
      );
    }
  }

  private recognitionError(
    statusCode: HttpStatus,
    code: string,
    message: string,
    requestId: string,
    retryable: boolean,
  ): HttpException {
    return new HttpException(
      { statusCode, message, code, request_id: requestId, retryable },
      statusCode,
    );
  }

  async getIngredientOrMealByName(name: string, page: number, limit: number) {
    this.logger.log(`Searching for ingredient or meal by name: ${name}`);
    // search both ingredients and meals concurrently
    const [ingredientResult, mealResult] = await Promise.all([
      this.ingredientsService.searchByName(name, page, limit),
      this.mealsService.searchByName(name, page, limit),
    ]);

    // combine all results
    const combinedData = [
      ...ingredientResult.data.map((item) => ({ ...item, type: 'ingredient' })),
      ...mealResult.data.map((item) => ({ ...item, type: 'meal' })),
    ];

    return {
      total: ingredientResult.total + mealResult.total,
      data: combinedData,
    };
  }

  async getUserContributions(userId: string) {
    this.logger.log(`Getting all contributions for user: ${userId}`);
    // fetch both contribution types concurrently
    const [contributionMeals, contributionIngredients] = await Promise.all([
      this.contributionMealsService.findAllUser(userId),
      this.contributionIngresService.findAllUser(userId),
    ]);

    // combine all results with type tags
    const combinedData = [
      ...contributionMeals.map((item) => ({ ...item, type: 'meal' })),
      ...contributionIngredients.map((item) => ({ ...item, type: 'ingredient' })),
    ];

    return {
      total: contributionMeals.length + contributionIngredients.length,
      data: combinedData,
    };
  }
}
