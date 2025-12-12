import { ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsString,
  IsInt,
  Min,
  IsOptional,
  IsEnum,
  IsDateString,
  IsNumber,
} from 'class-validator';

export enum ReservationStatus {
  PENDING = 'PENDING',
  CONFIRMED = 'CONFIRMED',
  CHECKED_IN = 'CHECKED_IN',
  CHECKED_OUT = 'CHECKED_OUT',
  CANCELLED = 'CANCELLED',
}

export enum ReservationSource {
  DIRECT = 'DIRECT',
  OTA = 'OTA',
  BOOKING_COM = 'BOOKING_COM',
  AIRBNB = 'AIRBNB',
  EXPEDIA = 'EXPEDIA',
}

export class CreateReservationDto {
  @ApiProperty({ enum: ReservationStatus, default: ReservationStatus.PENDING })
  @IsEnum(ReservationStatus)
  status: ReservationStatus;

  @ApiProperty({ enum: ReservationSource, default: ReservationSource.DIRECT })
  @IsEnum(ReservationSource)
  source: ReservationSource;

  @ApiProperty({ example: '2024-01-15T14:00:00Z' })
  @IsDateString()
  checkInDate: string;

  @ApiProperty({ example: '2024-01-18T11:00:00Z' })
  @IsDateString()
  checkOutDate: string;

  @ApiProperty({ example: 2, minimum: 1 })
  @IsInt()
  @Min(1)
  numberOfGuests: number;

  @ApiProperty({ example: 1, minimum: 1 })
  @IsInt()
  @Min(1)
  numberOfRooms: number;

  @ApiProperty({ example: 299.99 })
  @IsNumber()
  @Min(0)
  totalPrice: number;

  @ApiProperty({ example: 0 })
  @IsNumber()
  @Min(0)
  paidAmount: number;

  @ApiProperty({ example: 'Early check-in requested', required: false })
  @IsString()
  @IsOptional()
  specialRequests?: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  propertyId: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  guestId: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  roomId?: string;
}

export class UpdateReservationDto {
  @ApiProperty({ enum: ReservationStatus, required: false })
  @IsEnum(ReservationStatus)
  @IsOptional()
  status?: ReservationStatus;

  @ApiProperty({ enum: ReservationSource, required: false })
  @IsEnum(ReservationSource)
  @IsOptional()
  source?: ReservationSource;

  @ApiProperty({ required: false })
  @IsDateString()
  @IsOptional()
  checkInDate?: string;

  @ApiProperty({ required: false })
  @IsDateString()
  @IsOptional()
  checkOutDate?: string;

  @ApiProperty({ required: false, minimum: 1 })
  @IsInt()
  @Min(1)
  @IsOptional()
  numberOfGuests?: number;

  @ApiProperty({ required: false, minimum: 1 })
  @IsInt()
  @Min(1)
  @IsOptional()
  numberOfRooms?: number;

  @ApiProperty({ required: false, minimum: 0 })
  @IsNumber()
  @Min(0)
  @IsOptional()
  totalPrice?: number;

  @ApiProperty({ required: false, minimum: 0 })
  @IsNumber()
  @Min(0)
  @IsOptional()
  paidAmount?: number;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  specialRequests?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  roomId?: string;
}

export class CheckInDto {
  @ApiProperty({ example: 'Room assigned to guest' })
  @IsString()
  @IsOptional()
  notes?: string;
}

export class CheckOutDto {
  @ApiProperty({ example: 'Guest checked out successfully' })
  @IsString()
  @IsOptional()
  notes?: string;
}

export class ReservationResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty({ enum: ReservationStatus })
  status: ReservationStatus;

  @ApiProperty({ enum: ReservationSource })
  source: ReservationSource;

  @ApiProperty()
  checkInDate: Date;

  @ApiProperty()
  checkOutDate: Date;

  @ApiProperty()
  numberOfGuests: number;

  @ApiProperty()
  numberOfRooms: number;

  @ApiProperty()
  totalPrice: number;

  @ApiProperty()
  paidAmount: number;

  @ApiProperty()
  specialRequests?: string;

  @ApiProperty()
  confirmationCode: string;

  @ApiProperty()
  propertyId: string;

  @ApiProperty()
  guestId: string;

  @ApiProperty()
  roomId?: string;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;

  @ApiProperty()
  guest: {
    id: string;
    firstName: string;
    lastName: string;
    email?: string;
    phone?: string;
  };

  @ApiProperty()
  room?: {
    id: string;
    number: string;
    floor: number;
  };
}

export class ReservationSearchDto {
  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  search?: string;

  @ApiProperty({ enum: ReservationStatus, required: false })
  @IsEnum(ReservationStatus)
  @IsOptional()
  status?: ReservationStatus;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  propertyId?: string;

  @ApiProperty({ required: false })
  @IsDateString()
  @IsOptional()
  checkInFrom?: string;

  @ApiProperty({ required: false })
  @IsDateString()
  @IsOptional()
  checkInTo?: string;

  @ApiProperty({ required: false })
  @IsDateString()
  @IsOptional()
  checkOutFrom?: string;

  @ApiProperty({ required: false })
  @IsDateString()
  @IsOptional()
  checkOutTo?: string;
}