import { Controller, Get, Headers, Query, Req, Res } from '@nestjs/common';
import type { Request, Response } from 'express';
import { parseAccessToken, parseToken } from '../common/auth';
import { Public } from '../common/auth.guard';
import { RealtimeService } from './realtime.service';

@Controller('events')
export class EventsController {
  constructor(private readonly realtimeService: RealtimeService) {}

  @Public()
  @Get('stream')
  stream(
    @Headers('authorization') authorization: string | undefined,
    @Query('token') token: string | undefined,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    const actor = authorization
      ? parseToken(authorization)
      : token
        ? parseAccessToken(token)
        : null;

    if (!actor) {
      res.status(401).json({ message: 'Token tidak ditemukan.' });
      return;
    }

    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache, no-transform');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('X-Accel-Buffering', 'no');
    res.flushHeaders?.();
    res.write(
      `event: ready\ndata: ${JSON.stringify({ userId: actor.id_user })}\n\n`,
    );

    const removeClient = this.realtimeService.addClient(actor.id_user, res);
    const heartbeat = setInterval(() => {
      try {
        res.write(
          `event: ping\ndata: ${JSON.stringify({ at: new Date().toISOString() })}\n\n`,
        );
      } catch {
        clearInterval(heartbeat);
        removeClient();
      }
    }, 20000);

    req.on('close', () => {
      clearInterval(heartbeat);
      removeClient();
      res.end();
    });
  }
}
