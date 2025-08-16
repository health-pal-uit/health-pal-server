import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { DailyLogsService } from './daily_logs.service';
import { CreateDailyLogDto } from './dto/create-daily_log.dto';
import { UpdateDailyLogDto } from './dto/update-daily_log.dto';

@Controller('daily-logs')
export class DailyLogsController {
  constructor(private readonly dailyLogsService: DailyLogsService) {}

  @Post()
  create(@Body() createDailyLogDto: CreateDailyLogDto) {
    return this.dailyLogsService.create(createDailyLogDto);
  }

  @Get()
  findAll() {
    return this.dailyLogsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.dailyLogsService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateDailyLogDto: UpdateDailyLogDto) {
    return this.dailyLogsService.update(+id, updateDailyLogDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.dailyLogsService.remove(+id);
  }
}
