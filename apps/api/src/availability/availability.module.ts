import { Module } from '@nestjs/common';

import { AuthModule } from '../auth/auth.module';
import { PrismaModule } from '../prisma/prisma.module';
import { AvailabilityController } from './availability.controller';

@Module({
  imports: [PrismaModule, AuthModule],
  controllers: [AvailabilityController],
})
export class AvailabilityModule {}
