import { Module } from '@nestjs/common';
import { FitnessProfilesService } from './fitness_profiles.service';
import { FitnessProfilesController } from './fitness_profiles.controller';

@Module({
  controllers: [FitnessProfilesController],
  providers: [FitnessProfilesService],
})
export class FitnessProfilesModule {}
