import { Test, TestingModule } from '@nestjs/testing';
import { ContributionMealsController } from './contribution_meals.controller';
import { ContributionMealsService } from './contribution_meals.service';

describe('ContributionMealsController', () => {
  let controller: ContributionMealsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ContributionMealsController],
      providers: [ContributionMealsService],
    }).compile();

    controller = module.get<ContributionMealsController>(ContributionMealsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
