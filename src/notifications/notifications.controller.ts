import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { ApiBearerAuth } from '@nestjs/swagger';
import { NotificationsService } from './notifications.service';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { UpdateNotificationDto } from './dto/update-notification.dto';
import { AdminSupabaseGuard } from 'src/auth/guards/supabase/admin-supabase.guard';
import { SupabaseGuard } from 'src/auth/guards/supabase/supabase.guard';
import { CurrentUserId } from 'src/helpers/decorators/current-user-id.decorator';
import { CurrentUser } from 'src/helpers/decorators/current-user.decorator';

@ApiBearerAuth()
@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Post('user')
  @UseGuards(AdminSupabaseGuard)
  async sendToUser(@Body() createNotificationDto: CreateNotificationDto) {
    return await this.notificationsService.sendToUser(createNotificationDto);
  }

  @Post('all-user')
  @UseGuards(AdminSupabaseGuard)
  async sendToAllUsers(@Body() body: { title: string; message: string }) {
    return await this.notificationsService.sendToAllUsers(body);
  }

  @Get('admin')
  @UseGuards(AdminSupabaseGuard)
  async findAll() {
    return await this.notificationsService.findAll();
  }

  @Get() // user id
  @UseGuards(SupabaseGuard)
  async getUserNotifications(@CurrentUserId() id: string) {
    return await this.notificationsService.getUserNotifications(id);
  }

  @Get('unread')
  @UseGuards(SupabaseGuard)
  async getUserUnreadNotifications(@CurrentUserId() id: string) {
    return await this.notificationsService.getUserUnreadNotifications(id);
  }

  @Patch('markAsRead/:id') // notification id
  @UseGuards(SupabaseGuard)
  async markAsRead(@Param('id') id: string, @CurrentUser() user: any) {
    return await this.notificationsService.markAsRead(id, user.id);
  }

  @Patch('markAllAsRead')
  @UseGuards(SupabaseGuard)
  async markAllAsRead(@CurrentUser() user: any) {
    return await this.notificationsService.markAllAsRead(user.id);
  }

  @Delete(':id')
  @UseGuards(SupabaseGuard)
  async remove(@Param('id') id: string, @CurrentUser() user: any) {
    const isAdmin = user.role === 'admin';
    if (isAdmin) {
      return await this.notificationsService.adminRemove(id);
    }
    return await this.notificationsService.remove(id, user.id);
  }
}
