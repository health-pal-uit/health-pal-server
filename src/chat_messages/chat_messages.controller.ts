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
  UseInterceptors,
  UploadedFile,
  Query,
} from '@nestjs/common';
import { ChatMessagesService } from './chat_messages.service';
import { CreateChatMessageDto } from './dto/create-chat_message.dto';
import { UpdateChatMessageDto } from './dto/update-chat_message.dto';
import { SupabaseGuard } from 'src/auth/guards/supabase/supabase.guard';
import { AdminSupabaseGuard } from 'src/auth/guards/supabase/admin-supabase.guard';
import { CurrentUserId } from 'src/helpers/decorators/current-user-id.decorator';
import { CurrentUser } from 'src/helpers/decorators/current-user.decorator';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('Chat Messages')
@ApiBearerAuth()
@Controller('chat-messages')
export class ChatMessagesController {
  constructor(private readonly chatMessagesService: ChatMessagesService) {}

  @Get('session/:sessionId')
  @UseGuards(SupabaseGuard)
  @ApiOperation({ summary: 'Get all messages for a chat session with pagination' })
  @ApiParam({ name: 'sessionId', description: 'ID of the chat session' })
  @ApiResponse({ status: 200, description: 'List of chat messages', type: [CreateChatMessageDto] })
  async findBySession(
    @Param('sessionId') sessionId: string,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
  ) {
    return await this.chatMessagesService.findBySession(sessionId, page, limit);
  }

  @Post()
  @UseGuards(SupabaseGuard)
  @UseInterceptors(FileInterceptor('image'))
  @ApiOperation({ summary: 'Create a new chat message' })
  @ApiBody({ type: CreateChatMessageDto })
  @ApiResponse({ status: 201, description: 'The created chat message', type: CreateChatMessageDto })
  async create(
    @Body() createChatMessageDto: CreateChatMessageDto,
    @CurrentUserId() userId: string,
    @UploadedFile() image?: Express.Multer.File,
  ) {
    createChatMessageDto.user_id = userId;
    const imageBuffer = image?.buffer;
    const imageName = image?.originalname;
    return await this.chatMessagesService.create(createChatMessageDto, imageBuffer, imageName);
  }

  @Get()
  @UseGuards(SupabaseGuard)
  @ApiOperation({
    summary: 'Get all chat messages (admin) or user messages (user) with pagination',
  })
  @ApiResponse({ status: 200, description: 'List of chat messages', type: [CreateChatMessageDto] })
  async findAll(
    @CurrentUser() user: any,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
  ) {
    const isAdmin = user.role === 'admin';
    if (!isAdmin) {
      return await this.chatMessagesService.findAllUser(user.id, page, limit);
    }
    return await this.chatMessagesService.findAll(page, limit);
  }

  @Get(':id')
  @UseGuards(AdminSupabaseGuard)
  @ApiOperation({ summary: 'Get a chat message by ID (admin only)' })
  @ApiParam({ name: 'id', description: 'ID of the chat message' })
  @ApiResponse({ status: 200, description: 'The chat message', type: CreateChatMessageDto })
  async findOne(@Param('id') id: string) {
    return await this.chatMessagesService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(SupabaseGuard)
  @UseInterceptors(FileInterceptor('image'))
  @ApiOperation({ summary: 'Update a chat message' })
  @ApiParam({ name: 'id', description: 'ID of the chat message' })
  @ApiBody({ type: UpdateChatMessageDto })
  @ApiResponse({ status: 200, description: 'The updated chat message', type: CreateChatMessageDto })
  async update(
    @Param('id') id: string,
    @Body() updateChatMessageDto: UpdateChatMessageDto,
    @UploadedFile() image?: Express.Multer.File,
  ) {
    const imageBuffer = image?.buffer;
    const imageName = image?.originalname;
    return await this.chatMessagesService.update(id, updateChatMessageDto, imageBuffer, imageName);
  }

  @Delete(':id')
  @UseGuards(SupabaseGuard)
  @ApiOperation({ summary: 'Delete a chat message' })
  @ApiParam({ name: 'id', description: 'ID of the chat message' })
  @ApiResponse({ status: 200, description: 'The deleted chat message' })
  async remove(@Param('id') id: string) {
    return await this.chatMessagesService.remove(id);
  }
}
