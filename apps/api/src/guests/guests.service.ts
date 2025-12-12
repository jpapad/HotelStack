import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateGuestDto, UpdateGuestDto, GuestResponseDto } from './dto/guest.dto';

@Injectable()
export class GuestsService {
  constructor(private prisma: PrismaService) {}

  async create(createGuestDto: CreateGuestDto): Promise<GuestResponseDto> {
    const guest = await this.prisma.guest.create({
      data: createGuestDto,
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        phone: true,
        address: true,
        city: true,
        state: true,
        zipCode: true,
        country: true,
        notes: true,
        propertyId: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return guest;
  }

  async findAll(
    page: number = 1,
    limit: number = 10,
    search?: string,
    propertyId?: string,
  ) {
    const skip = (page - 1) * limit;
    
    const where: any = {};
    
    if (search) {
      where.OR = [
        { firstName: { contains: search, mode: 'insensitive' } },
        { lastName: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { phone: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (propertyId) {
      where.propertyId = propertyId;
    }

    const [guests, total] = await Promise.all([
      this.prisma.guest.findMany({
        where,
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          phone: true,
          address: true,
          city: true,
          state: true,
          zipCode: true,
          country: true,
          notes: true,
          propertyId: true,
          createdAt: true,
          updatedAt: true,
        },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.guest.count({ where }),
    ]);

    return {
      data: guests,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string): Promise<GuestResponseDto> {
    const guest = await this.prisma.guest.findUnique({
      where: { id },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        phone: true,
        address: true,
        city: true,
        state: true,
        zipCode: true,
        country: true,
        notes: true,
        propertyId: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!guest) {
      throw new NotFoundException('Guest not found');
    }

    return guest;
  }

  async update(id: string, updateGuestDto: UpdateGuestDto): Promise<GuestResponseDto> {
    const guest = await this.prisma.guest.findUnique({
      where: { id },
    });

    if (!guest) {
      throw new NotFoundException('Guest not found');
    }

    const updatedGuest = await this.prisma.guest.update({
      where: { id },
      data: updateGuestDto,
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        phone: true,
        address: true,
        city: true,
        state: true,
        zipCode: true,
        country: true,
        notes: true,
        propertyId: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return updatedGuest;
  }

  async remove(id: string): Promise<void> {
    const guest = await this.prisma.guest.findUnique({
      where: { id },
    });

    if (!guest) {
      throw new NotFoundException('Guest not found');
    }

    await this.prisma.guest.delete({
      where: { id },
    });
  }
}