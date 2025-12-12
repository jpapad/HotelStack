import {
  Controller,
  Get,
  Post,
  Body,
  UseGuards,
  Query,
  Param,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';
import { ActivityLogsService } from './activity-logs.service';
import { CreateActivityLogDto } from './dto/activity-log.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { UserRole } from '../common/dtos/user.dto';
import { PaginationDto } from '../common/dtos/pagination.dto';

@ApiTags('Activity Logs')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('activity-logs')
export class ActivityLogsController {
  constructor(private readonly activityLogsService: ActivityLogsService) {}

  @ApiOperation({ summary: 'Create a new activity log entry' })
  @Roles(UserRole.MANAGER, UserRole.RECEPTION, UserRole.HOUSEKEEPING)
  @Post()
  create(@Body() createActivityLogDto: CreateActivityLogDto) {
    return this.activityLogsService.create(createActivityLogDto);
  }

  @ApiOperation({ summary: 'Get all activity logs with pagination' })
  @Roles(UserRole.MANAGER, UserRole.RECEPTION)
  @Get()
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'propertyId', required: false, type: String })
  @ApiQuery({ name: 'userId', required: false, type: String })
  @ApiQuery({ name: 'entityType', required: false, type: String })
  findAll(
    @Query() paginationDto: PaginationDto,
    @Query('propertyId') propertyId?: string,
    @Query('userId') userId?: string,
    @Query('entityType') entityType?: string,
  ) {
    return this.activityLogsService.findAll(
      paginationDto.page,
      paginationDto.limit,
      propertyId,
      userId,
      entityType,
    );
  }

  @ApiOperation({ summary: 'Get activity logs for a specific entity' })
  @Roles(UserRole.MANAGER, UserRole.RECEPTION)
  @Get('entity/:entityType/:entityId')
  findByEntity(
    @Param('entityType') entityType: string,
    @Param('entityId') entityId: string,
  ) {
    return this.activityLogsService.findByEntity(entityId, entityType);
  }

  @ApiOperation({ summary: 'Get activity logs for a specific user' })
  @Roles(UserRole.MANAGER)
  @Get('user/:userId')
  getUserActivity(
    @Param('userId') userId: string,
    @Query() paginationDto: PaginationDto,
  ) {
    return this.activityLogsService.getUserActivity(
      userId,
      paginationDto.page,
      paginationDto.limit,
    );
  }
}