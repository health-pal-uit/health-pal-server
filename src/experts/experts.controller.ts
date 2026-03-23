import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { ExpertSupabaseGuard } from 'src/auth/guards/supabase/expert-supabase.guard';
import { ExpertsService } from './experts.service';
import { CreateExpertDto } from './dto/create-expert.dto';
import { UpdateExpertDto } from './dto/update-expert.dto';

@Controller('experts')
export class ExpertsController {
  constructor(private readonly expertsService: ExpertsService) {}

  @UseGuards(ExpertSupabaseGuard)
  @Post()
  create(@Body() createExpertDto: CreateExpertDto) {
    return this.expertsService.create(createExpertDto);
  }

  @Get()
  findAll() {
    return this.expertsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.expertsService.findOne(+id);
  }

  @UseGuards(ExpertSupabaseGuard)
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateExpertDto: UpdateExpertDto) {
    return this.expertsService.update(+id, updateExpertDto);
  }

  @UseGuards(ExpertSupabaseGuard)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.expertsService.remove(+id);
  }
}
