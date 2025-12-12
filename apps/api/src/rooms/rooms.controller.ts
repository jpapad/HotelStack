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
import { RoomsService } from './rooms.service';
import { CreateRoomTypeDto, UpdateRoomTypeDto, CreateRoomDto, UpdateRoomDto, RoomStatus } from './dto/room.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '../../common/dtos/user.dto';
import { PaginationDto } from '../../common/dtos/pagination.dto';

@ApiTags('Room Types')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('room-types')
export class RoomTypesController {
  constructor(private readonly roomsService: RoomsService) {}

  @ApiOperation({ summary: 'Create a new room type' })
  @Roles(UserRole.MANAGER)
  @Post()
  createRoomType(@Body() createRoomTypeDto: CreateRoomTypeDto) {
    return this.roomsService.createRoomType(createRoomTypeDto);
  }

  @ApiOperation({ summary: 'Get all room types' })
  @Roles(UserRole.MANAGER, UserRole.RECEPTION, UserRole.HOUSEKEEPING)
  @Get()
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'propertyId', required: false, type: String })
  findAllRoomTypes(
    @Query() paginationDto: PaginationDto,
    @Query('propertyId') propertyId?: string,
  ) {
    return this.roomsService.findAllRoomTypes(
      paginationDto.page,
      paginationDto.limit,
      propertyId,
    );
  }

  @ApiOperation({ summary: 'Get room type by ID' })
  @Roles(UserRole.MANAGER, UserRole.RECEPTION, UserRole.HOUSEKEEPING)
  @Get(':id')
  findRoomType(@Param('id') id: string) {
    return this.roomsService.findRoomType(id);
  }

  @ApiOperation({ summary: 'Update room type' })
  @Roles(UserRole.MANAGER)
  @Patch(':id')
  updateRoomType(@Param('id') id: string, @Body() updateRoomTypeDto: UpdateRoomTypeDto) {
    return this.roomsService.updateRoomType(id, updateRoomTypeDto);
  }

  @ApiOperation({ summary: 'Delete room type' })
  @Roles(UserRole.MANAGER)
  @Delete(':id')
  removeRoomType(@Param('id') id: string) {
    return this.roomsService.removeRoomType(id);
  }
}

@ApiTags('Rooms')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('rooms')
export class RoomsController {
  constructor(private readonly roomsService: RoomsService) {}

  @ApiOperation({ summary: 'Create a new room' })
  @Roles(UserRole.MANAGER)
  @Post()
  createRoom(@Body() createRoomDto: CreateRoomDto) {
    return this.roomsService.createRoom(createRoomDto);
  }

  @ApiOperation({ summary: 'Get all rooms' })
  @Roles(UserRole.MANAGER, UserRole.RECEPTION, UserRole.HOUSEKEEPING)
  @Get()
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'propertyId', required: false, type: String })
  @ApiQuery({ name: 'roomTypeId', required: false, type: String })
  @ApiQuery({ name: 'status', required: false, enum: RoomStatus })
  findAllRooms(
    @Query() paginationDto: PaginationDto,
    @Query('propertyId') propertyId?: string,
    @Query('roomTypeId') roomTypeId?: string,
    @Query('status') status?: RoomStatus,
  ) {
    return this.roomsService.findAllRooms(
      paginationDto.page,
      paginationDto.limit,
      propertyId,
      roomTypeId,
      status,
    );
  }

  @ApiOperation({ summary: 'Get room by ID' })
  @Roles(UserRole.MANAGER, UserRole.RECEPTION, UserRole.HOUSEKEEPING)
  @Get(':id')
  findRoom(@Param('id') id: string) {
    return this.roomsService.findRoom(id);
  }

  @ApiOperation({ summary: 'Update room' })
  @Roles(UserRole.MANAGER, UserRole.RECEPTION)
  @Patch(':id')
  updateRoom(@Param('id') id: string, @Body() updateRoomDto: UpdateRoomDto) {
    return this.roomsService.updateRoom(id, updateRoomDto);
  }

  @ApiOperation({ summary: 'Delete room' })
  @Roles(UserRole.MANAGER)
  @Delete(':id')
  removeRoom(@Param('id') id: string) {
    return this.roomsService.removeRoom(id);
  }
}