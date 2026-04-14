import { BadRequestException, Controller, Delete, Get, Headers, Param, Patch, Query } from '@nestjs/common';
import { parseToken } from '../common/auth';
import { NotificationsService } from './notifications.service';

@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get()
  async list(
    @Headers('authorization') authorization?: string,
    @Query('search') search?: string,
    @Query('status') status?: string,
    @Query('sort') sort?: string,
  ) {
    const actor = parseToken(authorization);
    const items = await this.notificationsService.listForUser(actor.id_user, 'system', {
      search,
      unreadOnly: status === 'unread',
      sort: sort === 'oldest' ? 'oldest' : 'newest',
    });

    return items.map((item) => ({
      id: item.notification.id,
      type: item.notification.type,
      title: item.notification.title,
      message: item.notification.message,
      entityType: item.notification.entityType,
      entityId: item.notification.entityId,
      targetPath: item.notification.targetPath,
      createdAt: item.notification.createdAt,
      isRead: item.isRead,
      readAt: item.readAt,
    }));
  }

  @Get('unread-count')
  async unreadCount(@Headers('authorization') authorization?: string) {
    const actor = parseToken(authorization);
    const count = await this.notificationsService.unreadCount(actor.id_user, 'system');
    return { count };
  }

  @Patch(':id/read')
  async markRead(@Param('id') id: string, @Headers('authorization') authorization?: string) {
    const actor = parseToken(authorization);
    const notificationId = Number(id);
    if (!Number.isInteger(notificationId) || notificationId <= 0) {
      throw new BadRequestException('ID notifikasi tidak valid');
    }
    await this.notificationsService.markRead(actor.id_user, notificationId, 'system');
    return { success: true };
  }

  @Patch('read-all')
  async markAllRead(@Headers('authorization') authorization?: string) {
    const actor = parseToken(authorization);
    await this.notificationsService.markAllRead(actor.id_user, 'system');
    return { success: true };
  }

  @Delete(':id')
  async deleteOne(@Param('id') id: string, @Headers('authorization') authorization?: string) {
    const actor = parseToken(authorization);
    const notificationId = Number(id);
    if (!Number.isInteger(notificationId) || notificationId <= 0) {
      throw new BadRequestException('ID notifikasi tidak valid');
    }
    const deletedCount = await this.notificationsService.deleteOne(actor.id_user, notificationId, 'system');
    return { success: true, deletedCount };
  }

  @Delete()
  async clearAll(@Headers('authorization') authorization?: string) {
    const actor = parseToken(authorization);
    const deletedCount = await this.notificationsService.clearAll(actor.id_user, 'system');
    return { success: true, deletedCount };
  }
}
