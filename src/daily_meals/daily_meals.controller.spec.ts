import { Test, TestingModule } from '@nestjs/testing';
import { DailyMealsController } from './daily_meals.controller';
import { DailyMealsService } from './daily_meals.service';

describe('DailyMealsController', () => {
  let controller: DailyMealsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DailyMealsController],
      providers: [DailyMealsService],
    }).compile();

    controller = module.get<DailyMealsController>(DailyMealsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
