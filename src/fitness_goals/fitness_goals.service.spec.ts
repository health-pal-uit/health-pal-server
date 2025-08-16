import { Test, TestingModule } from '@nestjs/testing';
import { FitnessGoalsService } from './fitness_goals.service';

describe('FitnessGoalsService', () => {
  let service: FitnessGoalsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [FitnessGoalsService],
    }).compile();

    service = module.get<FitnessGoalsService>(FitnessGoalsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
