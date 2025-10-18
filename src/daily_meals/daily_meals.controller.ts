import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { DailyMealsService } from './daily_meals.service';
import { CreateDailyMealDto } from './dto/create-daily_meal.dto';
import { UpdateDailyMealDto } from './dto/update-daily_meal.dto';
import { SupabaseGuard } from 'src/auth/guards/supabase/supabase.guard';
import { CurrentUser } from 'src/helpers/decorators/current-user.decorator';

@Controller('daily-meals')
export class DailyMealsController {
  constructor(private readonly dailyMealsService: DailyMealsService) {}

  @Post()
  @UseGuards(SupabaseGuard)
  create(@Body() createDailyMealDto: CreateDailyMealDto, @CurrentUser() user: any) {
    return this.dailyMealsService.create(createDailyMealDto, user.id);
  }

  @Post('many')
  @UseGuards(SupabaseGuard)
  createMany(@Body() createDailyMealDtos: CreateDailyMealDto[], @CurrentUser() user: any) {
    return this.dailyMealsService.createMany(createDailyMealDtos, user.id);
  }

  @Get()
  @UseGuards(SupabaseGuard)
  findAll(@CurrentUser() user: any) {
    const isAdmin = user.role === 'admin';
    if (!isAdmin) {
      return this.dailyMealsService.findAllByUser(user.id);
    }
    return this.dailyMealsService.findAll();
  }

  @Get(':id')
  @UseGuards(SupabaseGuard)
  findOne(@Param('id') id: string, @CurrentUser() user: any) {
    return this.dailyMealsService.findOneOwned(id, user.id);
  }

  @Patch(':id')
  @UseGuards(SupabaseGuard)
  update(
    @Param('id') id: string,
    @Body() updateDailyMealDto: UpdateDailyMealDto,
    @CurrentUser() user: any,
  ) {
    return this.dailyMealsService.updateOneOwned(id, updateDailyMealDto, user.id);
  }

  @Delete(':id')
  @UseGuards(SupabaseGuard)
  remove(@Param('id') id: string, @CurrentUser() user: any) {
    return this.dailyMealsService.removeOwned(id, user.id);
  }
}
