import { Module } from '@nestjs/common';
import { FitnessGoalsService } from './fitness_goals.service';
import { FitnessGoalsController } from './fitness_goals.controller';

@Module({
  controllers: [FitnessGoalsController],
  providers: [FitnessGoalsService],
})
export class FitnessGoalsModule {}
