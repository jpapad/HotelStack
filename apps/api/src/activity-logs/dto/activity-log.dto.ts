import { ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsString,
  IsOptional,
} from 'class-validator';

export class CreateActivityLogDto {
  @ApiProperty({ example: 'CREATE_RESERVATION' })
  @IsString()
  @IsNotEmpty()
  action: string;

  @ApiProperty({ example: 'Created new reservation RES-123456', required: false })
  @IsString()
  @IsOptional()
  details?: string;

  @ApiProperty({ example: 'res_123', required: false })
  @IsString()
  @IsOptional()
  entityId?: string;

  @ApiProperty({ example: 'Reservation', required: false })
  @IsString()
  @IsOptional()
  entityType?: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  propertyId: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  userId: string;
}

export class ActivityLogResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  action: string;

  @ApiProperty()
  details?: string;

  @ApiProperty()
  entityId?: string;

  @ApiProperty()
  entityType?: string;

  @ApiProperty()
  propertyId: string;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  user: {
    id: string;
    name: string;
    email: string;
    role: string;
  };
}