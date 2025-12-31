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
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags, ApiParam } from '@nestjs/swagger';
import { ActivityRecordsService } from './activity_records.service';
import { CreateActivityRecordDto } from './dto/create-activity_record.dto';
import { UpdateActivityRecordDto } from './dto/update-activity_record.dto';
import { SupabaseGuard } from 'src/auth/guards/supabase/supabase.guard';
import { CurrentUser } from 'src/helpers/decorators/current-user.decorator';
import { AdminSupabaseGuard } from 'src/auth/guards/supabase/admin-supabase.guard';

@ApiBearerAuth()
@ApiTags('activity-records')
@Controller('activity-records')
@UseGuards(SupabaseGuard)
export class ActivityRecordsController {
  constructor(private readonly activityRecordsService: ActivityRecordsService) {}

  @Get('check-challenge-progress/:challengeId')
  @ApiOperation({
    summary: 'Check challenge progress',
    description:
      'Calculates and returns overall progress percentage for a challenge and saves it to challenge_user table',
  })
  @ApiResponse({ status: 200, description: 'Progress percentage calculated successfully' })
  @ApiResponse({ status: 404, description: 'Challenge not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async checkProgress(@Param('challengeId') challengeId: string, @CurrentUser() user: any) {
    if (!user || !user.id) {
      throw new UnauthorizedException('User not authenticated');
    }
    const progress_percent = await this.activityRecordsService.recalculateProgressChallengesForUser(
      challengeId,
      user.id,
    );
    return { progress_percent };
  }

  @Get('check-activity-log-progress/:activityRecordId')
  @ApiOperation({
    summary: 'Check activity record progress',
    description: 'Calculates progress percentage for a specific activity record within a challenge',
  })
  @ApiResponse({ status: 200, description: 'Progress percentage calculated successfully' })
  @ApiResponse({ status: 404, description: 'Activity record not found' })
  @ApiResponse({ status: 400, description: 'Activity record is not associated with a challenge' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async checkActivityLogProgress(
    @Param('activityRecordId') activityRecordId: string,
    @CurrentUser() user: any,
  ) {
    const progress_percent = await this.activityRecordsService.calculateProgressPercent(
      activityRecordId,
      user.id,
    );
    return { progress_percent };
  }

  @Post('challenges')
  @UseGuards(AdminSupabaseGuard)
  @ApiOperation({
    summary: 'Create challenge activity record',
    description: 'Admin only - Creates an activity requirement/template for a challenge',
  })
  @ApiResponse({ status: 201, description: 'Challenge activity record created successfully' })
  @ApiResponse({ status: 400, description: 'Invalid input data or missing challenge_id' })
  @ApiResponse({ status: 404, description: 'Activity or challenge not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized - Admin access required' })
  async createChallenges(@Body() createActivityRecordDto: CreateActivityRecordDto) {
    return await this.activityRecordsService.createChallenges(createActivityRecordDto);
  }

  @Post('daily-logs')
  @ApiOperation({
    summary: 'Create daily log activity record for today',
    description:
      'Records user activity for today. Creates or updates daily log and calculates calories burned',
  })
  @ApiResponse({ status: 201, description: 'Daily activity record created successfully' })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  @ApiResponse({ status: 404, description: 'Activity not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async createDailyLogs(
    @Body() createActivityRecordDto: CreateActivityRecordDto,
    @CurrentUser() user: any,
  ) {
    return await this.activityRecordsService.createDailyLogs(createActivityRecordDto, user.id);
  }

  @Post('daily-logs/date/:date')
  @UseGuards(SupabaseGuard)
  @ApiOperation({
    summary: 'Create daily log activity record for a specific date',
    description:
      'Records user activity for a specific date. Creates or updates daily log and calculates calories burned',
  })
  @ApiParam({
    name: 'date',
    type: String,
    description: 'Date in dd-MM-yyyy format (e.g., 29-12-2025)',
    example: '29-12-2025',
  })
  @ApiResponse({ status: 201, description: 'Daily activity record created successfully' })
  @ApiResponse({ status: 400, description: 'Invalid input data or date format' })
  @ApiResponse({ status: 404, description: 'Activity not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async createDailyLogsForDate(
    @Param('date') date: string,
    @Body() createActivityRecordDto: CreateActivityRecordDto,
    @CurrentUser() user: any,
  ) {
    // validate date format
    const dateRegex = /^\d{2}-\d{2}-\d{4}$/;
    if (!dateRegex.test(date)) {
      throw new BadRequestException('Invalid date format. Use dd-MM-yyyy (e.g., 29-12-2025)');
    }

    // parse date from dd-MM-yyyy to ISO format
    const [day, month, year] = date.split('-');
    const isoDate = `${year}-${month}-${day}`;
    const parsedDate = new Date(isoDate);

    if (isNaN(parsedDate.getTime())) {
      throw new BadRequestException('Invalid date');
    }

    // set the created_at to the specified date
    createActivityRecordDto.created_at = parsedDate;

    return await this.activityRecordsService.createDailyLogs(createActivityRecordDto, user.id);
  }

  @Get('challenges/:challengeId')
  @ApiOperation({
    summary: 'Get all challenge activity records with pagination',
    description: 'Retrieves all activity requirements for a specific challenge',
  })
  @ApiResponse({ status: 200, description: 'Challenge activity records retrieved successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async findAllChallenges(
    @Param('challengeId') challengeId: string,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
  ) {
    return await this.activityRecordsService.findAllChallenges(challengeId, page, limit);
  }

  @Get('daily-logs/:dailyLogId')
  @ApiOperation({
    summary: 'Get user daily log activity records with pagination',
    description: "Retrieves all activity records for a user's specific daily log",
  })
  @ApiResponse({ status: 200, description: 'Daily activity records retrieved successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async findAllDailyLogs(
    @CurrentUser() user: any,
    @Param('dailyLogId') dailyLogId: string,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
  ) {
    return await this.activityRecordsService.findAllDailyLogsOfUser(
      user.id,
      dailyLogId,
      page,
      limit,
    );
  }
  @Get(':id')
  @ApiOperation({
    summary: 'Get activity record by ID',
    description:
      'Retrieves a specific activity record. User can only access their own daily log records',
  })
  @ApiResponse({ status: 200, description: 'Activity record retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Activity record not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - User not authorized to access this record',
  })
  async findOne(@Param('id') id: string, @CurrentUser() user: any) {
    return await this.activityRecordsService.findOne(id, user.id);
  }

  @Patch('challenges/:id')
  @UseGuards(AdminSupabaseGuard)
  @ApiOperation({
    summary: 'Update challenge activity record',
    description:
      'Admin only - Updates an activity requirement for a challenge. Cannot change relations or type',
  })
  @ApiResponse({ status: 200, description: 'Challenge activity record updated successfully' })
  @ApiResponse({ status: 404, description: 'Activity record not found' })
  @ApiResponse({ status: 400, description: 'Invalid input data or no valid fields to update' })
  @ApiResponse({ status: 401, description: 'Unauthorized - Admin access required' })
  async updateChallenges(
    @Param('id') id: string,
    @Body() updateActivityRecordDto: UpdateActivityRecordDto,
  ) {
    return await this.activityRecordsService.updateChallenges(id, updateActivityRecordDto);
  }

  @Delete('challenges/:id')
  @UseGuards(AdminSupabaseGuard)
  @ApiOperation({
    summary: 'Delete challenge activity record',
    description: 'Admin only - Deletes an activity requirement from a challenge',
  })
  @ApiResponse({ status: 200, description: 'Challenge activity record deleted successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized - Admin access required' })
  async removeChallenges(@Param('id') id: string) {
    return await this.activityRecordsService.removeChallenges(id);
  }

  @Patch('daily-logs/:id')
  @ApiOperation({
    summary: 'Update daily log activity record',
    description: 'Updates user activity record in daily log. Recalculates calories burned',
  })
  @ApiResponse({ status: 200, description: 'Daily activity record updated successfully' })
  @ApiResponse({ status: 404, description: 'Activity record not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - User not authorized to update this record',
  })
  async updateDailyLogs(
    @Param('id') id: string,
    @Body() updateActivityRecordDto: UpdateActivityRecordDto,
    @CurrentUser() user: any,
  ) {
    return await this.activityRecordsService.updateDailyLogsOfUser(
      id,
      updateActivityRecordDto,
      user.id,
    );
  }

  @Delete('daily-logs/:id')
  @ApiOperation({
    summary: 'Delete daily log activity record',
    description: 'Deletes user activity record from daily log. Updates total calories burned',
  })
  @ApiResponse({ status: 200, description: 'Daily activity record deleted successfully' })
  @ApiResponse({ status: 404, description: 'Activity record not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - User not authorized to delete this record',
  })
  async removeDailyLogs(@Param('id') id: string, @CurrentUser() user: any) {
    return await this.activityRecordsService.removeDailyLogsOfUser(id, user.id);
  }
}
