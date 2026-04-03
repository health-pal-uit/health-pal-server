import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsArray,
  IsDateString,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Max,
  Min,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export enum FitnessSyncSource {
  HEALTH_CONNECT = 'health_connect',
  GOOGLE_FIT = 'google_fit',
}

export enum FitnessSyncRecordType {
  STEPS = 'steps',
  DISTANCE = 'distance',
  ACTIVE_CALORIES = 'active_calories',
  HEART_RATE = 'heart_rate',
  EXERCISE_SESSION = 'exercise_session',
}

export class SyncFitnessRecordDto {
  @ApiProperty({ enum: FitnessSyncSource, example: FitnessSyncSource.HEALTH_CONNECT })
  @IsEnum(FitnessSyncSource)
  source: FitnessSyncSource;

  @ApiProperty({
    enum: FitnessSyncRecordType,
    example: FitnessSyncRecordType.STEPS,
  })
  @IsEnum(FitnessSyncRecordType)
  record_type: FitnessSyncRecordType;

  @ApiProperty({ example: 'hc:steps:1743705600:1743791999' })
  @IsString()
  external_record_id: string;

  @ApiPropertyOptional({ example: 'walking' })
  @IsOptional()
  @IsString()
  exercise_type?: string;

  @ApiPropertyOptional({ example: '2026-04-03T00:00:00.000Z' })
  @IsOptional()
  @IsDateString()
  start_time?: string;

  @ApiPropertyOptional({ example: '2026-04-03T23:59:59.000Z' })
  @IsOptional()
  @IsDateString()
  end_time?: string;

  @ApiPropertyOptional({ example: '2026-04-03T23:59:59.000Z' })
  @IsOptional()
  @IsDateString()
  recorded_at?: string;

  @ApiPropertyOptional({ example: 45 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  duration_minutes?: number;

  @ApiPropertyOptional({ example: 8200 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  steps_count?: number;

  @ApiPropertyOptional({ example: 6120 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  distance_meters?: number;

  @ApiPropertyOptional({ example: 350.5 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  active_calories_kcal?: number;

  @ApiPropertyOptional({ example: 126 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  avg_heart_rate_bpm?: number;

  @ApiPropertyOptional({ example: 3 })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(5)
  intensity_level?: number;

  @ApiPropertyOptional({ example: 'A3B4-C5D6' })
  @IsOptional()
  @IsString()
  device_id?: string;

  @ApiPropertyOptional({ example: 'Asia/Ho_Chi_Minh' })
  @IsOptional()
  @IsString()
  timezone?: string;
}

export class SyncFitnessRecordsBatchDto {
  @ApiProperty({ type: [SyncFitnessRecordDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SyncFitnessRecordDto)
  records: SyncFitnessRecordDto[];
}

export class SyncFitnessByIdDto {
  @ApiProperty({ format: 'uuid' })
  @IsUUID()
  user_id: string;

  @ApiProperty({ type: [SyncFitnessRecordDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SyncFitnessRecordDto)
  records: SyncFitnessRecordDto[];
}
