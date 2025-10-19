import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { ActivityRecordsService } from './activity_records.service';
import { CreateActivityRecordDto } from './dto/create-activity_record.dto';
import { UpdateActivityRecordDto } from './dto/update-activity_record.dto';
import { SupabaseGuard } from 'src/auth/guards/supabase/supabase.guard';
import { CurrentUser } from 'src/helpers/decorators/current-user.decorator';
import { AdminSupabaseGuard } from 'src/auth/guards/supabase/admin-supabase.guard';

@Controller('activity-records')
@UseGuards(SupabaseGuard)
export class ActivityRecordsController {
  constructor(private readonly activityRecordsService: ActivityRecordsService) {}

  // trả về number và lưu vào challenge_user.progress_percent
  @Get('check-challenge-progress/:challengeId')
  checkProgress(@Param('challengeId') challengeId: string, @CurrentUser() user: any) {
    return this.activityRecordsService.recalculateProgressChallengesForUser(challengeId, user.id);
  }

  // chỉ trả về number
  @Get('check-activity-log-progress/:activityLogId')
  checkActivityLogProgress(
    @Param('activityLogId') activityLogId: string,
    @CurrentUser() user: any,
  ) {
    return this.activityRecordsService.calculateProgressPercent(activityLogId, user.id);
  }

  @Post('challenges')
  @UseGuards(AdminSupabaseGuard)
  createChallenges(@Body() createActivityRecordDto: CreateActivityRecordDto) {
    return this.activityRecordsService.createChallenges(createActivityRecordDto);
  }

  @Post('daily-logs')
  createDailyLogs(
    @Body() createActivityRecordDto: CreateActivityRecordDto,
    @CurrentUser() user: any,
  ) {
    return this.activityRecordsService.createDailyLogs(createActivityRecordDto, user.id);
  }

  @Get('challenges')
  findAllChallenges(@Body() challengeId: string) {
    return this.activityRecordsService.findAllChallenges(challengeId);
  }

  @Get('daily-logs')
  findAllDailyLogs(@CurrentUser() user: any, @Body() dailyLogId: string) {
    return this.activityRecordsService.findAllDailyLogsOfUser(user.id, dailyLogId);
  }
  @Get(':id')
  findOne(@Param('id') id: string, @CurrentUser() user: any) {
    return this.activityRecordsService.findOne(id, user.id);
  }

  @Patch('challenges/:id')
  @UseGuards(AdminSupabaseGuard)
  updateChallenges(
    @Param('id') id: string,
    @Body() updateActivityRecordDto: UpdateActivityRecordDto,
  ) {
    return this.activityRecordsService.updateChallenges(id, updateActivityRecordDto);
  }

  @Delete('challenges/:id')
  @UseGuards(AdminSupabaseGuard)
  removeChallenges(@Param('id') id: string) {
    return this.activityRecordsService.removeChallenges(id);
  }

  @Patch('daily-logs/:id')
  updateDailyLogs(
    @Param('id') id: string,
    @Body() updateActivityRecordDto: UpdateActivityRecordDto,
    @CurrentUser() user: any,
  ) {
    return this.activityRecordsService.updateDailyLogsOfUser(id, updateActivityRecordDto, user.id);
  }

  @Delete('daily-logs/:id')
  removeDailyLogs(@Param('id') id: string, @CurrentUser() user: any) {
    return this.activityRecordsService.removeDailyLogsOfUser(id, user.id);
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
  @Get('challenges-users')
  findAllChallengesOfUser(@CurrentUser() user: any, @Body() challengeId: string) {
    return this.activityRecordsService.findAllChallengesOfUser(user.id, challengeId);
  }
}
