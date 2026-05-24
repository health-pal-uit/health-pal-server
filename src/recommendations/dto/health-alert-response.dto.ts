import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class HealthAlertDto {
  @ApiProperty({ example: 'high_heart_rate' })
  type: 'high_heart_rate' | 'short_sleep' | 'poor_sleep_quality';

  @ApiProperty({ example: 'Elevated resting heart rate detected over the last 5 days.' })
  message: string;

  @ApiProperty({ example: 5 })
  days_affected: number;

  @ApiPropertyOptional({ example: 95 })
  avg_value?: number;
}

export class SuggestedExpertDto {
  @ApiProperty()
  id: string;

  @ApiPropertyOptional()
  bio: string | null;

  @ApiProperty()
  rating_avg: number;

  @ApiProperty()
  token_per_minute: number;

  @ApiPropertyOptional()
  expert_role?: { name: string } | null;
}

export class HealthAlertResponseDto {
  @ApiProperty()
  has_alerts: boolean;

  @ApiProperty({ type: [HealthAlertDto] })
  alerts: HealthAlertDto[];

  @ApiProperty({ example: 'Your heart rate has been elevated recently...' })
  ai_message: string;

  @ApiProperty({ type: [SuggestedExpertDto] })
  suggested_experts: SuggestedExpertDto[];
}
