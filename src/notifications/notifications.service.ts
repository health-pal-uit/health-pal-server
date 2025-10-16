import { Injectable } from '@nestjs/common';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { UpdateNotificationDto } from './dto/update-notification.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from 'src/users/entities/user.entity';
import { Notification } from './entities/notification.entity';

@Injectable()
export class NotificationsService {
  constructor(
    @InjectRepository(Notification) private notificationRepository: Repository<Notification>,
    @InjectRepository(User) private userRepository: Repository<User>,
  ) {}

  sendToUser(createNotificationDto: CreateNotificationDto) {
    throw new Error('Method not implemented.');
  }
  sendToAllUsers(body: { title: string; message: string }) {
    throw new Error('Method not implemented.');
  }
  findAll() {
    throw new Error('Method not implemented.');
  }
  getUserNotifications(id: string) {
    throw new Error('Method not implemented.');
  }
  getUserUnreadNotifications(id: string) {
    throw new Error('Method not implemented.');
  }
  markAsRead(id: string) {
    throw new Error('Method not implemented.');
  }
  remove(id: string) {
    // soft delete
    return `This action removes a #${id} notification`;
  }
  adminRemove(id: string) {
    throw new Error('Method not implemented.');
  }
}
