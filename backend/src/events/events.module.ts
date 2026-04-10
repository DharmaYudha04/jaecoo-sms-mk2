import { Module } from '@nestjs/common';
import { EventsController } from './events.controller';
import { RealtimeService } from './realtime.service';

@Module({
  controllers: [EventsController],
  providers: [RealtimeService],
  exports: [RealtimeService],
})
export class EventsModule {}
