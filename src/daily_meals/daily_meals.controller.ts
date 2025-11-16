import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { ApiBearerAuth } from '@nestjs/swagger';
import { DailyMealsService } from './daily_meals.service';
import { CreateDailyMealDto } from './dto/create-daily_meal.dto';
import { UpdateDailyMealDto } from './dto/update-daily_meal.dto';
import { SupabaseGuard } from 'src/auth/guards/supabase/supabase.guard';
import { CurrentUser } from 'src/helpers/decorators/current-user.decorator';

@ApiBearerAuth()
@Controller('daily-meals')
export class DailyMealsController {
  constructor(private readonly dailyMealsService: DailyMealsService) {}

  @Post()
  @UseGuards(SupabaseGuard)
  async create(@Body() createDailyMealDto: CreateDailyMealDto, @CurrentUser() user: any) {
    return await this.dailyMealsService.create(createDailyMealDto, user.id);
  }

  @Post('many')
  @UseGuards(SupabaseGuard)
  async createMany(@Body() createDailyMealDtos: CreateDailyMealDto[], @CurrentUser() user: any) {
    return await this.dailyMealsService.createMany(createDailyMealDtos, user.id);
  }

  @Get()
  @UseGuards(SupabaseGuard)
  async findAll(@CurrentUser() user: any) {
    const isAdmin = user.role === 'admin';
    if (!isAdmin) {
      return await this.dailyMealsService.findAllByUser(user.id);
    }
    return await this.dailyMealsService.findAll();
  }

  @Get(':id')
  @UseGuards(SupabaseGuard)
  async findOne(@Param('id') id: string, @CurrentUser() user: any) {
    return await this.dailyMealsService.findOneOwned(id, user.id);
  }

  @Patch(':id')
  @UseGuards(SupabaseGuard)
  async update(
    @Param('id') id: string,
    @Body() updateDailyMealDto: UpdateDailyMealDto,
    @CurrentUser() user: any,
  ) {
    return await this.dailyMealsService.updateOneOwned(id, updateDailyMealDto, user.id);
  }

  @Delete(':id')
  @UseGuards(SupabaseGuard)
  async remove(@Param('id') id: string, @CurrentUser() user: any) {
    return await this.dailyMealsService.removeOwned(id, user.id);
  }
}
