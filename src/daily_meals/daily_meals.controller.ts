import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { DailyMealsService } from './daily_meals.service';
import { CreateDailyMealDto } from './dto/create-daily_meal.dto';
import { UpdateDailyMealDto } from './dto/update-daily_meal.dto';

@Controller('daily-meals')
export class DailyMealsController {
  constructor(private readonly dailyMealsService: DailyMealsService) {}

  @Post()
  create(@Body() createDailyMealDto: CreateDailyMealDto) {
    return this.dailyMealsService.create(createDailyMealDto);
  }

  @Get()
  findAll() {
    return this.dailyMealsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.dailyMealsService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateDailyMealDto: UpdateDailyMealDto) {
    return this.dailyMealsService.update(+id, updateDailyMealDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.dailyMealsService.remove(+id);
  }
}
