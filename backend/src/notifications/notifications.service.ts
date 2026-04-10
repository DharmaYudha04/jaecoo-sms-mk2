import { BadRequestException, Injectable } from '@nestjs/common';
import { Role } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { PushService } from './push.service';
import { RealtimeService } from '../events/realtime.service';

export type NotificationCategory = 'system' | 'broadcast';

export type CreateNotificationInput = {
  type: string;
  title: string;
  message: string;
  entityType?: string | null;
  entityId?: string | number | null;
  targetPath?: string | null;
  actorUserId?: number | null;
  roles?: Role[];
};

type BroadcastInput = {
  title: string;
  message: string;
  actorUserId: number;
  actorRole: Role;
  targetRoles: Role[];
};

const defaultRoles: Role[] = ['ADMIN', 'MANAGER', 'FRONTLINE', 'MEKANIK'];

@Injectable()
export class NotificationsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly realtimeService: RealtimeService,
    private readonly pushService: PushService,
  ) {}

  private async resolveRecipients(
    targetRoles: Role[],
    actorUserId?: number | null,
  ) {
    return this.prisma.user.findMany({
      where: {
        isActive: true,
        role: { in: targetRoles },
        ...(actorUserId ? { id_user: { not: actorUserId } } : {}),
      },
      select: { id_user: true, role: true },
    });
  }

  private getTypeFilter(category: NotificationCategory) {
    return category === 'broadcast'
      ? { type: 'BROADCAST' }
      : { type: { not: 'BROADCAST' } };
  }

  private async emitDelivery(
    userIds: number[],
    category: NotificationCategory,
    notification: {
      id: number;
      type: string;
      title: string;
      message: string;
      entityType: string | null;
      entityId: string | null;
      targetPath: string | null;
      createdAt: Date;
    },
  ) {
    const normalized = {
      ...notification,
      createdAt: notification.createdAt.toISOString(),
      category,
    };

    this.realtimeService.broadcast(userIds, {
      type:
        category === 'broadcast' ? 'broadcast.created' : 'notification.created',
      data: { notification: normalized },
    });

    await this.pushService.sendToUsers(userIds, {
      title: notification.title,
      body: notification.message,
      tag: `jaecoo-${category}-${notification.id}`,
      url: notification.targetPath,
    });
  }

  async create(input: CreateNotificationInput) {
    const roles = input.roles?.length
      ? Array.from(new Set(input.roles))
      : defaultRoles;
    const recipients = await this.resolveRecipients(
      roles,
      input.actorUserId ?? null,
    );
    if (recipients.length === 0) {
      return null;
    }

    const created = await this.prisma.notification.create({
      data: {
        type: input.type,
        title: input.title,
        message: input.message,
        entityType: input.entityType ?? null,
        entityId: input.entityId == null ? null : String(input.entityId),
        targetPath: input.targetPath ?? null,
        createdByUserId: input.actorUserId ?? null,
        recipients: {
          create: recipients.map((user) => ({
            userId: user.id_user,
            roleSnapshot: user.role,
          })),
        },
      },
    });

    await this.emitDelivery(
      recipients.map((user) => user.id_user),
      'system',
      created,
    );

    return created;
  }

  async broadcast(input: BroadcastInput) {
    const dedupedRoles = Array.from(new Set(input.targetRoles)).filter(
      (role) => role !== input.actorRole,
    );
    if (dedupedRoles.length === 0) {
      throw new BadRequestException(
        'Pilih minimal satu role tujuan selain role pengirim.',
      );
    }

    const recipients = await this.resolveRecipients(
      dedupedRoles,
      input.actorUserId,
    );
    if (recipients.length === 0) {
      throw new BadRequestException('Tidak ada user aktif pada role tujuan.');
    }

    const created = await this.prisma.notification.create({
      data: {
        type: 'BROADCAST',
        title: input.title.trim(),
        message: input.message.trim(),
        entityType: 'broadcast',
        entityId: null,
        targetPath: '/broadcasts',
        createdByUserId: input.actorUserId,
        recipients: {
          create: recipients.map((user) => ({
            userId: user.id_user,
            roleSnapshot: user.role,
          })),
        },
      },
    });

    await this.emitDelivery(
      recipients.map((user) => user.id_user),
      'broadcast',
      created,
    );

    return created;
  }

  listForUser(
    userId: number,
    category: NotificationCategory,
    options?: {
      search?: string;
      unreadOnly?: boolean;
      sort?: 'newest' | 'oldest';
    },
  ) {
    const search = options?.search?.trim();
    return this.prisma.notificationRecipient.findMany({
      where: {
        userId,
        ...(options?.unreadOnly ? { isRead: false } : {}),
        notification: {
          ...this.getTypeFilter(category),
          ...(search
            ? {
                OR: [
                  { title: { contains: search, mode: 'insensitive' } },
                  { message: { contains: search, mode: 'insensitive' } },
                ],
              }
            : {}),
        },
      },
      include: { notification: true },
      orderBy: {
        notification: {
          createdAt: options?.sort === 'oldest' ? 'asc' : 'desc',
        },
      },
    });
  }

  unreadCount(userId: number, category: NotificationCategory) {
    return this.prisma.notificationRecipient.count({
      where: {
        userId,
        isRead: false,
        notification: this.getTypeFilter(category),
      },
    });
  }

  async markRead(
    userId: number,
    notificationId: number,
    category: NotificationCategory,
  ) {
    return this.prisma.notificationRecipient.updateMany({
      where: {
        userId,
        notificationId,
        notification: this.getTypeFilter(category),
      },
      data: {
        isRead: true,
        readAt: new Date(),
        isSeen: true,
        seenAt: new Date(),
      },
    });
  }

  async markAllRead(userId: number, category: NotificationCategory) {
    return this.prisma.notificationRecipient.updateMany({
      where: {
        userId,
        isRead: false,
        notification: this.getTypeFilter(category),
      },
      data: {
        isRead: true,
        readAt: new Date(),
        isSeen: true,
        seenAt: new Date(),
      },
    });
  }

  async clearAll(userId: number, category: NotificationCategory) {
    const recipients = await this.prisma.notificationRecipient.findMany({
      where: {
        userId,
        notification: this.getTypeFilter(category),
      },
      select: { notificationId: true },
    });

    if (recipients.length === 0) {
      return 0;
    }

    const notificationIds = Array.from(
      new Set(recipients.map((item) => item.notificationId)),
    );

    const deletedCount = await this.prisma.$transaction(async (tx) => {
      const deletedRecipients = await tx.notificationRecipient.deleteMany({
        where: {
          userId,
          notificationId: { in: notificationIds },
        },
      });

      const orphanNotifications = await tx.notification.findMany({
        where: {
          id: { in: notificationIds },
          recipients: { none: {} },
        },
        select: { id: true },
      });

      if (orphanNotifications.length > 0) {
        await tx.notification.deleteMany({
          where: { id: { in: orphanNotifications.map((item) => item.id) } },
        });
      }

      return deletedRecipients.count;
    });

    return deletedCount;
  }
}
