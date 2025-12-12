import { Body, Controller, Get, NotFoundException, Param, Post, Req, UseGuards } from '@nestjs/common';

import { JwtAuthGuard, type AuthenticatedRequest } from '../auth/jwt-auth.guard';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { PrismaService } from '../prisma/prisma.service';

type CreateChargeBody = {
  description: string;
  amount: string;
  chargeType: string;
  notes?: string | null;
};

type CreatePaymentBody = {
  amount: string;
  method: string;
  status?: 'PENDING' | 'COMPLETED' | 'FAILED' | 'REFUNDED';
  transactionId?: string | null;
  notes?: string | null;
};

@Controller('stays')
@UseGuards(JwtAuthGuard, RolesGuard)
export class StaysController {
  constructor(private readonly prisma: PrismaService) {}

  @Get(':id')
  async get(@Param('id') id: string) {
    const stay = await this.prisma.stay.findUnique({
      where: { id },
      include: {
        room: { include: { roomType: true } },
        guest: true,
        reservation: true,
      },
    });

    if (!stay) {
      throw new NotFoundException('Stay not found');
    }

    const [charges, payments] = await Promise.all([
      this.prisma.charge.findMany({
        where: { reservationId: stay.reservationId },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.payment.findMany({
        where: { reservationId: stay.reservationId },
        orderBy: { createdAt: 'desc' },
      }),
    ]);

    return { stay, charges, payments };
  }

  @Post(':id/check-out')
  @Roles('RECEPTION', 'MANAGER')
  async checkOut(@Param('id') id: string, @Req() req: AuthenticatedRequest) {
    const stay = await this.prisma.stay.findUnique({ where: { id } });
    if (!stay) {
      throw new NotFoundException('Stay not found');
    }

    const now = new Date();

    const updated = await this.prisma.stay.update({
      where: { id },
      data: { checkOutDate: now },
    });

    await this.prisma.reservation.update({
      where: { id: stay.reservationId },
      data: { status: 'CHECKED_OUT' },
    });

    await this.prisma.activityLog.create({
      data: {
        action: 'CHECK_OUT',
        details: `Checked out by ${req.user.email}`,
        entityId: stay.reservationId,
        entityType: 'Reservation',
        propertyId: stay.propertyId,
      },
    });

    return updated;
  }

  @Post(':id/charges')
  @Roles('RECEPTION', 'MANAGER')
  async addCharge(@Param('id') id: string, @Body() body: CreateChargeBody, @Req() req: AuthenticatedRequest) {
    const stay = await this.prisma.stay.findUnique({ where: { id } });
    if (!stay) {
      throw new NotFoundException('Stay not found');
    }

    const charge = await this.prisma.charge.create({
      data: {
        description: body.description,
        amount: body.amount,
        chargeType: body.chargeType,
        notes: body.notes ?? null,
        propertyId: stay.propertyId,
        reservationId: stay.reservationId,
      },
    });

    await this.prisma.activityLog.create({
      data: {
        action: 'CHARGE_ADDED',
        details: `Charge added by ${req.user.email}`,
        entityId: stay.reservationId,
        entityType: 'Reservation',
        propertyId: stay.propertyId,
      },
    });

    return charge;
  }

  @Post(':id/payments')
  @Roles('RECEPTION', 'MANAGER')
  async addPayment(@Param('id') id: string, @Body() body: CreatePaymentBody, @Req() req: AuthenticatedRequest) {
    const stay = await this.prisma.stay.findUnique({
      where: { id },
      include: { reservation: true },
    });
    if (!stay) {
      throw new NotFoundException('Stay not found');
    }

    const payment = await this.prisma.payment.create({
      data: {
        amount: body.amount,
        method: body.method,
        status: body.status ?? 'COMPLETED',
        transactionId: body.transactionId ?? null,
        notes: body.notes ?? null,
        propertyId: stay.propertyId,
        reservationId: stay.reservationId,
        guestId: stay.guestId,
      },
    });

    await this.prisma.activityLog.create({
      data: {
        action: 'PAYMENT_ADDED',
        details: `Payment added by ${req.user.email}`,
        entityId: stay.reservationId,
        entityType: 'Reservation',
        propertyId: stay.propertyId,
      },
    });

    return payment;
  }
}
