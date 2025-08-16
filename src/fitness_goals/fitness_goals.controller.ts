import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { FitnessGoalsService } from './fitness_goals.service';
import { CreateFitnessGoalDto } from './dto/create-fitness_goal.dto';
import { UpdateFitnessGoalDto } from './dto/update-fitness_goal.dto';

@Controller('fitness-goals')
export class FitnessGoalsController {
  constructor(private readonly fitnessGoalsService: FitnessGoalsService) {}

  @Post()
  create(@Body() createFitnessGoalDto: CreateFitnessGoalDto) {
    return this.fitnessGoalsService.create(createFitnessGoalDto);
  }

  @Get()
  findAll() {
    return this.fitnessGoalsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.fitnessGoalsService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateFitnessGoalDto: UpdateFitnessGoalDto) {
    return this.fitnessGoalsService.update(+id, updateFitnessGoalDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.fitnessGoalsService.remove(+id);
  }
}
