import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  IsBoolean,
  IsDateString,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsUUID,
  Min,
} from 'class-validator';
import { RecordType } from 'src/helpers/enums/record-type.enum';
import { TransformToISODate } from 'src/helpers/transformers/date.transformer';

export class CreateActivityRecordDto {
  @ApiProperty({ example: 10, description: 'Number of repetitions' })
  @IsOptional()
  @Transform(({ value }) => (value ? Number(value) : value))
  @IsNumber()
  @Min(0, { message: 'Repetitions must be positive' })
  reps?: number;

  @ApiProperty({ example: 1, description: 'Number of hours' })
  @IsOptional()
  @Transform(({ value }) => (value ? Number(value) : value))
  @IsNumber()
  @Min(0, { message: 'Duration must be positive' })
  hours?: number;

  @ApiProperty({ example: 100, description: 'Calories burned' })
  @IsOptional()
  @Transform(({ value }) => (value ? Number(value) : value))
  @IsNumber()
  kcal_burned?: number;

  // new fields
  @ApiProperty({ example: 50, description: 'Load in kilograms' })
  @IsOptional()
  @Transform(({ value }) => (value ? Number(value) : value))
  @IsNumber()
  load_kg?: number;

  @ApiProperty({ example: 5, description: 'Distance in kilometers' })
  @IsOptional()
  @Transform(({ value }) => (value ? Number(value) : value))
  @IsNumber()
  distance_km?: number;

  @ApiProperty({ example: 70, description: 'User weight in kilograms' })
  @IsOptional()
  @Transform(({ value }) => (value ? Number(value) : value))
  @IsNumber()
  user_weight_kg?: number;

  @ApiProperty({ example: true, description: 'Own by user?' })
  @IsOptional()
  @Transform(({ value }) => {
    if (value === 'true' || value === true) return true;
    if (value === 'false' || value === false) return false;
    return value;
  })
  @IsBoolean()
  user_owned?: boolean;
  // end new fields

  @ApiProperty({ example: 60, description: 'Resting heart rate' })
  @IsOptional()
  @Transform(({ value }) => (value ? Number(value) : value))
  @IsNumber()
  rhr?: number;

  @ApiProperty({ example: 70, description: 'Average heart rate' })
  @IsOptional()
  @Transform(({ value }) => (value ? Number(value) : value))
  @IsNumber()
  ahr?: number;

  @ApiProperty({ example: 'daily', description: 'Type of activity record', enum: RecordType })
  @IsOptional()
  @IsEnum(RecordType)
  type?: RecordType;

  @ApiProperty({ example: 3, description: 'Intensity level from 1 to 5' })
  @IsOptional()
  @Transform(({ value }) => (value ? Number(value) : value))
  @IsNumber()
  intensity_level?: number;

  @ApiProperty({ example: '2023-01-01', description: 'Creation date' })
  @TransformToISODate()
  @IsOptional()
  @IsDateString()
  created_at?: Date;

  // relations => 2

  @IsUUID('4')
  @IsNotEmpty()
  @ApiProperty({ description: 'ID of the related activity', example: 'uuid' })
  activity_id: string;

  @IsUUID('4')
  @IsOptional()
  @ApiProperty({ example: 'uuid', description: 'ID of the related daily log' })
  daily_log_id?: string | null;

  @IsUUID('4')
  @IsOptional()
  @ApiProperty({ required: false, example: 'uuid', description: 'ID of the related challenge' })
  challenge_id?: string | null;
}
