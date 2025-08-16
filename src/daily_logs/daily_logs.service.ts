import { Injectable } from '@nestjs/common';
import { CreateDailyLogDto } from './dto/create-daily_log.dto';
import { UpdateDailyLogDto } from './dto/update-daily_log.dto';

@Injectable()
export class DailyLogsService {
  create(createDailyLogDto: CreateDailyLogDto) {
    return 'This action adds a new dailyLog';
  }

  findAll() {
    return `This action returns all dailyLogs`;
  }

  findOne(id: number) {
    return `This action returns a #${id} dailyLog`;
  }

  update(id: number, updateDailyLogDto: UpdateDailyLogDto) {
    return `This action updates a #${id} dailyLog`;
  }

  remove(id: number) {
    return `This action removes a #${id} dailyLog`;
  }
}
