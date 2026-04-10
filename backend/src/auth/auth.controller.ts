import { Body, Controller, Get, Headers, Post, Req } from '@nestjs/common';
import type { Request } from 'express';
import { AuditLogStatus } from '@prisma/client';
import { Public } from '../common/auth.guard';
import { AuthService } from './auth.service';
import { AuditService } from '../audit/audit.service';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly auditService: AuditService,
  ) {}

  @Public()
  @Post('login')
  async login(
    @Body() body: { email: string; password: string },
    @Req() req: Request,
  ) {
    const normalizedEmail = body.email.trim().toLowerCase();

    try {
      const result = await this.authService.login(body.email, body.password);
      await this.auditService.log({
        actor: result.user,
        action: 'LOGIN_SUCCESS',
        module: 'auth',
        entityType: 'session',
        entityLabel: normalizedEmail,
        status: AuditLogStatus.SUCCESS,
        message: `Login berhasil untuk ${normalizedEmail}.`,
        req,
      });
      return result;
    } catch (error) {
      await this.auditService.log({
        actor: { email: normalizedEmail },
        action: 'LOGIN_FAILED',
        module: 'auth',
        entityType: 'session',
        entityLabel: normalizedEmail,
        status: AuditLogStatus.FAILED,
        message: `Login gagal untuk ${normalizedEmail}.`,
        metadata: { email: normalizedEmail },
        req,
      });
      throw error;
    }
  }

  @Get('me')
  me(@Headers('authorization') authorization?: string) {
    return this.authService.me(authorization);
  }
}
