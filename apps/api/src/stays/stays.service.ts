import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateStayDto, UpdateStayDto, StayResponseDto } from './dto/stay.dto';

@Injectable()
export class StaysService {
  constructor(private prisma: PrismaService) {}

  async create(createStayDto: CreateStayDto): Promise<StayResponseDto> {
    const { reservationId, roomId, guestId } = createStayDto;

    // Verify reservation exists
    const reservation = await this.prisma.reservation.findUnique({
      where: { id: reservationId },
    });

    if (!reservation) {
      throw new NotFoundException('Reservation not found');
    }

    // Verify room exists
    const room = await this.prisma.room.findUnique({
      where: { id: roomId },
    });

    if (!room) {
      throw new NotFoundException('Room not found');
    }

    // Verify guest exists
    const guest = await this.prisma.guest.findUnique({
      where: { id: guestId },
    });

    if (!guest) {
      throw new NotFoundException('Guest not found');
    }

    // Check if stay already exists for this reservation
    const existingStay = await this.prisma.stay.findFirst({
      where: { reservationId },
    });

    if (existingStay) {
      throw new BadRequestException('Stay already exists for this reservation');
    }

    const stay = await this.prisma.stay.create({
      data: createStayDto,
      include: {
        reservation: {
          select: {
            id: true,
            confirmationCode: true,
            status: true,
          },
        },
        room: {
          select: {
            id: true,
            number: true,
            floor: true,
          },
        },
        guest: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
      select: {
        id: true,
        checkInDate: true,
        checkOutDate: true,
        numberOfNights: true,
        occupants: true,
        notes: true,
        propertyId: true,
        reservationId: true,
        roomId: true,
        guestId: true,
        createdAt: true,
        updatedAt: true,
        reservation: true,
        room: true,
        guest: true,
      },
    });

    return stay;
  }

  async findAll(page: number = 1, limit: number = 10, propertyId?: string) {
    const skip = (page - 1) * limit;
    
    const where: any = {};
    if (propertyId) {
      where.propertyId = propertyId;
    }

    const [stays, total] = await Promise.all([
      this.prisma.stay.findMany({
        where,
        include: {
          reservation: {
            select: {
              id: true,
              confirmationCode: true,
              status: true,
            },
          },
          room: {
            select: {
              id: true,
              number: true,
              floor: true,
            },
          },
          guest: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
            },
          },
        },
        select: {
          id: true,
          checkInDate: true,
          checkOutDate: true,
          numberOfNights: true,
          occupants: true,
          notes: true,
          propertyId: true,
          reservationId: true,
          roomId: true,
          guestId: true,
          createdAt: true,
          updatedAt: true,
          reservation: true,
          room: true,
          guest: true,
        },
        skip,
        take: limit,
        orderBy: { checkInDate: 'desc' },
      }),
      this.prisma.stay.count({ where }),
    ]);

    return {
      data: stays,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string): Promise<StayResponseDto> {
    const stay = await this.prisma.stay.findUnique({
      where: { id },
      include: {
        reservation: {
          select: {
            id: true,
            confirmationCode: true,
            status: true,
          },
        },
        room: {
          select: {
            id: true,
            number: true,
            floor: true,
          },
        },
        guest: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
      select: {
        id: true,
        checkInDate: true,
        checkOutDate: true,
        numberOfNights: true,
        occupants: true,
        notes: true,
        propertyId: true,
        reservationId: true,
        roomId: true,
        guestId: true,
        createdAt: true,
        updatedAt: true,
        reservation: true,
        room: true,
        guest: true,
      },
    });

    if (!stay) {
      throw new NotFoundException('Stay not found');
    }

    return stay;
  }

  async update(id: string, updateStayDto: UpdateStayDto): Promise<StayResponseDto> {
    const stay = await this.prisma.stay.findUnique({
      where: { id },
    });

    if (!stay) {
      throw new NotFoundException('Stay not found');
    }

    const updatedStay = await this.prisma.stay.update({
      where: { id },
      data: updateStayDto,
      include: {
        reservation: {
          select: {
            id: true,
            confirmationCode: true,
            status: true,
          },
        },
        room: {
          select: {
            id: true,
            number: true,
            floor: true,
          },
        },
        guest: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
      select: {
        id: true,
        checkInDate: true,
        checkOutDate: true,
        numberOfNights: true,
        occupants: true,
        notes: true,
        propertyId: true,
        reservationId: true,
        roomId: true,
        guestId: true,
        createdAt: true,
        updatedAt: true,
        reservation: true,
        room: true,
        guest: true,
      },
    });

    return updatedStay;
  }

  async remove(id: string): Promise<void> {
    const stay = await this.prisma.stay.findUnique({
      where: { id },
    });

    if (!stay) {
      throw new NotFoundException('Stay not found');
    }

    await this.prisma.stay.delete({
      where: { id },
    });
  }

  async getActiveStays(propertyId?: string) {
    const where: any = {
      checkOutDate: null,
    };

    if (propertyId) {
      where.propertyId = propertyId;
    }

    const stays = await this.prisma.stay.findMany({
      where,
      include: {
        reservation: {
          select: {
            id: true,
            confirmationCode: true,
            status: true,
          },
        },
        room: {
          select: {
            id: true,
            number: true,
            floor: true,
          },
        },
        guest: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
      select: {
        id: true,
        checkInDate: true,
        numberOfNights: true,
        occupants: true,
        notes: true,
        propertyId: true,
        reservationId: true,
        roomId: true,
        guestId: true,
        createdAt: true,
        updatedAt: true,
        reservation: true,
        room: true,
        guest: true,
      },
      orderBy: { checkInDate: 'asc' },
    });

    return stays;
  }
}