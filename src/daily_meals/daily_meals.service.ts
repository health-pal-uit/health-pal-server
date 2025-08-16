import { Injectable } from '@nestjs/common';
import { CreateDailyMealDto } from './dto/create-daily_meal.dto';
import { UpdateDailyMealDto } from './dto/update-daily_meal.dto';

@Injectable()
export class DailyMealsService {
  create(createDailyMealDto: CreateDailyMealDto) {
    return 'This action adds a new dailyMeal';
  }

  findAll() {
    return `This action returns all dailyMeals`;
  }

  findOne(id: number) {
    return `This action returns a #${id} dailyMeal`;
  }

  update(id: number, updateDailyMealDto: UpdateDailyMealDto) {
    return `This action updates a #${id} dailyMeal`;
  }

  remove(id: number) {
    return `This action removes a #${id} dailyMeal`;
  }
}
