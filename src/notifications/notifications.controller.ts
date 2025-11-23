import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiParam, ApiBody } from '@nestjs/swagger';
import { NotificationsService } from './notifications.service';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { UpdateNotificationDto } from './dto/update-notification.dto';
import { AdminSupabaseGuard } from 'src/auth/guards/supabase/admin-supabase.guard';
import { SupabaseGuard } from 'src/auth/guards/supabase/supabase.guard';
import { CurrentUserId } from 'src/helpers/decorators/current-user-id.decorator';
import { CurrentUser } from 'src/helpers/decorators/current-user.decorator';
import { NotificationPaginationDto } from './notification-pagination.dto';

@ApiBearerAuth()
@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Post('user')
  @UseGuards(AdminSupabaseGuard)
  @ApiOperation({ summary: 'Send notification to a specific user' })
  @ApiBody({ type: CreateNotificationDto })
  @ApiResponse({ status: 201, description: 'Notification sent successfully' })
  @ApiResponse({ status: 404, description: 'User not found' })
  async sendToUser(@Body() createNotificationDto: CreateNotificationDto) {
    return await this.notificationsService.sendToUser(createNotificationDto);
  }

  @Post('all-user')
  @UseGuards(AdminSupabaseGuard)
  @ApiOperation({ summary: 'Send notification to all users' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: { title: { type: 'string' }, message: { type: 'string' } },
    },
  })
  @ApiResponse({ status: 201, description: 'Notifications sent to all users' })
  async sendToAllUsers(@Body() body: { title: string; message: string }) {
    return await this.notificationsService.sendToAllUsers(body);
  }

  @Get('admin')
  @UseGuards(AdminSupabaseGuard)
  @ApiOperation({ summary: 'Get all notifications (admin only)' })
  @ApiResponse({ status: 200, description: 'List of all notifications' })
  async findAll(@Query() query: NotificationPaginationDto) {
    const { page = 1, limit = 10 } = query;
    return await this.notificationsService.findAll(page, limit);
  }

  @Get() // user id
  @UseGuards(SupabaseGuard)
  @ApiOperation({ summary: "Get current user's notifications" })
  @ApiResponse({ status: 200, description: 'List of user notifications' })
  async getUserNotifications(
    @CurrentUserId() id: string,
    @Query() query: NotificationPaginationDto,
  ) {
    const { page = 1, limit = 10 } = query;
    return await this.notificationsService.getUserNotifications(id, page, limit);
  }

  @Get('unread')
  @UseGuards(SupabaseGuard)
  @ApiOperation({ summary: "Get current user's unread notifications" })
  @ApiResponse({ status: 200, description: 'List of unread notifications' })
  async getUserUnreadNotifications(
    @CurrentUserId() id: string,
    @Query() query: NotificationPaginationDto,
  ) {
    const { page = 1, limit = 10 } = query;
    return await this.notificationsService.getUserUnreadNotifications(id, page, limit);
  }

  @Patch('markAsRead/:id') // notification id
  @UseGuards(SupabaseGuard)
  @ApiOperation({ summary: 'Mark a specific notification as read' })
  @ApiParam({ name: 'id', description: 'Notification ID' })
  @ApiResponse({ status: 200, description: 'Notification marked as read' })
  @ApiResponse({ status: 404, description: 'Notification not found' })
  async markAsRead(@Param('id') id: string, @CurrentUser() user: any) {
    return await this.notificationsService.markAsRead(id, user.id);
  }

  @Patch('markAllAsRead')
  @UseGuards(SupabaseGuard)
  @ApiOperation({ summary: 'Mark all user notifications as read' })
  @ApiResponse({ status: 200, description: 'All notifications marked as read' })
  async markAllAsRead(@CurrentUser() user: any) {
    return await this.notificationsService.markAllAsRead(user.id);
  }

  @Delete(':id')
  @UseGuards(SupabaseGuard)
  @ApiOperation({
    summary: 'Remove a notification (soft delete for users, hard delete for admins)',
  })
  @ApiParam({ name: 'id', description: 'Notification ID' })
  @ApiResponse({ status: 200, description: 'Notification removed' })
  @ApiResponse({ status: 404, description: 'Notification not found' })
  async remove(@Param('id') id: string, @CurrentUser() user: any) {
    const isAdmin = user.role === 'admin';
    if (isAdmin) {
      return await this.notificationsService.adminRemove(id);
    }
    return await this.notificationsService.remove(id, user.id);
  }
}
