import { NestFactory } from '@nestjs/core';
import { createServer } from 'node:net';
import { createApp } from './app.factory';

void NestFactory;

async function bootstrap() {
  const app = await createApp();
  const isProd = process.env.NODE_ENV === 'production';

  const configuredPort = Number(process.env.PORT);
  const initialPort =
    Number.isFinite(configuredPort) && configuredPort > 0
      ? configuredPort
      : 3000;

  if (isProd) {
    await app.listen(initialPort, '0.0.0.0');
    return;
  }

  const maxPortRetries = 10;
  const isPortAvailable = (port: number): Promise<boolean> =>
    new Promise((resolve) => {
      const server = createServer();

      server.once('error', () => {
        resolve(false);
      });

      server.once('listening', () => {
        server.close(() => resolve(true));
      });

      server.listen(port);
    });

  for (let attempt = 0; attempt <= maxPortRetries; attempt += 1) {
    const port = initialPort + attempt;

    if (!(await isPortAvailable(port))) {
      continue;
    }

    await app.listen(port, '0.0.0.0');
    if (attempt > 0) {
      console.warn(
        `Port ${initialPort} sedang dipakai, server berjalan di port ${port}.`,
      );
    }
    return;
  }

  throw new Error(
    `Tidak menemukan port kosong dalam rentang ${initialPort}-${initialPort + maxPortRetries}.`,
  );
}

void bootstrap();
