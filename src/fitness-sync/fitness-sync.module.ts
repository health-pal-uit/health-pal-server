import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ActivityRecord } from 'src/activity_records/entities/activity_record.entity';
import { Activity } from 'src/activities/entities/activity.entity';
import { DailyLogsModule } from 'src/daily_logs/daily_logs.module';
import { User } from 'src/users/entities/user.entity';
import { FitnessSyncController } from './fitness-sync.controller';
import { FitnessSyncService } from './fitness-sync.service';
import { FitnessSyncEvent } from './entities/fitness-sync-event.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([FitnessSyncEvent, User, Activity, ActivityRecord]),
    DailyLogsModule,
  ],
  controllers: [FitnessSyncController],
  providers: [FitnessSyncService],
  exports: [FitnessSyncService],
})
export class FitnessSyncModule {}
