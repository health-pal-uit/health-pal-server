import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsDateString, IsNotEmpty, IsOptional, IsUUID } from 'class-validator';
import { TransformToISODate } from 'src/helpers/transformers/date.transformer';

export class CreateChatParticipantDto {
  @ApiProperty({ description: 'is admin?', default: false })
  @IsOptional()
  @IsBoolean()
  is_admin?: boolean;

  @ApiProperty({ description: 'joined at', default: () => 'CURRENT_TIMESTAMP' })
  @IsOptional()
  @IsDateString()
  @TransformToISODate()
  joined_at?: Date;

  @ApiProperty({ description: 'chat session id' })
  @IsNotEmpty()
  @IsUUID('4')
  chat_session_id!: string;

  @ApiProperty({ description: 'user id' })
  @IsNotEmpty()
  @IsUUID('4')
  user_id!: string;
}
