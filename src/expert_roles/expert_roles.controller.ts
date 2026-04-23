import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { AdminSupabaseGuard } from 'src/auth/guards/supabase/admin-supabase.guard';
import { ExpertRolesService } from './expert_roles.service';
import { CreateExpertRoleDto } from './dto/create-expert_role.dto';
import { UpdateExpertRoleDto } from './dto/update-expert_role.dto';
import { SupabaseGuard } from 'src/auth/guards/supabase/supabase.guard';

@ApiTags('expert-roles')
@ApiBearerAuth()
@Controller('expert-roles')
export class ExpertRolesController {
  constructor(private readonly expertRolesService: ExpertRolesService) {}

  @Post()
  @UseGuards(AdminSupabaseGuard)
  @ApiOperation({ summary: 'Create a new expert role (admin only)' })
  @ApiBody({ type: CreateExpertRoleDto })
  @ApiResponse({ status: 201, description: 'Expert role created' })
  async create(@Body() createExpertRoleDto: CreateExpertRoleDto) {
    return await this.expertRolesService.create(createExpertRoleDto);
  }

  @Get()
  @UseGuards(SupabaseGuard)
  @ApiOperation({ summary: 'Get all expert roles (admin only)' })
  @ApiResponse({ status: 200, description: 'List of expert roles' })
  async findAll() {
    return await this.expertRolesService.findAll();
  }

  @Get(':id')
  @UseGuards(AdminSupabaseGuard)
  @ApiOperation({ summary: 'Get an expert role by id (admin only)' })
  @ApiParam({ name: 'id', description: 'Expert role id (UUID)' })
  @ApiResponse({ status: 200, description: 'Expert role details' })
  async findOne(@Param('id') id: string) {
    return await this.expertRolesService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(AdminSupabaseGuard)
  @ApiOperation({ summary: 'Update an expert role (admin only)' })
  @ApiParam({ name: 'id', description: 'Expert role id (UUID)' })
  @ApiBody({ type: UpdateExpertRoleDto })
  @ApiResponse({ status: 200, description: 'Expert role updated' })
  async update(@Param('id') id: string, @Body() updateExpertRoleDto: UpdateExpertRoleDto) {
    return await this.expertRolesService.update(id, updateExpertRoleDto);
  }

  @Delete(':id')
  @UseGuards(AdminSupabaseGuard)
  @ApiOperation({ summary: 'Delete an expert role (admin only)' })
  @ApiParam({ name: 'id', description: 'Expert role id (UUID)' })
  @ApiResponse({ status: 200, description: 'Expert role removed' })
  async remove(@Param('id') id: string) {
    return await this.expertRolesService.remove(id);
  }
}
