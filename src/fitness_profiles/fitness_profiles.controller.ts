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
import {
  ApiBearerAuth,
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiParam,
} from '@nestjs/swagger';
import { FitnessProfilesService } from './fitness_profiles.service';
import { CreateFitnessProfileDto } from './dto/create-fitness_profile.dto';
import { UpdateFitnessProfileDto } from './dto/update-fitness_profile.dto';
import { SupabaseGuard } from 'src/auth/guards/supabase/supabase.guard';
import { AdminSupabaseGuard } from 'src/auth/guards/supabase/admin-supabase.guard';
import { CurrentUser } from 'src/helpers/decorators/current-user.decorator';
import { BFFitnessProfileDto } from './dto/body-fat-fitness_profile.dto';
import type { ReqUserType } from 'src/auth/types/req.type';
import { FitnessProfilePaginationDto } from './dto/fitness-profile-pagination.dto';

@ApiTags('FitnessProfiles')
@ApiBearerAuth()
@Controller('fitness-profiles')
export class FitnessProfilesController {
  constructor(private readonly fitnessProfilesService: FitnessProfilesService) {}

  @UseGuards(SupabaseGuard)
  @Post()
  @ApiOperation({
    summary: 'Create a fitness profile for the current user',
    description:
      'Creates a new fitness profile for the authenticated user. Returns the created profile.',
  })
  @ApiBody({ type: CreateFitnessProfileDto })
  @ApiResponse({ status: 201, description: 'Fitness profile created and returned.' })
  async create(
    @Body() createFitnessProfileDto: CreateFitnessProfileDto,
    @CurrentUser() user: ReqUserType,
  ) {
    return await this.fitnessProfilesService.create(createFitnessProfileDto, user.id);
  }

  @UseGuards(AdminSupabaseGuard)
  @Get()
  @ApiOperation({
    summary: 'Admin: List all fitness profiles',
    description: 'Returns a list of all fitness profiles in the system. Admin only.',
  })
  @ApiResponse({ status: 200, description: 'List of all fitness profiles.' })
  async findAll(@Query() query: FitnessProfilePaginationDto) {
    const { page = 1, limit = 10 } = query;
    return await this.fitnessProfilesService.findAll(page, limit);
  }

  @UseGuards(SupabaseGuard)
  @Get('my-profiles')
  @ApiOperation({
    summary: 'List all fitness profiles for the current user',
    description: 'Returns all fitness profiles belonging to the authenticated user.',
  })
  @ApiResponse({ status: 200, description: "List of current user's fitness profiles." })
  async findAllForCurrentUser(@CurrentUser() user: ReqUserType) {
    return await this.fitnessProfilesService.findAllForUser(user.id);
  }

  @UseGuards(AdminSupabaseGuard)
  @Get('deleted')
  @ApiOperation({
    summary: 'Admin: List all soft-deleted fitness profiles',
    description: 'Returns a list of all soft-deleted fitness profiles. Admin only.',
  })
  @ApiResponse({ status: 200, description: 'List of all soft-deleted fitness profiles.' })
  async findAllDeleted() {
    return await this.fitnessProfilesService.findAllDeleted();
  }

  @UseGuards(SupabaseGuard)
  @Patch('restore/:id')
  @ApiOperation({
    summary: 'Restore a soft-deleted fitness profile by id for the current user',
    description: 'Restores a soft-deleted fitness profile for the authenticated user.',
  })
  @ApiParam({ name: 'id', type: String })
  @ApiResponse({ status: 200, description: 'Fitness profile restored.' })
  async restore(@Param('id') id: string, @CurrentUser() user: ReqUserType) {
    return await this.fitnessProfilesService.restore(id, user.id);
  }

  @Get('me')
  @UseGuards(SupabaseGuard)
  @ApiOperation({
    summary: "Get the current user's fitness profile",
    description: 'Returns the fitness profile of the authenticated user.',
  })
  @ApiResponse({ status: 200, description: "Current user's fitness profile." })
  async findCurrent(@CurrentUser() user: ReqUserType) {
    return await this.fitnessProfilesService.findOne(user.id);
  }

  @Get(':userId')
  @UseGuards(SupabaseGuard)
  @ApiOperation({
    summary: 'Get a fitness profile by userId',
    description:
      'Returns the fitness profile for the specified userId. Admin or user-to-user access.',
  })
  @ApiParam({ name: 'userId', type: String })
  @ApiResponse({ status: 200, description: 'Fitness profile found.' })
  async findOne(@Param('userId') userId: string) {
    return await this.fitnessProfilesService.findOne(userId);
  }

  @Patch('me')
  @UseGuards(SupabaseGuard)
  @ApiOperation({
    summary: "Update the current user's fitness profile",
    description: 'Updates the fitness profile of the authenticated user.',
  })
  @ApiBody({ type: UpdateFitnessProfileDto })
  @ApiResponse({ status: 200, description: 'Fitness profile updated and returned.' })
  async update(
    @Body() updateFitnessProfileDto: UpdateFitnessProfileDto,
    @CurrentUser() user: ReqUserType,
  ) {
    return await this.fitnessProfilesService.update(updateFitnessProfileDto, user.id);
  }

  @Patch(':userId')
  @UseGuards(SupabaseGuard)
  @ApiOperation({
    summary: 'Update a fitness profile by userId',
    description:
      'Updates the fitness profile for the specified userId. Admin or user-to-user access.',
  })
  @ApiParam({ name: 'userId', type: String, required: true })
  @ApiBody({ type: UpdateFitnessProfileDto })
  @ApiResponse({ status: 200, description: 'Fitness profile updated and returned.' })
  async updateCurrent(
    @Param('userId') userId: string,
    @Body() updateFitnessProfileDto: UpdateFitnessProfileDto,
  ) {
    return await this.fitnessProfilesService.update(updateFitnessProfileDto, userId);
  }

  @Patch('calculate-bfp')
  @UseGuards(SupabaseGuard)
  @ApiOperation({
    summary: 'Calculate body fat percentage for the current user',
    description:
      'Calculates and updates the body fat percentage for the authenticated user based on provided measurements.',
  })
  @ApiBody({ type: BFFitnessProfileDto })
  @ApiResponse({ status: 200, description: 'Body fat percentage calculated and updated.' })
  async calculateBFP(@CurrentUser() user: ReqUserType, @Body() bdf: BFFitnessProfileDto) {
    return await this.fitnessProfilesService.calculateBodyFatPercentage(user.id, bdf);
  }

  @Delete('me/all')
  @UseGuards(SupabaseGuard)
  @ApiOperation({
    summary: 'Delete all fitness profiles for the current user',
    description: 'Soft deletes all fitness profiles belonging to the authenticated user.',
  })
  @ApiResponse({
    status: 200,
    description: 'All fitness profiles soft deleted.',
    schema: {
      type: 'object',
      properties: {
        deleted: { type: 'number', example: 5 },
        message: { type: 'string', example: 'Successfully deleted 5 fitness profile(s)' },
      },
    },
  })
  async removeAll(@CurrentUser() user: ReqUserType) {
    return await this.fitnessProfilesService.removeAllForUser(user.id);
  }

  @Delete(':id')
  @UseGuards(SupabaseGuard)
  @ApiOperation({
    summary: 'Delete a fitness profile by id for the current user',
    description: 'Soft deletes the specified fitness profile for the authenticated user.',
  })
  @ApiParam({ name: 'id', type: String })
  @ApiResponse({ status: 200, description: 'Fitness profile soft deleted.' })
  async remove(@Param('id') id: string, @CurrentUser() user: ReqUserType) {
    return await this.fitnessProfilesService.remove(id, user.id);
  }
}
