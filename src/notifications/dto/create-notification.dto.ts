import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsDateString, IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator';
import { TransformToISODate } from 'src/helpers/transformers/date.transformer';
import { User } from 'src/users/entities/user.entity';

export class CreateNotificationDto {
  @ApiProperty({ example: 'This is a notification', description: 'Content of the notification' })
  @IsNotEmpty()
  @IsString()
  content: string;

  @ApiProperty({ example: 'Notification Title', description: 'Title of the notification' })
  @IsNotEmpty()
  @IsString()
  title: string;

  // @ApiProperty({ example: false, description: 'Indicates if the notification is read' })
  // @IsOptional()
  // @IsBoolean()
  // is_read?: boolean;

  // @ApiProperty({
  //   example: '2023-01-01T00:00:00Z',
  //   description: 'Creation date of the notification',
  // })
  // @IsOptional()
  // @IsDateString()
  // @TransformToISODate()
  // created_at?: Date;

  // relations => 1
  @IsUUID('4')
  @IsNotEmpty()
  @ApiProperty({ example: 'uuid', description: 'User ID' })
  user_id!: string;
}
