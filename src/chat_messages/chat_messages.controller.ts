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

@ApiBearerAuth()
@Controller('chat-messages')
export class ChatMessagesController {
  constructor(private readonly chatMessagesService: ChatMessagesService) {}

  @Post()
  @UseGuards(SupabaseGuard)
  @UseInterceptors(FileInterceptor('image'))
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
  async findAll(@CurrentUser() user: any) {
    const isAdmin = user.role === 'admin';
    if (!isAdmin) {
      return await this.chatMessagesService.findAllUser(user.id);
    }
    return await this.chatMessagesService.findAll();
  }

  @Get(':id')
  @UseGuards(AdminSupabaseGuard)
  async findOne(@Param('id') id: string) {
    return await this.chatMessagesService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(SupabaseGuard)
  @UseInterceptors(FileInterceptor('image'))
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
  async remove(@Param('id') id: string) {
    return await this.chatMessagesService.remove(id);
  }
}
