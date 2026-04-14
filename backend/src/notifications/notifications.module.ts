import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { NotificationsController } from './notifications.controller';
import { NotificationsService } from './notifications.service';
import { BroadcastsController } from './broadcasts.controller';
import { RealtimeStreamService } from './realtime-stream.service';
import { RealtimeEventsController } from './realtime-events.controller';

@Module({
  imports: [PrismaModule],
  controllers: [NotificationsController, BroadcastsController, RealtimeEventsController],
  providers: [NotificationsService, RealtimeStreamService],
  exports: [NotificationsService, RealtimeStreamService],
})
export class NotificationsModule {}
