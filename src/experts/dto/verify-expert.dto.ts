import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsOptional } from 'class-validator';

export class VerifyExpertDto {
  @ApiPropertyOptional({
    example: true,
    description: 'Verification state; defaults to true for approve endpoint',
  })
  @IsOptional()
  @IsBoolean()
  is_verified?: boolean;
}
