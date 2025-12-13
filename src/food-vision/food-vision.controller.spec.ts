import { Test, TestingModule } from '@nestjs/testing';
import { FoodVisionController } from './food-vision.controller';
import { FoodVisionService } from './food-vision.service';

describe('FoodVisionController', () => {
  let controller: FoodVisionController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [FoodVisionController],
      providers: [FoodVisionService],
    }).compile();

    controller = module.get<FoodVisionController>(FoodVisionController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
