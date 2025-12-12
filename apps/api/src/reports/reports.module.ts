import { Module } from '@nestjs/common';

import { AuthModule } from '../auth/auth.module';
import { PrismaModule } from '../prisma/prisma.module';
import { ReportsController } from './reports.controller';

@Module({
  imports: [PrismaModule, AuthModule],
  controllers: [ReportsController],
})
export class ReportsModule {}
