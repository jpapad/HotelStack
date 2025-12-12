import { Module } from '@nestjs/common';

import { AuthModule } from '../auth/auth.module';
import { PrismaModule } from '../prisma/prisma.module';
import { StaysController } from './stays.controller';

@Module({
  imports: [PrismaModule, AuthModule],
  controllers: [StaysController],
})
export class StaysModule {}
