import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsIn, IsISO8601, IsOptional } from 'class-validator';

export class AdminReportQueryDto {
  @ApiPropertyOptional({
    description: 'Metric to report. "overview" returns several key metrics.',
    enum: ['overview', 'users', 'posts', 'daily_logs', 'challenges', 'premium_packages'],
    default: 'overview',
  })
  @IsOptional()
  @IsIn(['overview', 'users', 'posts', 'daily_logs', 'challenges', 'premium_packages'])
  metric?: 'overview' | 'users' | 'posts' | 'daily_logs' | 'challenges' | 'premium_packages';

  @ApiPropertyOptional({
    description: 'Date range start (ISO8601). Defaults to 30 days ago.',
    example: '2025-11-01',
  })
  @IsOptional()
  @IsISO8601()
  start_date?: string;

  @ApiPropertyOptional({
    description: 'Date range end (ISO8601). Defaults to now.',
    example: '2025-11-27',
  })
  @IsOptional()
  @IsISO8601()
  end_date?: string;

  @ApiPropertyOptional({
    description: 'Aggregation bucket size',
    enum: ['day', 'week', 'month'],
    default: 'day',
  })
  @IsOptional()
  @IsIn(['day', 'week', 'month'])
  segment?: 'day' | 'week' | 'month';
}
