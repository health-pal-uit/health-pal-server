import { Module } from '@nestjs/common';
import { FavMealsService } from './fav_meals.service';
import { FavMealsController } from './fav_meals.controller';

@Module({
  controllers: [FavMealsController],
  providers: [FavMealsService],
})
export class FavMealsModule {}
