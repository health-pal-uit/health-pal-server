import { ApiProperty } from '@nestjs/swagger';
import {
  IsDateString,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUrl,
  IsUUID,
} from 'class-validator';
import { MessageType } from 'src/helpers/enums/message-type.enum';
import { TransformToISODate } from 'src/helpers/transformers/date.transformer';

export class CreateChatMessageDto {
  @ApiProperty({ description: 'Content of the chat message' })
  @IsNotEmpty()
  @IsString()
  content!: string;

  @ApiProperty({ enum: MessageType, description: 'Type of the message', required: false })
  @IsEnum(MessageType)
  @IsOptional()
  message_type?: MessageType;

  @ApiProperty({ description: 'URL of the media, if any', required: false })
  @IsUrl()
  @IsOptional()
  media_url?: string;

  @ApiProperty({ description: 'Timestamp of when the message was created' })
  @IsOptional()
  @IsDateString()
  @TransformToISODate()
  created_at?: Date;

  @ApiProperty({ description: 'ID of the chat session' })
  @IsNotEmpty()
  @IsUUID('4')
  chat_session_id!: string;

  @ApiProperty({ description: 'ID of the user sending the message' })
  @IsOptional()
  @IsUUID('4')
  user_id?: string; // will use current user id from auth token if not provided
}
