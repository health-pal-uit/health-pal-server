import { Module } from '@nestjs/common';
import { DailyMealsService } from './daily_meals.service';
import { DailyMealsController } from './daily_meals.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DailyMeal } from './entities/daily_meal.entity';
import { DailyLog } from 'src/daily_logs/entities/daily_log.entity';
import { Meal } from 'src/meals/entities/meal.entity';
import { DailyLogsModule } from 'src/daily_logs/daily_logs.module';

@Module({
  imports: [TypeOrmModule.forFeature([DailyMeal, DailyLog, Meal]), DailyLogsModule],
  controllers: [DailyMealsController],
  providers: [DailyMealsService],
})
export class DailyMealsModule {}
