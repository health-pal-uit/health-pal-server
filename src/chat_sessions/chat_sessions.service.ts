import { Injectable } from '@nestjs/common';
import { CreateChatSessionDto } from './dto/create-chat_session.dto';
import { UpdateChatSessionDto } from './dto/update-chat_session.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { ChatSession } from './entities/chat_session.entity';
import { IsNull, Repository } from 'typeorm';
import { User } from 'src/users/entities/user.entity';
import { UpdateResult } from 'typeorm';
import { DeleteResult } from 'typeorm';
import { ChatParticipant } from 'src/chat_participants/entities/chat_participant.entity';
import { Equal } from 'typeorm';

@Injectable()
export class ChatSessionsService {
  constructor(
    @InjectRepository(ChatSession) private chatSessionRepository: Repository<ChatSession>,
    @InjectRepository(User) private userRepository: Repository<User>,
    @InjectRepository(ChatParticipant)
    private chatParticipantRepository: Repository<ChatParticipant>,
  ) {}

  async create(createChatSessionDto: CreateChatSessionDto, user_id: string): Promise<ChatSession> {
    if (createChatSessionDto.is_group === false) {
      const otherUserId = createChatSessionDto.participant_ids?.find((id) => id !== user_id);
      if (!otherUserId) {
        throw new Error('Invalid participant IDs');
      }
      const otherUser = await this.userRepository.findOneBy({ id: otherUserId });
      createChatSessionDto.title = otherUser ? otherUser.fullname : 'Unknown User';
    }
    const chatSession = this.chatSessionRepository.create(createChatSessionDto);
    return this.chatSessionRepository.save(chatSession);
  }

  // create(createChatSessionDto: CreateChatSessionDto) {
  //   const payload: Partial<ChatSession> = {
  //     ...createChatSessionDto,
  //     title: createChatSessionDto.title === null ? undefined : createChatSessionDto.title,
  //   };
  //   const chatSession = this.chatSessionRepository.create(payload);
  //   return this.chatSessionRepository.save(chatSession);
  // }

  async findAll(): Promise<ChatSession[]> {
    return await this.chatSessionRepository.find({
      relations: ['participants'],
      where: { deleted_at: IsNull() },
    });
  }

  async findUserAll(id: string): Promise<ChatSession[]> {
    // const allSessions = await this.chatSessionRepository.find({
    //   relations: ['participants'],
    // });
    // const userSessions = allSessions.filter(session => session.participants.map(p => p.id).includes(id));
    // return userSessions;
    return await this.chatSessionRepository.find({
      relations: ['participants', 'participants.user'],
      where: {
        participants: { user: { id: Equal(id) } },
        deleted_at: IsNull(),
      },
    });
  }

  async findOne(id: string): Promise<ChatSession | null> {
    return await this.chatSessionRepository.findOne({
      where: { id },
      relations: ['participants', 'participants.user'],
    });
  }

  async update(id: string, updateChatSessionDto: UpdateChatSessionDto): Promise<UpdateResult> {
    return this.chatSessionRepository.update(id, updateChatSessionDto);
  }

  async remove(id: string, user_id: string): Promise<DeleteResult> {
    const chatSession = await this.chatSessionRepository.findOne({
      where: { id },
      relations: ['participants'],
    });
    if (!chatSession) {
      throw new Error('Chat session not found');
    }
    const participant = chatSession.participants.find((p) => p.user.id === user_id);
    if (!participant) {
      throw new Error('User is not a participant of this chat session');
    }
    return await this.chatSessionRepository.softDelete(id);
  }
  async adminRemove(id: string): Promise<DeleteResult> {
    return await this.chatSessionRepository.softDelete(id);
  }
}
