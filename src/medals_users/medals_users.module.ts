import { Module } from '@nestjs/common';
import { MedalsUsersService } from './medals_users.service';
import { MedalsUsersController } from './medals_users.controller';

@Module({
  controllers: [MedalsUsersController],
  providers: [MedalsUsersService],
})
export class MedalsUsersModule {}
