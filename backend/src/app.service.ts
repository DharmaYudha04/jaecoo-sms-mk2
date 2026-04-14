import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello(): string {
    return 'JAECOO Service Backend';
  }

  getHealth() {
    return {
      status: 'ok',
      service: 'jaecoo-backend',
      timestamp: new Date().toISOString(),
      nodeEnv: process.env.NODE_ENV ?? 'development',
    };
  }
}
