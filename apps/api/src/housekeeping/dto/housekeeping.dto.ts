import { ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsString,
  IsOptional,
  IsEnum,
} from 'class-validator';

export enum HousekeepingTaskStatus {
  PENDING = 'PENDING',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
}

export class CreateHousekeepingTaskDto {
  @ApiProperty({ example: 'Clean Room 101' })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({ example: 'Standard cleaning after checkout', required: false })
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
  roomId: string;
}

export class UpdateHousekeepingTaskDto {
  @ApiProperty({ required: false })
  @IsString()
  @IsNotEmpty()
  title?: string;

  @ApiProperty({ enum: HousekeepingTaskStatus, required: false })
  @IsEnum(HousekeepingTaskStatus)
  @IsOptional()
  status?: HousekeepingTaskStatus;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  notes?: string;
}

export class HousekeepingTaskResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  title: string;

  @ApiProperty({ enum: HousekeepingTaskStatus })
  status: HousekeepingTaskStatus;

  @ApiProperty()
  notes?: string;

  @ApiProperty()
  propertyId: string;

  @ApiProperty()
  roomId: string;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;

  @ApiProperty()
  room: {
    id: string;
    number: string;
    floor: number;
  };
}