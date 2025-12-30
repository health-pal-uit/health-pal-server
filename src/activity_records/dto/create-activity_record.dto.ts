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
import { RecordType } from 'src/helpers/enums/record-type.enum';
import { TransformToISODate } from 'src/helpers/transformers/date.transformer';

export class CreateActivityRecordDto {
  @ApiProperty({ example: 30, description: 'Duration in minutes' })
  @IsNotEmpty()
  @Transform(({ value }) => (value ? Number(value) : value))
  @IsNumber()
  @Min(0.1, { message: 'Duration must be positive' })
  duration_minutes!: number;

  @ApiProperty({ example: 3, description: 'Intensity level from 1 to 5' })
  @IsOptional()
  @Transform(({ value }) => (value ? Number(value) : value))
  @IsNumber()
  intensity_level?: number;

  @ApiProperty({ example: 60, description: 'Resting heart rate (optional, from fitness tracker)' })
  @IsOptional()
  @Transform(({ value }) => (value ? Number(value) : value))
  @IsNumber()
  rhr?: number;

  @ApiProperty({
    example: 140,
    description: 'Average heart rate during activity (optional, from fitness tracker)',
  })
  @IsOptional()
  @Transform(({ value }) => (value ? Number(value) : value))
  @IsNumber()
  ahr?: number;

  @ApiProperty({ example: 'daily', description: 'Type of activity record', enum: RecordType })
  @IsOptional()
  @IsEnum(RecordType)
  type?: RecordType;

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
