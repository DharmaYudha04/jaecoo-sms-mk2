import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { CustomersModule } from './customers/customers.module';
import { VehiclesModule } from './vehicles/vehicles.module';
import { UsersModule } from './users/users.module';
import { WorkOrdersModule } from './work-orders/work-orders.module';
import { ServicesModule } from './services/services.module';
import { SchedulesModule } from './schedules/schedules.module';
import { AuthGuard } from './common/auth.guard';
import { AuditModule } from './audit/audit.module';
import { NotificationsModule } from './notifications/notifications.module';

@Module({
  imports: [
    PrismaModule,
    AuditModule,
    AuthModule,
    CustomersModule,
    VehiclesModule,
    UsersModule,
    WorkOrdersModule,
    ServicesModule,
    NotificationsModule,
    SchedulesModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    // Apply JWT authentication globally; use @Public() to opt out.
    { provide: APP_GUARD, useClass: AuthGuard },
  ],
})
export class AppModule {}
