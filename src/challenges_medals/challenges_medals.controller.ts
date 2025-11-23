import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { ChallengesMedalsService } from './challenges_medals.service';
import { CreateChallengesMedalDto } from './dto/create-challenges_medal.dto';
import { UpdateChallengesMedalDto } from './dto/update-challenges_medal.dto';
import { SupabaseGuard } from 'src/auth/guards/supabase/supabase.guard';
import { AdminSupabaseGuard } from 'src/auth/guards/supabase/admin-supabase.guard';

@ApiTags('challenges-medals')
@ApiBearerAuth()
@Controller('challenges-medals')
export class ChallengesMedalsController {
  constructor(private readonly challengesMedalsService: ChallengesMedalsService) {}

  @ApiOperation({
    summary: 'Assign a medal to a challenge (Admin only)',
    description:
      'Creates a link between a challenge and a medal. Each challenge-medal pair must be unique.',
  })
  @ApiResponse({ status: 201, description: 'Medal assigned to challenge successfully' })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  @ApiResponse({ status: 401, description: 'Unauthorized - Admin access required' })
  @ApiResponse({ status: 404, description: 'Challenge or Medal not found' })
  @ApiResponse({ status: 409, description: 'Medal already assigned to this challenge' })
  @Post()
  @UseGuards(AdminSupabaseGuard)
  async create(@Body() createChallengesMedalDto: CreateChallengesMedalDto) {
    return await this.challengesMedalsService.create(createChallengesMedalDto);
  }

  @ApiOperation({
    summary: 'Get all challenge-medal assignments',
    description: 'Retrieves all medal assignments for challenges with relations included.',
  })
  @ApiResponse({ status: 200, description: 'Returns list of all challenge-medal assignments' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @Get()
  @UseGuards(SupabaseGuard)
  async findAll() {
    return await this.challengesMedalsService.findAll();
  }

  @ApiOperation({
    summary: 'Get a specific challenge-medal assignment',
    description: 'Retrieves details of a specific challenge-medal link including relations.',
  })
  @ApiResponse({ status: 200, description: 'Returns the challenge-medal assignment' })
  @ApiResponse({ status: 404, description: 'Challenge-medal assignment not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @Get(':id')
  @UseGuards(SupabaseGuard)
  async findOne(@Param('id') id: string) {
    return await this.challengesMedalsService.findOne(id);
  }

  @ApiOperation({
    summary: 'Update a challenge-medal assignment (Admin only)',
    description: 'Updates which medal is assigned to a challenge. Validates the new medal exists.',
  })
  @ApiResponse({ status: 200, description: 'Challenge-medal assignment updated successfully' })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  @ApiResponse({ status: 401, description: 'Unauthorized - Admin access required' })
  @ApiResponse({
    status: 404,
    description: 'Challenge-medal assignment, Challenge, or Medal not found',
  })
  @Patch(':id')
  @UseGuards(AdminSupabaseGuard)
  async update(
    @Param('id') id: string,
    @Body() updateChallengesMedalDto: UpdateChallengesMedalDto,
  ) {
    return await this.challengesMedalsService.update(id, updateChallengesMedalDto);
  }

  @ApiOperation({
    summary: 'Remove a medal from a challenge (Admin only)',
    description:
      'Deletes the link between a challenge and a medal. Does not delete the challenge or medal themselves.',
  })
  @ApiResponse({ status: 200, description: 'Medal removed from challenge successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized - Admin access required' })
  @ApiResponse({ status: 404, description: 'Challenge-medal assignment not found' })
  @Delete(':id')
  @UseGuards(AdminSupabaseGuard)
  async remove(@Param('id') id: string) {
    return await this.challengesMedalsService.remove(id);
  }
}
