import { Test, TestingModule } from '@nestjs/testing';
import { FoodVisionService } from './food-vision.service';

describe('FoodVisionService', () => {
  let service: FoodVisionService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [FoodVisionService],
    }).compile();

    service = module.get<FoodVisionService>(FoodVisionService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
