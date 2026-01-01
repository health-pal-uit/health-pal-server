import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { NotificationsService } from './notifications.service';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull, Not } from 'typeorm';
import { User } from 'src/users/entities/user.entity';
import { DailyLog } from 'src/daily_logs/entities/daily_log.entity';

@Injectable()
export class NotificationSchedulerService {
  private readonly logger = new Logger(NotificationSchedulerService.name);

  constructor(
    private notificationsService: NotificationsService,
    @InjectRepository(User) private userRepository: Repository<User>,
    @InjectRepository(DailyLog) private dailyLogRepository: Repository<DailyLog>,
  ) {}

  @Cron(CronExpression.EVERY_DAY_AT_8AM)
  async sendGoodMorningNotification() {
    this.logger.log('Sending good morning notifications...');
    try {
      await this.notificationsService.sendToAllUsers({
        title: 'Good Morning! ☀️',
        message: 'Start your day right - log your meals and track your activities!',
      });
      this.logger.log('Good morning notifications sent successfully');
    } catch (error) {
      this.logger.error('Error sending good morning notifications:', error);
    }
  }

  @Cron('0 12 * * *') // every day 12pm
  async sendLunchReminderNotification() {
    this.logger.log('Sending lunch reminder notifications...');
    try {
      await this.notificationsService.sendToAllUsers({
        title: 'Lunch Time! 🍽️',
        message: "Don't forget to log your lunch. Keep track of your nutrition!",
      });
      this.logger.log('Lunch reminder notifications sent successfully');
    } catch (error) {
      this.logger.error('Error sending lunch reminder notifications:', error);
    }
  }

  @Cron('0 18 * * *') // every day 6pm
  async sendDinnerReminderNotification() {
    this.logger.log('Sending dinner reminder notifications...');
    try {
      await this.notificationsService.sendToAllUsers({
        title: 'Dinner Time! 🥗',
        message: 'Log your dinner to stay on track with your nutrition goals!',
      });
      this.logger.log('Dinner reminder notifications sent successfully');
    } catch (error) {
      this.logger.error('Error sending dinner reminder notifications:', error);
    }
  }

  @Cron('0 20 * * *') // every day 8pm
  async remindUsersToLogActivities() {
    this.logger.log('Sending activity log reminder notifications...');
    try {
      await this.notificationsService.sendToAllUsers({
        title: 'Activity Time! 💪',
        message: "Don't forget to log your workouts and activities today!",
      });
      this.logger.log('Activity reminder notifications sent successfully');
    } catch (error) {
      this.logger.error('Error sending activity reminder notifications:', error);
    }
  }

  @Cron('0 22 * * *') // every day 10pm
  async sendDailyReflectionNotification() {
    this.logger.log('Sending daily reflection notifications...');
    try {
      await this.notificationsService.sendToAllUsers({
        title: 'End of Day! 🌙',
        message: 'Review your nutrition and activity for today. Great job staying consistent!',
      });
      this.logger.log('Daily reflection notifications sent successfully');
    } catch (error) {
      this.logger.error('Error sending daily reflection notifications:', error);
    }
  }
}
