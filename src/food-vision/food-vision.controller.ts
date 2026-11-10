import {
  Body,
  BadRequestException,
  CallHandler,
  Controller,
  ExecutionContext,
  FileTypeValidator,
  Get,
  HttpCode,
  HttpException,
  MaxFileSizeValidator,
  NestInterceptor,
  ParseFilePipe,
  Post,
  Query,
  Req,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FoodVisionService } from './food-vision.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { SupabaseGuard } from 'src/auth/guards/supabase/supabase.guard';
import { CurrentUser } from 'src/helpers/decorators/current-user.decorator';
import type { ReqUserType } from 'src/auth/types/req.type';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiHeader,
  ApiOkResponse,
  ApiOperation,
  ApiResponse,
} from '@nestjs/swagger';
import { randomUUID } from 'node:crypto';
import { catchError, throwError } from 'rxjs';
import type { Request, Response } from 'express';
import { FoodRecognitionPolicy, RecognizeFoodDto } from './dto/recognize-food.dto';

type RecognitionRequest = Request & { recognitionRequestId: string };
const maxImageBytes = 10 * 1024 * 1024;

/** Request context is scoped to the new routes; legacy behavior is unchanged. */
class RecognitionRequestContext implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler) {
    const request = context.switchToHttp().getRequest<RecognitionRequest>();
    const response = context.switchToHttp().getResponse<Response>();
    const supplied = request.get('X-Request-ID');
    const valid = supplied !== undefined && /^[A-Za-z0-9._:-]{1,64}$/.test(supplied);
    const requestId = valid ? supplied : randomUUID();
    request.recognitionRequestId = requestId;
    response.setHeader('X-Request-ID', requestId);
    if (supplied !== undefined && !valid) {
      throw new BadRequestException({
        statusCode: 400,
        code: 'invalid_request_id',
        message:
          'X-Request-ID must contain 1–64 letters, digits, dots, underscores, colons or hyphens.',
        request_id: requestId,
        retryable: false,
      });
    }
    return next.handle().pipe(
      catchError((error: unknown) => {
        if (!(error instanceof HttpException)) return throwError(() => error);
        const body = error.getResponse();
        const details =
          typeof body === 'object' && body !== null
            ? (body as Record<string, unknown>)
            : { message: body };
        const status = error.getStatus();
        return throwError(
          () =>
            new HttpException(
              {
                ...details,
                statusCode: status,
                code: details.code ?? (status === 413 ? 'image_too_large' : 'invalid_request'),
                request_id: requestId,
                retryable: details.retryable ?? status >= 500,
              },
              status,
            ),
        );
      }),
    );
  }
}

const imagePipe = () =>
  new ParseFilePipe({
    fileIsRequired: true,
    validators: [
      // Nest's size validator is strict-less-than; +1 permits exactly 10 MiB.
      new MaxFileSizeValidator({ maxSize: maxImageBytes + 1 }),
      new FileTypeValidator({ fileType: /^image\/(jpeg|png|webp)$/ }),
    ],
  });
const imageUpload = () =>
  FileInterceptor('file', { limits: { fileSize: maxImageBytes + 1, files: 1 } });
const imageBody = {
  type: 'object',
  required: ['file'],
  properties: {
    file: { type: 'string', format: 'binary' },
  },
};

@Controller('food-vision')
export class FoodVisionController {
  constructor(private readonly foodVisionService: FoodVisionService) {}

  @UseGuards(SupabaseGuard)
  @Post('analyze')
  @UseInterceptors(FileInterceptor('file'))
  async analyzeFoodImage(@UploadedFile() image: Express.Multer.File) {
    return this.foodVisionService.analyzeFoodImage(image);
  }

  @UseGuards(SupabaseGuard)
  @Post('recognize')
  @HttpCode(200)
  @ApiBearerAuth()
  @ApiConsumes('multipart/form-data')
  @ApiHeader({
    name: 'X-Request-ID',
    required: false,
    description: 'Optional correlation ID; generated when absent.',
  })
  @ApiOperation({
    summary: 'Recognize an image with one frozen policy',
    description:
      'Defaults to P1. Returns the complete AI response under data, including status, reason, candidate, suggestion, confidence, box and versions. Requires user confirmation before saving.',
  })
  @ApiBody({
    schema: {
      ...imageBody,
      properties: {
        ...imageBody.properties,
        policy: {
          type: 'string',
          enum: Object.values(FoodRecognitionPolicy),
          default: FoodRecognitionPolicy.P1,
        },
      },
    },
  })
  @ApiOkResponse({
    description:
      'Accepted, uncertain or no_detection result in the existing data/message/statusCode envelope.',
  })
  @ApiResponse({ status: 502, description: 'Invalid or failed upstream AI response.' })
  @ApiResponse({ status: 503, description: 'AI unavailable or configuration invalid.' })
  @ApiResponse({ status: 504, description: 'AI request timed out.' })
  @UseInterceptors(new RecognitionRequestContext(), imageUpload())
  async recognizeFoodImage(
    @UploadedFile(imagePipe()) image: Express.Multer.File,
    @Body() body: RecognizeFoodDto,
    @Req() request: RecognitionRequest,
  ) {
    return this.foodVisionService.recognizeFoodImage(
      image,
      body.policy ?? FoodRecognitionPolicy.P1,
      request.recognitionRequestId,
    );
  }

  @UseGuards(SupabaseGuard)
  @Post('compare')
  @HttpCode(200)
  @ApiBearerAuth()
  @ApiConsumes('multipart/form-data')
  @ApiHeader({
    name: 'X-Request-ID',
    required: false,
    description: 'Optional correlation ID; generated when absent.',
  })
  @ApiOperation({
    summary: 'Compare P0/P1/P2 on one image',
    description:
      'Research/demo endpoint. Returns shared metadata and three policy outcomes from the AI comparison endpoint; does not save a nutrition record.',
  })
  @ApiBody({ schema: imageBody })
  @ApiOkResponse({ description: 'Shared AI metadata and results array under data.' })
  @ApiResponse({ status: 502, description: 'Invalid or failed upstream AI response.' })
  @ApiResponse({ status: 503, description: 'AI unavailable or configuration invalid.' })
  @ApiResponse({ status: 504, description: 'AI request timed out.' })
  @UseInterceptors(new RecognitionRequestContext(), imageUpload())
  async compareFoodImage(
    @UploadedFile(imagePipe()) image: Express.Multer.File,
    @Req() request: RecognitionRequest,
  ) {
    return this.foodVisionService.compareFoodImage(image, request.recognitionRequestId);
  }

  @UseGuards(SupabaseGuard)
  @Post('search')
  async getIngredientOrMealByName(
    @Body('name') name: string,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
  ) {
    return this.foodVisionService.getIngredientOrMealByName(name, page, limit);
  }

  @UseGuards(SupabaseGuard)
  @Get('contributions/me')
  async getUserContributions(@CurrentUser() user: ReqUserType) {
    return this.foodVisionService.getUserContributions(user.id);
  }
}
