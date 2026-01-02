import { Module } from '@nestjs/common';
import { FoodVisionService } from './food-vision.service';
import { FoodVisionController } from './food-vision.controller';
import { MealsModule } from 'src/meals/meals.module';
import { IngredientsModule } from 'src/ingredients/ingredients.module';
import { ContributionMealsModule } from 'src/contribution_meals/contribution_meals.module';
import { ContributionIngresModule } from 'src/contribution_ingres/contribution_ingres.module';

@Module({
  imports: [MealsModule, IngredientsModule, ContributionMealsModule, ContributionIngresModule],
  controllers: [FoodVisionController],
  providers: [FoodVisionService],
})
export class FoodVisionModule {}
