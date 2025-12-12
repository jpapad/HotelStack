import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { join } from 'node:path';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AvailabilityModule } from './availability/availability.module';
import { AuthModule } from './auth/auth.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { DatabaseService } from './database.service';
import { HealthController } from './health.controller';
import { HousekeepingModule } from './housekeeping/housekeeping.module';
import { PrismaModule } from './prisma/prisma.module';
import { ReportsModule } from './reports/reports.module';
import { ReservationsModule } from './reservations/reservations.module';
import { RoomsModule } from './rooms/rooms.module';
import { StaysModule } from './stays/stays.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: [
        join(__dirname, '..', '..', '..', '.env'),
        join(__dirname, '..', '.env.local'),
      ],
    }),
    PrismaModule,
    AuthModule,
    DashboardModule,
    ReservationsModule,
    StaysModule,
    RoomsModule,
    AvailabilityModule,
    HousekeepingModule,
    ReportsModule,
  ],
  controllers: [AppController, HealthController],
  providers: [AppService, DatabaseService],
})
export class AppModule {}
