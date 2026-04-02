import { ApiProperty } from '@nestjs/swagger';
import {
  IsDateString,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Min,
} from 'class-validator';
import { ConsultationStatus } from '../entities/consultation.entity';
import { TransformToISODate } from 'src/helpers/transformers/date.transformer';

export class CreateMyConsultationDto {
  @ApiProperty({ example: 'uuid', description: 'Booking ID (must be your booking as expert)' })
  @IsNotEmpty()
  @IsUUID('4')
  booking_id: string;

  @ApiProperty({ example: 'uuid', description: 'Linked chat session ID', required: false })
  @IsOptional()
  @IsUUID('4')
  chat_session_id?: string;

  @ApiProperty({ enum: ConsultationStatus, required: false, default: ConsultationStatus.SCHEDULED })
  @IsOptional()
  @IsEnum(ConsultationStatus)
  status?: ConsultationStatus;

  @ApiProperty({ example: '2026-03-21T09:00:00Z', required: false })
  @IsOptional()
  @IsDateString()
  @TransformToISODate()
  started_at?: Date;

  @ApiProperty({ example: '2026-03-21T09:30:00Z', required: false })
  @IsOptional()
  @IsDateString()
  @TransformToISODate()
  ended_at?: Date;

  @ApiProperty({ example: 30, required: false })
  @IsOptional()
  @IsNumber()
  @Min(0)
  duration_minutes?: number;

  @ApiProperty({ example: 50, required: false })
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
