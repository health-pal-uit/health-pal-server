import { PartialType } from '@nestjs/mapped-types';
import { CreateDailyMealDto } from './create-daily_meal.dto';

export class UpdateDailyMealDto extends PartialType(CreateDailyMealDto) {}
