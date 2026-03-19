import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { ExpertRolesService } from './expert_roles.service';
import { CreateExpertRoleDto } from './dto/create-expert_role.dto';
import { UpdateExpertRoleDto } from './dto/update-expert_role.dto';

@Controller('expert-roles')
export class ExpertRolesController {
  constructor(private readonly expertRolesService: ExpertRolesService) {}

  @Post()
  create(@Body() createExpertRoleDto: CreateExpertRoleDto) {
    return this.expertRolesService.create(createExpertRoleDto);
  }

  @Get()
  findAll() {
    return this.expertRolesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.expertRolesService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateExpertRoleDto: UpdateExpertRoleDto) {
    return this.expertRolesService.update(+id, updateExpertRoleDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.expertRolesService.remove(+id);
  }
}
