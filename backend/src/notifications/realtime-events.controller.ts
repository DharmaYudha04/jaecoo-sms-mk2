import {
  Controller,
  Get,
  Query,
  Res,
  UnauthorizedException,
} from '@nestjs/common';
import type { Response } from 'express';
import { Public } from '../common/auth.guard';
import { parseToken } from '../common/auth';
import { RealtimeStreamService } from './realtime-stream.service';

@Controller('events')
export class RealtimeEventsController {
  constructor(private readonly realtimeStreamService: RealtimeStreamService) {}

  @Public()
  @Get('stream')
  async stream(
    @Query('token') token: string | undefined,
    @Res() response: Response,
  ) {
    if (!token) {
      throw new UnauthorizedException('Token diperlukan');
    }

    const actor = parseToken(token);

    response.setHeader('Content-Type', 'text/event-stream');
    response.setHeader('Cache-Control', 'no-cache, no-transform');
    response.setHeader('Connection', 'keep-alive');
    response.setHeader('X-Accel-Buffering', 'no');
    response.flushHeaders?.();

    this.realtimeStreamService.addClient(actor.id_user, response);
    this.realtimeStreamService.publishReady(actor.id_user, response);

    const heartbeat = setInterval(() => {
      this.realtimeStreamService.publishHeartbeat(actor.id_user);
    }, 25000);

    response.on('close', () => {
      clearInterval(heartbeat);
      this.realtimeStreamService.removeClient(actor.id_user, response);
      response.end();
    });
  }
}
