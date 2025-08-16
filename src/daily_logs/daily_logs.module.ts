import { Module } from '@nestjs/common';
import { DailyLogsService } from './daily_logs.service';
import { DailyLogsController } from './daily_logs.controller';

@Module({
  controllers: [DailyLogsController],
  providers: [DailyLogsService],
})
export class DailyLogsModule {}
