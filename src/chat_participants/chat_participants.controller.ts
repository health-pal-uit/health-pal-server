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
import { ChatParticipantsService } from './chat_participants.service';
import { CreateChatParticipantDto } from './dto/create-chat_participant.dto';
import { UpdateChatParticipantDto } from './dto/update-chat_participant.dto';
import { SupabaseGuard } from 'src/auth/guards/supabase/supabase.guard';
import { AdminSupabaseGuard } from 'src/auth/guards/supabase/admin-supabase.guard';
import { CurrentUserId } from 'src/helpers/decorators/current-user-id.decorator';
import { CurrentUser } from 'src/helpers/decorators/current-user.decorator';

@ApiTags('Chat Participants')
@ApiBearerAuth()
@Controller('chat-participants')
export class ChatParticipantsController {
  constructor(private readonly chatParticipantsService: ChatParticipantsService) {}

  @Get('session/:sessionId')
  @UseGuards(SupabaseGuard)
  @ApiOperation({ summary: 'Get all participants for a chat session with pagination' })
  @ApiParam({ name: 'sessionId', description: 'ID of the chat session' })
  @ApiResponse({
    status: 200,
    description: 'List of chat participants',
    type: [CreateChatParticipantDto],
  })
  async findBySession(
    @Param('sessionId') sessionId: string,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
  ) {
    return await this.chatParticipantsService.findBySession(sessionId, page, limit);
  }

  @Post('/:id')
  @UseGuards(SupabaseGuard)
  @ApiOperation({ summary: 'Add a user to a chat session' })
  @ApiBody({ type: CreateChatParticipantDto })
  @ApiResponse({
    status: 201,
    description: 'The created chat participant',
    type: CreateChatParticipantDto,
  })
  async createNotMe(
    @Body() createChatParticipantDto: CreateChatParticipantDto,
    @Param('id') id: string,
  ) {
    createChatParticipantDto.user_id = id;
    return await this.chatParticipantsService.create(createChatParticipantDto);
  }

  @Post()
  @UseGuards(SupabaseGuard)
  @ApiOperation({ summary: 'Add a user to a chat session' })
  @ApiBody({ type: CreateChatParticipantDto })
  @ApiResponse({
    status: 201,
    description: 'The created chat participant',
    type: CreateChatParticipantDto,
  })
  async create(
    @Body() createChatParticipantDto: CreateChatParticipantDto,
    @CurrentUser() user: any,
  ) {
    createChatParticipantDto.user_id = user.id;
    return await this.chatParticipantsService.create(createChatParticipantDto);
  }

  @Get()
  @UseGuards(SupabaseGuard)
  @ApiOperation({
    summary: 'Get all chat participants (admin) or user participations (user) with pagination',
  })
  @ApiResponse({
    status: 200,
    description: 'List of chat participants',
    type: [CreateChatParticipantDto],
  })
  async findAll(
    @CurrentUser() user: any,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
  ) {
    const isAdmin = user.role === 'admin';
    if (!isAdmin) {
      return await this.chatParticipantsService.findAllUser(user.id, page, limit);
    }
    return await this.chatParticipantsService.findAll(page, limit);
  }

  @Get(':id')
  @UseGuards(SupabaseGuard)
  @ApiOperation({ summary: 'Get a chat participant by ID' })
  @ApiParam({ name: 'id', description: 'ID of the chat participant' })
  @ApiResponse({ status: 200, description: 'The chat participant', type: CreateChatParticipantDto })
  async findOne(@Param('id') id: string) {
    return await this.chatParticipantsService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(SupabaseGuard)
  @ApiOperation({ summary: 'Update a chat participant' })
  @ApiParam({ name: 'id', description: 'ID of the chat participant' })
  @ApiBody({ type: UpdateChatParticipantDto })
  @ApiResponse({
    status: 200,
    description: 'The updated chat participant',
    type: CreateChatParticipantDto,
  })
  async update(
    @Param('id') id: string,
    @Body() updateChatParticipantDto: UpdateChatParticipantDto,
  ) {
    return await this.chatParticipantsService.update(id, updateChatParticipantDto);
  }

  @Delete(':id')
  @UseGuards(SupabaseGuard)
  @ApiOperation({ summary: 'Remove a chat participant' })
  @ApiParam({ name: 'id', description: 'ID of the chat participant' })
  @ApiResponse({ status: 200, description: 'The deleted chat participant' })
  async remove(@Param('id') id: string) {
    return await this.chatParticipantsService.remove(id);
  }
}
