import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsEnum, IsNotEmpty, IsNumber, IsOptional, IsUUID } from 'class-validator';
import { ActivityLevel } from 'src/helpers/enums/activity-level.enum';
import { BFPCalculatingMethod } from 'src/helpers/enums/bfp-calculating-method.enum';
import { TransformToISODate } from 'src/helpers/transformers/date.transformer';

export class CreateFitnessProfileDto {
  @ApiProperty({ description: 'Weight in kilograms' })
  @IsNotEmpty()
  @IsNumber()
  weight_kg!: number;

  @ApiProperty({ description: 'Height in meters' })
  @IsNotEmpty()
  @IsNumber()
  height_m!: number;

  @ApiProperty({ description: 'Waist circumference in centimeters' })
  @IsOptional()
  @IsNumber()
  waist_cm?: number;

  @ApiProperty({ description: 'Hip circumference in centimeters' })
  @IsOptional()
  @IsNumber()
  hip_cm?: number;

  @ApiProperty({ description: 'Neck circumference in centimeters' })
  @IsOptional()
  @IsNumber()
  neck_cm?: number;

  @ApiProperty({ description: 'Activity level', enum: ActivityLevel })
  @IsEnum(ActivityLevel)
  @IsNotEmpty()
  activity_level!: ActivityLevel;

  @ApiProperty({ description: 'Body fat percentage' })
  @IsNumber()
  @IsOptional()
  body_fat_percentages?: number;

  @ApiProperty({ description: 'Body fat calculating method', enum: BFPCalculatingMethod })
  @IsEnum(BFPCalculatingMethod)
  @IsOptional()
  body_fat_calculating_method?: BFPCalculatingMethod;

  @ApiProperty({ description: 'Basal metabolic rate' })
  @IsNumber()
  @IsOptional()
  bmr?: number;

  @ApiProperty({ description: 'Body mass index' })
  @IsNumber()
  @IsOptional()
  bmi?: number;

  @ApiProperty({ description: 'Creation date' })
  @IsOptional()
  @IsDateString()
  @TransformToISODate()
  created_at?: Date;

  @ApiProperty({ description: 'Total Daily Energy Expenditure' })
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
