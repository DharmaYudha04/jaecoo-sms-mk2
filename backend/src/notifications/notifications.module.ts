import { Module } from '@nestjs/common';
import { NotificationsController } from './notifications.controller';
import { NotificationsService } from './notifications.service';
import { PrismaModule } from '../prisma/prisma.module';
import { EventsModule } from '../events/events.module';
import { PushService } from './push.service';
import { BroadcastsController } from './broadcasts.controller';

@Module({
  imports: [PrismaModule, EventsModule],
  controllers: [NotificationsController, BroadcastsController],
  providers: [NotificationsService, PushService],
  exports: [NotificationsService, PushService],
})
export class NotificationsModule {}
