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
import { ChargesPaymentsService } from './charges-payments.service';
import { CreateChargeDto, CreatePaymentDto } from './dto/charge-payment.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { UserRole } from '../common/dtos/user.dto';
import { PaginationDto } from '../common/dtos/pagination.dto';

@ApiTags('Charges & Payments')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('charges-payments')
export class ChargesPaymentsController {
  constructor(private readonly chargesPaymentsService: ChargesPaymentsService) {}

  // Charges
  @ApiOperation({ summary: 'Create a new charge' })
  @Roles(UserRole.MANAGER, UserRole.RECEPTION)
  @Post('charges')
  createCharge(@Body() createChargeDto: CreateChargeDto) {
    return this.chargesPaymentsService.createCharge(createChargeDto);
  }

  @ApiOperation({ summary: 'Get all charges' })
  @Roles(UserRole.MANAGER, UserRole.RECEPTION)
  @Get('charges')
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'propertyId', required: false, type: String })
  getAllCharges(
    @Query() paginationDto: PaginationDto,
    @Query('propertyId') propertyId?: string,
  ) {
    return this.chargesPaymentsService.getAllCharges(
      paginationDto.page,
      paginationDto.limit,
      propertyId,
    );
  }

  @ApiOperation({ summary: 'Get charges for a reservation' })
  @Roles(UserRole.MANAGER, UserRole.RECEPTION)
  @Get('charges/reservation/:reservationId')
  getReservationCharges(@Param('reservationId') reservationId: string) {
    return this.chargesPaymentsService.getReservationCharges(reservationId);
  }

  @ApiOperation({ summary: 'Get total charges for a reservation' })
  @Roles(UserRole.MANAGER, UserRole.RECEPTION)
  @Get('charges/reservation/:reservationId/total')
  getReservationTotalCharges(@Param('reservationId') reservationId: string) {
    return this.chargesPaymentsService.getReservationTotalCharges(reservationId);
  }

  // Payments
  @ApiOperation({ summary: 'Create a new payment' })
  @Roles(UserRole.MANAGER, UserRole.RECEPTION)
  @Post('payments')
  createPayment(@Body() createPaymentDto: CreatePaymentDto) {
    return this.chargesPaymentsService.createPayment(createPaymentDto);
  }

  @ApiOperation({ summary: 'Get all payments' })
  @Roles(UserRole.MANAGER, UserRole.RECEPTION)
  @Get('payments')
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'propertyId', required: false, type: String })
  @ApiQuery({ name: 'status', required: false, type: String })
  getAllPayments(
    @Query() paginationDto: PaginationDto,
    @Query('propertyId') propertyId?: string,
    @Query('status') status?: string,
  ) {
    return this.chargesPaymentsService.getAllPayments(
      paginationDto.page,
      paginationDto.limit,
      propertyId,
      status,
    );
  }

  @ApiOperation({ summary: 'Get payments for a reservation' })
  @Roles(UserRole.MANAGER, UserRole.RECEPTION)
  @Get('payments/reservation/:reservationId')
  getReservationPayments(@Param('reservationId') reservationId: string) {
    return this.chargesPaymentsService.getReservationPayments(reservationId);
  }

  @ApiOperation({ summary: 'Get total payments for a reservation' })
  @Roles(UserRole.MANAGER, UserRole.RECEPTION)
  @Get('payments/reservation/:reservationId/total')
  getReservationTotalPayments(@Param('reservationId') reservationId: string) {
    return this.chargesPaymentsService.getReservationTotalPayments(reservationId);
  }

  @ApiOperation({ summary: 'Get reservation balance' })
  @Roles(UserRole.MANAGER, UserRole.RECEPTION)
  @Get('payments/reservation/:reservationId/balance')
  getReservationBalance(@Param('reservationId') reservationId: string) {
    return this.chargesPaymentsService.getReservationBalance(reservationId);
  }
}