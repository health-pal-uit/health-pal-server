import { ApiProperty } from '@nestjs/swagger';
import {
  IsArray,
  IsDateString,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsUUID,
} from 'class-validator';
import { RecordType } from 'src/helpers/enums/record-type.enum';
import { TransformToISODate } from 'src/helpers/transformers/date.transformer';
import { Check } from 'typeorm';

export class CreateActivityRecordDto {
  @ApiProperty({ example: 10, description: 'Number of repetitions' })
  @IsOptional()
  @IsNumber()
  reps?: number;

  @ApiProperty({ example: 1, description: 'Number of hours' })
  @IsOptional()
  @IsNumber()
  hours?: number;

  @ApiProperty({ example: 100, description: 'Calories burned' })
  @IsOptional()
  @IsNumber()
  kcal_burned?: number;

  @ApiProperty({ example: 60, description: 'Resting heart rate' })
  @IsNumber()
  rhr: number;

  @ApiProperty({ example: 70, description: 'Average heart rate' })
  @IsNumber()
  ahr: number;

  @ApiProperty({ example: 'daily', description: 'Type of activity record', enum: RecordType })
  @IsNotEmpty()
  @IsEnum(RecordType)
  type: RecordType;

  @ApiProperty({ example: 3, description: 'Intensity level from 1 to 5' })
  @Check('intensity_level >= 1 AND intensity_level <= 5')
  @IsNumber()
  intensity_level: number;

  @ApiProperty({ example: '2023-01-01', description: 'Creation date' })
  @TransformToISODate()
  @IsOptional()
  @IsDateString()
  created_at: Date;

  // relations => 2

  @IsArray()
  @IsUUID('4')
  @IsNotEmpty()
  @ApiProperty({ required: false, description: 'IDs of the related entities', example: ['uuid'] })
  activity_id: string;

  @IsUUID('4')
  @IsOptional()
  @ApiProperty({ example: 'uuid', description: 'ID of the related daily log' })
  daily_log_id: string | null;

  @IsUUID('4')
  @IsOptional()
  @ApiProperty({ required: false, example: 'uuid', description: 'ID of the related challenge' })
  challenge_id: string | null;

  @IsUUID('4')
  @IsOptional()
  @ApiProperty({ required: false, example: 'uuid', description: 'ID of the related fitness goal' })
  goal_id: string | null;
}
