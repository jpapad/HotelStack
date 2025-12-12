import { Body, Controller, Get, NotFoundException, Param, Patch, Req, UseGuards } from '@nestjs/common';

import { JwtAuthGuard, type AuthenticatedRequest } from '../auth/jwt-auth.guard';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { PrismaService } from '../prisma/prisma.service';

type UpdateTaskBody = {
  status?: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  notes?: string | null;
};

@Controller('housekeeping')
@UseGuards(JwtAuthGuard, RolesGuard)
export class HousekeepingController {
  constructor(private readonly prisma: PrismaService) {}

  @Get('tasks')
  async listTasks() {
    return await this.prisma.housekeepingTask.findMany({
      include: {
        room: {
          include: {
            roomType: true,
          },
        },
      },
      orderBy: [{ status: 'asc' }, { createdAt: 'desc' }],
      take: 200,
    });
  }

  @Patch('tasks/:id')
  @Roles('HOUSEKEEPING', 'MANAGER')
  async updateTask(@Param('id') id: string, @Body() body: UpdateTaskBody, @Req() req: AuthenticatedRequest) {
    const existing = await this.prisma.housekeepingTask.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundException('Task not found');
    }

    const task = await this.prisma.housekeepingTask.update({
      where: { id },
      data: {
        status: body.status ?? undefined,
        notes: typeof body.notes === 'undefined' ? undefined : body.notes,
      },
      include: { room: true },
    });

    await this.prisma.activityLog.create({
      data: {
        action: 'HOUSEKEEPING_TASK_UPDATED',
        details: `Updated by ${req.user.email}`,
        entityId: task.id,
        entityType: 'HousekeepingTask',
        propertyId: task.propertyId,
      },
    });

    return task;
  }
}
