import { Module } from '@nestjs/common';
import { MedalsService } from './medals.service';
import { MedalsController } from './medals.controller';
import { Medal } from './entities/medal.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Challenge } from 'src/challenges/entities/challenge.entity';
import { ChallengesMedalsModule } from 'src/challenges_medals/challenges_medals.module';

@Module({
  imports: [TypeOrmModule.forFeature([Medal, Challenge]), ChallengesMedalsModule],
  controllers: [MedalsController],
  providers: [MedalsService],
})
export class MedalsModule {}
