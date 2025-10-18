import { Module } from '@nestjs/common';
import { DailyLogsService } from './daily_logs.service';
import { DailyLogsController } from './daily_logs.controller';
import { DailyLog } from './entities/daily_log.entity';

@Module({
  imports: [DailyLog],
  controllers: [DailyLogsController],
  providers: [DailyLogsService],
  exports: [DailyLogsService],
})
export class DailyLogsModule {}
