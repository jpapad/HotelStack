import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import {
  CreateRoomTypeDto,
  UpdateRoomTypeDto,
  CreateRoomDto,
  UpdateRoomDto,
  RoomTypeResponseDto,
  RoomResponseDto,
} from './dto/room.dto';

@Injectable()
export class RoomsService {
  constructor(private prisma: PrismaService) {}

  // Room Types
  async createRoomType(createRoomTypeDto: CreateRoomTypeDto): Promise<RoomTypeResponseDto> {
    const existingRoomType = await this.prisma.roomType.findFirst({
      where: {
        name: createRoomTypeDto.name,
        propertyId: createRoomTypeDto.propertyId,
      },
    });

    if (existingRoomType) {
      throw new ConflictException('Room type with this name already exists in the property');
    }

    const roomType = await this.prisma.roomType.create({
      data: createRoomTypeDto,
      select: {
        id: true,
        name: true,
        capacity: true,
        amenities: true,
        propertyId: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return roomType;
  }

  async findAllRoomTypes(page: number = 1, limit: number = 10, propertyId?: string) {
    const skip = (page - 1) * limit;
    
    const where: any = {};
    if (propertyId) {
      where.propertyId = propertyId;
    }

    const [roomTypes, total] = await Promise.all([
      this.prisma.roomType.findMany({
        where,
        select: {
          id: true,
          name: true,
          capacity: true,
          amenities: true,
          propertyId: true,
          createdAt: true,
          updatedAt: true,
        },
        skip,
        take: limit,
        orderBy: { name: 'asc' },
      }),
      this.prisma.roomType.count({ where }),
    ]);

    return {
      data: roomTypes,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findRoomType(id: string): Promise<RoomTypeResponseDto> {
    const roomType = await this.prisma.roomType.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        capacity: true,
        amenities: true,
        propertyId: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!roomType) {
      throw new NotFoundException('Room type not found');
    }

    return roomType;
  }

  async updateRoomType(id: string, updateRoomTypeDto: UpdateRoomTypeDto): Promise<RoomTypeResponseDto> {
    const roomType = await this.prisma.roomType.findUnique({
      where: { id },
    });

    if (!roomType) {
      throw new NotFoundException('Room type not found');
    }

    const updatedRoomType = await this.prisma.roomType.update({
      where: { id },
      data: updateRoomTypeDto,
      select: {
        id: true,
        name: true,
        capacity: true,
        amenities: true,
        propertyId: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return updatedRoomType;
  }

  async removeRoomType(id: string): Promise<void> {
    const roomType = await this.prisma.roomType.findUnique({
      where: { id },
      include: {
        rooms: true,
      },
    });

    if (!roomType) {
      throw new NotFoundException('Room type not found');
    }

    if (roomType.rooms.length > 0) {
      throw new ConflictException('Cannot delete room type with existing rooms');
    }

    await this.prisma.roomType.delete({
      where: { id },
    });
  }

  // Rooms
  async createRoom(createRoomDto: CreateRoomDto): Promise<RoomResponseDto> {
    const existingRoom = await this.prisma.room.findFirst({
      where: {
        number: createRoomDto.number,
        propertyId: createRoomDto.propertyId,
      },
    });

    if (existingRoom) {
      throw new ConflictException('Room with this number already exists in the property');
    }

    const room = await this.prisma.room.create({
      data: createRoomDto,
      include: {
        roomType: {
          select: {
            id: true,
            name: true,
            capacity: true,
            amenities: true,
            propertyId: true,
            createdAt: true,
            updatedAt: true,
          },
        },
      },
      select: {
        id: true,
        number: true,
        floor: true,
        status: true,
        notes: true,
        propertyId: true,
        roomTypeId: true,
        createdAt: true,
        updatedAt: true,
        roomType: true,
      },
    });

    return room;
  }

  async findAllRooms(page: number = 1, limit: number = 10, propertyId?: string, roomTypeId?: string, status?: string) {
    const skip = (page - 1) * limit;
    
    const where: any = {};
    if (propertyId) {
      where.propertyId = propertyId;
    }
    if (roomTypeId) {
      where.roomTypeId = roomTypeId;
    }
    if (status) {
      where.status = status;
    }

    const [rooms, total] = await Promise.all([
      this.prisma.room.findMany({
        where,
        include: {
          roomType: {
            select: {
              id: true,
              name: true,
              capacity: true,
              amenities: true,
              propertyId: true,
              createdAt: true,
              updatedAt: true,
            },
          },
        },
        select: {
          id: true,
          number: true,
          floor: true,
          status: true,
          notes: true,
          propertyId: true,
          roomTypeId: true,
          createdAt: true,
          updatedAt: true,
          roomType: true,
        },
        skip,
        take: limit,
        orderBy: [{ floor: 'asc' }, { number: 'asc' }],
      }),
      this.prisma.room.count({ where }),
    ]);

    return {
      data: rooms,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findRoom(id: string): Promise<RoomResponseDto> {
    const room = await this.prisma.room.findUnique({
      where: { id },
      include: {
        roomType: {
          select: {
            id: true,
            name: true,
            capacity: true,
            amenities: true,
            propertyId: true,
            createdAt: true,
            updatedAt: true,
          },
        },
      },
      select: {
        id: true,
        number: true,
        floor: true,
        status: true,
        notes: true,
        propertyId: true,
        roomTypeId: true,
        createdAt: true,
        updatedAt: true,
        roomType: true,
      },
    });

    if (!room) {
      throw new NotFoundException('Room not found');
    }

    return room;
  }

  async updateRoom(id: string, updateRoomDto: UpdateRoomDto): Promise<RoomResponseDto> {
    const room = await this.prisma.room.findUnique({
      where: { id },
    });

    if (!room) {
      throw new NotFoundException('Room not found');
    }

    if (updateRoomDto.number) {
      const existingRoom = await this.prisma.room.findFirst({
        where: {
          number: updateRoomDto.number,
          propertyId: room.propertyId,
          NOT: { id },
        },
      });

      if (existingRoom) {
        throw new ConflictException('Room with this number already exists in the property');
      }
    }

    const updatedRoom = await this.prisma.room.update({
      where: { id },
      data: updateRoomDto,
      include: {
        roomType: {
          select: {
            id: true,
            name: true,
            capacity: true,
            amenities: true,
            propertyId: true,
            createdAt: true,
            updatedAt: true,
          },
        },
      },
      select: {
        id: true,
        number: true,
        floor: true,
        status: true,
        notes: true,
        propertyId: true,
        roomTypeId: true,
        createdAt: true,
        updatedAt: true,
        roomType: true,
      },
    });

    return updatedRoom;
  }

  async removeRoom(id: string): Promise<void> {
    const room = await this.prisma.room.findUnique({
      where: { id },
      include: {
        reservations: true,
        stays: true,
      },
    });

    if (!room) {
      throw new NotFoundException('Room not found');
    }

    if (room.reservations.length > 0 || room.stays.length > 0) {
      throw new ConflictException('Cannot delete room with existing reservations or stays');
    }

    await this.prisma.room.delete({
      where: { id },
    });
  }
}