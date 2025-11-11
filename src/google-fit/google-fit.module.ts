import { Module } from '@nestjs/common';
import { GoogleFitService } from './google-fit.service';
import { GoogleFitController } from './google-fit.controller';
import { User } from 'src/users/entities/user.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ActivityRecord } from 'src/activity_records/entities/activity_record.entity';
import { Activity } from 'src/activities/entities/activity.entity';
import { DailyLogsModule } from 'src/daily_logs/daily_logs.module';

@Module({
  imports: [TypeOrmModule.forFeature([User, ActivityRecord, Activity]), DailyLogsModule],
  controllers: [GoogleFitController],
  providers: [GoogleFitService],
})
export class GoogleFitModule {}
