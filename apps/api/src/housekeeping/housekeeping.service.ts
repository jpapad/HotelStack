import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import {
  CreateHousekeepingTaskDto,
  UpdateHousekeepingTaskDto,
  HousekeepingTaskResponseDto,
  HousekeepingTaskStatus,
} from './dto/housekeeping.dto';

@Injectable()
export class HousekeepingService {
  constructor(private prisma: PrismaService) {}

  async create(createHousekeepingTaskDto: CreateHousekeepingTaskDto): Promise<HousekeepingTaskResponseDto> {
    const { roomId } = createHousekeepingTaskDto;

    // Verify room exists
    const room = await this.prisma.room.findUnique({
      where: { id: roomId },
    });

    if (!room) {
      throw new NotFoundException('Room not found');
    }

    const task = await this.prisma.housekeepingTask.create({
      data: createHousekeepingTaskDto,
      include: {
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
        title: true,
        status: true,
        notes: true,
        propertyId: true,
        roomId: true,
        createdAt: true,
        updatedAt: true,
        room: true,
      },
    });

    return task;
  }

  async findAll(page: number = 1, limit: number = 10, propertyId?: string, status?: HousekeepingTaskStatus, roomId?: string) {
    const skip = (page - 1) * limit;
    
    const where: any = {};
    if (propertyId) {
      where.propertyId = propertyId;
    }
    if (status) {
      where.status = status;
    }
    if (roomId) {
      where.roomId = roomId;
    }

    const [tasks, total] = await Promise.all([
      this.prisma.housekeepingTask.findMany({
        where,
        include: {
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
          title: true,
          status: true,
          notes: true,
          propertyId: true,
          roomId: true,
          createdAt: true,
          updatedAt: true,
          room: true,
        },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.housekeepingTask.count({ where }),
    ]);

    return {
      data: tasks,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string): Promise<HousekeepingTaskResponseDto> {
    const task = await this.prisma.housekeepingTask.findUnique({
      where: { id },
      include: {
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
        title: true,
        status: true,
        notes: true,
        propertyId: true,
        roomId: true,
        createdAt: true,
        updatedAt: true,
        room: true,
      },
    });

    if (!task) {
      throw new NotFoundException('Housekeeping task not found');
    }

    return task;
  }

  async update(id: string, updateHousekeepingTaskDto: UpdateHousekeepingTaskDto): Promise<HousekeepingTaskResponseDto> {
    const task = await this.prisma.housekeepingTask.findUnique({
      where: { id },
    });

    if (!task) {
      throw new NotFoundException('Housekeeping task not found');
    }

    const updatedTask = await this.prisma.housekeepingTask.update({
      where: { id },
      data: updateHousekeepingTaskDto,
      include: {
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
        title: true,
        status: true,
        notes: true,
        propertyId: true,
        roomId: true,
        createdAt: true,
        updatedAt: true,
        room: true,
      },
    });

    return updatedTask;
  }

  async updateStatus(id: string, status: HousekeepingTaskStatus): Promise<HousekeepingTaskResponseDto> {
    const task = await this.prisma.housekeepingTask.findUnique({
      where: { id },
    });

    if (!task) {
      throw new NotFoundException('Housekeeping task not found');
    }

    if (task.status === 'COMPLETED' && status !== 'COMPLETED') {
      throw new ConflictException('Cannot change status of completed task');
    }

    const updatedTask = await this.prisma.housekeepingTask.update({
      where: { id },
      data: { status },
      include: {
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
        title: true,
        status: true,
        notes: true,
        propertyId: true,
        roomId: true,
        createdAt: true,
        updatedAt: true,
        room: true,
      },
    });

    return updatedTask;
  }

  async remove(id: string): Promise<void> {
    const task = await this.prisma.housekeepingTask.findUnique({
      where: { id },
    });

    if (!task) {
      throw new NotFoundException('Housekeeping task not found');
    }

    if (task.status === 'COMPLETED') {
      throw new ConflictException('Cannot delete completed task');
    }

    await this.prisma.housekeepingTask.delete({
      where: { id },
    });
  }

  async getTasksByRoom(roomId: string): Promise<HousekeepingTaskResponseDto[]> {
    const tasks = await this.prisma.housekeepingTask.findMany({
      where: { roomId },
      include: {
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
        title: true,
        status: true,
        notes: true,
        propertyId: true,
        roomId: true,
        createdAt: true,
        updatedAt: true,
        room: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return tasks;
  }

  async getTasksByStatus(status: HousekeepingTaskStatus, propertyId?: string): Promise<HousekeepingTaskResponseDto[]> {
    const where: any = { status };
    
    if (propertyId) {
      where.propertyId = propertyId;
    }

    const tasks = await this.prisma.housekeepingTask.findMany({
      where,
      include: {
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
        title: true,
        status: true,
        notes: true,
        propertyId: true,
        roomId: true,
        createdAt: true,
        updatedAt: true,
        room: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return tasks;
  }
}