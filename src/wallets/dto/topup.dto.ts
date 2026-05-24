import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsPositive, Max, Min } from 'class-validator';

export class TopupDto {
  @ApiProperty({
    example: 100,
    description: 'Number of HPT tokens to add to wallet (simulated top-up, max 10 000 per request)',
  })
  @IsNumber()
  @IsPositive()
  @Min(1)
  @Max(10000)
  token_amount: number;
}
