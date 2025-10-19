import { Module } from '@nestjs/common';
import { ChallengesService } from './challenges.service';
import { ChallengesController } from './challenges.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Challenge } from './entities/challenge.entity';
import { ActivityRecordsModule } from 'src/activity_records/activity_records.module';

@Module({
  imports: [TypeOrmModule.forFeature([Challenge]), ActivityRecordsModule],
  controllers: [ChallengesController],
  providers: [ChallengesService],
})
export class ChallengesModule {}
