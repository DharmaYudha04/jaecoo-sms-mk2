import { Request, Response, NextFunction } from 'express';

export function securityHeadersMiddleware(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('Referrer-Policy', 'same-origin');
  res.setHeader(
    'Permissions-Policy',
    'geolocation=(), microphone=(), camera=()',
  );
  res.setHeader(
    'Strict-Transport-Security',
    'max-age=31536000; includeSubDomains; preload',
  );
  res.setHeader('X-XSS-Protection', '1; mode=block');

  const csp = "default-src 'self'; frame-ancestors 'none';";
  res.setHeader('Content-Security-Policy', csp);

  next();
}
