import { Module } from '@nestjs/common';
import { RecommendationsService } from './recommendations.service';
import { RecommendationsController } from './recommendations.controller';
import { FitnessGoalsModule } from 'src/fitness_goals/fitness_goals.module';
import { FitnessProfilesModule } from 'src/fitness_profiles/fitness_profiles.module';

@Module({
  imports: [FitnessGoalsModule, FitnessProfilesModule],
  controllers: [RecommendationsController],
  providers: [RecommendationsService],
})
export class RecommendationsModule {}
