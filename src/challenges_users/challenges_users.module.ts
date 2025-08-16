import { Module } from '@nestjs/common';
import { ChallengesUsersService } from './challenges_users.service';
import { ChallengesUsersController } from './challenges_users.controller';

@Module({
  controllers: [ChallengesUsersController],
  providers: [ChallengesUsersService],
})
export class ChallengesUsersModule {}
