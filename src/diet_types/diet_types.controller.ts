import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { ApiBearerAuth } from '@nestjs/swagger';
import { DietTypesService } from './diet_types.service';
import { CreateDietTypeDto } from './dto/create-diet_type.dto';
import { UpdateDietTypeDto } from './dto/update-diet_type.dto';
import { AdminSupabaseGuard } from 'src/auth/guards/supabase/admin-supabase.guard';
import { SupabaseGuard } from 'src/auth/guards/supabase/supabase.guard';

@ApiBearerAuth()
@Controller('diet-types')
export class DietTypesController {
  constructor(private readonly dietTypesService: DietTypesService) {}

  @Post()
  @UseGuards(AdminSupabaseGuard)
  async create(@Body() createDietTypeDto: CreateDietTypeDto) {
    return await this.dietTypesService.create(createDietTypeDto);
  }

  @Get()
  @UseGuards(SupabaseGuard)
  async findAll() {
    return await this.dietTypesService.findAll();
  }

  @Get(':id')
  @UseGuards(SupabaseGuard)
  async findOne(@Param('id') id: string) {
    return await this.dietTypesService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(AdminSupabaseGuard)
  async update(@Param('id') id: string, @Body() updateDietTypeDto: UpdateDietTypeDto) {
    return await this.dietTypesService.update(id, updateDietTypeDto);
  }

  @Delete(':id')
  @UseGuards(AdminSupabaseGuard)
  async remove(@Param('id') id: string) {
    return await this.dietTypesService.remove(id);
  }
}
