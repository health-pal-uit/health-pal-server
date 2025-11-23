import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { ActivitiesService } from './activities.service';
import { CreateActivityDto } from './dto/create-activity.dto';
import { UpdateActivityDto } from './dto/update-activity.dto';
import { AdminSupabaseGuard } from 'src/auth/guards/supabase/admin-supabase.guard';
import { SupabaseGuard } from 'src/auth/guards/supabase/supabase.guard';

@ApiBearerAuth()
@ApiTags('activities')
@Controller('activities')
export class ActivitiesController {
  constructor(private readonly activitiesService: ActivitiesService) {}

  @Post()
  @UseGuards(AdminSupabaseGuard)
  @ApiOperation({
    summary: 'Create a new activity',
    description: 'Admin only - Creates a new activity with name, MET value, and categories',
  })
  @ApiResponse({ status: 201, description: 'Activity successfully created' })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  @ApiResponse({ status: 401, description: 'Unauthorized - Admin access required' })
  async create(@Body() createActivityDto: CreateActivityDto) {
    return await this.activitiesService.create(createActivityDto);
  }

  @Get()
  @UseGuards(SupabaseGuard)
  @ApiOperation({
    summary: 'Get all activities',
    description: 'Retrieves all non-deleted activities with pagination',
  })
  @ApiResponse({ status: 200, description: 'List of activities retrieved successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async findAll(@Query('page') page: number = 1, @Query('limit') limit: number = 10) {
    return await this.activitiesService.findAll(page, limit);
  }

  @Get(':id')
  @UseGuards(SupabaseGuard)
  @ApiOperation({
    summary: 'Get activity by ID',
    description: 'Retrieves a specific activity by its ID',
  })
  @ApiResponse({ status: 200, description: 'Activity retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Activity not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async findOne(@Param('id') id: string) {
    return await this.activitiesService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(AdminSupabaseGuard)
  @ApiOperation({
    summary: 'Update an activity',
    description: 'Admin only - Updates an existing activity by ID',
  })
  @ApiResponse({ status: 200, description: 'Activity successfully updated' })
  @ApiResponse({ status: 404, description: 'Activity not found' })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  @ApiResponse({ status: 401, description: 'Unauthorized - Admin access required' })
  async update(@Param('id') id: string, @Body() updateActivityDto: UpdateActivityDto) {
    return await this.activitiesService.update(id, updateActivityDto);
  }

  @Delete(':id')
  @UseGuards(AdminSupabaseGuard)
  @ApiOperation({
    summary: 'Delete an activity',
    description: 'Admin only - Soft deletes an activity by ID',
  })
  @ApiResponse({ status: 200, description: 'Activity successfully deleted' })
  @ApiResponse({ status: 404, description: 'Activity not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized - Admin access required' })
  async remove(@Param('id') id: string) {
    return await this.activitiesService.remove(id);
  }
}
