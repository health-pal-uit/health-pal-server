import { Test, TestingModule } from '@nestjs/testing';
import { FavMealsController } from './fav_meals.controller';
import { FavMealsService } from './fav_meals.service';

describe('FavMealsController', () => {
  let controller: FavMealsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [FavMealsController],
      providers: [FavMealsService],
    }).compile();

    controller = module.get<FavMealsController>(FavMealsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
