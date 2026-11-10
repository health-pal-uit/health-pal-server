import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional } from 'class-validator';

export enum FoodRecognitionPolicy {
  P0 = 'P0',
  P1 = 'P1',
  P2 = 'P2',
}

export class RecognizeFoodDto {
  @ApiPropertyOptional({ enum: FoodRecognitionPolicy, default: FoodRecognitionPolicy.P1 })
  @IsOptional()
  @IsEnum(FoodRecognitionPolicy)
  policy: FoodRecognitionPolicy = FoodRecognitionPolicy.P1;
}
