import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ChatMessage } from 'src/chat_messages/entities/chat_message.entity';
import { ChatParticipant } from 'src/chat_participants/entities/chat_participant.entity';
import { ChatSession } from 'src/chat_sessions/entities/chat_session.entity';
import { Repository } from 'typeorm';

@Injectable()
export class ChatService {
  constructor(
    @InjectRepository(ChatSession) private chatSessionRepository: Repository<ChatSession>,
    @InjectRepository(ChatParticipant)
    private chatParticipantRepository: Repository<ChatParticipant>,
    @InjectRepository(ChatMessage) private chatMessageRepository: Repository<ChatMessage>,
  ) {}
}
