import { Injectable } from '@nestjs/common';
import { Notification, Role } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { RealtimeStreamService } from './realtime-stream.service';

type NotificationKind = 'system' | 'broadcast';

type CreateNotificationInput = {
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

type ListOptions = {
  search?: string;
  unreadOnly?: boolean;
  sort?: 'newest' | 'oldest';
};

const allRoles: Role[] = ['ADMIN', 'MANAGER', 'FRONTLINE', 'MEKANIK'];

@Injectable()
export class NotificationsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly realtimeStreamService: RealtimeStreamService,
  ) {}

  private buildTypeFilter(kind: NotificationKind) {
    return kind === 'broadcast'
      ? { startsWith: 'BROADCAST_' }
      : { not: { startsWith: 'BROADCAST_' } };
  }

  private async resolveRecipients(targetRoles: Role[]) {
    const uniqueRoles = Array.from(new Set(targetRoles));
    const users = await this.prisma.user.findMany({
      where: {
        role: { in: uniqueRoles },
        isActive: true,
      },
      select: { id_user: true, role: true },
    });

    return users.map((user) => ({
      userId: user.id_user,
      roleSnapshot: user.role,
    }));
  }

  async create(input: CreateNotificationInput): Promise<Notification | null> {
    const targetRoles = input.roles?.length ? Array.from(new Set(input.roles)) : allRoles;
    const recipients = await this.resolveRecipients(targetRoles);

    if (!recipients.length) {
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
          create: recipients,
        },
      },
    });

    this.realtimeStreamService.publishToUsers(
      recipients.map((item) => item.userId),
      'notification.created',
      {
        notification: {
          id: created.id,
          title: created.title,
          message: created.message,
          targetPath: created.targetPath,
          entityType: created.entityType,
          category: 'system',
        },
      },
    );

    return created;
  }

  async broadcast(input: BroadcastInput) {
    const targetRoles = Array.from(new Set([...input.targetRoles, input.actorRole]));
    const recipients = await this.resolveRecipients(targetRoles);

    if (!recipients.length) {
      return null;
    }

    const created = await this.prisma.notification.create({
      data: {
        type: 'BROADCAST_MESSAGE',
        title: input.title,
        message: input.message,
        entityType: 'broadcast',
        targetPath: '/broadcasts',
        createdByUserId: input.actorUserId,
        recipients: {
          create: recipients,
        },
      },
      include: {
        recipients: {
          select: { userId: true, roleSnapshot: true },
        },
      },
    });

    this.realtimeStreamService.publishToUsers(
      created.recipients.map((item) => item.userId),
      'broadcast.created',
      {
        notification: {
          id: created.id,
          title: created.title,
          message: created.message,
          targetPath: created.targetPath,
          entityType: created.entityType,
          category: 'broadcast',
        },
      },
    );

    return created;
  }

  listForUser(userId: number, kind: NotificationKind, options?: ListOptions) {
    const search = options?.search?.trim();

    return this.prisma.notificationRecipient.findMany({
      where: {
        userId,
        ...(options?.unreadOnly ? { isRead: false } : {}),
        notification: {
          type: this.buildTypeFilter(kind),
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
      orderBy: { notification: { createdAt: options?.sort === 'oldest' ? 'asc' : 'desc' } },
    });
  }

  async unreadCount(userId: number, kind: NotificationKind) {
    return this.prisma.notificationRecipient.count({
      where: {
        userId,
        isRead: false,
        notification: { type: this.buildTypeFilter(kind) },
      },
    });
  }

  async markRead(userId: number, notificationId: number, kind: NotificationKind) {
    return this.prisma.notificationRecipient.updateMany({
      where: {
        userId,
        notificationId,
        notification: { type: this.buildTypeFilter(kind) },
      },
      data: { isRead: true, readAt: new Date() },
    });
  }

  async markAllRead(userId: number, kind: NotificationKind) {
    return this.prisma.notificationRecipient.updateMany({
      where: {
        userId,
        isRead: false,
        notification: { type: this.buildTypeFilter(kind) },
      },
      data: { isRead: true, readAt: new Date() },
    });
  }


  async deleteOne(userId: number, notificationId: number, kind: NotificationKind) {
    const deletedCount = await this.prisma.$transaction(async (tx) => {
      const deletedRecipients = await tx.notificationRecipient.deleteMany({
        where: {
          userId,
          notificationId,
          notification: { type: this.buildTypeFilter(kind) },
        },
      });

      if (deletedRecipients.count === 0) {
        return 0;
      }

      const orphanNotification = await tx.notification.findFirst({
        where: {
          id: notificationId,
          recipients: { none: {} },
        },
        select: { id: true },
      });

      if (orphanNotification) {
        await tx.notification.delete({ where: { id: orphanNotification.id } });
      }

      return deletedRecipients.count;
    });

    return deletedCount;
  }

  async clearAll(userId: number, kind: NotificationKind) {
    const recipients = await this.prisma.notificationRecipient.findMany({
      where: {
        userId,
        notification: { type: this.buildTypeFilter(kind) },
      },
      select: { notificationId: true },
    });

    if (recipients.length === 0) {
      return 0;
    }

    const notificationIds = Array.from(new Set(recipients.map((item) => item.notificationId)));

    const deletedCount = await this.prisma.$transaction(async (tx) => {
      const deletedRecipients = await tx.notificationRecipient.deleteMany({
        where: {
          userId,
          notification: { type: this.buildTypeFilter(kind) },
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
