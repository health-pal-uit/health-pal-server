import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { ApiBearerAuth } from '@nestjs/swagger';
import { ChatParticipantsService } from './chat_participants.service';
import { CreateChatParticipantDto } from './dto/create-chat_participant.dto';
import { UpdateChatParticipantDto } from './dto/update-chat_participant.dto';
import { SupabaseGuard } from 'src/auth/guards/supabase/supabase.guard';
import { AdminSupabaseGuard } from 'src/auth/guards/supabase/admin-supabase.guard';
import { CurrentUserId } from 'src/helpers/decorators/current-user-id.decorator';
import { CurrentUser } from 'src/helpers/decorators/current-user.decorator';

@ApiBearerAuth()
@Controller('chat-participants')
export class ChatParticipantsController {
  constructor(private readonly chatParticipantsService: ChatParticipantsService) {}

  @Post()
  @UseGuards(SupabaseGuard)
  async create(
    @Body() createChatParticipantDto: CreateChatParticipantDto,
    @CurrentUser() user: any,
  ) {
    createChatParticipantDto.user_id = user.id;
    return await this.chatParticipantsService.create(createChatParticipantDto);
  }

  @Get()
  @UseGuards(SupabaseGuard)
  async findAll(@CurrentUser() user: any) {
    const isAdmin = user.role === 'admin';
    if (!isAdmin) {
      return await this.chatParticipantsService.findAllUser(user.id);
    }
    return await this.chatParticipantsService.findAll();
  }

  @Get(':id')
  @UseGuards(SupabaseGuard)
  async findOne(@Param('id') id: string) {
    return await this.chatParticipantsService.findOne(id);
  }

  // @Patch(':id')
  // update(@Param('id') id: string, @Body() updateChatParticipantDto: UpdateChatParticipantDto) {
  //   return this.chatParticipantsService.update(id, updateChatParticipantDto);
  // }

  @Delete(':id')
  @UseGuards(SupabaseGuard)
  async remove(@Param('id') id: string) {
    return await this.chatParticipantsService.remove(id);
  }
}
