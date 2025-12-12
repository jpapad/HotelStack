import { Module } from '@nestjs/common';
import { ChargesPaymentsService } from './charges-payments.service';
import { ChargesPaymentsController } from './charges-payments.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [ChargesPaymentsController],
  providers: [ChargesPaymentsService],
  exports: [ChargesPaymentsService],
})
export class ChargesPaymentsModule {}