import { Injectable } from '@nestjs/common';
import { CreateFitnessGoalDto } from './dto/create-fitness_goal.dto';
import { UpdateFitnessGoalDto } from './dto/update-fitness_goal.dto';

@Injectable()
export class FitnessGoalsService {
  create(createFitnessGoalDto: CreateFitnessGoalDto) {
    return 'This action adds a new fitnessGoal';
  }

  findAll() {
    return `This action returns all fitnessGoals`;
  }

  findOne(id: number) {
    return `This action returns a #${id} fitnessGoal`;
  }

  update(id: number, updateFitnessGoalDto: UpdateFitnessGoalDto) {
    return `This action updates a #${id} fitnessGoal`;
  }

  remove(id: number) {
    return `This action removes a #${id} fitnessGoal`;
  }
}
