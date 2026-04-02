import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsNotEmpty, IsNumber, IsOptional, IsString, IsUUID, Max, Min } from 'class-validator';

export class RateMyConsultationDto {
  @ApiProperty({ example: 'uuid', description: 'Consultation ID being reviewed' })
  @IsNotEmpty()
  @IsUUID('4')
  consultation_id: string;

  @ApiProperty({ example: 5, description: 'Rating score 1-5' })
  @IsNotEmpty()
  @Transform(({ value }) => Number(value))
  @IsNumber()
  @Min(1)
  @Max(5)
  score: number;

  @ApiProperty({ example: 'Helpful session', required: false })
  @IsOptional()
  @IsString()
  comment?: string;
}
