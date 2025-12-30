import { Module } from '@nestjs/common';
import { FitnessGoalsService } from './fitness_goals.service';
import { FitnessGoalsController } from './fitness_goals.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FitnessGoal } from './entities/fitness_goal.entity';
import { User } from 'src/users/entities/user.entity';
import { FitnessProfile } from 'src/fitness_profiles/entities/fitness_profile.entity';

@Module({
  imports: [TypeOrmModule.forFeature([FitnessGoal, User, FitnessProfile])],
  controllers: [FitnessGoalsController],
  providers: [FitnessGoalsService],
  exports: [FitnessGoalsService],
})
export class FitnessGoalsModule {}
