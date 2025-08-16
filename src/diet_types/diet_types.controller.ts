import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { DietTypesService } from './diet_types.service';
import { CreateDietTypeDto } from './dto/create-diet_type.dto';
import { UpdateDietTypeDto } from './dto/update-diet_type.dto';

@Controller('diet-types')
export class DietTypesController {
  constructor(private readonly dietTypesService: DietTypesService) {}

  @Post()
  create(@Body() createDietTypeDto: CreateDietTypeDto) {
    return this.dietTypesService.create(createDietTypeDto);
  }

  @Get()
  findAll() {
    return this.dietTypesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.dietTypesService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateDietTypeDto: UpdateDietTypeDto) {
    return this.dietTypesService.update(+id, updateDietTypeDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.dietTypesService.remove(+id);
  }
}
