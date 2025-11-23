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
import { SupabaseStorageService } from 'src/supabase-storage/supabase-storage.service';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class ChatMessagesService {
  constructor(
    @InjectRepository(ChatMessage) private chatMessagesRepository: Repository<ChatMessage>,
    @InjectRepository(ChatSession) private chatSessionsRepository: Repository<ChatSession>,
    @InjectRepository(User) private usersRepository: Repository<User>,
    private readonly supabaseStorageService: SupabaseStorageService,
    private readonly configService: ConfigService,
  ) {}

  async findBySession(
    sessionId: string,
    page: number = 1,
    limit: number = 10,
  ): Promise<ChatMessage[]> {
    const skip = (page - 1) * limit;
    return await this.chatMessagesRepository.find({
      where: { chat_session: { id: sessionId } },
      order: { created_at: 'ASC' },
      relations: ['user', 'chat_session'],
      skip,
      take: limit,
    });
  }

  async create(
    createChatMessageDto: CreateChatMessageDto,
    fileBuffer?: Buffer,
    fileName?: string,
  ): Promise<ChatMessage> {
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
    const chatMessageBucket = this.configService.get<string>('CHAT_IMG_BUCKET_NAME') || 'chat-imgs';
    if (fileBuffer && fileName) {
      const imageUrl = await this.supabaseStorageService.uploadImageFromBuffer(
        fileBuffer,
        fileName,
        chatMessageBucket,
      );
      chatMessage.media_url = imageUrl ?? undefined;
    }
    return await this.chatMessagesRepository.save(chatMessage);
  }

  async findAll(page: number = 1, limit: number = 10): Promise<ChatMessage[]> {
    const skip = (page - 1) * limit;
    return await this.chatMessagesRepository.find({
      skip,
      take: limit,
    });
  }

  async findAllUser(userId: string, page: number = 1, limit: number = 10): Promise<ChatMessage[]> {
    const skip = (page - 1) * limit;
    return await this.chatMessagesRepository.find({
      where: { user: { id: Equal(userId) } },
      skip,
      take: limit,
    });
  }

  async findOne(id: string): Promise<ChatMessage | null> {
    return await this.chatMessagesRepository.findOne({ where: { id } });
  }

  async update(
    id: string,
    updateChatMessageDto: UpdateChatMessageDto,
    imageBuffer?: Buffer,
    imageName?: string,
  ): Promise<UpdateResult> {
    const result = await this.chatMessagesRepository.update(id, updateChatMessageDto);
    if (imageBuffer && imageName) {
      const chatMessage = await this.chatMessagesRepository.findOne({ where: { id } });
      if (chatMessage) {
        const chatMessageBucket =
          this.configService.get<string>('CHAT_IMG_BUCKET_NAME') || 'chat-imgs';
        chatMessage.media_url =
          (await this.supabaseStorageService.uploadImageFromBuffer(
            imageBuffer,
            imageName,
            chatMessageBucket,
          )) || chatMessage.media_url;
        await this.chatMessagesRepository.save(chatMessage);
      }
    }
    return result;
  }

  async remove(id: string): Promise<DeleteResult> {
    return await this.chatMessagesRepository.delete(id);
  }
}
