import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsNotEmpty, IsNumber, isNumber, IsOptional, IsUUID } from 'class-validator';
import { TransformToISODate } from 'src/helpers/transformers/date.transformer';

export class CreateDailyLogDto {
  @ApiProperty({ description: 'Date of the daily log' })
  @IsDateString()
  @TransformToISODate()
  date: Date;

  @ApiProperty({ description: 'Total calories consumed on the daily log' })
  @IsOptional()
  @IsNumber()
  total_kcal?: number;

  @ApiProperty({ description: 'Total protein consumed on the daily log' })
  @IsOptional()
  @IsNumber()
  total_protein_gr?: number;

  @ApiProperty({ description: 'Total fat consumed on the daily log' })
  @IsOptional()
  @IsNumber()
  total_fat_gr?: number;

  @ApiProperty({ description: 'Total carbohydrates consumed on the daily log' })
  @IsOptional()
  @IsNumber()
  total_carbs_gr?: number;

  @ApiProperty({ description: 'Total fiber consumed on the daily log' })
  @IsOptional()
  @IsNumber()
  total_fiber_gr?: number;

  @ApiProperty({ description: 'Total water consumed on the daily log' })
  @IsOptional()
  @IsNumber()
  water_drank_l?: number;

  @ApiProperty({ description: 'Date when the daily log was last updated' })
  @IsOptional()
  @IsDateString()
  @TransformToISODate()
  updated_at?: Date;

  // relations => 1

  @ApiProperty({ description: 'ID of the user who owns the daily log' })
  @IsNotEmpty()
  @IsUUID('4')
  user_id!: string;

  // reflects
  @ApiProperty({
    description: 'IDs of the daily ingredients associated with the daily log',
    type: [String],
  })
  @IsOptional()
  @IsUUID('4', { each: true })
  daily_ingre_ids?: string[];

  @ApiProperty({
    description: 'IDs of the daily meals associated with the daily log',
    type: [String],
  })
  @IsOptional()
  @IsUUID('4', { each: true })
  daily_meal_ids?: string[];

  @ApiProperty({
    description: 'IDs of the activity records associated with the daily log',
    type: [String],
  })
  @IsOptional()
  @IsUUID('4', { each: true })
  activity_record_ids?: string[];
}
