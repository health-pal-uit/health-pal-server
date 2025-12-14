import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { UpdateNotificationDto } from './dto/update-notification.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { DeleteResult, IsNull, Not, Repository } from 'typeorm';
import { User } from 'src/users/entities/user.entity';
import { Notification } from './entities/notification.entity';
import { Device } from 'src/devices/entities/device.entity';
import * as admin from 'firebase-admin';

@Injectable()
export class NotificationsService {
  constructor(
    @InjectRepository(Notification) private notificationRepository: Repository<Notification>,
    @InjectRepository(User) private userRepository: Repository<User>,
    @InjectRepository(Device) private deviceRepository: Repository<Device>,
    @Inject('FIREBASE_ADMIN') private firebaseAdmin: admin.app.App | null,
  ) {}

  async sendPushNotificationToDevice(push_tokens: string[], title: string, message: string) {
    if (push_tokens.length === 0) {
      console.log('No push tokens available to send notification.');
      return;
    }

    if (!this.firebaseAdmin) {
      console.warn('Firebase Admin not initialized. Skipping push notification.');
      return;
    }

    try {
      const res = await this.firebaseAdmin.messaging().sendEachForMulticast({
        tokens: push_tokens,
        notification: {
          title: title,
          body: message,
        },
      });

      if (res.failureCount > 0) {
        res.responses.forEach((resp, idx) => {
          if (!resp.success) {
            console.error(`Failed to send notification to ${push_tokens[idx]}: ${resp.error}`);
          }
        });
      }
      return res;
    } catch (error) {
      console.error('Error sending push notification:', error);
    }
  }

  async sendToUser(createNotificationDto: CreateNotificationDto) {
    const user = await this.userRepository.findOne({
      where: { id: createNotificationDto.user_id },
      relations: ['devices'],
    });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const tokens = user.devices
      .filter((device) => device.last_active_at !== null && device.push_token)
      .map((device) => device.push_token);

    const notification = this.notificationRepository.create({
      user: user,
      title: createNotificationDto.title,
      content: createNotificationDto.content,
    });
    await this.notificationRepository.save(notification);
    if (tokens.length > 0) {
      await this.sendPushNotificationToDevice(
        tokens,
        createNotificationDto.title,
        createNotificationDto.content,
      );
    }
  }

  async sendToAllUsers(body: { title: string; message: string }) {
    const users = await this.userRepository.find();

    const notifications = users.map((user) =>
      this.notificationRepository.create({
        user,
        title: body.title,
        content: body.message,
      }),
    );
    await this.notificationRepository.save(notifications);

    const devices = await this.deviceRepository.find({
      where: { last_active_at: Not(IsNull()) },
      select: ['push_token'],
    });

    const tokens = devices.map((d) => d.push_token).filter(Boolean);

    if (tokens.length > 0) {
      await this.sendPushNotificationToDevice(tokens, body.title, body.message);
    }
  }

  async findAll(
    page: number = 1,
    limit: number = 10,
  ): Promise<{ data: Notification[]; total: number; page: number; limit: number }> {
    const skip = (page - 1) * limit;
    const [data, total] = await this.notificationRepository.findAndCount({
      relations: ['user'],
      skip,
      take: limit,
      order: { created_at: 'DESC' },
    });
    return { data, total, page, limit };
  }

  async getUserNotifications(
    id: string,
    page: number = 1,
    limit: number = 10,
  ): Promise<{ data: Notification[]; total: number; page: number; limit: number }> {
    const skip = (page - 1) * limit;
    const [data, total] = await this.notificationRepository.findAndCount({
      where: { user: { id: id } },
      skip,
      take: limit,
      order: { created_at: 'DESC' },
    });
    return { data, total, page, limit };
  }

  async getUserUnreadNotifications(
    id: string,
    page: number = 1,
    limit: number = 10,
  ): Promise<{ data: Notification[]; total: number; page: number; limit: number }> {
    const skip = (page - 1) * limit;
    const [data, total] = await this.notificationRepository.findAndCount({
      where: { user: { id: id }, is_read: false },
      relations: ['user'],
      skip,
      take: limit,
      order: { created_at: 'DESC' },
    });
    return { data, total, page, limit };
  }

  async markAsRead(id: string, userId: string) {
    const notification = await this.notificationRepository.findOne({
      where: { id: id, user: { id: userId } },
    });
    if (!notification) {
      throw new NotFoundException('Notification not found');
    }
    notification.is_read = true;
    await this.notificationRepository.save(notification);
  }

  async markAllAsRead(userId: string) {
    const notifications = await this.notificationRepository.find({
      where: { user: { id: userId }, is_read: false },
    });
    for (const notification of notifications) {
      notification.is_read = true;
    }
    await this.notificationRepository.save(notifications);
  }

  async remove(id: string, userId: string): Promise<Notification | null> {
    const notification = await this.notificationRepository.findOne({
      where: { id, user: { id: userId } },
    });
    if (!notification) {
      throw new NotFoundException('Notification not found');
    }
    await this.notificationRepository.softDelete(id);
    return await this.notificationRepository.findOne({
      where: { id },
      withDeleted: true,
    });
  }
  async adminRemove(id: string): Promise<Notification | null> {
    const notification = await this.notificationRepository.findOne({
      where: { id },
    });
    await this.notificationRepository.delete(id);
    return notification;
  }
}
