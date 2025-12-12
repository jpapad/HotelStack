import { ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsString,
  IsInt,
  Min,
  IsOptional,
  IsDateString,
} from 'class-validator';

export class CreateStayDto {
  @ApiProperty({ example: '2024-01-15T14:00:00Z' })
  @IsDateString()
  checkInDate: string;

  @ApiProperty({ example: '2024-01-18T11:00:00Z', required: false })
  @IsDateString()
  @IsOptional()
  checkOutDate?: string;

  @ApiProperty({ example: 3 })
  @IsInt()
  @Min(0)
  numberOfNights: number;

  @ApiProperty({ example: 2 })
  @IsInt()
  @Min(1)
  occupants: number;

  @ApiProperty({ example: 'Guest had a pleasant stay', required: false })
  @IsString()
  @IsOptional()
  notes?: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  propertyId: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  reservationId: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  roomId: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  guestId: string;
}

export class UpdateStayDto {
  @ApiProperty({ required: false })
  @IsDateString()
  @IsOptional()
  checkInDate?: string;

  @ApiProperty({ required: false })
  @IsDateString()
  @IsOptional()
  checkOutDate?: string;

  @ApiProperty({ required: false, minimum: 0 })
  @IsInt()
  @Min(0)
  @IsOptional()
  numberOfNights?: number;

  @ApiProperty({ required: false, minimum: 1 })
  @IsInt()
  @Min(1)
  @IsOptional()
  occupants?: number;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  notes?: string;
}

export class StayResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  checkInDate: Date;

  @ApiProperty()
  checkOutDate?: Date;

  @ApiProperty()
  numberOfNights: number;

  @ApiProperty()
  occupants: number;

  @ApiProperty()
  notes?: string;

  @ApiProperty()
  propertyId: string;

  @ApiProperty()
  reservationId: string;

  @ApiProperty()
  roomId: string;

  @ApiProperty()
  guestId: string;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;

  @ApiProperty()
  reservation: {
    id: string;
    confirmationCode: string;
    status: string;
  };

  @ApiProperty()
  room: {
    id: string;
    number: string;
    floor: number;
  };

  @ApiProperty()
  guest: {
    id: string;
    firstName: string;
    lastName: string;
    email?: string;
  };
}