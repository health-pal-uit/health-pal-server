import { Injectable } from '@nestjs/common';
import { CreateIngreMealDto } from './dto/create-ingre_meal.dto';
import { UpdateIngreMealDto } from './dto/update-ingre_meal.dto';

@Injectable()
export class IngreMealsService {
  create(createIngreMealDto: CreateIngreMealDto) {
    return 'This action adds a new ingreMeal';
  }

  findAll() {
    return `This action returns all ingreMeals`;
  }

  findOne(id: number) {
    return `This action returns a #${id} ingreMeal`;
  }

  update(id: number, updateIngreMealDto: UpdateIngreMealDto) {
    return `This action updates a #${id} ingreMeal`;
  }

  remove(id: number) {
    return `This action removes a #${id} ingreMeal`;
  }
}
