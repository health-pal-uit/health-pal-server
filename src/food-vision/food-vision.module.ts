import { Module } from '@nestjs/common';
import { FoodVisionService } from './food-vision.service';
import { FoodVisionController } from './food-vision.controller';
import { MealsModule } from 'src/meals/meals.module';
import { IngredientsModule } from 'src/ingredients/ingredients.module';

@Module({
  imports: [MealsModule, IngredientsModule],
  controllers: [FoodVisionController],
  providers: [FoodVisionService],
})
export class FoodVisionModule {}
