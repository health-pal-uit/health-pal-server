import { Module } from '@nestjs/common';
import { ContributionMealsService } from './contribution_meals.service';
import { ContributionMealsController } from './contribution_meals.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ContributionMeal } from './entities/contribution_meal.entity';
import { Meal } from 'src/meals/entities/meal.entity';
import { IngreMeal } from 'src/ingre_meals/entities/ingre_meal.entity';
import { MealsModule } from 'src/meals/meals.module';
import { SupabaseStorageModule } from 'src/supabase-storage/supabase-storage.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([ContributionMeal, Meal, IngreMeal]),
    MealsModule,
    SupabaseStorageModule,
  ],
  controllers: [ContributionMealsController],
  providers: [ContributionMealsService],
  exports: [ContributionMealsService],
})
export class ContributionMealsModule {}
