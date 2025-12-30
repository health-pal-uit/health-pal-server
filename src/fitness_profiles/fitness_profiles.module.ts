import { Module } from '@nestjs/common';
import { FitnessProfilesService } from './fitness_profiles.service';
import { FitnessProfilesController } from './fitness_profiles.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FitnessProfile } from './entities/fitness_profile.entity';
import { User } from 'src/users/entities/user.entity';
import { DietType } from 'src/diet_types/entities/diet_type.entity';

@Module({
  imports: [TypeOrmModule.forFeature([FitnessProfile, User, DietType])],
  controllers: [FitnessProfilesController],
  providers: [FitnessProfilesService],
  exports: [FitnessProfilesService],
})
export class FitnessProfilesModule {}
