import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { ApiBearerAuth } from '@nestjs/swagger';
import { FavMealsService } from './fav_meals.service';
import { CreateFavMealDto } from './dto/create-fav_meal.dto';
import { UpdateFavMealDto } from './dto/update-fav_meal.dto';
import { SupabaseGuard } from 'src/auth/guards/supabase/supabase.guard';
import { CurrentUserId } from 'src/helpers/decorators/current-user-id.decorator';

@ApiBearerAuth()
@Controller('fav-meals')
export class FavMealsController {
  constructor(private readonly favMealsService: FavMealsService) {}
  @Post()
  @UseGuards(SupabaseGuard)
  async create(@Body() createFavMealDto: CreateFavMealDto) {
    return await this.favMealsService.create(createFavMealDto);
  }

  // find all of a user
  @Get('user')
  @UseGuards(SupabaseGuard)
  async findAllOfUser(@CurrentUserId() userId: string) {
    return await this.favMealsService.findAllOfUser(userId);
  }

  @Delete(':id')
  @UseGuards(SupabaseGuard)
  async remove(@Param('id') id: string) {
    return await this.favMealsService.remove(id);
  }
}
