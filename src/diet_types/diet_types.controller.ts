import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiParam,
} from '@nestjs/swagger';
import { DietTypesService } from './diet_types.service';
import { CreateDietTypeDto } from './dto/create-diet_type.dto';
import { UpdateDietTypeDto } from './dto/update-diet_type.dto';
import { AdminSupabaseGuard } from 'src/auth/guards/supabase/admin-supabase.guard';
import { SupabaseGuard } from 'src/auth/guards/supabase/supabase.guard';

@ApiTags('DietTypes')
@ApiBearerAuth()
@Controller('diet-types')
export class DietTypesController {
  constructor(private readonly dietTypesService: DietTypesService) {}

  @Post()
  @UseGuards(AdminSupabaseGuard)
  @ApiOperation({ summary: 'Create a new diet type (admin only)' })
  @ApiResponse({ status: 201, description: 'Diet type created.' })
  @ApiBody({ type: CreateDietTypeDto })
  async create(@Body() createDietTypeDto: CreateDietTypeDto) {
    return await this.dietTypesService.create(createDietTypeDto);
  }

  @Get()
  @UseGuards(SupabaseGuard)
  @ApiOperation({ summary: 'Get all diet types (user)' })
  @ApiResponse({ status: 200, description: 'List all diet types.' })
  async findAll() {
    return await this.dietTypesService.findAll();
  }

  @Get(':id')
  @UseGuards(SupabaseGuard)
  @ApiOperation({ summary: 'Get a diet type by id (user)' })
  @ApiParam({ name: 'id', type: String })
  @ApiResponse({ status: 200, description: 'Diet type found.' })
  async findOne(@Param('id') id: string) {
    return await this.dietTypesService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(AdminSupabaseGuard)
  @ApiOperation({ summary: 'Update a diet type (admin only)' })
  @ApiParam({ name: 'id', type: String })
  @ApiBody({ type: UpdateDietTypeDto })
  @ApiResponse({ status: 200, description: 'Diet type updated.' })
  async update(@Param('id') id: string, @Body() updateDietTypeDto: UpdateDietTypeDto) {
    return await this.dietTypesService.update(id, updateDietTypeDto);
  }

  @Delete(':id')
  @UseGuards(AdminSupabaseGuard)
  @ApiOperation({ summary: 'Delete a diet type (admin only)' })
  @ApiParam({ name: 'id', type: String })
  @ApiResponse({ status: 200, description: 'Diet type deleted.' })
  async remove(@Param('id') id: string) {
    return await this.dietTypesService.remove(id);
  }
}
