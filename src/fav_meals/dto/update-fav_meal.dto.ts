import { PartialType } from '@nestjs/mapped-types';
import { CreateFavMealDto } from './create-fav_meal.dto';

export class UpdateFavMealDto extends PartialType(CreateFavMealDto) {}
