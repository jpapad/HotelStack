import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import {
  CreateReservationDto,
  UpdateReservationDto,
  ReservationResponseDto,
  ReservationSearchDto,
  CheckInDto,
  CheckOutDto,
} from './dto/reservation.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class ReservationsService {
  constructor(private prisma: PrismaService) {}

  async create(createReservationDto: CreateReservationDto): Promise<ReservationResponseDto> {
    const { guestId, roomId, checkInDate, checkOutDate, propertyId } = createReservationDto;

    // Verify guest exists
    const guest = await this.prisma.guest.findUnique({
      where: { id: guestId },
    });

    if (!guest) {
      throw new NotFoundException('Guest not found');
    }

    // Verify room exists if provided
    if (roomId) {
      const room = await this.prisma.room.findUnique({
        where: { id: roomId },
      });

      if (!room) {
        throw new NotFoundException('Room not found');
      }

      // Check room availability
      const isAvailable = await this.checkRoomAvailability(roomId, new Date(checkInDate), new Date(checkOutDate));
      
      if (!isAvailable) {
        throw new ConflictException('Room is not available for the selected dates');
      }
    }

    // Generate confirmation code
    const confirmationCode = await this.generateConfirmationCode();

    const reservation = await this.prisma.reservation.create({
      data: {
        ...createReservationDto,
        confirmationCode,
      },
      include: {
        guest: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
          },
        },
        room: {
          select: {
            id: true,
            number: true,
            floor: true,
          },
        },
      },
    });

    return reservation;
  }

  async findAll(page: number = 1, limit: number = 10, searchDto: ReservationSearchDto = {}) {
    const skip = (page - 1) * limit;
    
    const where: Prisma.ReservationWhereInput = {};

    if (searchDto.search) {
      where.OR = [
        { confirmationCode: { contains: searchDto.search, mode: 'insensitive' } },
        { guest: { firstName: { contains: searchDto.search, mode: 'insensitive' } } },
        { guest: { lastName: { contains: searchDto.search, mode: 'insensitive' } } },
        { guest: { email: { contains: searchDto.search, mode: 'insensitive' } } },
      ];
    }

    if (searchDto.status) {
      where.status = searchDto.status;
    }

    if (searchDto.propertyId) {
      where.propertyId = searchDto.propertyId;
    }

    if (searchDto.checkInFrom || searchDto.checkInTo) {
      where.checkInDate = {};
      if (searchDto.checkInFrom) {
        where.checkInDate.gte = new Date(searchDto.checkInFrom);
      }
      if (searchDto.checkInTo) {
        where.checkInDate.lte = new Date(searchDto.checkInTo);
      }
    }

    if (searchDto.checkOutFrom || searchDto.checkOutTo) {
      where.checkOutDate = {};
      if (searchDto.checkOutFrom) {
        where.checkOutDate.gte = new Date(searchDto.checkOutFrom);
      }
      if (searchDto.checkOutTo) {
        where.checkOutDate.lte = new Date(searchDto.checkOutTo);
      }
    }

    const [reservations, total] = await Promise.all([
      this.prisma.reservation.findMany({
        where,
        include: {
          guest: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              phone: true,
            },
          },
          room: {
            select: {
              id: true,
              number: true,
              floor: true,
            },
          },
        },
        select: {
          id: true,
          status: true,
          source: true,
          checkInDate: true,
          checkOutDate: true,
          numberOfGuests: true,
          numberOfRooms: true,
          totalPrice: true,
          paidAmount: true,
          specialRequests: true,
          confirmationCode: true,
          propertyId: true,
          guestId: true,
          roomId: true,
          createdAt: true,
          updatedAt: true,
          guest: true,
          room: true,
        },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.reservation.count({ where }),
    ]);

    return {
      data: reservations,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string): Promise<ReservationResponseDto> {
    const reservation = await this.prisma.reservation.findUnique({
      where: { id },
      include: {
        guest: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
          },
        },
        room: {
          select: {
            id: true,
            number: true,
            floor: true,
          },
        },
      },
      select: {
        id: true,
        status: true,
        source: true,
        checkInDate: true,
        checkOutDate: true,
        numberOfGuests: true,
        numberOfRooms: true,
        totalPrice: true,
        paidAmount: true,
        specialRequests: true,
        confirmationCode: true,
        propertyId: true,
        guestId: true,
        roomId: true,
        createdAt: true,
        updatedAt: true,
        guest: true,
        room: true,
      },
    });

    if (!reservation) {
      throw new NotFoundException('Reservation not found');
    }

    return reservation;
  }

  async update(id: string, updateReservationDto: UpdateReservationDto): Promise<ReservationResponseDto> {
    const reservation = await this.prisma.reservation.findUnique({
      where: { id },
    });

    if (!reservation) {
      throw new NotFoundException('Reservation not found');
    }

    // Check room availability if room is being changed
    if (updateReservationDto.roomId && updateReservationDto.roomId !== reservation.roomId) {
      const isAvailable = await this.checkRoomAvailability(
        updateReservationDto.roomId,
        new Date(updateReservationDto.checkInDate || reservation.checkInDate),
        new Date(updateReservationDto.checkOutDate || reservation.checkOutDate),
      );
      
      if (!isAvailable) {
        throw new ConflictException('Room is not available for the selected dates');
      }
    }

    const updatedReservation = await this.prisma.reservation.update({
      where: { id },
      data: updateReservationDto,
      include: {
        guest: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
          },
        },
        room: {
          select: {
            id: true,
            number: true,
            floor: true,
          },
        },
      },
      select: {
        id: true,
        status: true,
        source: true,
        checkInDate: true,
        checkOutDate: true,
        numberOfGuests: true,
        numberOfRooms: true,
        totalPrice: true,
        paidAmount: true,
        specialRequests: true,
        confirmationCode: true,
        propertyId: true,
        guestId: true,
        roomId: true,
        createdAt: true,
        updatedAt: true,
        guest: true,
        room: true,
      },
    });

    return updatedReservation;
  }

  async checkIn(id: string, checkInDto: CheckInDto): Promise<ReservationResponseDto> {
    const reservation = await this.prisma.reservation.findUnique({
      where: { id },
    });

    if (!reservation) {
      throw new NotFoundException('Reservation not found');
    }

    if (reservation.status !== 'CONFIRMED') {
      throw new BadRequestException('Only confirmed reservations can be checked in');
    }

    if (!reservation.roomId) {
      throw new BadRequestException('Room must be assigned before check-in');
    }

    const updatedReservation = await this.prisma.reservation.update({
      where: { id },
      data: {
        status: 'CHECKED_IN',
      },
      include: {
        guest: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
          },
        },
        room: {
          select: {
            id: true,
            number: true,
            floor: true,
          },
        },
      },
      select: {
        id: true,
        status: true,
        source: true,
        checkInDate: true,
        checkOutDate: true,
        numberOfGuests: true,
        numberOfRooms: true,
        totalPrice: true,
        paidAmount: true,
        specialRequests: true,
        confirmationCode: true,
        propertyId: true,
        guestId: true,
        roomId: true,
        createdAt: true,
        updatedAt: true,
        guest: true,
        room: true,
      },
    });

    return updatedReservation;
  }

  async checkOut(id: string, checkOutDto: CheckOutDto): Promise<ReservationResponseDto> {
    const reservation = await this.prisma.reservation.findUnique({
      where: { id },
    });

    if (!reservation) {
      throw new NotFoundException('Reservation not found');
    }

    if (reservation.status !== 'CHECKED_IN') {
      throw new BadRequestException('Only checked-in reservations can be checked out');
    }

    const updatedReservation = await this.prisma.reservation.update({
      where: { id },
      data: {
        status: 'CHECKED_OUT',
      },
      include: {
        guest: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
          },
        },
        room: {
          select: {
            id: true,
            number: true,
            floor: true,
          },
        },
      },
      select: {
        id: true,
        status: true,
        source: true,
        checkInDate: true,
        checkOutDate: true,
        numberOfGuests: true,
        numberOfRooms: true,
        totalPrice: true,
        paidAmount: true,
        specialRequests: true,
        confirmationCode: true,
        propertyId: true,
        guestId: true,
        roomId: true,
        createdAt: true,
        updatedAt: true,
        guest: true,
        room: true,
      },
    });

    return updatedReservation;
  }

  async remove(id: string): Promise<void> {
    const reservation = await this.prisma.reservation.findUnique({
      where: { id },
    });

    if (!reservation) {
      throw new NotFoundException('Reservation not found');
    }

    if (['CHECKED_IN', 'CONFIRMED'].includes(reservation.status)) {
      throw new ConflictException('Cannot delete active reservations');
    }

    await this.prisma.reservation.delete({
      where: { id },
    });
  }

  private async checkRoomAvailability(roomId: string, checkInDate: Date, checkOutDate: Date): Promise<boolean> {
    const conflictingReservations = await this.prisma.reservation.findMany({
      where: {
        roomId,
        status: {
          in: ['CONFIRMED', 'CHECKED_IN'],
        },
        AND: [
          {
            checkInDate: {
              lt: checkOutDate,
            },
          },
          {
            checkOutDate: {
              gt: checkInDate,
            },
          },
        ],
      },
    });

    return conflictingReservations.length === 0;
  }

  private async generateConfirmationCode(): Promise<string> {
    const code = `RES-${Date.now()}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`;
    
    // Ensure uniqueness
    const existing = await this.prisma.reservation.findUnique({
      where: { confirmationCode: code },
    });

    if (existing) {
      return this.generateConfirmationCode();
    }

    return code;
  }
}