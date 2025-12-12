import { ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsString,
  IsNumber,
  Min,
  IsOptional,
  IsEnum,
} from 'class-validator';

export enum PaymentStatus {
  PENDING = 'PENDING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
  REFUNDED = 'REFUNDED',
}

export class CreateChargeDto {
  @ApiProperty({ example: 'Room charge for 3 nights' })
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiProperty({ example: 299.99 })
  @IsNumber()
  @Min(0)
  amount: number;

  @ApiProperty({ example: 'room_charge' })
  @IsString()
  @IsNotEmpty()
  chargeType: string;

  @ApiProperty({ example: 'Standard room rate', required: false })
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
}

export class CreatePaymentDto {
  @ApiProperty({ example: 299.99 })
  @IsNumber()
  @Min(0)
  amount: number;

  @ApiProperty({ example: 'credit_card' })
  @IsString()
  @IsNotEmpty()
  method: string;

  @ApiProperty({ enum: PaymentStatus, default: PaymentStatus.PENDING })
  @IsEnum(PaymentStatus)
  status: PaymentStatus;

  @ApiProperty({ example: 'TXN123456789', required: false })
  @IsString()
  @IsOptional()
  transactionId?: string;

  @ApiProperty({ example: 'Payment processed successfully', required: false })
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
  guestId: string;
}

export class ChargeResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  description: string;

  @ApiProperty()
  amount: number;

  @ApiProperty()
  chargeType: string;

  @ApiProperty()
  notes?: string;

  @ApiProperty()
  propertyId: string;

  @ApiProperty()
  reservationId: string;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;

  @ApiProperty()
  reservation: {
    id: string;
    confirmationCode: string;
  };
}

export class PaymentResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  amount: number;

  @ApiProperty()
  method: string;

  @ApiProperty({ enum: PaymentStatus })
  status: PaymentStatus;

  @ApiProperty()
  transactionId?: string;

  @ApiProperty()
  notes?: string;

  @ApiProperty()
  propertyId: string;

  @ApiProperty()
  reservationId: string;

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
  };

  @ApiProperty()
  guest: {
    id: string;
    firstName: string;
    lastName: string;
  };
}