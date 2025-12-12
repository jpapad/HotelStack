import { Controller, Get, Query, UseGuards } from '@nestjs/common';

import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { PrismaService } from '../prisma/prisma.service';

@Controller('availability')
@UseGuards(JwtAuthGuard)
export class AvailabilityController {
  constructor(private readonly prisma: PrismaService) {}

  @Get()
  async getAvailability(@Query('from') from?: string, @Query('to') to?: string) {
    const start = from ? new Date(from) : new Date();
    const end = to ? new Date(to) : new Date(start.getTime() + 14 * 24 * 60 * 60 * 1000);

    const reservations = await this.prisma.reservation.findMany({
      where: {
        status: { not: 'CANCELLED' },
        AND: [{ checkInDate: { lt: end } }, { checkOutDate: { gt: start } }],
        roomId: { not: null },
      },
      include: {
        guest: { select: { firstName: true, lastName: true } },
        room: { select: { id: true, number: true } },
      },
      orderBy: [{ roomId: 'asc' }, { checkInDate: 'asc' }],
    });

    return {
      from: start,
      to: end,
      reservations: reservations.map((r) => ({
        id: r.id,
        roomId: r.roomId,
        roomNumber: r.room?.number ?? null,
        checkInDate: r.checkInDate,
        checkOutDate: r.checkOutDate,
        status: r.status,
        guestName: `${r.guest.firstName} ${r.guest.lastName}`,
      })),
    };
  }
}
