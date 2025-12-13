import { ApiProperty } from '@nestjs/swagger';
import {
  IsBoolean,
  IsDateString,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';
import { ChatSessionStatus } from 'src/helpers/enums/chat-session-status.enum';
import { TransformToISODate } from 'src/helpers/transformers/date.transformer';

export class CreateChatSessionDto {
  @ApiProperty({ enum: ChatSessionStatus, description: 'Status of the chat session' })
  @IsEnum(ChatSessionStatus)
  @IsOptional()
  status?: ChatSessionStatus;

  @ApiProperty({ description: 'Title of the chat session' })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({ description: 'Is the chat session a group chat?' })
  @IsOptional()
  @IsBoolean()
  is_group?: boolean;

  @ApiProperty({ description: 'Creation date of the chat session' })
  @IsDateString()
  @IsOptional()
  @TransformToISODate()
  created_at?: Date;

  // relations

  // reflects
  @ApiProperty({
    type: [String],
    description: 'IDs of other participants to add (current user is added automatically)',
    required: false,
  })
  @IsUUID('4', { each: true })
  @IsNotEmpty({ each: true })
  @IsOptional()
  participant_ids?: string[];

  // messages: string[]; when creating no need to preknow messages?
}
