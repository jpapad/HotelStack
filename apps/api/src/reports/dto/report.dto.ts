import { ApiProperty } from '@nestjs/swagger';
import {
  IsDateString,
  IsOptional,
  IsString,
  IsEnum,
} from 'class-validator';

export class OccupancyReportDto {
  @ApiProperty({ example: '2024-01-01' })
  @IsDateString()
  startDate: string;

  @ApiProperty({ example: '2024-01-31' })
  @IsDateString()
  endDate: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  propertyId?: string;
}

export class ArrivalDepartureReportDto {
  @ApiProperty({ example: '2024-01-15' })
  @IsDateString()
  date: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  propertyId?: string;
}

export class DashboardDto {
  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  propertyId?: string;

  @ApiProperty({ example: '2024-01-15', required: false })
  @IsDateString()
  @IsOptional()
  date?: string;
}

export class OccupancyReportResponse {
  @ApiProperty()
  totalRooms: number;

  @ApiProperty()
  occupiedRooms: number;

  @ApiProperty()
  availableRooms: number;

  @ApiProperty()
  occupancyRate: number;

  @ApiProperty()
  date: string;

  @ApiProperty({ type: 'array' })
  roomBreakdown: Array<{
    roomId: string;
    roomNumber: string;
    status: string;
    guestName?: string;
  }>;
}

export class ArrivalDepartureResponse {
  @ApiProperty()
  date: string;

  @ApiProperty({ type: 'array' })
  arrivals: Array<{
    id: string;
    confirmationCode: string;
    guestName: string;
    roomNumber?: string;
    checkInDate: string;
  }>;

  @ApiProperty({ type: 'array' })
  departures: Array<{
    id: string;
    confirmationCode: string;
    guestName: string;
    roomNumber?: string;
    checkOutDate: string;
  }>;
}

export class DashboardResponse {
  @ApiProperty()
  date: string;

  @ApiProperty()
  totalRooms: number;

  @ApiProperty()
  occupiedRooms: number;

  @ApiProperty()
  availableRooms: number;

  @ApiProperty()
  inHouseGuests: number;

  @ApiProperty()
  occupancyRate: number;

  @ApiProperty({ type: 'array' })
  todaysArrivals: Array<{
    id: string;
    confirmationCode: string;
    guestName: string;
    roomNumber?: string;
    checkInDate: string;
  }>;

  @ApiProperty({ type: 'array' })
  todaysDepartures: Array<{
    id: string;
    confirmationCode: string;
    guestName: string;
    roomNumber?: string;
    checkOutDate: string;
  }>;

  @ApiProperty({ type: 'array' })
  roomStatusSummary: Array<{
    status: string;
    count: number;
    percentage: number;
  }>;

  @ApiProperty({ type: 'array' })
  upcomingReservations: Array<{
    id: string;
    confirmationCode: string;
    guestName: string;
    checkInDate: string;
    roomNumber?: string;
  }>;
}