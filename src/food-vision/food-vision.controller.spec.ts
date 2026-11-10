import { Test } from '@nestjs/testing';
import type { Request } from 'express';
import { FoodVisionController } from './food-vision.controller';
import { FoodVisionService } from './food-vision.service';
import { FoodRecognitionPolicy, RecognizeFoodDto } from './dto/recognize-food.dto';
import { SupabaseGuard } from 'src/auth/guards/supabase/supabase.guard';

describe('FoodVisionController', () => {
  let controller: FoodVisionController;

  const service = {
    analyzeFoodImage: jest.fn(),
    recognizeFoodImage: jest.fn(),
    compareFoodImage: jest.fn(),
  };
  const image = { buffer: Buffer.from('controller-fixture') } as Express.Multer.File;
  const request = { recognitionRequestId: 'controller-test' } as Request & {
    recognitionRequestId: string;
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    const module = await Test.createTestingModule({
      controllers: [FoodVisionController],
      providers: [{ provide: FoodVisionService, useValue: service }],
    })
      .overrideGuard(SupabaseGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<FoodVisionController>(FoodVisionController);
  });

  it('keeps legacy analyze delegation', async () => {
    service.analyzeFoodImage.mockResolvedValue(['Pho']);
    await expect(controller.analyzeFoodImage(image)).resolves.toEqual(['Pho']);
    expect(service.analyzeFoodImage).toHaveBeenCalledWith(image);
  });

  it('defaults recognition to P1 with the request ID', async () => {
    service.recognizeFoodImage.mockResolvedValue({ status: 'uncertain' });
    await expect(
      controller.recognizeFoodImage(image, new RecognizeFoodDto(), request),
    ).resolves.toEqual({ status: 'uncertain' });
    expect(service.recognizeFoodImage).toHaveBeenCalledWith(
      image,
      FoodRecognitionPolicy.P1,
      'controller-test',
    );
  });

  it('passes the selected policy unchanged', async () => {
    await controller.recognizeFoodImage(image, { policy: FoodRecognitionPolicy.P2 }, request);
    expect(service.recognizeFoodImage).toHaveBeenCalledWith(
      image,
      FoodRecognitionPolicy.P2,
      'controller-test',
    );
  });

  it('delegates comparison once', async () => {
    service.compareFoodImage.mockResolvedValue({ results: [] });
    await expect(controller.compareFoodImage(image, request)).resolves.toEqual({ results: [] });
    expect(service.compareFoodImage).toHaveBeenCalledWith(image, 'controller-test');
  });
});
