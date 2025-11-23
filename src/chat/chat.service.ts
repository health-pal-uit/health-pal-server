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

  async isUserInSession(userId: string, sessionId: string) {
    const participant = await this.chatParticipantRepository.findOne({
      relations: ['user', 'chat_session'],
      where: { user: { id: userId }, chat_session: { id: sessionId } },
    });
    return !!participant;
  }

  async getSessionMessages(sessionId: string, limit: number = 50) {
    const messages = await this.chatMessageRepository.find({
      where: { chat_session: { id: sessionId } },
      relations: ['user', 'chat_session'],
      order: { created_at: 'DESC' }, // Newest first for chat history
      take: limit,
    });
    return messages.reverse(); // Reverse to show oldest to newest
  }

  async saveMessage(userId: string, sessionId: string, content: string) {
    console.log(
      '[ChatService] Saving message - userId:',
      userId,
      'sessionId:',
      sessionId,
      'content:',
      content,
    );

    const message = this.chatMessageRepository.create({
      user: { id: userId },
      chat_session: { id: sessionId },
      content,
    });

    const saved = await this.chatMessageRepository.save(message);

    // return with relations loaded
    return this.chatMessageRepository.findOne({
      where: { id: saved.id },
      relations: ['user', 'chat_session'],
    });
  }
}
