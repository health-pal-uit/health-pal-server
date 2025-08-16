import { PartialType } from '@nestjs/mapped-types';
import { CreateFitnessGoalDto } from './create-fitness_goal.dto';

export class UpdateFitnessGoalDto extends PartialType(CreateFitnessGoalDto) {}
