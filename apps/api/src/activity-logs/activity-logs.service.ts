import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateActivityLogDto, ActivityLogResponseDto } from './dto/activity-log.dto';

@Injectable()
export class ActivityLogsService {
  constructor(private prisma: PrismaService) {}

  async create(createActivityLogDto: CreateActivityLogDto): Promise<ActivityLogResponseDto> {
    const activityLog = await this.prisma.activityLog.create({
      data: createActivityLogDto,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
      },
      select: {
        id: true,
        action: true,
        details: true,
        entityId: true,
        entityType: true,
        propertyId: true,
        createdAt: true,
        user: true,
      },
    });

    return activityLog;
  }

  async findAll(page: number = 1, limit: number = 10, propertyId?: string, userId?: string, entityType?: string) {
    const skip = (page - 1) * limit;
    
    const where: any = {};
    if (propertyId) {
      where.propertyId = propertyId;
    }
    if (userId) {
      where.userId = userId;
    }
    if (entityType) {
      where.entityType = entityType;
    }

    const [activityLogs, total] = await Promise.all([
      this.prisma.activityLog.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              role: true,
            },
          },
        },
        select: {
          id: true,
          action: true,
          details: true,
          entityId: true,
          entityType: true,
          propertyId: true,
          createdAt: true,
          user: true,
        },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.activityLog.count({ where }),
    ]);

    return {
      data: activityLogs,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findByEntity(entityId: string, entityType: string): Promise<ActivityLogResponseDto[]> {
    const activityLogs = await this.prisma.activityLog.findMany({
      where: {
        entityId,
        entityType,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
      },
      select: {
        id: true,
        action: true,
        details: true,
        entityId: true,
        entityType: true,
        propertyId: true,
        createdAt: true,
        user: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return activityLogs;
  }

  async getUserActivity(userId: string, page: number = 1, limit: number = 10): Promise<{
    data: ActivityLogResponseDto[];
    meta: any;
  }> {
    const skip = (page - 1) * limit;
    
    const [activityLogs, total] = await Promise.all([
      this.prisma.activityLog.findMany({
        where: { userId },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              role: true,
            },
          },
        },
        select: {
          id: true,
          action: true,
          details: true,
          entityId: true,
          entityType: true,
          propertyId: true,
          createdAt: true,
          user: true,
        },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.activityLog.count({ where: { userId } }),
    ]);

    return {
      data: activityLogs,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }
}