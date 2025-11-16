import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { ApiBearerAuth } from '@nestjs/swagger';
import { FitnessProfilesService } from './fitness_profiles.service';
import { CreateFitnessProfileDto } from './dto/create-fitness_profile.dto';
import { UpdateFitnessProfileDto } from './dto/update-fitness_profile.dto';
import { SupabaseGuard } from 'src/auth/guards/supabase/supabase.guard';
import { AdminSupabaseGuard } from 'src/auth/guards/supabase/admin-supabase.guard';
import { CurrentUser } from 'src/helpers/decorators/current-user.decorator';
import { BFFitnessProfileDto } from './dto/body-fat-fitness_profile.dto';

@ApiBearerAuth()
@Controller('fitness-profiles')
export class FitnessProfilesController {
  constructor(private readonly fitnessProfilesService: FitnessProfilesService) {}

  @UseGuards(SupabaseGuard)
  @Post()
  async create(@Body() createFitnessProfileDto: CreateFitnessProfileDto, @CurrentUser() user: any) {
    return await this.fitnessProfilesService.create(createFitnessProfileDto, user.id);
  }

  @UseGuards(AdminSupabaseGuard)
  @Get()
  async findAll() {
    return await this.fitnessProfilesService.findAll();
  }

  @Get(':id')
  @UseGuards(SupabaseGuard)
  async findOne(@Param('id') id: string, @CurrentUser() user: any) {
    return await this.fitnessProfilesService.findOne(id, user.id);
  }

  @Patch(':id')
  @UseGuards(SupabaseGuard)
  async update(
    @Param('id') id: string,
    @Body() updateFitnessProfileDto: UpdateFitnessProfileDto,
    @CurrentUser() user: any,
  ) {
    return await this.fitnessProfilesService.update(id, updateFitnessProfileDto, user.id);
  }

  @Patch('calculate-bfp')
  @UseGuards(SupabaseGuard)
  async calculateBFP(@CurrentUser() user: any, @Body() bdf: BFFitnessProfileDto) {
    return await this.fitnessProfilesService.calculateBodyFatPercentage(user.id, bdf);
  }

  @Delete(':id')
  @UseGuards(SupabaseGuard)
  async remove(@Param('id') id: string, @CurrentUser() user: any) {
    return await this.fitnessProfilesService.remove(id, user.id);
  }
}
