import { Injectable } from '@nestjs/common';
import { CreateChatParticipantDto } from './dto/create-chat_participant.dto';
import { UpdateChatParticipantDto } from './dto/update-chat_participant.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { ChatParticipant } from './entities/chat_participant.entity';
import { Equal, Repository } from 'typeorm';
import { User } from 'src/users/entities/user.entity';
import { ChatSession } from 'src/chat_sessions/entities/chat_session.entity';
import { DeleteResult } from 'typeorm';

@Injectable()
export class ChatParticipantsService {
  constructor(
    @InjectRepository(ChatParticipant)
    private chatParticipantRepository: Repository<ChatParticipant>,
    @InjectRepository(User) private usersRepository: Repository<User>,
    @InjectRepository(ChatSession) private chatSessionRepository: Repository<ChatSession>,
  ) {}

  async create(createChatParticipantDto: CreateChatParticipantDto): Promise<ChatParticipant> {
    const user = await this.usersRepository.findOneBy({ id: createChatParticipantDto.user_id });
    const chatSession = await this.chatSessionRepository.findOneBy({
      id: createChatParticipantDto.chat_session_id,
    });
    if (!user || !chatSession) {
      throw new Error('User or Chat Session not found');
    }
    const chatParticipant = this.chatParticipantRepository.create(createChatParticipantDto);
    chatParticipant.user = user!;
    chatParticipant.chat_session = chatSession!;
    return await this.chatParticipantRepository.save(chatParticipant);
  }

  async findBySession(sessionId: string): Promise<ChatParticipant[]> {
    return await this.chatParticipantRepository.find({
      where: { chat_session: { id: sessionId } },
      relations: ['user', 'chat_session'],
    });
  }

  async update(
    id: string,
    updateChatParticipantDto: UpdateChatParticipantDto,
  ): Promise<ChatParticipant | null> {
    await this.chatParticipantRepository.update(id, updateChatParticipantDto);
    return this.findOne(id);
  }

  async findAll(): Promise<ChatParticipant[]> {
    return await this.chatParticipantRepository.find();
  }

  async findAllUser(user_id: string): Promise<ChatParticipant[]> {
    return await this.chatParticipantRepository.find({
      where: { user: { id: Equal(user_id) } },
      relations: ['chat_session'],
    });
  }

  async findOne(id: string): Promise<ChatParticipant | null> {
    return await this.chatParticipantRepository.findOne({
      where: { id },
      relations: ['user', 'chat_session'],
    });
  }

  // async update(id: string, updateChatParticipantDto: UpdateChatParticipantDto) : Promise<ChatParticipant | null> {
  //   await this.chatParticipantRepository.update(id, updateChatParticipantDto);
  //   return this.findOne(id);
  // }

  async remove(id: string): Promise<DeleteResult> {
    return await this.chatParticipantRepository.delete(id);
  }
}
