import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { MedalsService } from './medals.service';
import { CreateMedalDto } from './dto/create-medal.dto';
import { UpdateMedalDto } from './dto/update-medal.dto';
import { AdminSupabaseGuard } from 'src/auth/guards/supabase/admin-supabase.guard';
import { SupabaseGuard } from 'src/auth/guards/supabase/supabase.guard';

@Controller('medals')
export class MedalsController {
  constructor(private readonly medalsService: MedalsService) {}

  @Post()
  @UseGuards(AdminSupabaseGuard)
  create(@Body() createMedalDto: CreateMedalDto) {
    return this.medalsService.create(createMedalDto);
  }

  @Get()
  @UseGuards(SupabaseGuard)
  findAll() {
    return this.medalsService.findAll();
  }

  @Get(':id')
  @UseGuards(SupabaseGuard)
  findOne(@Param('id') id: string) {
    return this.medalsService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(AdminSupabaseGuard)
  update(@Param('id') id: string, @Body() updateMedalDto: UpdateMedalDto) {
    return this.medalsService.update(id, updateMedalDto);
  }

  @Delete(':id')
  @UseGuards(AdminSupabaseGuard)
  remove(@Param('id') id: string) {
    return this.medalsService.remove(id);
  }
}
