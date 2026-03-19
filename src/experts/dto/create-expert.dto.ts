import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  IsBoolean,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
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

  @ApiProperty({ example: 2.5, description: 'Charged tokens per minute', required: false })
  @IsOptional()
  @Transform(({ value }) => (value !== undefined ? Number(value) : value))
  @IsNumber()
  @Min(0)
  token_per_minute?: number;

  @ApiProperty({ example: false, required: false })
  @IsOptional()
  @IsBoolean()
  is_verified?: boolean;

  @ApiProperty({ example: false, required: false })
  @IsOptional()
  @IsBoolean()
  is_online?: boolean;

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
