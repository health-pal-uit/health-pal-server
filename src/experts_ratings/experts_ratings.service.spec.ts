import { Test, TestingModule } from '@nestjs/testing';
import { ExpertsRatingsService } from './experts_ratings.service';

describe('ExpertsRatingsService', () => {
  let service: ExpertsRatingsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ExpertsRatingsService],
    }).compile();

    service = module.get<ExpertsRatingsService>(ExpertsRatingsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
