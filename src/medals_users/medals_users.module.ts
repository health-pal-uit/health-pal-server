import { Module } from '@nestjs/common';
import { MedalsUsersService } from './medals_users.service';
import { MedalsUsersController } from './medals_users.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MedalsUser } from './entities/medals_user.entity';
import { User } from 'src/users/entities/user.entity';
import { Medal } from 'src/medals/entities/medal.entity';
import { Challenge } from 'src/challenges/entities/challenge.entity';
import { ChallengesUser } from 'src/challenges_users/entities/challenges_user.entity';
import { NotificationsModule } from 'src/notifications/notifications.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([MedalsUser, User, Medal, Challenge, ChallengesUser]),
    NotificationsModule,
  ],
  controllers: [MedalsUsersController],
  providers: [MedalsUsersService],
})
export class MedalsUsersModule {}
