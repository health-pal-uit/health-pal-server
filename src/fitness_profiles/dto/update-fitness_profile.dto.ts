import { PartialType } from '@nestjs/mapped-types';
import { CreateFitnessProfileDto } from './create-fitness_profile.dto';

export class UpdateFitnessProfileDto extends PartialType(CreateFitnessProfileDto) {}
