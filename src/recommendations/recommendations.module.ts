import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RecommendationsService } from './recommendations.service';
import { RecommendationsController } from './recommendations.controller';
import { FitnessGoalsModule } from 'src/fitness_goals/fitness_goals.module';
import { FitnessProfilesModule } from 'src/fitness_profiles/fitness_profiles.module';
import { Meal } from 'src/meals/entities/meal.entity';
import { DailyLog } from 'src/daily_logs/entities/daily_log.entity';
import { Expert } from 'src/experts/entities/expert.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Meal, DailyLog, Expert]),
    FitnessGoalsModule,
    FitnessProfilesModule,
  ],
  controllers: [RecommendationsController],
  providers: [RecommendationsService],
})
export class RecommendationsModule {}
