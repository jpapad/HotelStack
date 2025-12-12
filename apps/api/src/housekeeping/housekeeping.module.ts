import { Module } from '@nestjs/common';

import { AuthModule } from '../auth/auth.module';
import { PrismaModule } from '../prisma/prisma.module';
import { HousekeepingController } from './housekeeping.controller';

@Module({
  imports: [PrismaModule, AuthModule],
  controllers: [HousekeepingController],
})
export class HousekeepingModule {}
