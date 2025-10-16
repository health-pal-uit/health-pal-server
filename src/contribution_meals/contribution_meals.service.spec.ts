import { Test, TestingModule } from '@nestjs/testing';
import { ContributionMealsService } from './contribution_meals.service';

describe('ContributionMealsService', () => {
  let service: ContributionMealsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ContributionMealsService],
    }).compile();

    service = module.get<ContributionMealsService>(ContributionMealsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
