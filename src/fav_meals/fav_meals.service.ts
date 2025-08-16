import { Injectable } from '@nestjs/common';
import { CreateFavMealDto } from './dto/create-fav_meal.dto';
import { UpdateFavMealDto } from './dto/update-fav_meal.dto';

@Injectable()
export class FavMealsService {
  create(createFavMealDto: CreateFavMealDto) {
    return 'This action adds a new favMeal';
  }

  findAll() {
    return `This action returns all favMeals`;
  }

  findOne(id: number) {
    return `This action returns a #${id} favMeal`;
  }

  update(id: number, updateFavMealDto: UpdateFavMealDto) {
    return `This action updates a #${id} favMeal`;
  }

  remove(id: number) {
    return `This action removes a #${id} favMeal`;
  }
}
