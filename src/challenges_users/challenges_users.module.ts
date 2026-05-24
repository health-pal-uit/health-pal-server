import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ChallengesUsersService } from './challenges_users.service';
import { ChallengesUsersController } from './challenges_users.controller';
import { ChallengesUser } from './entities/challenges_user.entity';
import { User } from 'src/users/entities/user.entity';
import { Challenge } from 'src/challenges/entities/challenge.entity';
import { NotificationsModule } from 'src/notifications/notifications.module';
import { WalletsModule } from 'src/wallets/wallets.module';
import { TokenTransactionsModule } from 'src/token_transactions/token_transactions.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([ChallengesUser, User, Challenge]),
    NotificationsModule,
    WalletsModule,
    TokenTransactionsModule,
  ],
  controllers: [ChallengesUsersController],
  providers: [ChallengesUsersService],
  exports: [ChallengesUsersService],
})
export class ChallengesUsersModule {}
