import { Injectable } from '@nestjs/common';
import { CreateIngreMealDto } from './dto/create-ingre_meal.dto';
import { UpdateIngreMealDto } from './dto/update-ingre_meal.dto';

@Injectable()
export class IngreMealsService {
  create(createIngreMealDto: CreateIngreMealDto) {
    return 'This action adds a new ingreMeal';
  }

  findAll() {
    return `This action returns all ingreMeal`;
  }

  findOne(id: string) {
    return `This action returns a #${id} ingreMeal`;
  }

  update(id: string, updateIngreMealDto: UpdateIngreMealDto) {
    return `This action updates a #${id} ingreMeal`;
  }

  remove(id: string) {
    return `This action removes a #${id} ingreMeal`;
  }
}
