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
    // Validate user exists
    const user = await this.usersRepository.findOneBy({ id: createChatParticipantDto.user_id });
    if (!user) {
      throw new Error(`User with ID ${createChatParticipantDto.user_id} not found`);
    }

    // Validate chat session exists
    const chatSession = await this.chatSessionRepository.findOneBy({
      id: createChatParticipantDto.chat_session_id,
    });
    if (!chatSession) {
      throw new Error(`Chat Session with ID ${createChatParticipantDto.chat_session_id} not found`);
    }

    // Check if user is already a participant
    const existingParticipant = await this.chatParticipantRepository.findOne({
      where: {
        user: { id: createChatParticipantDto.user_id },
        chat_session: { id: createChatParticipantDto.chat_session_id },
      },
    });

    if (existingParticipant) {
      throw new Error('User is already a participant in this chat session');
    }

    // Create the participant
    const chatParticipant = this.chatParticipantRepository.create(createChatParticipantDto);
    chatParticipant.user = user;
    chatParticipant.chat_session = chatSession;
    return await this.chatParticipantRepository.save(chatParticipant);
  }

  async isUserAdminOfSession(userId: string, chatSessionId: string): Promise<boolean> {
    const participant = await this.chatParticipantRepository.findOne({
      where: {
        user: { id: userId },
        chat_session: { id: chatSessionId },
      },
    });
    return participant?.is_admin ?? false;
  }

  async findBySession(
    sessionId: string,
    page: number = 1,
    limit: number = 10,
  ): Promise<ChatParticipant[]> {
    const skip = (page - 1) * limit;
    return await this.chatParticipantRepository.find({
      where: { chat_session: { id: sessionId } },
      relations: ['user', 'chat_session'],
      skip,
      take: limit,
    });
  }

  async update(
    id: string,
    updateChatParticipantDto: UpdateChatParticipantDto,
  ): Promise<ChatParticipant | null> {
    await this.chatParticipantRepository.update(id, updateChatParticipantDto);
    return this.findOne(id);
  }

  async findAll(page: number = 1, limit: number = 10): Promise<ChatParticipant[]> {
    const skip = (page - 1) * limit;
    return await this.chatParticipantRepository.find({
      skip,
      take: limit,
    });
  }

  async findAllUser(
    user_id: string,
    page: number = 1,
    limit: number = 10,
  ): Promise<ChatParticipant[]> {
    const skip = (page - 1) * limit;
    return await this.chatParticipantRepository.find({
      where: { user: { id: Equal(user_id) } },
      relations: ['chat_session'],
      skip,
      take: limit,
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
