import { Module } from '@nestjs/common';
import { MealsService } from './meals.service';
import { MealsController } from './meals.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Meal } from './entities/meal.entity';
import { IngreMeal } from 'src/ingre_meals/entities/ingre_meal.entity';
import { ContributionMealsModule } from 'src/contribution_meals/contribution_meals.module';
import { Ingredient } from 'src/ingredients/entities/ingredient.entity';
import { SupabaseStorageModule } from 'src/supabase-storage/supabase-storage.module';

@Module({
  imports: [TypeOrmModule.forFeature([Meal, IngreMeal, Ingredient]), SupabaseStorageModule],
  controllers: [MealsController],
  providers: [MealsService],
  exports: [MealsService],
})
export class MealsModule {}
