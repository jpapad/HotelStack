import { ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsString,
  IsInt,
  Min,
  Max,
  IsOptional,
  IsEnum,
} from 'class-validator';

export enum RoomStatus {
  AVAILABLE = 'AVAILABLE',
  OCCUPIED = 'OCCUPIED',
  MAINTENANCE = 'MAINTENANCE',
  CLEANING = 'CLEANING',
}

export class CreateRoomTypeDto {
  @ApiProperty({ example: 'Deluxe King Room' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: 2, minimum: 1 })
  @IsInt()
  @Min(1)
  capacity: number;

  @ApiProperty({ example: 'WiFi, TV, Minibar, Air Conditioning' })
  @IsString()
  @IsNotEmpty()
  amenities: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  propertyId: string;
}

export class UpdateRoomTypeDto {
  @ApiProperty({ required: false })
  @IsString()
  @IsNotEmpty()
  name?: string;

  @ApiProperty({ required: false, minimum: 1 })
  @IsInt()
  @Min(1)
  capacity?: number;

  @ApiProperty({ required: false })
  @IsString()
  @IsNotEmpty()
  amenities?: string;
}

export class CreateRoomDto {
  @ApiProperty({ example: '101' })
  @IsString()
  @IsNotEmpty()
  number: string;

  @ApiProperty({ example: 1, minimum: 1 })
  @IsInt()
  @Min(1)
  floor: number;

  @ApiProperty({ enum: RoomStatus, default: RoomStatus.AVAILABLE })
  @IsEnum(RoomStatus)
  status: RoomStatus;

  @ApiProperty({ example: 'Standard room with city view', required: false })
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
  roomTypeId: string;
}

export class UpdateRoomDto {
  @ApiProperty({ required: false })
  @IsString()
  @IsNotEmpty()
  number?: string;

  @ApiProperty({ required: false, minimum: 1 })
  @IsInt()
  @Min(1)
  floor?: number;

  @ApiProperty({ enum: RoomStatus, required: false })
  @IsEnum(RoomStatus)
  status?: RoomStatus;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  notes?: string;
}

export class RoomTypeResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  name: string;

  @ApiProperty()
  capacity: number;

  @ApiProperty()
  amenities: string;

  @ApiProperty()
  propertyId: string;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}

export class RoomResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  number: string;

  @ApiProperty()
  floor: number;

  @ApiProperty({ enum: RoomStatus })
  status: RoomStatus;

  @ApiProperty()
  notes?: string;

  @ApiProperty()
  propertyId: string;

  @ApiProperty()
  roomTypeId: string;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;

  @ApiProperty()
  roomType: RoomTypeResponseDto;
}