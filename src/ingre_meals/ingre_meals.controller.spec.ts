import { Test, TestingModule } from '@nestjs/testing';
import { IngreMealsController } from './ingre_meals.controller';
import { IngreMealsService } from './ingre_meals.service';

describe('IngreMealsController', () => {
  let controller: IngreMealsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [IngreMealsController],
      providers: [IngreMealsService],
    }).compile();

    controller = module.get<IngreMealsController>(IngreMealsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
