import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RecommendationsService } from './recommendations.service';
import { RecommendationsController } from './recommendations.controller';
import { FitnessGoalsModule } from 'src/fitness_goals/fitness_goals.module';
import { FitnessProfilesModule } from 'src/fitness_profiles/fitness_profiles.module';
import { Meal } from 'src/meals/entities/meal.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Meal]), FitnessGoalsModule, FitnessProfilesModule],
  controllers: [RecommendationsController],
  providers: [RecommendationsService],
})
export class RecommendationsModule {}
