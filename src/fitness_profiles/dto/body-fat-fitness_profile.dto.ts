import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsEnum, IsNotEmpty, IsNumber, IsOptional, IsUUID } from 'class-validator';
import { ActivityLevel } from 'src/helpers/enums/activity-level.enum';
import { BFPCalculatingMethod } from 'src/helpers/enums/bfp-calculating-method.enum';
import { TransformToISODate } from 'src/helpers/transformers/date.transformer';

export class BFFitnessProfileDto {
  @ApiProperty({ description: 'Waist circumference in centimeters' })
  @IsNotEmpty()
  @IsNumber()
  waist_cm!: number;

  @ApiProperty({ description: 'Hip circumference in centimeters' })
  @IsNotEmpty()
  @IsNumber()
  hip_cm!: number;

  @ApiProperty({ description: 'Neck circumference in centimeters' })
  @IsNotEmpty()
  @IsNumber()
  neck_cm!: number;

  @ApiProperty({ description: 'Body fat percentage' })
  @IsNumber()
  @IsOptional()
  body_fat_percentages?: number;

  @ApiProperty({ description: 'Body fat calculating method', enum: BFPCalculatingMethod })
  @IsEnum(BFPCalculatingMethod)
  @IsOptional()
  body_fat_calculating_method?: BFPCalculatingMethod;

  // relations => 2
  @ApiProperty({ description: 'User ID' })
  @IsNotEmpty()
  @IsUUID('4')
  user_id!: string;

  @ApiProperty({ description: 'Diet type ID' })
  @IsNotEmpty()
  @IsUUID('4')
  diet_type_id?: string;
}
