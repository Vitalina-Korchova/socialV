import { Controller, Get, Param, Patch, Query, UseGuards } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { AuthGuard } from '@nestjs/passport';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';

@UseGuards(AuthGuard('jwt'))
@Controller('api/notifications')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) { }

  @Get()
  async getNotifications(
    @CurrentUser('id') userId: number,
    @Query('page') page?: string,
    @Query('page_size') page_size?: string,
  ) {
    return this.notificationsService.getNotificationsByUserId(
      userId,
      page ? Number(page) : 1,
      page_size ? Number(page_size) : 10,
    );
  }

  @Get('unread-count')
  async getUnreadCount(@CurrentUser('id') userId: number) {
    const count = await this.notificationsService.getUnreadCount(userId);
    return { count };
  }

  @Patch(':id/read')
  async markAsRead(
    @Param('id') id: string,
    @CurrentUser('id') userId: number,
  ) {
    return this.notificationsService.markAsRead(Number(id), userId);
  }
}
