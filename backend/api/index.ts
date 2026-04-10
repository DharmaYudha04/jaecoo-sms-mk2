import type { IncomingMessage, ServerResponse } from 'node:http';
import { NestFactory } from '@nestjs/core';
import { createApp } from '../src/app.factory';

void NestFactory;

let cachedHandler:
  | ((req: IncomingMessage, res: ServerResponse) => void)
  | null = null;

async function getHandler() {
  if (cachedHandler) {
    return cachedHandler;
  }

  const app = await createApp();
  await app.init();
  cachedHandler = app.getHttpAdapter().getInstance() as (
    req: IncomingMessage,
    res: ServerResponse,
  ) => void;
  return cachedHandler;
}

export default async function handler(
  req: IncomingMessage,
  res: ServerResponse,
) {
  const nextHandler = await getHandler();
  nextHandler(req, res);
}
