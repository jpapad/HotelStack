import { Module } from '@nestjs/common';

import { AuthModule } from '../auth/auth.module';
import { PrismaModule } from '../prisma/prisma.module';
import { ReservationsController } from './reservations.controller';

@Module({
  imports: [PrismaModule, AuthModule],
  controllers: [ReservationsController],
})
export class ReservationsModule {}
