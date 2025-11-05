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
  create(@Body() createDietTypeDto: CreateDietTypeDto) {
    return this.dietTypesService.create(createDietTypeDto);
  }

  @Get()
  @UseGuards(SupabaseGuard)
  findAll() {
    return this.dietTypesService.findAll();
  }

  @Get(':id')
  @UseGuards(SupabaseGuard)
  findOne(@Param('id') id: string) {
    return this.dietTypesService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(AdminSupabaseGuard)
  update(@Param('id') id: string, @Body() updateDietTypeDto: UpdateDietTypeDto) {
    return this.dietTypesService.update(id, updateDietTypeDto);
  }

  @Delete(':id')
  @UseGuards(AdminSupabaseGuard)
  remove(@Param('id') id: string) {
    return this.dietTypesService.remove(id);
  }
}
