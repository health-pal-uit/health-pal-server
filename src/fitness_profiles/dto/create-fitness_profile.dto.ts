import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  IsDateString,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsUUID,
  Min,
} from 'class-validator';
import { ActivityLevel } from 'src/helpers/enums/activity-level.enum';
import { BFPCalculatingMethod } from 'src/helpers/enums/bfp-calculating-method.enum';
import { TransformToISODate } from 'src/helpers/transformers/date.transformer';

export class CreateFitnessProfileDto {
  @ApiProperty({ description: 'Weight in kilograms' })
  @IsNotEmpty()
  @Transform(({ value }) => (value ? Number(value) : value))
  @IsNumber()
  @Min(0.1, { message: 'Weight must be positive' })
  weight_kg!: number;

  @ApiProperty({ description: 'Height in meters' })
  @IsNotEmpty()
  @Transform(({ value }) => (value ? Number(value) : value))
  @IsNumber()
  @Min(0.1, { message: 'Height must be positive' })
  height_m!: number;

  @ApiProperty({ description: 'Waist circumference in centimeters' })
  @IsOptional()
  @Transform(({ value }) => (value ? Number(value) : value))
  @IsNumber()
  waist_cm?: number;

  @ApiProperty({ description: 'Hip circumference in centimeters' })
  @IsOptional()
  @Transform(({ value }) => (value ? Number(value) : value))
  @IsNumber()
  hip_cm?: number;

  @ApiProperty({ description: 'Neck circumference in centimeters' })
  @IsOptional()
  @Transform(({ value }) => (value ? Number(value) : value))
  @IsNumber()
  neck_cm?: number;

  @ApiProperty({ description: 'Activity level', enum: ActivityLevel })
  @IsEnum(ActivityLevel)
  @IsNotEmpty()
  activity_level!: ActivityLevel;

  @ApiProperty({ description: 'Body fat percentage' })
  @Transform(({ value }) => (value ? Number(value) : value))
  @IsNumber()
  @IsOptional()
  body_fat_percentages?: number;

  @ApiProperty({ description: 'Body fat calculating method', enum: BFPCalculatingMethod })
  @IsEnum(BFPCalculatingMethod)
  @IsOptional()
  body_fat_calculating_method?: BFPCalculatingMethod;

  @ApiProperty({ description: 'Basal metabolic rate' })
  @Transform(({ value }) => (value ? Number(value) : value))
  @IsNumber()
  @IsOptional()
  bmr?: number;

  @ApiProperty({ description: 'Body mass index' })
  @Transform(({ value }) => (value ? Number(value) : value))
  @IsNumber()
  @IsOptional()
  bmi?: number;

  @ApiProperty({ description: 'Creation date' })
  @IsOptional()
  @IsDateString()
  @TransformToISODate()
  created_at?: Date;

  @ApiProperty({ description: 'Total Daily Energy Expenditure' })
  @Transform(({ value }) => (value ? Number(value) : value))
  @IsNumber()
  @IsOptional()
  tdee_kcal?: number; // cal later

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
