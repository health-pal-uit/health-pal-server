import { Module } from '@nestjs/common';
import { FitnessGoalsService } from './fitness_goals.service';
import { FitnessGoalsController } from './fitness_goals.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FitnessGoal } from './entities/fitness_goal.entity';
import { User } from 'src/users/entities/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([FitnessGoal, User])],
  controllers: [FitnessGoalsController],
  providers: [FitnessGoalsService],
})
export class FitnessGoalsModule {}
