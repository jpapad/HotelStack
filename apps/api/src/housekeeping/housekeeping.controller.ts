import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';
import { HousekeepingService } from './housekeeping.service';
import {
  CreateHousekeepingTaskDto,
  UpdateHousekeepingTaskDto,
  HousekeepingTaskStatus,
} from './dto/housekeeping.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { UserRole } from '../common/dtos/user.dto';
import { PaginationDto } from '../common/dtos/pagination.dto';

@ApiTags('Housekeeping')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('housekeeping')
export class HousekeepingController {
  constructor(private readonly housekeepingService: HousekeepingService) {}

  @ApiOperation({ summary: 'Create a new housekeeping task' })
  @Roles(UserRole.MANAGER, UserRole.RECEPTION, UserRole.HOUSEKEEPING)
  @Post()
  create(@Body() createHousekeepingTaskDto: CreateHousekeepingTaskDto) {
    return this.housekeepingService.create(createHousekeepingTaskDto);
  }

  @ApiOperation({ summary: 'Get all housekeeping tasks' })
  @Roles(UserRole.MANAGER, UserRole.RECEPTION, UserRole.HOUSEKEEPING)
  @Get()
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'propertyId', required: false, type: String })
  @ApiQuery({ name: 'status', required: false, enum: HousekeepingTaskStatus })
  @ApiQuery({ name: 'roomId', required: false, type: String })
  findAll(
    @Query() paginationDto: PaginationDto,
    @Query('propertyId') propertyId?: string,
    @Query('status') status?: HousekeepingTaskStatus,
    @Query('roomId') roomId?: string,
  ) {
    return this.housekeepingService.findAll(
      paginationDto.page,
      paginationDto.limit,
      propertyId,
      status,
      roomId,
    );
  }

  @ApiOperation({ summary: 'Get housekeeping task by ID' })
  @Roles(UserRole.MANAGER, UserRole.RECEPTION, UserRole.HOUSEKEEPING)
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.housekeepingService.findOne(id);
  }

  @ApiOperation({ summary: 'Update housekeeping task' })
  @Roles(UserRole.MANAGER, UserRole.RECEPTION, UserRole.HOUSEKEEPING)
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateHousekeepingTaskDto: UpdateHousekeepingTaskDto,
  ) {
    return this.housekeepingService.update(id, updateHousekeepingTaskDto);
  }

  @ApiOperation({ summary: 'Update housekeeping task status' })
  @Roles(UserRole.MANAGER, UserRole.RECEPTION, UserRole.HOUSEKEEPING)
  @Patch(':id/status')
  updateStatus(
    @Param('id') id: string,
    @Body() body: { status: HousekeepingTaskStatus },
  ) {
    return this.housekeepingService.updateStatus(id, body.status);
  }

  @ApiOperation({ summary: 'Delete housekeeping task' })
  @Roles(UserRole.MANAGER)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.housekeepingService.remove(id);
  }

  @ApiOperation({ summary: 'Get tasks by room' })
  @Roles(UserRole.MANAGER, UserRole.RECEPTION, UserRole.HOUSEKEEPING)
  @Get('room/:roomId')
  getTasksByRoom(@Param('roomId') roomId: string) {
    return this.housekeepingService.getTasksByRoom(roomId);
  }

  @ApiOperation({ summary: 'Get tasks by status' })
  @Roles(UserRole.MANAGER, UserRole.RECEPTION, UserRole.HOUSEKEEPING)
  @Get('status/:status')
  getTasksByStatus(
    @Param('status') status: HousekeepingTaskStatus,
    @Query('propertyId') propertyId?: string,
  ) {
    return this.housekeepingService.getTasksByStatus(status, propertyId);
  }
}