import { PartialType } from '@nestjs/mapped-types';
import { CreateIngreMealDto } from './create-ingre_meal.dto';

export class UpdateIngreMealDto extends PartialType(CreateIngreMealDto) {}
