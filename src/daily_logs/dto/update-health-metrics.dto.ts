import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsInt, IsNumber, IsOptional, Max, Min } from 'class-validator';

export class UpdateHealthMetricsDto {
  @ApiPropertyOptional({ description: 'Average heart rate in BPM', example: 72 })
  @IsOptional()
  @Transform(({ value }) => (value != null ? Number(value) : value))
  @IsInt()
  @Min(30)
  @Max(250)
  avg_heart_rate_bpm?: number;

  @ApiPropertyOptional({ description: 'Resting heart rate in BPM', example: 60 })
  @IsOptional()
  @Transform(({ value }) => (value != null ? Number(value) : value))
  @IsInt()
  @Min(30)
  @Max(250)
  resting_heart_rate_bpm?: number;

  @ApiPropertyOptional({ description: 'Sleep duration in hours', example: 7.5 })
  @IsOptional()
  @Transform(({ value }) => (value != null ? Number(value) : value))
  @IsNumber()
  @Min(0)
  @Max(24)
  sleep_duration_hours?: number;

  @ApiPropertyOptional({
    description: 'Sleep quality score from 1 (very poor) to 5 (excellent)',
    example: 4,
  })
  @IsOptional()
  @Transform(({ value }) => (value != null ? Number(value) : value))
  @IsInt()
  @Min(1)
  @Max(5)
  sleep_quality?: number;
}
