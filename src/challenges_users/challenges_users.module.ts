import { Module } from '@nestjs/common';
import { ChallengesUsersService } from './challenges_users.service';
import { ChallengesUsersController } from './challenges_users.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ChallengesUser } from './entities/challenges_user.entity';
import { User } from 'src/users/entities/user.entity';
import { Challenge } from 'src/challenges/entities/challenge.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ChallengesUser, User, Challenge])],
  controllers: [ChallengesUsersController],
  providers: [ChallengesUsersService],
  exports: [ChallengesUsersService],
})
export class ChallengesUsersModule {}
