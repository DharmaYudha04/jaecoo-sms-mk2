import {
  CanActivate,
  ExecutionContext,
  Injectable,
  SetMetadata,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';
import { parseToken } from './auth';

export const IS_PUBLIC_KEY = 'isPublic';

/**
 * Mark a route or controller as public (no authentication required).
 */
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);

/**
 * Global authentication guard.
 * All routes require a valid JWT unless decorated with @Public().
 */
@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }

    const request = context.switchToHttp().getRequest<Request>();
    const authHeader = request.headers.authorization;

    if (!authHeader) {
      throw new UnauthorizedException('Token tidak ditemukan.');
    }

    // parseToken validates signature, expiry, issuer, audience and throws
    // UnauthorizedException on any failure.
    parseToken(authHeader);
    return true;
  }
}
