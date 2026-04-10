import { Injectable, Logger } from '@nestjs/common';
import webpush from 'web-push';
import { PrismaService } from '../prisma/prisma.service';

export type PushPayload = {
  title: string;
  body: string;
  tag?: string;
  url?: string | null;
};

type SubscriptionInput = {
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
};

@Injectable()
export class PushService {
  private readonly logger = new Logger(PushService.name);
  private readonly publicKey = process.env.WEB_PUSH_PUBLIC_KEY?.trim();
  private readonly privateKey = process.env.WEB_PUSH_PRIVATE_KEY?.trim();
  private readonly subject =
    process.env.WEB_PUSH_SUBJECT?.trim() || 'mailto:admin@example.com';

  constructor(private readonly prisma: PrismaService) {
    if (this.isEnabled()) {
      webpush.setVapidDetails(this.subject, this.publicKey!, this.privateKey!);
    }
  }

  isEnabled(): boolean {
    return Boolean(this.publicKey && this.privateKey);
  }

  getPublicConfig() {
    return {
      supported: this.isEnabled(),
      publicKey: this.publicKey ?? null,
    };
  }

  async upsertSubscription(
    userId: number,
    subscription: SubscriptionInput,
    userAgent?: string | null,
  ) {
    return this.prisma.pushSubscription.upsert({
      where: { endpoint: subscription.endpoint },
      update: {
        userId,
        p256dh: subscription.keys.p256dh,
        auth: subscription.keys.auth,
        userAgent: userAgent ?? null,
        isActive: true,
        lastUsedAt: new Date(),
      },
      create: {
        userId,
        endpoint: subscription.endpoint,
        p256dh: subscription.keys.p256dh,
        auth: subscription.keys.auth,
        userAgent: userAgent ?? null,
        isActive: true,
        lastUsedAt: new Date(),
      },
    });
  }

  async removeSubscription(userId: number, endpoint: string) {
    return this.prisma.pushSubscription.deleteMany({
      where: { userId, endpoint },
    });
  }

  async sendToUsers(userIds: number[], payload: PushPayload): Promise<void> {
    if (!this.isEnabled()) return;

    const subscriptions = await this.prisma.pushSubscription.findMany({
      where: {
        userId: { in: Array.from(new Set(userIds)) },
        isActive: true,
      },
    });

    const body = JSON.stringify(payload);
    await Promise.all(
      subscriptions.map(async (subscription) => {
        try {
          await webpush.sendNotification(
            {
              endpoint: subscription.endpoint,
              keys: {
                p256dh: subscription.p256dh,
                auth: subscription.auth,
              },
            },
            body,
          );
          await this.prisma.pushSubscription.update({
            where: { id: subscription.id },
            data: { lastUsedAt: new Date(), isActive: true },
          });
        } catch (error) {
          const statusCode =
            typeof error === 'object' && error && 'statusCode' in error
              ? Number((error as { statusCode?: unknown }).statusCode)
              : 0;
          if (statusCode === 404 || statusCode === 410) {
            await this.prisma.pushSubscription.update({
              where: { id: subscription.id },
              data: { isActive: false },
            });
          }
          this.logger.warn(
            `Push notification gagal dikirim ke subscription ${subscription.id}.`,
          );
        }
      }),
    );
  }
}
