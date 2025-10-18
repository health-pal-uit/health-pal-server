import { PartialType } from '@nestjs/swagger';
import { CreateContributionMealDto } from './create-contribution_meal.dto';

export class UpdateContributionMealDto extends PartialType(CreateContributionMealDto) {}
