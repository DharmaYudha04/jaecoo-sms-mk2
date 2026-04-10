import { NestFactory } from '@nestjs/core';
import type { INestApplication } from '@nestjs/common';
import type { CorsOptions } from '@nestjs/common/interfaces/external/cors-options.interface';
import type { Express, NextFunction, Request, Response } from 'express';
import { AppModule } from './app.module';
import { GlobalValidationPipe } from './common/validation.pipe';
import { securityHeadersMiddleware } from './common/security.middleware';
import { rateLimitMiddleware } from './common/rate-limit.middleware';
import { validateEnvironmentVariables } from './common/env.validation';

function getConfiguredOrigins(): string[] {
  return (process.env.FRONTEND_URL || 'http://localhost:5173')
    .split(',')
    .map((value) => value.trim())
    .filter(Boolean)
    .map((value) => new URL(value).origin);
}

export async function createApp(): Promise<INestApplication> {
  validateEnvironmentVariables();

  const app: INestApplication = await NestFactory.create(AppModule);
  const configuredOrigins = getConfiguredOrigins();
  const isProd = process.env.NODE_ENV === 'production';
  const corsOrigin: CorsOptions['origin'] = (origin, callback) => {
    if (!origin) {
      callback(null, true);
      return;
    }

    try {
      const parsedOrigin = new URL(origin);
      if (
        parsedOrigin.hostname === 'localhost' ||
        parsedOrigin.hostname === '127.0.0.1'
      ) {
        callback(null, true);
        return;
      }

      if (
        parsedOrigin.protocol === 'https:' &&
        parsedOrigin.hostname.endsWith('.vercel.app')
      ) {
        callback(null, true);
        return;
      }
    } catch {
      // Fallback to explicit origin matching below.
    }

    if (configuredOrigins.includes(origin)) {
      callback(null, true);
      return;
    }

    callback(new Error(`Origin '${origin}' not allowed by CORS`), false);
  };

  app.enableCors({
    origin: corsOrigin,
    credentials: true,
    methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: [
      'Content-Type',
      'Authorization',
      'Accept',
      'X-Requested-With',
    ],
  });

  app.setGlobalPrefix('api');
  app.useGlobalPipes(new GlobalValidationPipe());
  app.use(securityHeadersMiddleware);
  app.use(rateLimitMiddleware);

  if (isProd) {
    const server = app.getHttpAdapter().getInstance() as Express & {
      set?: (name: string, value: number) => void;
    };

    server.set?.('trust proxy', 1);

    app.use((req: Request, res: Response, next: NextFunction) => {
      const host = req.headers.host ?? '';
      if (host.includes('localhost') || host.includes('127.0.0.1')) {
        next();
        return;
      }

      if (!req.secure && req.get('x-forwarded-proto') !== 'https') {
        res.redirect(`https://${host}${req.url}`);
        return;
      }

      next();
    });
  }

  return app;
}
