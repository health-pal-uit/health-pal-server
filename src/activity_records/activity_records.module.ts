import { Module } from '@nestjs/common';
import { ActivityRecordsService } from './activity_records.service';
import { ActivityRecordsController } from './activity_records.controller';

@Module({
  controllers: [ActivityRecordsController],
  providers: [ActivityRecordsService],
})
export class ActivityRecordsModule {}
