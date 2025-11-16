import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { ApiBearerAuth } from '@nestjs/swagger';
import { FitnessGoalsService } from './fitness_goals.service';
import { CreateFitnessGoalDto } from './dto/create-fitness_goal.dto';
import { UpdateFitnessGoalDto } from './dto/update-fitness_goal.dto';
import { SupabaseGuard } from 'src/auth/guards/supabase/supabase.guard';
import { CurrentUser } from 'src/helpers/decorators/current-user.decorator';
import { AdminSupabaseGuard } from 'src/auth/guards/supabase/admin-supabase.guard';

@ApiBearerAuth()
@Controller('fitness-goals')
@UseGuards(SupabaseGuard)
export class FitnessGoalsController {
  constructor(private readonly fitnessGoalsService: FitnessGoalsService) {}

  @Post()
  async create(@Body() createFitnessGoalDto: CreateFitnessGoalDto, @CurrentUser() user: any) {
    return await this.fitnessGoalsService.create(createFitnessGoalDto, user.id);
  }

  @Get()
  @UseGuards(AdminSupabaseGuard)
  async findAll() {
    return await this.fitnessGoalsService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string, @CurrentUser() user: any) {
    return await this.fitnessGoalsService.findOne(id, user.id);
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateFitnessGoalDto: UpdateFitnessGoalDto,
    @CurrentUser() user: any,
  ) {
    return await this.fitnessGoalsService.update(id, updateFitnessGoalDto, user.id);
  }

  @Delete(':id')
  async remove(@Param('id') id: string, @CurrentUser() user: any) {
    return await this.fitnessGoalsService.remove(id, user.id);
  }
}
