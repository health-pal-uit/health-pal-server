import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { ApiBearerAuth } from '@nestjs/swagger';
import { ChatSessionsService } from './chat_sessions.service';
import { CreateChatSessionDto } from './dto/create-chat_session.dto';
import { UpdateChatSessionDto } from './dto/update-chat_session.dto';
import { SupabaseGuard } from 'src/auth/guards/supabase/supabase.guard';
import { AdminSupabaseGuard } from 'src/auth/guards/supabase/admin-supabase.guard';
import { CurrentUserId } from 'src/helpers/decorators/current-user-id.decorator';
import { CurrentUser } from 'src/helpers/decorators/current-user.decorator';

@ApiBearerAuth()
@Controller('chat-sessions')
export class ChatSessionsController {
  constructor(private readonly chatSessionsService: ChatSessionsService) {}

  @Post()
  @UseGuards(SupabaseGuard)
  create(@Body() createChatSessionDto: CreateChatSessionDto, @CurrentUserId() user_id: string) {
    return this.chatSessionsService.create(createChatSessionDto, user_id);
  }

  @Get()
  @UseGuards(SupabaseGuard)
  findUserAll(@CurrentUser() user: any) {
    // user id
    const isAdmin = user.role === 'admin';
    if (isAdmin) {
      return this.chatSessionsService.findAll();
    }
    return this.chatSessionsService.findUserAll(user.id);
  }

  @Get(':id')
  @UseGuards(SupabaseGuard)
  findOne(@Param('id') id: string) {
    return this.chatSessionsService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(SupabaseGuard)
  update(@Param('id') id: string, @Body() updateChatSessionDto: UpdateChatSessionDto) {
    return this.chatSessionsService.update(id, updateChatSessionDto);
  }

  @Delete(':id')
  @UseGuards(SupabaseGuard)
  remove(@Param('id') id: string, @CurrentUser() user: any) {
    if (user.role === 'admin') {
      this.chatSessionsService.adminRemove(id);
    }
    return this.chatSessionsService.remove(id, user.id);
  }
}
