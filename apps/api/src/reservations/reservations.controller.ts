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
import { ReservationsService } from './reservations.service';
import {
  CreateReservationDto,
  UpdateReservationDto,
  ReservationSearchDto,
  CheckInDto,
  CheckOutDto,
} from './dto/reservation.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { UserRole } from '../common/dtos/user.dto';
import { PaginationDto } from '../common/dtos/pagination.dto';

@ApiTags('Reservations')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('reservations')
export class ReservationsController {
  constructor(private readonly reservationsService: ReservationsService) {}

  @ApiOperation({ summary: 'Create a new reservation' })
  @Roles(UserRole.MANAGER, UserRole.RECEPTION)
  @Post()
  create(@Body() createReservationDto: CreateReservationDto) {
    return this.reservationsService.create(createReservationDto);
  }

  @ApiOperation({ summary: 'Get all reservations with search and filters' })
  @Roles(UserRole.MANAGER, UserRole.RECEPTION, UserRole.HOUSEKEEPING)
  @Get()
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'search', required: false, type: String })
  @ApiQuery({ name: 'status', required: false, enum: String })
  @ApiQuery({ name: 'propertyId', required: false, type: String })
  @ApiQuery({ name: 'checkInFrom', required: false, type: String })
  @ApiQuery({ name: 'checkInTo', required: false, type: String })
  @ApiQuery({ name: 'checkOutFrom', required: false, type: String })
  @ApiQuery({ name: 'checkOutTo', required: false, type: String })
  findAll(
    @Query() paginationDto: PaginationDto,
    @Query() searchDto: ReservationSearchDto,
  ) {
    return this.reservationsService.findAll(
      paginationDto.page,
      paginationDto.limit,
      searchDto,
    );
  }

  @ApiOperation({ summary: 'Get reservation by ID' })
  @Roles(UserRole.MANAGER, UserRole.RECEPTION, UserRole.HOUSEKEEPING)
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.reservationsService.findOne(id);
  }

  @ApiOperation({ summary: 'Update reservation' })
  @Roles(UserRole.MANAGER, UserRole.RECEPTION)
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateReservationDto: UpdateReservationDto,
  ) {
    return this.reservationsService.update(id, updateReservationDto);
  }

  @ApiOperation({ summary: 'Check in a reservation' })
  @Roles(UserRole.MANAGER, UserRole.RECEPTION)
  @Post(':id/check-in')
  checkIn(@Param('id') id: string, @Body() checkInDto: CheckInDto) {
    return this.reservationsService.checkIn(id, checkInDto);
  }

  @ApiOperation({ summary: 'Check out a reservation' })
  @Roles(UserRole.MANAGER, UserRole.RECEPTION)
  @Post(':id/check-out')
  checkOut(@Param('id') id: string, @Body() checkOutDto: CheckOutDto) {
    return this.reservationsService.checkOut(id, checkOutDto);
  }

  @ApiOperation({ summary: 'Delete reservation' })
  @Roles(UserRole.MANAGER)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.reservationsService.remove(id);
  }
}