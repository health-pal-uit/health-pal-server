import { Test, TestingModule } from '@nestjs/testing';
import { FitnessProfilesController } from './fitness_profiles.controller';
import { FitnessProfilesService } from './fitness_profiles.service';

describe('FitnessProfilesController', () => {
  let controller: FitnessProfilesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [FitnessProfilesController],
      providers: [FitnessProfilesService],
    }).compile();

    controller = module.get<FitnessProfilesController>(FitnessProfilesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
