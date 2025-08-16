import { Injectable } from '@nestjs/common';
import { CreateChatParticipantDto } from './dto/create-chat_participant.dto';
import { UpdateChatParticipantDto } from './dto/update-chat_participant.dto';

@Injectable()
export class ChatParticipantsService {
  create(createChatParticipantDto: CreateChatParticipantDto) {
    return 'This action adds a new chatParticipant';
  }

  findAll() {
    return `This action returns all chatParticipants`;
  }

  findOne(id: number) {
    return `This action returns a #${id} chatParticipant`;
  }

  update(id: number, updateChatParticipantDto: UpdateChatParticipantDto) {
    return `This action updates a #${id} chatParticipant`;
  }

  remove(id: number) {
    return `This action removes a #${id} chatParticipant`;
  }
}
