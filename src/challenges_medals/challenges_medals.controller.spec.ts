import { Test, TestingModule } from '@nestjs/testing';
import { ChallengesMedalsController } from './challenges_medals.controller';
import { ChallengesMedalsService } from './challenges_medals.service';

describe('ChallengesMedalsController', () => {
  let controller: ChallengesMedalsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ChallengesMedalsController],
      providers: [ChallengesMedalsService],
    }).compile();

    controller = module.get<ChallengesMedalsController>(ChallengesMedalsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
