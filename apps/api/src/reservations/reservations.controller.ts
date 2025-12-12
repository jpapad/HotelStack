import {
  Body,
  Controller,
  Get,
  NotFoundException,
  Param,
  Patch,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { Prisma, ReservationStatus } from '@prisma/client';

import { JwtAuthGuard, type AuthenticatedRequest } from '../auth/jwt-auth.guard';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { PrismaService } from '../prisma/prisma.service';

function isReservationStatus(value: string): value is ReservationStatus {
  return (Object.values(ReservationStatus) as string[]).includes(value);
}

type ReservationUpdateBody = {
  status?: ReservationStatus;
  checkInDate?: string;
  checkOutDate?: string;
  specialRequests?: string | null;
  roomId?: string | null;
};

@Controller('reservations')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ReservationsController {
  constructor(private readonly prisma: PrismaService) {}

  @Get()
  async list(@Query('search') search?: string, @Query('status') status?: string) {
    const where: Prisma.ReservationWhereInput = {};

    if (status && isReservationStatus(status)) {
      where.status = status;
    }

    if (search) {
      where.OR = [
        { confirmationCode: { contains: search, mode: 'insensitive' } },
        {
          guest: {
            OR: [
              { firstName: { contains: search, mode: 'insensitive' } },
              { lastName: { contains: search, mode: 'insensitive' } },
            ],
          },
        },
      ];
    }

    return await this.prisma.reservation.findMany({
      where,
      include: {
        guest: { select: { id: true, firstName: true, lastName: true } },
        room: { select: { id: true, number: true } },
      },
      orderBy: { checkInDate: 'asc' },
      take: 100,
    });
  }

  @Get(':id')
  async get(@Param('id') id: string) {
    const reservation = await this.prisma.reservation.findUnique({
      where: { id },
      include: {
        guest: true,
        room: {
          include: {
            roomType: true,
          },
        },
        stays: true,
        charges: true,
        payments: {
          include: {
            guest: { select: { firstName: true, lastName: true } },
          },
        },
      },
    });

    if (!reservation) {
      throw new NotFoundException('Reservation not found');
    }

    const activity = await this.prisma.activityLog.findMany({
      where: {
        entityId: reservation.id,
      },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });

    return { reservation, activity };
  }

  @Patch(':id')
  @Roles('RECEPTION', 'MANAGER')
  async update(@Param('id') id: string, @Body() body: ReservationUpdateBody, @Req() req: AuthenticatedRequest) {
    const existing = await this.prisma.reservation.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundException('Reservation not found');
    }

    const data: Prisma.ReservationUpdateInput = {};

    if (body.status) {
      data.status = body.status;
    }

    if (typeof body.specialRequests !== 'undefined') {
      data.specialRequests = body.specialRequests;
    }

    if (typeof body.roomId !== 'undefined') {
      data.room = body.roomId ? { connect: { id: body.roomId } } : { disconnect: true };
    }

    if (body.checkInDate) {
      data.checkInDate = new Date(body.checkInDate);
    }
    if (body.checkOutDate) {
      data.checkOutDate = new Date(body.checkOutDate);
    }

    const updated = await this.prisma.reservation.update({
      where: { id },
      data,
    });

    await this.prisma.activityLog.create({
      data: {
        action: 'RESERVATION_UPDATED',
        details: `Updated by ${req.user.email}`,
        entityId: id,
        entityType: 'Reservation',
        propertyId: updated.propertyId,
      },
    });

    return updated;
  }
}
