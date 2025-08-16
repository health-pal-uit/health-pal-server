import { PartialType } from '@nestjs/mapped-types';
import { CreateChatSessionDto } from './create-chat_session.dto';

export class UpdateChatSessionDto extends PartialType(CreateChatSessionDto) {}
