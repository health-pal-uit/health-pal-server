import { Test, TestingModule } from '@nestjs/testing';
import { FitnessGoalsController } from './fitness_goals.controller';
import { FitnessGoalsService } from './fitness_goals.service';

describe('FitnessGoalsController', () => {
  let controller: FitnessGoalsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [FitnessGoalsController],
      providers: [FitnessGoalsService],
    }).compile();

    controller = module.get<FitnessGoalsController>(FitnessGoalsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
