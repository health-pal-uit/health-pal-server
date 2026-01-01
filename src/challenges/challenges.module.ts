import { Module } from '@nestjs/common';
import { ChallengesService } from './challenges.service';
import { ChallengesController } from './challenges.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Challenge } from './entities/challenge.entity';
import { ActivityRecordsModule } from 'src/activity_records/activity_records.module';
import { SupabaseStorageModule } from 'src/supabase-storage/supabase-storage.module';

@Module({
  imports: [TypeOrmModule.forFeature([Challenge]), ActivityRecordsModule, SupabaseStorageModule],
  controllers: [ChallengesController],
  providers: [ChallengesService],
  exports: [ChallengesService],
})
export class ChallengesModule {}
