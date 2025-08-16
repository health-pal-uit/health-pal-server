import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { FitnessProfilesService } from './fitness_profiles.service';
import { CreateFitnessProfileDto } from './dto/create-fitness_profile.dto';
import { UpdateFitnessProfileDto } from './dto/update-fitness_profile.dto';

@Controller('fitness-profiles')
export class FitnessProfilesController {
  constructor(private readonly fitnessProfilesService: FitnessProfilesService) {}

  @Post()
  create(@Body() createFitnessProfileDto: CreateFitnessProfileDto) {
    return this.fitnessProfilesService.create(createFitnessProfileDto);
  }

  @Get()
  findAll() {
    return this.fitnessProfilesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.fitnessProfilesService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateFitnessProfileDto: UpdateFitnessProfileDto) {
    return this.fitnessProfilesService.update(+id, updateFitnessProfileDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.fitnessProfilesService.remove(+id);
  }
}
