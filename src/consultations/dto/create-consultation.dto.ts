import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  IsDateString,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsUUID,
  Min,
} from 'class-validator';
import { ConsultationStatus } from '../entities/consultation.entity';
import { TransformToISODate } from 'src/helpers/transformers/date.transformer';

export class CreateConsultationDto {
  @ApiProperty({ example: 'uuid', description: 'Booking ID' })
  @IsNotEmpty()
  @IsUUID('4')
  booking_id: string;

  @ApiProperty({ example: 'uuid', description: 'Expert ID conducting consultation' })
  @IsNotEmpty()
  @IsUUID('4')
  expert_id: string;

  @ApiProperty({ example: 'uuid', description: 'Linked chat session ID', required: false })
  @IsOptional()
  @IsUUID('4')
  chat_session_id?: string;

  @ApiProperty({ enum: ConsultationStatus, required: false })
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
  @Transform(({ value }) => (value !== undefined ? Number(value) : value))
  @IsNumber()
  @Min(0)
  duration_minutes?: number;

  @ApiProperty({ example: 50, required: false })
  @IsOptional()
  @Transform(({ value }) => (value !== undefined ? Number(value) : value))
  @IsNumber()
  @Min(0)
  tokens_charged?: number;
}
