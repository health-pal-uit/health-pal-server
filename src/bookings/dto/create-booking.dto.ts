import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsEnum, IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator';
import { BookingCallType, BookingStatus } from '../entities/booking.entity';
import { TransformToISODate } from 'src/helpers/transformers/date.transformer';

export class CreateBookingDto {
  @ApiProperty({ example: 'uuid', description: 'Expert ID' })
  @IsNotEmpty()
  @IsUUID('4')
  expert_id: string;

  @ApiProperty({ example: 'uuid', description: 'Client user ID' })
  @IsNotEmpty()
  @IsUUID('4')
  client_id: string;

  @ApiProperty({ enum: BookingCallType, required: false })
  @IsOptional()
  @IsEnum(BookingCallType)
  call_type?: BookingCallType;

  @ApiProperty({ enum: BookingStatus, required: false })
  @IsOptional()
  @IsEnum(BookingStatus)
  status?: BookingStatus;

  @ApiProperty({ example: '2026-03-21T09:00:00Z', description: 'Planned consultation time' })
  @IsNotEmpty()
  @IsDateString()
  @TransformToISODate()
  scheduled_at: Date;

  @ApiProperty({ example: 'Need help with my meal plan', required: false })
  @IsOptional()
  @IsString()
  client_note?: string;
}
