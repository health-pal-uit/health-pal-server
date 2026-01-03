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
import { NotificationsService } from 'src/notifications/notifications.service';

@Injectable()
export class ChatMessagesService {
  constructor(
    @InjectRepository(ChatMessage) private chatMessagesRepository: Repository<ChatMessage>,
    @InjectRepository(ChatSession) private chatSessionsRepository: Repository<ChatSession>,
    @InjectRepository(User) private usersRepository: Repository<User>,
    private readonly supabaseStorageService: SupabaseStorageService,
    private readonly configService: ConfigService,
    private readonly notificationsService: NotificationsService,
  ) {}

  async findBySession(
    sessionId: string,
    page: number = 1,
    limit: number = 10,
  ): Promise<{ data: ChatMessage[]; total: number; page: number; limit: number }> {
    const skip = (page - 1) * limit;
    const [data, total] = await this.chatMessagesRepository.findAndCount({
      where: { chat_session: { id: sessionId } },
      order: { created_at: 'ASC' },
      relations: ['user', 'chat_session'],
      skip,
      take: limit,
    });
    return { data, total, page, limit };
  }

  async findRecentBySession(
    sessionId: string,
    limit: number = 50,
  ): Promise<{ data: ChatMessage[]; total: number }> {
    const [allMessages, total] = await this.chatMessagesRepository.findAndCount({
      where: { chat_session: { id: sessionId } },
      order: { created_at: 'DESC' },
      relations: ['user', 'chat_session'],
      take: limit,
    });
    // Reverse to get oldest -> newest for display
    return { data: allMessages.reverse(), total };
  }

  async create(
    createChatMessageDto: CreateChatMessageDto,
    fileBuffer?: Buffer,
    fileName?: string,
  ): Promise<ChatMessage> {
    const chatSession = await this.chatSessionsRepository.findOne({
      where: { id: createChatMessageDto.chat_session_id },
      relations: ['participants', 'participants.user'],
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
    const savedMessage = await this.chatMessagesRepository.save(chatMessage);

    // notify other chat participants about new message
    const otherParticipants = chatSession.participants.filter((p) => p.user.id !== user.id);
    for (const participant of otherParticipants) {
      const messagePreview = createChatMessageDto.content?.substring(0, 50) || '📎 Sent a file';
      await this.notificationsService.notifyNewMessage(
        participant.user.id,
        user.fullname || user.email,
        messagePreview,
      );
    }

    return savedMessage;
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
  ): Promise<ChatMessage | null> {
    const chatMessage = await this.chatMessagesRepository.findOne({ where: { id } });
    if (!chatMessage) {
      return null;
    }

    const updated = this.chatMessagesRepository.merge(chatMessage, updateChatMessageDto);

    if (imageBuffer && imageName) {
      const chatMessageBucket =
        this.configService.get<string>('CHAT_IMG_BUCKET_NAME') || 'chat-imgs';
      updated.media_url =
        (await this.supabaseStorageService.uploadImageFromBuffer(
          imageBuffer,
          imageName,
          chatMessageBucket,
        )) || updated.media_url;
    }

    return await this.chatMessagesRepository.save(updated);
  }

  async remove(id: string): Promise<ChatMessage | null> {
    if (!id || id === 'undefined') {
      return null;
    }
    const chatMessage = await this.chatMessagesRepository.findOne({ where: { id } });
    if (!chatMessage) {
      return null;
    }
    await this.chatMessagesRepository.softDelete(id);
    return this.chatMessagesRepository
      .createQueryBuilder('message')
      .where('message.id = :id', { id })
      .withDeleted()
      .getOne();
  }
}
