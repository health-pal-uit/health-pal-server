import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsEnum, IsNotEmpty, IsOptional, IsUUID } from 'class-validator';
import { VideoCallStatus } from '../entities/video_call.entity';
import { TransformToISODate } from 'src/helpers/transformers/date.transformer';

export class CreateVideoCallDto {
  @ApiProperty({ example: 'uuid', description: 'Consultation ID', required: false })
  @IsOptional()
  @IsUUID('4')
  consultation_id?: string;

  @ApiProperty({ example: 'uuid', description: 'Patient user ID' })
  @IsNotEmpty()
  @IsUUID('4')
  patient_id: string;

  @ApiProperty({ example: 'uuid', description: 'Expert ID' })
  @IsNotEmpty()
  @IsUUID('4')
  expert_id: string;

  @ApiProperty({ enum: VideoCallStatus, required: false })
  @IsOptional()
  @IsEnum(VideoCallStatus)
  status?: VideoCallStatus;

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
}
