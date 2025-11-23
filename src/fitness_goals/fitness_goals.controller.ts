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
import { FitnessGoalsService } from './fitness_goals.service';
import { CreateFitnessGoalDto } from './dto/create-fitness_goal.dto';
import { UpdateFitnessGoalDto } from './dto/update-fitness_goal.dto';
import { SupabaseGuard } from 'src/auth/guards/supabase/supabase.guard';
import { CurrentUser } from 'src/helpers/decorators/current-user.decorator';
import type { ReqUserType } from 'src/auth/types/req.type';
import { AdminSupabaseGuard } from 'src/auth/guards/supabase/admin-supabase.guard';
import { FitnessGoalPaginationDto } from './dto/fitness-goal-pagination.dto';

@ApiTags('FitnessGoals')
@ApiBearerAuth()
@Controller('fitness-goals')
@UseGuards(SupabaseGuard)
export class FitnessGoalsController {
  constructor(private readonly fitnessGoalsService: FitnessGoalsService) {}

  @Post()
  @ApiOperation({
    summary: 'Create a fitness goal for the current user',
    description: 'Creates a new fitness goal for the authenticated user. Returns the created goal.',
  })
  @ApiBody({ type: CreateFitnessGoalDto })
  @ApiResponse({ status: 201, description: 'Fitness goal created and returned.' })
  async create(
    @Body() createFitnessGoalDto: CreateFitnessGoalDto,
    @CurrentUser() user: ReqUserType,
  ) {
    return await this.fitnessGoalsService.create(createFitnessGoalDto, user.id);
  }

  @Get()
  @UseGuards(AdminSupabaseGuard)
  @ApiOperation({
    summary: 'Admin: List all fitness goals',
    description: 'Returns a list of all fitness goals in the system. Admin only.',
  })
  @ApiResponse({ status: 200, description: 'List of all fitness goals.' })
  async findAll(@Query() query: FitnessGoalPaginationDto) {
    const { page = 1, limit = 10 } = query;
    return await this.fitnessGoalsService.findAll(page, limit);
  }

  // User: list own fitness goals
  @Get('user')
  @ApiOperation({
    summary: 'Get all fitness goals for the current user',
    description: 'Returns all fitness goals belonging to the authenticated user.',
  })
  @ApiResponse({ status: 200, description: 'List of user fitness goals.' })
  async findAllOfUser(@CurrentUser() user: ReqUserType) {
    return await this.fitnessGoalsService.findAllOfUser(user.id);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get a fitness goal by id for the current user',
    description:
      'Returns the fitness goal for the specified id, if it belongs to the authenticated user.',
  })
  @ApiParam({ name: 'id', type: String })
  @ApiResponse({ status: 200, description: 'Fitness goal found.' })
  async findOne(@Param('id') id: string, @CurrentUser() user: ReqUserType) {
    return await this.fitnessGoalsService.findOne(id, user.id);
  }

  @Patch(':id')
  @ApiOperation({
    summary: 'Update a fitness goal by id for the current user',
    description:
      'Updates the fitness goal for the specified id, if it belongs to the authenticated user.',
  })
  @ApiParam({ name: 'id', type: String })
  @ApiBody({ type: UpdateFitnessGoalDto })
  @ApiResponse({ status: 200, description: 'Fitness goal updated and returned.' })
  async update(
    @Param('id') id: string,
    @Body() updateFitnessGoalDto: UpdateFitnessGoalDto,
    @CurrentUser() user: ReqUserType,
  ) {
    return await this.fitnessGoalsService.update(id, updateFitnessGoalDto, user.id);
  }

  @Delete(':id')
  @ApiOperation({
    summary: 'Delete a fitness goal by id for the current user',
    description: 'Soft deletes the specified fitness goal for the authenticated user.',
  })
  @ApiParam({ name: 'id', type: String })
  @ApiResponse({ status: 200, description: 'Fitness goal soft deleted.' })
  async remove(@Param('id') id: string, @CurrentUser() user: ReqUserType) {
    return await this.fitnessGoalsService.remove(id, user.id);
  }
}
