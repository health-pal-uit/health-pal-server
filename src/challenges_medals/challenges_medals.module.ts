import { Module } from '@nestjs/common';
import { ChallengesMedalsService } from './challenges_medals.service';
import { ChallengesMedalsController } from './challenges_medals.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ChallengesMedal } from './entities/challenges_medal.entity';
import { Challenge } from 'src/challenges/entities/challenge.entity';
import { Medal } from 'src/medals/entities/medal.entity';
import { ChallengesUsersModule } from 'src/challenges_users/challenges_users.module';

@Module({
  imports: [TypeOrmModule.forFeature([ChallengesMedal, Challenge, Medal])],
  controllers: [ChallengesMedalsController],
  providers: [ChallengesMedalsService],
  exports: [ChallengesMedalsService],
})
export class ChallengesMedalsModule {}
