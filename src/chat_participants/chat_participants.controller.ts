import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { ChatParticipantsService } from './chat_participants.service';
import { CreateChatParticipantDto } from './dto/create-chat_participant.dto';
import { UpdateChatParticipantDto } from './dto/update-chat_participant.dto';

@Controller('chat-participants')
export class ChatParticipantsController {
  constructor(private readonly chatParticipantsService: ChatParticipantsService) {}

  @Post()
  create(@Body() createChatParticipantDto: CreateChatParticipantDto) {
    return this.chatParticipantsService.create(createChatParticipantDto);
  }

  @Get()
  findAll() {
    return this.chatParticipantsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.chatParticipantsService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateChatParticipantDto: UpdateChatParticipantDto) {
    return this.chatParticipantsService.update(+id, updateChatParticipantDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.chatParticipantsService.remove(+id);
  }
}
