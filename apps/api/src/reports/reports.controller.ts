import { Controller, Get, Header, Query, UseGuards } from '@nestjs/common';

import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { PrismaService } from '../prisma/prisma.service';

function fmtDate(d: Date): string {
  return d.toISOString().slice(0, 10);
}

@Controller('reports')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ReportsController {
  constructor(private readonly prisma: PrismaService) {}

  @Get('occupancy')
  @Roles('MANAGER')
  async occupancy(@Query('days') daysRaw?: string) {
    const days = Math.max(1, Math.min(365, Number(daysRaw ?? 30)));

    const to = new Date();
    to.setHours(23, 59, 59, 999);

    const from = new Date(to);
    from.setDate(from.getDate() - (days - 1));
    from.setHours(0, 0, 0, 0);

    const [roomsTotal, reservations] = await Promise.all([
      this.prisma.room.count(),
      this.prisma.reservation.findMany({
        where: {
          status: { in: ['CONFIRMED', 'CHECKED_IN', 'CHECKED_OUT'] },
          AND: [{ checkInDate: { lt: to } }, { checkOutDate: { gt: from } }],
          roomId: { not: null },
        },
        select: { checkInDate: true, checkOutDate: true },
      }),
    ]);

    const points = Array.from({ length: days }, (_, i) => {
      const dayStart = new Date(from);
      dayStart.setDate(from.getDate() + i);
      dayStart.setHours(0, 0, 0, 0);
      const dayEnd = new Date(dayStart);
      dayEnd.setHours(23, 59, 59, 999);

      const occupied = reservations.filter((r) => r.checkInDate < dayEnd && r.checkOutDate > dayStart).length;

      return {
        date: fmtDate(dayStart),
        occupiedRooms: occupied,
        roomsTotal,
        occupancyPct: roomsTotal === 0 ? 0 : Math.round((occupied / roomsTotal) * 1000) / 10,
      };
    });

    return { from, to, roomsTotal, points };
  }

  @Get('occupancy/export')
  @Roles('MANAGER')
  @Header('Content-Type', 'text/csv')
  async exportOccupancy(@Query('days') daysRaw?: string) {
    const report = await this.occupancy(daysRaw);

    const header = 'date,occupiedRooms,roomsTotal,occupancyPct';
    const rows = report.points.map((p) => `${p.date},${p.occupiedRooms},${p.roomsTotal},${p.occupancyPct}`);
    return [header, ...rows].join('\n');
  }
}
