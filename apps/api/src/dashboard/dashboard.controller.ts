import { Controller, Get, UseGuards } from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('dashboard')
@UseGuards(JwtAuthGuard)
export class DashboardController {
  constructor(private readonly prisma: PrismaService) {}

  @Get()
  async getDashboard() {
    const now = new Date();
    const start = new Date(now);
    start.setHours(0, 0, 0, 0);
    const end = new Date(now);
    end.setHours(23, 59, 59, 999);

    const [roomsTotal, inHouseReservations, arrivalsToday, departuresToday] = await Promise.all([
      this.prisma.room.count(),
      this.prisma.reservation.count({
        where: {
          status: 'CHECKED_IN',
          checkOutDate: { gt: now },
        },
      }),
      this.prisma.reservation.findMany({
        where: {
          checkInDate: { gte: start, lte: end },
        },
        include: {
          guest: { select: { firstName: true, lastName: true } },
          room: { select: { number: true } },
        },
        orderBy: { checkInDate: 'asc' },
        take: 10,
      }),
      this.prisma.reservation.findMany({
        where: {
          checkOutDate: { gte: start, lte: end },
        },
        include: {
          guest: { select: { firstName: true, lastName: true } },
          room: { select: { number: true } },
        },
        orderBy: { checkOutDate: 'asc' },
        take: 10,
      }),
    ]);

    const roomsOccupied = Math.min(inHouseReservations, roomsTotal);

    return {
      stats: {
        roomsTotal,
        roomsOccupied,
        inHouse: inHouseReservations,
        arrivalsToday: arrivalsToday.length,
        departuresToday: departuresToday.length,
      },
      arrivals: arrivalsToday.map((r) => ({
        id: r.id,
        confirmationCode: r.confirmationCode,
        status: r.status,
        checkInDate: r.checkInDate,
        checkOutDate: r.checkOutDate,
        guestName: `${r.guest.firstName} ${r.guest.lastName}`,
        roomNumber: r.room?.number ?? null,
      })),
      departures: departuresToday.map((r) => ({
        id: r.id,
        confirmationCode: r.confirmationCode,
        status: r.status,
        checkInDate: r.checkInDate,
        checkOutDate: r.checkOutDate,
        guestName: `${r.guest.firstName} ${r.guest.lastName}`,
        roomNumber: r.room?.number ?? null,
      })),
    };
  }
}
