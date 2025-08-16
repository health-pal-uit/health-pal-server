import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { ExpertsRolesService } from './experts_roles.service';
import { CreateExpertsRoleDto } from './dto/create-experts_role.dto';
import { UpdateExpertsRoleDto } from './dto/update-experts_role.dto';

@Controller('experts-roles')
export class ExpertsRolesController {
  constructor(private readonly expertsRolesService: ExpertsRolesService) {}

  @Post()
  create(@Body() createExpertsRoleDto: CreateExpertsRoleDto) {
    return this.expertsRolesService.create(createExpertsRoleDto);
  }

  @Get()
  findAll() {
    return this.expertsRolesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.expertsRolesService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateExpertsRoleDto: UpdateExpertsRoleDto) {
    return this.expertsRolesService.update(+id, updateExpertsRoleDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.expertsRolesService.remove(+id);
  }
}
