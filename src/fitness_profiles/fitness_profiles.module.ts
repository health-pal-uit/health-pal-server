import { Module } from '@nestjs/common';
import { FitnessProfilesService } from './fitness_profiles.service';
import { FitnessProfilesController } from './fitness_profiles.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FitnessProfile } from './entities/fitness_profile.entity';
import { User } from 'src/users/entities/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([FitnessProfile, User])],
  controllers: [FitnessProfilesController],
  providers: [FitnessProfilesService],
  exports: [FitnessProfilesService],
})
export class FitnessProfilesModule {}
