import { Test, TestingModule } from '@nestjs/testing';
import { FitnessProfilesService } from './fitness_profiles.service';

describe('FitnessProfilesService', () => {
  let service: FitnessProfilesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [FitnessProfilesService],
    }).compile();

    service = module.get<FitnessProfilesService>(FitnessProfilesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
