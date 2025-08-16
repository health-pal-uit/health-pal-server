import { Test, TestingModule } from '@nestjs/testing';
import { IngreMealsService } from './ingre_meals.service';

describe('IngreMealsService', () => {
  let service: IngreMealsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [IngreMealsService],
    }).compile();

    service = module.get<IngreMealsService>(IngreMealsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
