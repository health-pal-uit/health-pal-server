import { Module } from '@nestjs/common';
import { ChallengesMedalsService } from './challenges_medals.service';
import { ChallengesMedalsController } from './challenges_medals.controller';

@Module({
  controllers: [ChallengesMedalsController],
  providers: [ChallengesMedalsService],
})
export class ChallengesMedalsModule {}
