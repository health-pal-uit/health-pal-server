import { ApiOperation, ApiResponse, ApiTags, ApiParam, ApiBody } from '@nestjs/swagger';
import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
} from '@nestjs/common';
import { ApiBearerAuth } from '@nestjs/swagger';
import { ChatSessionsService } from './chat_sessions.service';
import { CreateChatSessionDto } from './dto/create-chat_session.dto';
import { UpdateChatSessionDto } from './dto/update-chat_session.dto';
import { SupabaseGuard } from 'src/auth/guards/supabase/supabase.guard';
import { AdminSupabaseGuard } from 'src/auth/guards/supabase/admin-supabase.guard';
import { CurrentUserId } from 'src/helpers/decorators/current-user-id.decorator';
import { CurrentUser } from 'src/helpers/decorators/current-user.decorator';

@ApiTags('Chat Sessions')
@ApiBearerAuth()
@Controller('chat-sessions')
export class ChatSessionsController {
  constructor(private readonly chatSessionsService: ChatSessionsService) {}

  @Post()
  @UseGuards(SupabaseGuard)
  @ApiOperation({ summary: 'Create a new chat session' })
  @ApiBody({ type: CreateChatSessionDto })
  @ApiResponse({ status: 201, description: 'The created chat session', type: CreateChatSessionDto })
  async create(
    @Body() createChatSessionDto: CreateChatSessionDto,
    @CurrentUserId() user_id: string,
  ) {
    return await this.chatSessionsService.create(createChatSessionDto, user_id);
  }

  @Get()
  @UseGuards(SupabaseGuard)
  @ApiOperation({
    summary: 'Get all chat sessions (admin) or user sessions (user) with pagination',
  })
  @ApiResponse({ status: 200, description: 'List of chat sessions', type: [CreateChatSessionDto] })
  async findUserAll(
    @CurrentUser() user: any,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
  ) {
    // user id
    const isAdmin = user.role === 'admin';
    if (isAdmin) {
      return await this.chatSessionsService.findAll(page, limit);
    }
    return await this.chatSessionsService.findUserAll(user.id, page, limit);
  }

  @Get(':id')
  @UseGuards(SupabaseGuard)
  @ApiOperation({ summary: 'Get a chat session by ID' })
  @ApiParam({ name: 'id', description: 'ID of the chat session' })
  @ApiResponse({ status: 200, description: 'The chat session', type: CreateChatSessionDto })
  async findOne(@Param('id') id: string) {
    return await this.chatSessionsService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(SupabaseGuard)
  @ApiOperation({ summary: 'Update a chat session' })
  @ApiParam({ name: 'id', description: 'ID of the chat session' })
  @ApiBody({ type: UpdateChatSessionDto })
  @ApiResponse({ status: 200, description: 'The updated chat session', type: CreateChatSessionDto })
  async update(@Param('id') id: string, @Body() updateChatSessionDto: UpdateChatSessionDto) {
    return await this.chatSessionsService.update(id, updateChatSessionDto);
  }

  @Delete(':id')
  @UseGuards(SupabaseGuard)
  @ApiOperation({ summary: 'Delete a chat session' })
  @ApiParam({ name: 'id', description: 'ID of the chat session' })
  @ApiResponse({ status: 200, description: 'The deleted chat session' })
  async remove(@Param('id') id: string, @CurrentUser() user: any) {
    if (user.role === 'admin') {
      await this.chatSessionsService.adminRemove(id);
    }
    return await this.chatSessionsService.remove(id, user.id);
  }
}
