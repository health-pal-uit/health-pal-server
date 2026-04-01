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
import { SupabaseGuard } from 'src/auth/guards/supabase/supabase.guard';
import { CurrentUser } from 'src/helpers/decorators/current-user.decorator';
import { ExpertRatingsService } from './expert_ratings.service';
import { CreateExpertRatingDto } from './dto/create-expert_rating.dto';
import { UpdateExpertRatingDto } from './dto/update-expert_rating.dto';

@ApiTags('expert-ratings')
@ApiBearerAuth()
@Controller('expert-ratings')
export class ExpertRatingsController {
  constructor(private readonly expertRatingsService: ExpertRatingsService) {}

  @Post()
  @UseGuards(SupabaseGuard)
  @ApiOperation({ summary: 'Create expert rating for a consultation' })
  @ApiBody({ type: CreateExpertRatingDto })
  @ApiResponse({ status: 201, description: 'Expert rating created' })
  async create(@Body() createExpertRatingDto: CreateExpertRatingDto, @CurrentUser() user: any) {
    return await this.expertRatingsService.create(createExpertRatingDto, user.id, user.role);
  }

  @Get()
  @UseGuards(SupabaseGuard)
  @ApiOperation({ summary: 'Get all expert ratings' })
  @ApiResponse({ status: 200, description: 'List of expert ratings' })
  async findAll() {
    return await this.expertRatingsService.findAll();
  }

  @Get(':id')
  @UseGuards(SupabaseGuard)
  @ApiOperation({ summary: 'Get an expert rating by id' })
  @ApiParam({ name: 'id', description: 'Expert rating id (UUID)' })
  @ApiResponse({ status: 200, description: 'Expert rating details' })
  async findOne(@Param('id') id: string) {
    return await this.expertRatingsService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(AdminSupabaseGuard)
  @ApiOperation({ summary: 'Update an expert rating (admin only)' })
  @ApiParam({ name: 'id', description: 'Expert rating id (UUID)' })
  @ApiBody({ type: UpdateExpertRatingDto })
  @ApiResponse({ status: 200, description: 'Expert rating updated' })
  async update(@Param('id') id: string, @Body() updateExpertRatingDto: UpdateExpertRatingDto) {
    return await this.expertRatingsService.update(id, updateExpertRatingDto);
  }

  @Delete(':id')
  @UseGuards(AdminSupabaseGuard)
  @ApiOperation({ summary: 'Delete an expert rating (admin only)' })
  @ApiParam({ name: 'id', description: 'Expert rating id (UUID)' })
  @ApiResponse({ status: 200, description: 'Expert rating deleted' })
  async remove(@Param('id') id: string) {
    return await this.expertRatingsService.remove(id);
  }
}
