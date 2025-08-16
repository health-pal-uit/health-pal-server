import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { FavMealsService } from './fav_meals.service';
import { CreateFavMealDto } from './dto/create-fav_meal.dto';
import { UpdateFavMealDto } from './dto/update-fav_meal.dto';

@Controller('fav-meals')
export class FavMealsController {
  constructor(private readonly favMealsService: FavMealsService) {}

  @Post()
  create(@Body() createFavMealDto: CreateFavMealDto) {
    return this.favMealsService.create(createFavMealDto);
  }

  @Get()
  findAll() {
    return this.favMealsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.favMealsService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateFavMealDto: UpdateFavMealDto) {
    return this.favMealsService.update(+id, updateFavMealDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.favMealsService.remove(+id);
  }
}
