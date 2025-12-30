import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator';
import { TransformToISODate } from 'src/helpers/transformers/date.transformer';

export class CreateDeviceDto {
  @ApiProperty({ example: 'device-uuid', description: 'Device unique identifier' })
  @IsNotEmpty()
  @IsString()
  device_id!: string;

  @ApiProperty({ example: 'push-token', description: 'Push notification token' })
  @IsNotEmpty()
  @IsString()
  push_token!: string;

  @ApiProperty({ example: '2023-01-01T00:00:00Z', description: 'Last active date of the device' })
  @IsOptional()
  @IsDateString()
  @TransformToISODate()
  last_active_at?: Date;

  @ApiProperty({ example: '2023-01-01T00:00:00Z', description: 'Creation date of the device' })
  @IsOptional()
  @IsDateString()
  @TransformToISODate()
  created_at?: Date;

  // relations => 1
  @ApiProperty({
    example: 'user-uuid',
    description: 'ID of the user owning the device',
    required: false,
  })
  @IsOptional()
  @IsUUID('4')
  user_id?: string;
}
