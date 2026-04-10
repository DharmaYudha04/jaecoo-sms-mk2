import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Headers,
  Param,
  Patch,
  Post,
  Query,
  Req,
} from '@nestjs/common';
import type { Request } from 'express';
import { parseToken } from '../common/auth';
import { NotificationsService } from './notifications.service';
import { PushService } from './push.service';

@Controller('notifications')
export class NotificationsController {
  constructor(
    private readonly notificationsService: NotificationsService,
    private readonly pushService: PushService,
  ) {}

  @Get()
  async list(
    @Headers('authorization') authorization?: string,
    @Query('search') search?: string,
    @Query('status') status?: string,
    @Query('sort') sort?: string,
  ) {
    const actor = parseToken(authorization);
    const items = await this.notificationsService.listForUser(
      actor.id_user,
      'system',
      {
        search,
        unreadOnly: status === 'unread',
        sort: sort === 'oldest' ? 'oldest' : 'newest',
      },
    );

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
      isSeen: item.isSeen,
      seenAt: item.seenAt,
      roleSnapshot: item.roleSnapshot,
      category: 'system',
    }));
  }

  @Get('unread-count')
  async unreadCount(@Headers('authorization') authorization?: string) {
    const actor = parseToken(authorization);
    const count = await this.notificationsService.unreadCount(
      actor.id_user,
      'system',
    );
    return { count };
  }

  @Patch(':id/read')
  async markRead(
    @Param('id') id: string,
    @Headers('authorization') authorization?: string,
  ) {
    const actor = parseToken(authorization);
    const notificationId = Number(id);
    if (!Number.isInteger(notificationId) || notificationId <= 0) {
      throw new BadRequestException('ID notifikasi tidak valid');
    }
    await this.notificationsService.markRead(
      actor.id_user,
      notificationId,
      'system',
    );
    return { success: true };
  }

  @Patch('read-all')
  async markAllRead(@Headers('authorization') authorization?: string) {
    const actor = parseToken(authorization);
    await this.notificationsService.markAllRead(actor.id_user, 'system');
    return { success: true };
  }

  @Delete()
  async clearAll(@Headers('authorization') authorization?: string) {
    const actor = parseToken(authorization);
    const deletedCount = await this.notificationsService.clearAll(
      actor.id_user,
      'system',
    );
    return { success: true, deletedCount };
  }

  @Get('push/public-key')
  getPushPublicKey() {
    return this.pushService.getPublicConfig();
  }

  @Post('push/subscribe')
  async subscribePush(
    @Body()
    body: { endpoint: string; keys?: { p256dh?: string; auth?: string } },
    @Headers('authorization') authorization?: string,
    @Req() req?: Request,
  ) {
    const actor = parseToken(authorization);
    if (!body.endpoint || !body.keys?.p256dh || !body.keys?.auth) {
      throw new BadRequestException('Subscription push tidak valid.');
    }

    await this.pushService.upsertSubscription(
      actor.id_user,
      {
        endpoint: body.endpoint,
        keys: {
          p256dh: body.keys.p256dh,
          auth: body.keys.auth,
        },
      },
      req?.headers['user-agent'] ?? null,
    );

    return { success: true };
  }

  @Delete('push/subscribe')
  async unsubscribePush(
    @Body() body: { endpoint: string },
    @Headers('authorization') authorization?: string,
  ) {
    const actor = parseToken(authorization);
    if (!body.endpoint) {
      throw new BadRequestException('Endpoint subscription wajib dikirim.');
    }
    await this.pushService.removeSubscription(actor.id_user, body.endpoint);
    return { success: true };
  }
}
