import { Test, TestingModule } from '@nestjs/testing';
import { ExpertsRatingsController } from './experts_ratings.controller';
import { ExpertsRatingsService } from './experts_ratings.service';

describe('ExpertsRatingsController', () => {
  let controller: ExpertsRatingsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ExpertsRatingsController],
      providers: [ExpertsRatingsService],
    }).compile();

    controller = module.get<ExpertsRatingsController>(ExpertsRatingsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
