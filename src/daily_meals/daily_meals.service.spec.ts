import { Test, TestingModule } from '@nestjs/testing';
import { DailyMealsService } from './daily_meals.service';

describe('DailyMealsService', () => {
  let service: DailyMealsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [DailyMealsService],
    }).compile();

    service = module.get<DailyMealsService>(DailyMealsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
