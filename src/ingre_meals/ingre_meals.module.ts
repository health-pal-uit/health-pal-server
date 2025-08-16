import { Module } from '@nestjs/common';
import { IngreMealsService } from './ingre_meals.service';
import { IngreMealsController } from './ingre_meals.controller';

@Module({
  controllers: [IngreMealsController],
  providers: [IngreMealsService],
})
export class IngreMealsModule {}
