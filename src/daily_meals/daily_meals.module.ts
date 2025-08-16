import { Module } from '@nestjs/common';
import { DailyMealsService } from './daily_meals.service';
import { DailyMealsController } from './daily_meals.controller';

@Module({
  controllers: [DailyMealsController],
  providers: [DailyMealsService],
})
export class DailyMealsModule {}
