import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { ChatMessagesService } from './chat_messages.service';
import { CreateChatMessageDto } from './dto/create-chat_message.dto';
import { UpdateChatMessageDto } from './dto/update-chat_message.dto';
import { SupabaseGuard } from 'src/auth/guards/supabase/supabase.guard';
import { AdminSupabaseGuard } from 'src/auth/guards/supabase/admin-supabase.guard';
import { CurrentUserId } from 'src/helpers/decorators/current-user-id.decorator';
import { CurrentUser } from 'src/helpers/decorators/current-user.decorator';

@Controller('chat-messages')
export class ChatMessagesController {
  constructor(private readonly chatMessagesService: ChatMessagesService) {}

  @Post()
  @UseGuards(SupabaseGuard)
  create(@Body() createChatMessageDto: CreateChatMessageDto, @CurrentUserId() userId: string) {
    createChatMessageDto.user_id = userId;
    return this.chatMessagesService.create(createChatMessageDto);
  }

  @Get()
  @UseGuards(SupabaseGuard)
  findAll(@CurrentUser() user: any) {
    const isAdmin = user.role === 'admin';
    if (!isAdmin) {
      return this.chatMessagesService.findAllUser(user.id);
    }
    return this.chatMessagesService.findAll();
  }

  @Get(':id')
  @UseGuards(AdminSupabaseGuard)
  findOne(@Param('id') id: string) {
    return this.chatMessagesService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(SupabaseGuard)
  update(@Param('id') id: string, @Body() updateChatMessageDto: UpdateChatMessageDto) {
    return this.chatMessagesService.update(id, updateChatMessageDto);
  }

  @Delete(':id')
  @UseGuards(SupabaseGuard)
  remove(@Param('id') id: string) {
    return this.chatMessagesService.remove(id);
  }
}
