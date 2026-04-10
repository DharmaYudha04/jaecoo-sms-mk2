import { Injectable, Logger } from '@nestjs/common';
import type { Response } from 'express';

export type RealtimeEventPayload = {
  type: string;
  data: Record<string, unknown>;
};

type Client = {
  id: string;
  res: Response;
};

@Injectable()
export class RealtimeService {
  private readonly logger = new Logger(RealtimeService.name);
  private readonly clients = new Map<number, Client[]>();

  addClient(userId: number, res: Response) {
    const client: Client = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
      res,
    };
    const current = this.clients.get(userId) ?? [];
    this.clients.set(userId, [...current, client]);
    return () => this.removeClient(userId, client.id);
  }

  removeClient(userId: number, clientId: string) {
    const next = (this.clients.get(userId) ?? []).filter(
      (item) => item.id !== clientId,
    );
    if (next.length > 0) {
      this.clients.set(userId, next);
      return;
    }
    this.clients.delete(userId);
  }

  sendToUser(userId: number, payload: RealtimeEventPayload) {
    const clients = this.clients.get(userId) ?? [];
    const serialized = `event: ${payload.type}\ndata: ${JSON.stringify(payload.data)}\n\n`;
    clients.forEach((client) => {
      try {
        client.res.write(serialized);
      } catch (error) {
        this.logger.warn(
          `Gagal mengirim realtime event ke user ${userId}: ${error instanceof Error ? error.message : 'unknown error'}`,
        );
      }
    });
  }

  broadcast(userIds: number[], payload: RealtimeEventPayload) {
    Array.from(new Set(userIds)).forEach((userId) =>
      this.sendToUser(userId, payload),
    );
  }
}
