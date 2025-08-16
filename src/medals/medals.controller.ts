import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { MedalsService } from './medals.service';
import { CreateMedalDto } from './dto/create-medal.dto';
import { UpdateMedalDto } from './dto/update-medal.dto';

@Controller('medals')
export class MedalsController {
  constructor(private readonly medalsService: MedalsService) {}

  @Post()
  create(@Body() createMedalDto: CreateMedalDto) {
    return this.medalsService.create(createMedalDto);
  }

  @Get()
  findAll() {
    return this.medalsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.medalsService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateMedalDto: UpdateMedalDto) {
    return this.medalsService.update(+id, updateMedalDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.medalsService.remove(+id);
  }
}
