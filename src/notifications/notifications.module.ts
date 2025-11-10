import { Module } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { NotificationsController } from './notifications.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/users/entities/user.entity';
import { Notification } from './entities/notification.entity';
import { firebaseAdminProvider } from './firebase-admin.provider';
import { Device } from 'src/devices/entities/device.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Notification, User, Device])],
  controllers: [NotificationsController],
  providers: [NotificationsService, firebaseAdminProvider],
})
export class NotificationsModule {}
