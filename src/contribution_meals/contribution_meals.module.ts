import { Module } from '@nestjs/common';
import { ContributionMealsService } from './contribution_meals.service';
import { ContributionMealsController } from './contribution_meals.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ContributionMeal } from './entities/contribution_meal.entity';
import { Meal } from 'src/meals/entities/meal.entity';
import { IngreMeal } from 'src/ingre_meals/entities/ingre_meal.entity';
import { Ingredient } from 'src/ingredients/entities/ingredient.entity';
import { MealsModule } from 'src/meals/meals.module';
import { SupabaseStorageModule } from 'src/supabase-storage/supabase-storage.module';
import { NotificationsModule } from 'src/notifications/notifications.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([ContributionMeal, Meal, IngreMeal, Ingredient]),
    MealsModule,
    SupabaseStorageModule,
    NotificationsModule,
  ],
  controllers: [ContributionMealsController],
  providers: [ContributionMealsService],
  exports: [ContributionMealsService],
})
export class ContributionMealsModule {}
