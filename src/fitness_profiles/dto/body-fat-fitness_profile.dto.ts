import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsEnum, IsNumber, IsOptional, IsUUID } from 'class-validator';
import { BFPCalculatingMethod } from 'src/helpers/enums/bfp-calculating-method.enum';

export class BFFitnessProfileDto {
  @ApiProperty({ description: 'Waist circumference in centimeters', required: false })
  @Transform(({ value }) => (value ? Number(value) : value))
  @IsNumber()
  @IsOptional()
  waist_cm?: number;

  @ApiProperty({ description: 'Hip circumference in centimeters', required: false })
  @Transform(({ value }) => (value ? Number(value) : value))
  @IsNumber()
  @IsOptional()
  hip_cm?: number;

  @ApiProperty({ description: 'Neck circumference in centimeters', required: false })
  @Transform(({ value }) => (value ? Number(value) : value))
  @IsNumber()
  @IsOptional()
  neck_cm?: number;

  @ApiProperty({ description: 'Body fat percentage' })
  @Transform(({ value }) => (value ? Number(value) : value))
  @IsNumber()
  @IsOptional()
  body_fat_percentages?: number;

  @ApiProperty({ description: 'Body fat calculating method', enum: BFPCalculatingMethod })
  @IsEnum(BFPCalculatingMethod)
  @IsOptional()
  body_fat_calculating_method?: BFPCalculatingMethod;

  // relations => 2
  @ApiProperty({ description: 'User ID', required: false })
  @IsOptional()
  @IsUUID('4')
  user_id?: string;

  @ApiProperty({ description: 'Diet type ID', required: false })
  @IsOptional()
  @Transform(({ value }) => (value === '' || value === null ? undefined : value))
  @IsUUID('4')
  diet_type_id?: string;
}
