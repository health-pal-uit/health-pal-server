import { Controller, Get, Post, Body, Param, Delete, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiParam,
} from '@nestjs/swagger';
import { FavMealsService } from './fav_meals.service';
import { CreateFavMealDto } from './dto/create-fav_meal.dto';

import { SupabaseGuard } from 'src/auth/guards/supabase/supabase.guard';
import { CurrentUserId } from 'src/helpers/decorators/current-user-id.decorator';

@ApiTags('FavMeals')
@ApiBearerAuth()
@Controller('fav-meals')
export class FavMealsController {
  constructor(private readonly favMealsService: FavMealsService) {}
  @Post()
  @UseGuards(SupabaseGuard)
  @Post()
  @UseGuards(SupabaseGuard)
  @ApiOperation({ summary: 'Add a favorite meal for a user' })
  @ApiBody({ type: CreateFavMealDto })
  @ApiResponse({ status: 201, description: 'Favorite meal added.' })
  async create(@Body() createFavMealDto: CreateFavMealDto) {
    return await this.favMealsService.create(createFavMealDto);
  }

  // find all of a user
  @Get('user')
  @UseGuards(SupabaseGuard)
  @ApiOperation({ summary: 'Get all favorite meals for the current user' })
  @ApiResponse({ status: 200, description: 'List of favorite meals with ids.' })
  async findAllOfUser(@CurrentUserId() userId: string) {
    return await this.favMealsService.findAllOfUser(userId);
  }
  // check if a specific meal is favorited by user
  @Get('user/:mealId')
  @UseGuards(SupabaseGuard)
  @ApiOperation({ summary: 'Check if a meal is favorited by the current user' })
  @ApiParam({ name: 'mealId', type: String })
  @ApiResponse({ status: 200, description: 'Favorited status.' })
  async isFavorited(@CurrentUserId() userId: string, @Param('mealId') mealId: string) {
    return { favorited: await this.favMealsService.isFavorited(userId, mealId) };
  }

  // remove by user and meal
  @Delete('user/:mealId')
  @UseGuards(SupabaseGuard)
  @ApiOperation({ summary: 'Remove a favorite by user and meal' })
  @ApiParam({ name: 'mealId', type: String })
  @ApiResponse({ status: 200, description: 'Favorite removed.' })
  async removeByUserAndMeal(@CurrentUserId() userId: string, @Param('mealId') mealId: string) {
    return await this.favMealsService.removeByUserAndMeal(userId, mealId);
  }

  @Delete(':id')
  @UseGuards(SupabaseGuard)
  @ApiOperation({ summary: 'Remove a favorite by id' })
  @ApiParam({ name: 'id', type: String })
  @ApiResponse({ status: 200, description: 'Favorite removed.' })
  async remove(@Param('id') id: string) {
    return await this.favMealsService.remove(id);
  }
}
