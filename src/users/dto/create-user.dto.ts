import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  IsBoolean,
  IsDateString,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUrl,
  IsUUID,
} from 'class-validator';
import { TransformToISODate } from 'src/helpers/transformers/date.transformer';

export class CreateUserDto {
  @ApiProperty({ type: String, description: 'Username' })
  @IsString()
  @IsNotEmpty()
  username!: string; // @IsString() in dto

  @ApiProperty({ type: String, description: 'Password' })
  @IsString()
  @IsNotEmpty()
  password!: string; // @IsString() in dto

  @ApiProperty({ type: String, description: 'Email' })
  @IsString()
  @IsNotEmpty()
  email!: string;

  @ApiProperty({ type: String, description: 'Phone' })
  @IsString()
  @IsOptional()
  phone?: string;

  @ApiProperty({ type: String, description: 'Full Name' })
  @IsString()
  @IsOptional()
  fullname?: string;

  @ApiProperty({ type: Boolean, description: 'Gender' })
  @IsOptional()
  @Transform(({ value }) => {
    if (value === 'true' || value === true) return true;
    if (value === 'false' || value === false) return false;
    return value;
  })
  @IsBoolean()
  gender?: boolean;

  @ApiProperty({ type: Date, description: 'Birth Date' })
  @IsNotEmpty()
  @IsDateString()
  @TransformToISODate()
  birth_date!: Date;

  @ApiProperty({ type: String, nullable: true, description: 'Avatar URL' })
  @IsUrl()
  @IsOptional()
  avatar_url?: string;

  @ApiProperty({ type: Date, description: 'Created At' })
  @IsOptional()
  @IsDateString()
  @TransformToISODate()
  created_at?: Date;

  @ApiProperty({ type: Date, description: 'Deactivated At', nullable: true })
  @IsOptional()
  @IsDateString()
  @TransformToISODate()
  deactivated_at?: Date;

  @ApiProperty({ type: String, description: 'Role ID' })
  @IsUUID('4')
  @IsOptional()
  role_id?: string;

  @ApiProperty({ type: String, description: 'Premium Package ID', nullable: true })
  @IsUUID('4')
  @IsOptional()
  premium_package_id?: string;
}
