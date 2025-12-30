import { Module } from '@nestjs/common';
import { ActivityRecordsService } from './activity_records.service';
import { ActivityRecordsController } from './activity_records.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ActivityRecord } from './entities/activity_record.entity';
import { User } from 'src/users/entities/user.entity';
import { DailyLogsModule } from 'src/daily_logs/daily_logs.module';
import { Activity } from 'src/activities/entities/activity.entity';
import { ChallengesUsersModule } from 'src/challenges_users/challenges_users.module';
import { Challenge } from 'src/challenges/entities/challenge.entity';
import { FitnessProfile } from 'src/fitness_profiles/entities/fitness_profile.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([ActivityRecord, User, Activity, Challenge, FitnessProfile]),
    DailyLogsModule,
    ChallengesUsersModule,
  ],
  controllers: [ActivityRecordsController],
  providers: [ActivityRecordsService],
  exports: [ActivityRecordsService],
})
export class ActivityRecordsModule {}
