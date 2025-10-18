import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { UpdateNotificationDto } from './dto/update-notification.dto';
import { AdminSupabaseGuard } from 'src/auth/guards/supabase/admin-supabase.guard';
import { SupabaseGuard } from 'src/auth/guards/supabase/supabase.guard';
import { CurrentUserId } from 'src/helpers/decorators/current-user-id.decorator';
import { CurrentUser } from 'src/helpers/decorators/current-user.decorator';

@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Post('user')
  @UseGuards(AdminSupabaseGuard)
  sendToUser(@Body() createNotificationDto: CreateNotificationDto) {
    return this.notificationsService.sendToUser(createNotificationDto);
  }

  @Post('all-user')
  @UseGuards(AdminSupabaseGuard)
  sendToAllUsers(@Body() body: { title: string; message: string }) {
    return this.notificationsService.sendToAllUsers(body);
  }

  @Get('admin')
  @UseGuards(AdminSupabaseGuard)
  findAll() {
    return this.notificationsService.findAll();
  }

  @Get() // user id
  @UseGuards(SupabaseGuard)
  getUserNotifications(@CurrentUserId() id: string) {
    return this.notificationsService.getUserNotifications(id);
  }

  @Get('unread')
  @UseGuards(SupabaseGuard)
  getUserUnreadNotifications(@CurrentUserId() id: string) {
    return this.notificationsService.getUserUnreadNotifications(id);
  }

  @Patch('markAsRead/:id') // notification id
  @UseGuards(SupabaseGuard)
  markAsRead(@Param('id') id: string) {
    return this.notificationsService.markAsRead(id);
  }

  @Delete(':id')
  @UseGuards(SupabaseGuard)
  remove(@Param('id') id: string, @CurrentUser() user: any) {
    const isAdmin = user.role === 'admin';
    if (isAdmin) {
      return this.notificationsService.adminRemove(id);
    }
    return this.notificationsService.remove(id);
  }
}
