import { Injectable } from '@nestjs/common';
import type { Response } from 'express';

type ClientMap = Map<number, Set<Response>>;

@Injectable()
export class RealtimeStreamService {
  private readonly clients: ClientMap = new Map();

  addClient(userId: number, response: Response) {
    const current = this.clients.get(userId) ?? new Set<Response>();
    current.add(response);
    this.clients.set(userId, current);
  }

  removeClient(userId: number, response: Response) {
    const current = this.clients.get(userId);
    if (!current) return;
    current.delete(response);
    if (current.size === 0) {
      this.clients.delete(userId);
    }
  }

  publishToUsers(userIds: number[], event: string, payload: unknown) {
    const uniqueUserIds = Array.from(new Set(userIds));
    for (const userId of uniqueUserIds) {
      const targets = this.clients.get(userId);
      if (!targets?.size) continue;
      const body = `event: ${event}\ndata: ${JSON.stringify(payload)}\n\n`;
      for (const response of targets) {
        response.write(body);
      }
    }
  }

  publishReady(userId: number, response: Response) {
    response.write(`event: ready\ndata: ${JSON.stringify({ ok: true, ts: Date.now() })}\n\n`);
  }

  publishHeartbeat(userId: number) {
    const targets = this.clients.get(userId);
    if (!targets?.size) return;
    const body = `event: heartbeat\ndata: ${JSON.stringify({ ts: Date.now() })}\n\n`;
    for (const response of targets) {
      response.write(body);
    }
  }
}
