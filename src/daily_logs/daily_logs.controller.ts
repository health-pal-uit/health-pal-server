import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  ForbiddenException,
  Query,
} from '@nestjs/common';
import { DailyLogPaginationDto } from './dto/daily-log-pagination.dto';
import { DailyLogsService } from './daily_logs.service';
import { CreateDailyLogDto } from './dto/create-daily_log.dto';
import { UpdateDailyLogDto } from './dto/update-daily_log.dto';
import { SupabaseGuard } from 'src/auth/guards/supabase/supabase.guard';
import { CurrentUser } from 'src/helpers/decorators/current-user.decorator';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiBody, ApiParam } from '@nestjs/swagger';
import type { ReqUserType } from 'src/auth/types/req.type';

@ApiBearerAuth()
@Controller('daily-logs')
@UseGuards(SupabaseGuard)
export class DailyLogsController {
  constructor(private readonly dailyLogsService: DailyLogsService) {}

  @Get()
  @ApiOperation({ summary: 'Get all daily logs for the current user' })
  @ApiResponse({ status: 200, description: 'List of daily logs' })
  async findAll(@CurrentUser() user: ReqUserType, @Query() query: DailyLogPaginationDto) {
    const { page = 1, limit = 10 } = query;
    return await this.dailyLogsService.findAllByUser(user.id, page, limit);
  }

  @Get('date/:date')
  @ApiOperation({
    summary: 'Get or create daily log by date for the current user (sorted by meal type)',
  })
  @ApiParam({
    name: 'date',
    type: String,
    description: 'Date in dd-MM-yyyy format (e.g., 29-12-2025)',
    example: '29-12-2025',
  })
  @ApiResponse({
    status: 200,
    description:
      'Daily log for the specified date (creates if not exists), sorted by meal type (breakfast, lunch, dinner, snack)',
  })
  async getDailyLogByDate(@Param('date') date: string, @CurrentUser() user: ReqUserType) {
    const dateRegex = /^\d{2}-\d{2}-\d{4}$/;
    if (!dateRegex.test(date)) {
      throw new ForbiddenException('Invalid date format. Use dd-MM-yyyy (e.g., 29-12-2025)');
    }

    const [day, month, year] = date.split('-');
    const isoDate = `${year}-${month}-${day}`;

    const parsedDate = new Date(isoDate);
    if (isNaN(parsedDate.getTime())) {
      throw new ForbiddenException('Invalid date');
    }

    const dailyLog = await this.dailyLogsService.getOrCreateDailyLog(user.id, isoDate);

    if (dailyLog) {
      const mealTypeOrder = { breakfast: 0, lunch: 1, dinner: 2, snack: 3 };

      dailyLog.daily_ingres?.sort((a, b) => {
        const typeComparison = mealTypeOrder[a.meal_type] - mealTypeOrder[b.meal_type];
        if (typeComparison !== 0) return typeComparison;
        return new Date(a.logged_at).getTime() - new Date(b.logged_at).getTime();
      });

      dailyLog.daily_meals?.sort((a, b) => {
        const typeComparison = mealTypeOrder[a.meal_type] - mealTypeOrder[b.meal_type];
        if (typeComparison !== 0) return typeComparison;
        return new Date(a.logged_at).getTime() - new Date(b.logged_at).getTime();
      });
    }

    return dailyLog;
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a daily log by id (user: own only, admin: any)' })
  @ApiParam({ name: 'id', type: String })
  @ApiResponse({ status: 200, description: 'Daily log detail' })
  async findOne(@Param('id') id: string, @CurrentUser() user: ReqUserType) {
    const isAdmin = user.role === 'admin';
    if (!isAdmin) {
      // ensure the daily log belongs to the user
      const dailyLog = await this.dailyLogsService.findOne(id);
      if (dailyLog?.user.id !== user.id) {
        throw new ForbiddenException('Access denied');
      }
      return dailyLog;
    }
    return await this.dailyLogsService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a daily log by id (user: own only, admin: any)' })
  @ApiParam({ name: 'id', type: String })
  @ApiBody({ type: UpdateDailyLogDto })
  @ApiResponse({ status: 200, description: 'Daily log updated' })
  async update(
    @Param('id') id: string,
    @Body() updateDailyLogDto: UpdateDailyLogDto,
    @CurrentUser() user: ReqUserType,
  ) {
    const isAdmin = user.role === 'admin';
    if (!isAdmin) {
      // ensure the daily log belongs to the user
      const dailyLog = await this.dailyLogsService.findOne(id);
      if (dailyLog?.user.id !== user.id) {
        throw new ForbiddenException('Access denied');
      }
    }
    return await this.dailyLogsService.update(id, updateDailyLogDto);
  }
}
