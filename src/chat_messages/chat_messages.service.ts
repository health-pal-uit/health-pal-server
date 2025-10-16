import { Injectable } from '@nestjs/common';
import { CreateChatMessageDto } from './dto/create-chat_message.dto';
import { UpdateChatMessageDto } from './dto/update-chat_message.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { ChatMessage } from './entities/chat_message.entity';
import { Equal, Repository } from 'typeorm';
import { ChatSession } from 'src/chat_sessions/entities/chat_session.entity';
import { User } from 'src/users/entities/user.entity';
import { UpdateResult } from 'typeorm';
import { DeleteResult } from 'typeorm';

@Injectable()
export class ChatMessagesService {
  constructor(
    @InjectRepository(ChatMessage) private chatMessagesRepository: Repository<ChatMessage>,
    @InjectRepository(ChatSession) private chatSessionsRepository: Repository<ChatSession>,
    @InjectRepository(User) private usersRepository: Repository<User>,
  ) {}

  async create(createChatMessageDto: CreateChatMessageDto) {
    const chatSession = await this.chatSessionsRepository.findOne({
      where: { id: createChatMessageDto.chat_session_id },
    });
    if (!chatSession) {
      throw new Error('Chat session not found');
    }
    const user = await this.usersRepository.findOne({
      where: { id: createChatMessageDto.user_id },
    });
    if (!user) {
      throw new Error('User not found');
    }
    const chatMessage = this.chatMessagesRepository.create(createChatMessageDto);
    chatMessage.user = user!;
    chatMessage.chat_session = chatSession!;
    return await this.chatMessagesRepository.save(chatMessage);
  }

  async findAll(): Promise<ChatMessage[]> {
    return await this.chatMessagesRepository.find();
  }

  async findAllUser(userId: string): Promise<ChatMessage[]> {
    return await this.chatMessagesRepository.find({ where: { user: { id: Equal(userId) } } });
  }

  async findOne(id: string): Promise<ChatMessage | null> {
    return await this.chatMessagesRepository.findOne({ where: { id } });
  }

  async update(id: string, updateChatMessageDto: UpdateChatMessageDto): Promise<UpdateResult> {
    return await this.chatMessagesRepository.update(id, updateChatMessageDto);
  }

  async remove(id: string): Promise<DeleteResult> {
    return await this.chatMessagesRepository.delete(id);
  }
}
