import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiBody, ApiParam } from '@nestjs/swagger';
import type { ReqUserType } from 'src/auth/types/req.type';
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
  @ApiOperation({ summary: 'Add a new daily meal for the current user' })
  @ApiBody({ type: CreateDailyMealDto })
  @ApiResponse({ status: 201, description: 'Daily meal created' })
  async create(@Body() createDailyMealDto: CreateDailyMealDto, @CurrentUser() user: ReqUserType) {
    return await this.dailyMealsService.create(createDailyMealDto, user.id);
  }

  @Post('many')
  @UseGuards(SupabaseGuard)
  @ApiOperation({ summary: 'Add many daily meals for the current user' })
  @ApiBody({ type: [CreateDailyMealDto] })
  @ApiResponse({ status: 201, description: 'Daily meals created' })
  async createMany(
    @Body() createDailyMealDtos: CreateDailyMealDto[],
    @CurrentUser() user: ReqUserType,
  ) {
    return await this.dailyMealsService.createMany(createDailyMealDtos, user.id);
  }

  @Get()
  @UseGuards(SupabaseGuard)
  @ApiOperation({ summary: 'Get all daily meals (admin: all, user: own)' })
  @ApiResponse({ status: 200, description: 'List of daily meals' })
  async findAll(@CurrentUser() user: ReqUserType) {
    const isAdmin = user.role === 'admin';
    if (!isAdmin) {
      return await this.dailyMealsService.findAllByUser(user.id);
    }
    return await this.dailyMealsService.findAll();
  }

  @Get(':id')
  @UseGuards(SupabaseGuard)
  @ApiOperation({ summary: 'Get a daily meal by id (user: own only)' })
  @ApiParam({ name: 'id', type: String })
  @ApiResponse({ status: 200, description: 'Daily meal detail' })
  async findOne(@Param('id') id: string, @CurrentUser() user: ReqUserType) {
    return await this.dailyMealsService.findOneOwned(id, user.id);
  }

  @Patch(':id')
  @UseGuards(SupabaseGuard)
  @ApiOperation({ summary: 'Update a daily meal by id (user: own only)' })
  @ApiParam({ name: 'id', type: String })
  @ApiBody({ type: UpdateDailyMealDto })
  @ApiResponse({ status: 200, description: 'Daily meal updated' })
  async update(
    @Param('id') id: string,
    @Body() updateDailyMealDto: UpdateDailyMealDto,
    @CurrentUser() user: ReqUserType,
  ) {
    return await this.dailyMealsService.updateOneOwned(id, updateDailyMealDto, user.id);
  }

  @Delete(':id')
  @UseGuards(SupabaseGuard)
  @ApiOperation({ summary: 'Delete a daily meal by id (user: own only)' })
  @ApiParam({ name: 'id', type: String })
  @ApiResponse({ status: 200, description: 'Daily meal deleted' })
  async remove(@Param('id') id: string, @CurrentUser() user: ReqUserType) {
    return await this.dailyMealsService.removeOwned(id, user.id);
  }
}
