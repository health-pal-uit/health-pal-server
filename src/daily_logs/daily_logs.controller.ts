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
import { ApiBearerAuth } from '@nestjs/swagger';

@ApiBearerAuth()
@Controller('daily-logs')
@UseGuards(SupabaseGuard)
export class DailyLogsController {
  constructor(private readonly dailyLogsService: DailyLogsService) {}

  @Get()
  findAll(@CurrentUser() user: any) {
    return this.dailyLogsService.findAllByUser(user.id);
  }

  @Get(':id')
  async findOne(@Param('id') id: string, @CurrentUser() user: any) {
    const isAdmin = user.role === 'admin';
    if (!isAdmin) {
      // ensure the daily log belongs to the user
      const dailyLog = await this.dailyLogsService.findOne(id);
      if (dailyLog?.user.id !== user.id) {
        throw new ForbiddenException('Access denied');
      }
      return dailyLog;
    }
    return this.dailyLogsService.findOne(id);
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateDailyLogDto: UpdateDailyLogDto,
    @CurrentUser() user: any,
  ) {
    const isAdmin = user.role === 'admin';
    if (!isAdmin) {
      // ensure the daily log belongs to the user
      const dailyLog = await this.dailyLogsService.findOne(id);
      if (dailyLog?.user.id !== user.id) {
        throw new ForbiddenException('Access denied');
      }
    }
    return this.dailyLogsService.update(id, updateDailyLogDto);
  }
}
