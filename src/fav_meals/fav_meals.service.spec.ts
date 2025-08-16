import { Test, TestingModule } from '@nestjs/testing';
import { FavMealsService } from './fav_meals.service';

describe('FavMealsService', () => {
  let service: FavMealsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [FavMealsService],
    }).compile();

    service = module.get<FavMealsService>(FavMealsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
