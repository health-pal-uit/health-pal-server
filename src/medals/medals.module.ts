import { Module, forwardRef } from '@nestjs/common';
import { MedalsService } from './medals.service';
import { MedalsController } from './medals.controller';
import { Medal } from './entities/medal.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Challenge } from 'src/challenges/entities/challenge.entity';
import { ChallengesMedalsModule } from 'src/challenges_medals/challenges_medals.module';
import { SupabaseStorageModule } from 'src/supabase-storage/supabase-storage.module';
import { ChallengesModule } from 'src/challenges/challenges.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Medal, Challenge]),
    ChallengesMedalsModule,
    SupabaseStorageModule,
    forwardRef(() => ChallengesModule),
  ],
  controllers: [MedalsController],
  providers: [MedalsService],
})
export class MedalsModule {}
