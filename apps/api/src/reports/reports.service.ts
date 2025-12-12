import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import {
  OccupancyReportDto,
  ArrivalDepartureReportDto,
  DashboardDto,
  OccupancyReportResponse,
  ArrivalDepartureResponse,
  DashboardResponse,
} from './dto/report.dto';

@Injectable()
export class ReportsService {
  constructor(private prisma: PrismaService) {}

  async getOccupancyReport(reportDto: OccupancyReportDto): Promise<OccupancyReportResponse> {
    const { startDate, endDate, propertyId } = reportDto;

    // Get total rooms
    const totalRooms = await this.prisma.room.count({
      where: propertyId ? { propertyId } : {},
    });

    // Get rooms occupied during the date range
    const occupiedRooms = await this.prisma.reservation.count({
      where: {
        ...(propertyId ? { propertyId } : {}),
        status: { in: ['CONFIRMED', 'CHECKED_IN'] },
        AND: [
          {
            checkInDate: { lte: new Date(endDate) },
          },
          {
            checkOutDate: { gte: new Date(startDate) },
          },
        ],
      },
    });

    // Calculate occupancy rate
    const occupancyRate = totalRooms > 0 ? (occupiedRooms / totalRooms) * 100 : 0;
    const availableRooms = totalRooms - occupiedRooms;

    // Get room breakdown for the specific date
    const date = new Date(startDate);
    const roomBreakdown = await this.getRoomOccupancyForDate(date, propertyId);

    return {
      totalRooms,
      occupiedRooms,
      availableRooms,
      occupancyRate: Math.round(occupancyRate * 100) / 100,
      date: startDate,
      roomBreakdown,
    };
  }

  async getArrivalDepartureReport(reportDto: ArrivalDepartureReportDto): Promise<ArrivalDepartureResponse> {
    const { date, propertyId } = reportDto;
    const targetDate = new Date(date);

    // Get arrivals for the date
    const arrivals = await this.prisma.reservation.findMany({
      where: {
        ...(propertyId ? { propertyId } : {}),
        checkInDate: {
          gte: new Date(targetDate.setHours(0, 0, 0, 0)),
          lt: new Date(targetDate.setHours(24, 0, 0, 0)),
        },
      },
      include: {
        guest: {
          select: {
            firstName: true,
            lastName: true,
          },
        },
        room: {
          select: {
            number: true,
          },
        },
      },
      select: {
        id: true,
        confirmationCode: true,
        guest: true,
        room: true,
        checkInDate: true,
      },
      orderBy: { checkInDate: 'asc' },
    });

    // Get departures for the date
    const departures = await this.prisma.reservation.findMany({
      where: {
        ...(propertyId ? { propertyId } : {}),
        checkOutDate: {
          gte: new Date(targetDate.setHours(0, 0, 0, 0)),
          lt: new Date(targetDate.setHours(24, 0, 0, 0)),
        },
      },
      include: {
        guest: {
          select: {
            firstName: true,
            lastName: true,
          },
        },
        room: {
          select: {
            number: true,
          },
        },
      },
      select: {
        id: true,
        confirmationCode: true,
        guest: true,
        room: true,
        checkOutDate: true,
      },
      orderBy: { checkOutDate: 'asc' },
    });

    return {
      date,
      arrivals: arrivals.map(arrival => ({
        id: arrival.id,
        confirmationCode: arrival.confirmationCode,
        guestName: `${arrival.guest.firstName} ${arrival.guest.lastName}`,
        roomNumber: arrival.room?.number,
        checkInDate: arrival.checkInDate.toISOString(),
      })),
      departures: departures.map(departure => ({
        id: departure.id,
        confirmationCode: departure.confirmationCode,
        guestName: `${departure.guest.firstName} ${departure.guest.lastName}`,
        roomNumber: departure.room?.number,
        checkOutDate: departure.checkOutDate.toISOString(),
      })),
    };
  }

  async getDashboard(dto: DashboardDto): Promise<DashboardResponse> {
    const { propertyId, date } = dto;
    const targetDate = date ? new Date(date) : new Date();

    // Get room statistics
    const totalRooms = await this.prisma.room.count({
      where: propertyId ? { propertyId } : {},
    });

    // Get currently occupied rooms
    const occupiedRooms = await this.prisma.reservation.count({
      where: {
        ...(propertyId ? { propertyId } : {}),
        status: 'CHECKED_IN',
      },
    });

    const availableRooms = totalRooms - occupiedRooms;
    const occupancyRate = totalRooms > 0 ? (occupiedRooms / totalRooms) * 100 : 0;

    // Get in-house guests count
    const inHouseGuests = await this.prisma.stay.count({
      where: {
        ...(propertyId ? { propertyId } : {}),
        checkOutDate: null,
      },
    });

    // Get today's arrivals
    const todaysArrivals = await this.prisma.reservation.findMany({
      where: {
        ...(propertyId ? { propertyId } : {}),
        checkInDate: {
          gte: new Date(targetDate.setHours(0, 0, 0, 0)),
          lt: new Date(targetDate.setHours(24, 0, 0, 0)),
        },
      },
      include: {
        guest: {
          select: {
            firstName: true,
            lastName: true,
          },
        },
        room: {
          select: {
            number: true,
          },
        },
      },
      select: {
        id: true,
        confirmationCode: true,
        guest: true,
        room: true,
        checkInDate: true,
      },
      orderBy: { checkInDate: 'asc' },
      take: 10, // Limit to 10 for dashboard
    });

    // Get today's departures
    const todaysDepartures = await this.prisma.reservation.findMany({
      where: {
        ...(propertyId ? { propertyId } : {}),
        checkOutDate: {
          gte: new Date(targetDate.setHours(0, 0, 0, 0)),
          lt: new Date(targetDate.setHours(24, 0, 0, 0)),
        },
      },
      include: {
        guest: {
          select: {
            firstName: true,
            lastName: true,
          },
        },
        room: {
          select: {
            number: true,
          },
        },
      },
      select: {
        id: true,
        confirmationCode: true,
        guest: true,
        room: true,
        checkOutDate: true,
      },
      orderBy: { checkOutDate: 'asc' },
      take: 10, // Limit to 10 for dashboard
    });

    // Get room status summary
    const roomStatusSummary = await this.prisma.room.groupBy({
      by: ['status'],
      where: propertyId ? { propertyId } : {},
      _count: { status: true },
    });

    const roomStatusData = roomStatusSummary.map(item => ({
      status: item.status,
      count: item._count.status,
      percentage: totalRooms > 0 ? Math.round((item._count.status / totalRooms) * 100) : 0,
    }));

    // Get upcoming reservations
    const upcomingReservations = await this.prisma.reservation.findMany({
      where: {
        ...(propertyId ? { propertyId } : {}),
        status: { in: ['CONFIRMED', 'PENDING'] },
        checkInDate: {
          gte: new Date(),
          lte: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // Next 7 days
        },
      },
      include: {
        guest: {
          select: {
            firstName: true,
            lastName: true,
          },
        },
        room: {
          select: {
            number: true,
          },
        },
      },
      select: {
        id: true,
        confirmationCode: true,
        guest: true,
        room: true,
        checkInDate: true,
      },
      orderBy: { checkInDate: 'asc' },
      take: 10, // Limit to 10 for dashboard
    });

    return {
      date: targetDate.toISOString(),
      totalRooms,
      occupiedRooms,
      availableRooms,
      inHouseGuests,
      occupancyRate: Math.round(occupancyRate * 100) / 100,
      todaysArrivals: todaysArrivals.map(arrival => ({
        id: arrival.id,
        confirmationCode: arrival.confirmationCode,
        guestName: `${arrival.guest.firstName} ${arrival.guest.lastName}`,
        roomNumber: arrival.room?.number,
        checkInDate: arrival.checkInDate.toISOString(),
      })),
      todaysDepartures: todaysDepartures.map(departure => ({
        id: departure.id,
        confirmationCode: departure.confirmationCode,
        guestName: `${departure.guest.firstName} ${departure.guest.lastName}`,
        roomNumber: departure.room?.number,
        checkOutDate: departure.checkOutDate.toISOString(),
      })),
      roomStatusSummary: roomStatusData,
      upcomingReservations: upcomingReservations.map(reservation => ({
        id: reservation.id,
        confirmationCode: reservation.confirmationCode,
        guestName: `${reservation.guest.firstName} ${reservation.guest.lastName}`,
        checkInDate: reservation.checkInDate.toISOString(),
        roomNumber: reservation.room?.number,
      })),
    };
  }

  private async getRoomOccupancyForDate(date: Date, propertyId?: string) {
    const rooms = await this.prisma.room.findMany({
      where: propertyId ? { propertyId } : {},
      include: {
        reservations: {
          where: {
            status: { in: ['CONFIRMED', 'CHECKED_IN'] },
            AND: [
              { checkInDate: { lte: date } },
              { checkOutDate: { gt: date } },
            ],
          },
          include: {
            guest: {
              select: {
                firstName: true,
                lastName: true,
              },
            },
          },
        },
      },
      select: {
        id: true,
        number: true,
        status: true,
        reservations: {
          select: {
            guest: {
              select: {
                firstName: true,
                lastName: true,
              },
            },
          },
          take: 1,
        },
      },
      orderBy: [{ floor: 'asc' }, { number: 'asc' }],
    });

    return rooms.map(room => ({
      roomId: room.id,
      roomNumber: room.number,
      status: room.status,
      guestName: room.reservations[0] 
        ? `${room.reservations[0].guest.firstName} ${room.reservations[0].guest.lastName}`
        : undefined,
    }));
  }
}