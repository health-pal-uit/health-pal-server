import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { IngreMealsService } from './ingre_meals.service';
import { CreateIngreMealDto } from './dto/create-ingre_meal.dto';
import { UpdateIngreMealDto } from './dto/update-ingre_meal.dto';

@Controller('ingre-meals')
export class IngreMealsController {
  constructor(private readonly ingreMealsService: IngreMealsService) {}

  @Post()
  create(@Body() createIngreMealDto: CreateIngreMealDto) {
    return this.ingreMealsService.create(createIngreMealDto);
  }

  @Get()
  findAll() {
    return this.ingreMealsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.ingreMealsService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateIngreMealDto: UpdateIngreMealDto) {
    return this.ingreMealsService.update(+id, updateIngreMealDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.ingreMealsService.remove(+id);
  }
}
