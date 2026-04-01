import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  IsBoolean,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUrl,
  IsUUID,
  Min,
} from 'class-validator';

export class CreateExpertDto {
  @ApiProperty({ example: 'uuid', description: 'User ID of this expert' })
  @IsNotEmpty()
  @IsUUID('4')
  user_id: string;

  @ApiProperty({ example: 'uuid', description: 'Expert role ID' })
  @IsNotEmpty()
  @IsUUID('4')
  expert_role_id: string;

  @ApiProperty({ example: 'Certified nutrition advisor', required: false })
  @IsOptional()
  @IsString()
  bio?: string;

  @ApiProperty({ example: 'VN-EXPERT-2026-0001', description: 'Professional license identifier' })
  @IsNotEmpty()
  @IsString()
  license_id: string;

  @ApiProperty({
    example: 'https://example.com/licenses/VN-EXPERT-2026-0001.pdf',
    description: 'Public URL to license proof',
  })
  @IsNotEmpty()
  @IsUrl()
  license_url: string;

  @ApiProperty({ example: 2.5, description: 'Charged tokens per minute', required: false })
  @IsOptional()
  @Transform(({ value }) => (value !== undefined ? Number(value) : value))
  @IsNumber()
  @Min(0)
  token_per_minute?: number;

  @ApiProperty({
    example: 'uuid',
    description: 'Premium package tier for booking fee discount',
    required: false,
  })
  @IsOptional()
  @IsUUID('4')
  booking_fee_tier_id?: string;

  @ApiProperty({ example: false, required: false })
  @IsOptional()
  @IsBoolean()
  is_verified?: boolean;

  @ApiProperty({ example: 0, required: false })
  @IsOptional()
  @Transform(({ value }) => (value !== undefined ? Number(value) : value))
  @IsNumber()
  @Min(0)
  rating_avg?: number;

  @ApiProperty({ example: 0, required: false })
  @IsOptional()
  @Transform(({ value }) => (value !== undefined ? Number(value) : value))
  @IsNumber()
  @Min(0)
  rating_count?: number;
}
