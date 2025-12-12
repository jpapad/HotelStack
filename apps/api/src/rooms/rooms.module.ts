import { Module } from '@nestjs/common';

import { AuthModule } from '../auth/auth.module';
import { PrismaModule } from '../prisma/prisma.module';
import { RoomsController } from './rooms.controller';

@Module({
  imports: [PrismaModule, AuthModule],
  controllers: [RoomsController],
})
export class RoomsModule {}
