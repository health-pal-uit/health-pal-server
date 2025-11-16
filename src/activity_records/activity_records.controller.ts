import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { ApiBearerAuth } from '@nestjs/swagger';
import { ActivityRecordsService } from './activity_records.service';
import { CreateActivityRecordDto } from './dto/create-activity_record.dto';
import { UpdateActivityRecordDto } from './dto/update-activity_record.dto';
import { SupabaseGuard } from 'src/auth/guards/supabase/supabase.guard';
import { CurrentUser } from 'src/helpers/decorators/current-user.decorator';
import { AdminSupabaseGuard } from 'src/auth/guards/supabase/admin-supabase.guard';

@ApiBearerAuth()
@Controller('activity-records')
@UseGuards(SupabaseGuard)
export class ActivityRecordsController {
  constructor(private readonly activityRecordsService: ActivityRecordsService) {}

  // trả về number và lưu vào challenge_user.progress_percent
  @Get('check-challenge-progress/:challengeId')
  async checkProgress(@Param('challengeId') challengeId: string, @CurrentUser() user: any) {
    return await this.activityRecordsService.recalculateProgressChallengesForUser(
      challengeId,
      user.id,
    );
  }

  // chỉ trả về number
  @Get('check-activity-log-progress/:activityLogId')
  async checkActivityLogProgress(
    @Param('activityLogId') activityLogId: string,
    @CurrentUser() user: any,
  ) {
    return await this.activityRecordsService.calculateProgressPercent(activityLogId, user.id);
  }

  @Post('challenges')
  @UseGuards(AdminSupabaseGuard)
  async createChallenges(@Body() createActivityRecordDto: CreateActivityRecordDto) {
    return await this.activityRecordsService.createChallenges(createActivityRecordDto);
  }

  @Post('daily-logs')
  async createDailyLogs(
    @Body() createActivityRecordDto: CreateActivityRecordDto,
    @CurrentUser() user: any,
  ) {
    return await this.activityRecordsService.createDailyLogs(createActivityRecordDto, user.id);
  }

  @Get('challenges/:challengeId')
  async findAllChallenges(@Param('challengeId') challengeId: string) {
    return await this.activityRecordsService.findAllChallenges(challengeId);
  }

  @Get('daily-logs/:dailyLogId')
  async findAllDailyLogs(@CurrentUser() user: any, @Param('dailyLogId') dailyLogId: string) {
    return await this.activityRecordsService.findAllDailyLogsOfUser(user.id, dailyLogId);
  }
  @Get(':id')
  async findOne(@Param('id') id: string, @CurrentUser() user: any) {
    return await this.activityRecordsService.findOne(id, user.id);
  }

  @Patch('challenges/:id')
  @UseGuards(AdminSupabaseGuard)
  async updateChallenges(
    @Param('id') id: string,
    @Body() updateActivityRecordDto: UpdateActivityRecordDto,
  ) {
    return await this.activityRecordsService.updateChallenges(id, updateActivityRecordDto);
  }

  @Delete('challenges/:id')
  @UseGuards(AdminSupabaseGuard)
  async removeChallenges(@Param('id') id: string) {
    return await this.activityRecordsService.removeChallenges(id);
  }

  @Patch('daily-logs/:id')
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
  async removeDailyLogs(@Param('id') id: string, @CurrentUser() user: any) {
    return await this.activityRecordsService.removeDailyLogsOfUser(id, user.id);
  }
  // @Delete('challenges/:id')
  // removeChallengesOfUser(@Param('id') id: string, @CurrentUser() user: any) {
  //   return this.activityRecordsService.removeChallengesOfUser(id, user.id);
  // }

  // @Patch('challenges-users/:id')
  // updateChallengesOfUser(@Param('id') id: string, @Body() updateActivityRecordDto: UpdateActivityRecordDto, @CurrentUser() user: any) {
  //   return this.activityRecordsService.updateChallengesOfUser(id, updateActivityRecordDto, user.id);
  // }

  // @Post('challenges-users')
  // createChallengesForUser(@Body() createActivityRecordDto: CreateActivityRecordDto, @CurrentUser() user: any) {
  //   return this.activityRecordsService.createChallengesForUser(createActivityRecordDto, user.id);
  // }
  // @Get('challenges-users')
  // findAllChallengesOfUser(@CurrentUser() user: any, @Body() challengeId: string) {
  //   return this.activityRecordsService.findAllChallengesOfUser(user.id, challengeId);
  // }
}
