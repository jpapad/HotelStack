import { Module } from '@nestjs/common';
import { RoomsService } from './rooms.service';
import { RoomTypesController, RoomsController } from './rooms.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [RoomTypesController, RoomsController],
  providers: [RoomsService],
  exports: [RoomsService],
})
export class RoomsModule {}