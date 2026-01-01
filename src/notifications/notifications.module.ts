import { Module } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { NotificationsController } from './notifications.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/users/entities/user.entity';
import { Notification } from './entities/notification.entity';
import { firebaseAdminProvider } from './firebase-admin.provider';
import { Device } from 'src/devices/entities/device.entity';
import { NotificationSchedulerService } from './notification-scheduler.service';
import { DailyLog } from 'src/daily_logs/entities/daily_log.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Notification, User, Device, DailyLog])],
  controllers: [NotificationsController],
  providers: [NotificationsService, NotificationSchedulerService, firebaseAdminProvider],
  exports: [NotificationsService],
})
export class NotificationsModule {}
