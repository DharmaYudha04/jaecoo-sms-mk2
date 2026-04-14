/* eslint-disable prettier/prettier */
import { BadRequestException, Body, Controller, Delete, Get, Headers, Param, Patch, Post, Query } from '@nestjs/common';
import { Role } from '@prisma/client';
import { parseToken } from '../common/auth';
import { NotificationsService } from './notifications.service';

const allowedRoles: Role[] = ['ADMIN', 'MANAGER', 'FRONTLINE', 'MEKANIK'];

@Controller('broadcasts')
export class BroadcastsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get()
  async list(
    @Headers('authorization') authorization?: string,
    @Query('search') search?: string,
    @Query('status') status?: string,
    @Query('sort') sort?: string,
  ) {
    const actor = parseToken(authorization);
    const items = await this.notificationsService.listForUser(actor.id_user, 'broadcast', {
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
    const count = await this.notificationsService.unreadCount(actor.id_user, 'broadcast');
    return { count };
  }

  @Patch(':id/read')
  async markRead(@Param('id') id: string, @Headers('authorization') authorization?: string) {
    const actor = parseToken(authorization);
    const notificationId = Number(id);
    if (!Number.isInteger(notificationId) || notificationId <= 0) {
      throw new BadRequestException('ID broadcast tidak valid');
    }
    await this.notificationsService.markRead(actor.id_user, notificationId, 'broadcast');
    return { success: true };
  }

  @Patch('read-all')
  async markAllRead(@Headers('authorization') authorization?: string) {
    const actor = parseToken(authorization);
    await this.notificationsService.markAllRead(actor.id_user, 'broadcast');
    return { success: true };
  }

  @Delete(':id')
  async deleteOne(@Param('id') id: string, @Headers('authorization') authorization?: string) {
    const actor = parseToken(authorization);
    const notificationId = Number(id);
    if (!Number.isInteger(notificationId) || notificationId <= 0) {
      throw new BadRequestException('ID broadcast tidak valid');
    }
    const deletedCount = await this.notificationsService.deleteOne(actor.id_user, notificationId, 'broadcast');
    return { success: true, deletedCount };
  }

  @Delete()
  async clearAll(@Headers('authorization') authorization?: string) {
    const actor = parseToken(authorization);
    const deletedCount = await this.notificationsService.clearAll(actor.id_user, 'broadcast');
    return { success: true, deletedCount };
  }

  @Post()
  async create(
    @Headers('authorization') authorization: string | undefined,
    @Body()
    body: {
      title?: string;
      message?: string;
      targetRoles?: Role[];
    },
  ) {
    const actor = parseToken(authorization);
    const title = body.title?.trim();
    const message = body.message?.trim();
    const targetRoles = Array.from(new Set((body.targetRoles ?? []).filter((role): role is Role => allowedRoles.includes(role))));

    if (!title || !message) {
      throw new BadRequestException('Judul dan pesan broadcast wajib diisi.');
    }

    if (targetRoles.length === 0) {
      throw new BadRequestException('Pilih minimal satu role tujuan.');
    }

    const notification = await this.notificationsService.broadcast({
      title,
      message,
      actorUserId: actor.id_user,
      actorRole: actor.role,
      targetRoles,
    });

    if (!notification) {
      throw new BadRequestException('Tidak ada penerima broadcast aktif yang sesuai.');
    }

    return {
      id: notification.id,
      title: notification.title,
      message: notification.message,
      createdAt: notification.createdAt,
      targetPath: notification.targetPath,
      recipientCount: notification.recipients.length,
    };
  }
}
