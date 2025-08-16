import { Test, TestingModule } from '@nestjs/testing';
import { ChallengesMedalsService } from './challenges_medals.service';

describe('ChallengesMedalsService', () => {
  let service: ChallengesMedalsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ChallengesMedalsService],
    }).compile();

    service = module.get<ChallengesMedalsService>(ChallengesMedalsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
