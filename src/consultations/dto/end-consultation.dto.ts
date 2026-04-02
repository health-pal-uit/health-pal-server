import { IsEnum, IsNotEmpty, IsOptional, IsNumber, IsString, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { ConsultationStatus } from '../entities/consultation.entity';

export class EndConsultationDto {
  @ApiProperty({ enum: ConsultationStatus, required: false })
  @IsOptional()
  @IsEnum(ConsultationStatus)
  status?: ConsultationStatus;

  @ApiProperty({ example: 60, required: false })
  @IsOptional()
  @IsNumber()
  @Min(0)
  duration_minutes?: number;

  @ApiProperty({ example: 150, required: false })
  @IsOptional()
  @IsNumber()
  @Min(0)
  tokens_charged?: number;

  @ApiProperty({
    example: 'Consultation completed successfully. Patient has improved symptoms.',
    required: false,
  })
  @IsOptional()
  @IsString()
  result?: string;
}
