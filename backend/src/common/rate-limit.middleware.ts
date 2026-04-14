import { Request, Response, NextFunction } from 'express';

const RATE_LIMIT_MAX = Number(process.env.RATE_LIMIT_MAX ?? 120);
const RATE_LIMIT_WINDOW_MS = Number(process.env.RATE_LIMIT_WINDOW_MS ?? 60000);
const AUTH_RATE_LIMIT_MAX = Number(process.env.AUTH_RATE_LIMIT_MAX ?? 20);

interface RateRecord {
  count: number;
  expiresAt: number;
}

const rateMap = new Map<string, RateRecord>();

function getClientIp(req: Request): string {
  const forwarded = req.headers['x-forwarded-for'];
  if (typeof forwarded === 'string' && forwarded.length > 0) {
    // Take only the first address and strip any extra characters to prevent injection.
    const ip = forwarded.split(',')[0].trim().slice(0, 45);
    // Validate basic IPv4/IPv6 format; fall back on nonsense values.
    if (/^[\d.:a-fA-F]+$/.test(ip)) return ip;
  }
  return req.ip || 'unknown';
}

export function rateLimitMiddleware(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const ip = getClientIp(req);
  const isAuthLogin = req.path === '/api/auth/login' && req.method === 'POST';
  const limit = isAuthLogin ? AUTH_RATE_LIMIT_MAX : RATE_LIMIT_MAX;

  const key = `${ip}:${req.method}:${isAuthLogin ? 'auth-login' : 'general'}`;
  const now = Date.now();
  const existing = rateMap.get(key);

  if (!existing || existing.expiresAt < now) {
    rateMap.set(key, { count: 1, expiresAt: now + RATE_LIMIT_WINDOW_MS });
  } else {
    if (existing.count >= limit) {
      const retryAfterSeconds = Math.max(
        1,
        Math.ceil((existing.expiresAt - now) / 1000),
      );

      res.setHeader('Retry-After', String(retryAfterSeconds));
      res.status(429).json({
        statusCode: 429,
        message: 'Too many requests, please try again later.',
        retryAfter: retryAfterSeconds,
      });
      return;
    }

    existing.count += 1;
  }

  if (Math.random() < 0.01) {
    const expiration = Date.now();
    for (const [rateKey, rec] of rateMap.entries()) {
      if (rec.expiresAt < expiration) rateMap.delete(rateKey);
    }
  }

  next();
}
