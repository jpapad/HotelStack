import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString, MinLength, IsEnum } from 'class-validator';

export enum UserRole {
  RECEPTION = 'RECEPTION',
  MANAGER = 'MANAGER',
  HOUSEKEEPING = 'HOUSEKEEPING',
}

export class CreateUserDto {
  @ApiProperty({ example: 'john.doe@example.com' })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({ example: 'StrongPassword123!' })
  @IsString()
  @MinLength(8)
  password: string;

  @ApiProperty({ example: 'John Doe' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ enum: UserRole, example: UserRole.RECEPTION })
  @IsEnum(UserRole)
  role: UserRole;
}

export class UpdateUserDto {
  @ApiProperty({ required: false })
  @IsEmail()
  @IsNotEmpty()
  email?: string;

  @ApiProperty({ required: false })
  @IsString()
  @MinLength(8)
  password?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsNotEmpty()
  name?: string;

  @ApiProperty({ enum: UserRole, required: false })
  @IsEnum(UserRole)
  role?: UserRole;
}

export class UserResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  email: string;

  @ApiProperty()
  name: string;

  @ApiProperty({ enum: UserRole })
  role: UserRole;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}