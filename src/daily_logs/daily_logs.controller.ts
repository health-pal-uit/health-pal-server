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
} from '@nestjs/common';
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
  async findAll(@CurrentUser() user: ReqUserType) {
    return await this.dailyLogsService.findAllByUser(user.id);
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
