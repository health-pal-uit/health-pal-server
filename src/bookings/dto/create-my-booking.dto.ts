import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsEnum, IsOptional, IsString, IsUUID } from 'class-validator';
import { BookingCallType, BookingStatus } from '../entities/booking.entity';
import { TransformToISODate } from 'src/helpers/transformers/date.transformer';

export class CreateMyBookingDto {
  @ApiProperty({
    example: 'uuid',
    description: 'Expert ID (auto-filled if you are an expert, required if you are a user)',
    required: false,
  })
  @IsOptional()
  @IsUUID('4')
  expert_id?: string;

  @ApiProperty({
    example: 'uuid',
    description: 'Client user ID (auto-filled if you are a user, required if you are an expert)',
    required: false,
  })
  @IsOptional()
  @IsUUID('4')
  client_id?: string;

  @ApiProperty({ enum: BookingCallType, required: false })
  @IsOptional()
  @IsEnum(BookingCallType)
  call_type?: BookingCallType;

  @ApiProperty({ enum: BookingStatus, required: false, description: 'Only admins can set this' })
  @IsOptional()
  @IsEnum(BookingStatus)
  status?: BookingStatus;

  @ApiProperty({ example: '2026-03-21T09:00:00Z', description: 'Planned consultation time' })
  @IsDateString()
  @TransformToISODate()
  scheduled_at: Date;

  @ApiProperty({ example: 'Need help with my meal plan', required: false })
  @IsOptional()
  @IsString()
  client_note?: string;
}
